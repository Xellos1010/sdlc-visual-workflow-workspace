const vscode = require('vscode');
const cp = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');

let serverProcess = null;
let latestEcosystemId = null;
let latestPanel = null;
let latestGapSummary = null;
let latestFocusPath = null;

function getWorkspaceRoot() {
  return vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath ?? null;
}

function getDefaultKnowledgeManifestPath() {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) return 'examples/knowledge-sources/input/foundry-foundational-docs.manifest.json';
  return path.join(workspaceRoot, 'examples', 'knowledge-sources', 'input', 'foundry-foundational-docs.manifest.json');
}

function getSettings() {
  const configuration = vscode.workspace.getConfiguration('flagshipFoundry');
  return {
    controlPlaneUrl: configuration.get('controlPlaneUrl', 'http://localhost:4010'),
    autoApproveDraftPlans: configuration.get('autoApproveDraftPlans', false),
    autoStartApprovedPlans: configuration.get('autoStartApprovedPlans', false),
    knowledgeManifestPath: configuration.get('knowledgeManifestPath', getDefaultKnowledgeManifestPath()),
    defaultFocusQuery: configuration.get('defaultFocusQuery', 'service worker messaging storage sidepanel')
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || payload.error || `HTTP ${response.status}`);
  }
  return payload;
}

async function ensureServer(context) {
  const settings = getSettings();
  try {
    await fetchJson(`${settings.controlPlaneUrl}/health`);
    return settings.controlPlaneUrl;
  } catch {
    const workspaceRoot = getWorkspaceRoot();
    if (!workspaceRoot) {
      throw new Error('Open the Foundry repository as the current workspace before starting the control plane.');
    }
    if (!serverProcess) {
      const serverPath = path.join(workspaceRoot, 'apps', 'control-plane', 'src', 'server.mjs');
      serverProcess = cp.spawn(process.execPath, [serverPath], {
        cwd: workspaceRoot,
        stdio: 'ignore',
        detached: false
      });
      context.subscriptions.push({ dispose: () => serverProcess && serverProcess.kill() });
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    await fetchJson(`${settings.controlPlaneUrl}/health`);
    return settings.controlPlaneUrl;
  }
}

async function importCurrentWorkspace(context) {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    vscode.window.showErrorMessage('Open a workspace first.');
    return null;
  }
  const baseUrl = await ensureServer(context);
  const ecosystemId = path.basename(workspaceRoot).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const result = await fetchJson(`${baseUrl}/ingestion/workspace-import`, {
    method: 'POST',
    body: JSON.stringify({
      ecosystemId,
      name: path.basename(workspaceRoot),
      source: { type: 'filesystem', workspaceRoot }
    })
  });
  latestEcosystemId = result.ecosystem.id;
  vscode.window.showInformationMessage(`Imported workspace into Foundry as ${latestEcosystemId}.`);
  if (latestPanel) {
    await refreshOverlay(context, latestPanel);
  }
  return result;
}

async function ingestSeedKnowledge(context) {
  const baseUrl = await ensureServer(context);
  const settings = getSettings();
  const manifestPath = path.isAbsolute(settings.knowledgeManifestPath)
    ? settings.knowledgeManifestPath
    : path.join(getWorkspaceRoot() || '', settings.knowledgeManifestPath);
  const raw = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);
  const result = await fetchJson(`${baseUrl}/knowledge/ingest`, {
    method: 'POST',
    body: JSON.stringify(manifest)
  });
  vscode.window.showInformationMessage(`Ingested knowledge base ${result.knowledgeBase.id} with ${result.documents.length} documents.`);
  if (latestPanel) await refreshOverlay(context, latestPanel);
  return result;
}

async function analyzeGaps(context) {
  if (!latestEcosystemId) {
    await importCurrentWorkspace(context);
  }
  const baseUrl = await ensureServer(context);
  const knowledgeBases = await fetchJson(`${baseUrl}/knowledge-bases`);
  let latestKnowledgeBase = knowledgeBases[0];
  if (!latestKnowledgeBase) {
    const ingested = await ingestSeedKnowledge(context);
    latestKnowledgeBase = ingested.knowledgeBase;
  }
  const report = await fetchJson(`${baseUrl}/analysis/gaps`, {
    method: 'POST',
    body: JSON.stringify({
      ecosystemId: latestEcosystemId,
      knowledgeBaseId: latestKnowledgeBase.id
    })
  });
  latestGapSummary = report.summary;
  vscode.window.showInformationMessage(`Gap analysis complete. Incomplete packs: ${report.summary.incompletePackCount}.`);
  if (latestPanel) await refreshOverlay(context, latestPanel);
  return report;
}

async function focusImpact(context) {
  if (!latestEcosystemId) {
    await importCurrentWorkspace(context);
  }
  const query = await vscode.window.showInputBox({
    prompt: 'Enter a focus query for impacted systems, modules, or patterns',
    value: getSettings().defaultFocusQuery
  });
  if (!query) return null;
  const baseUrl = await ensureServer(context);
  const result = await fetchJson(`${baseUrl}/analysis/focus`, {
    method: 'POST',
    body: JSON.stringify({ ecosystemId: latestEcosystemId, query, persist: true })
  });
  latestFocusPath = result.filePath || null;
  if (result.filePath) {
    const document = await vscode.workspace.openTextDocument(result.filePath);
    await vscode.window.showTextDocument(document, { preview: false, viewColumn: vscode.ViewColumn.Beside });
  }
  if (latestPanel) await refreshOverlay(context, latestPanel);
  return result;
}

function overlayHtml(state) {
  const plans = state.plans || [];
  const runs = state.runs || [];
  const latestPlan = plans[0];
  const latestRun = runs[0];
  const gapSummary = state.gapSummary || null;
  const focusContentEscaped = state.focusContent ? state.focusContent.replace(/`/g, '\\\\`').replace(/\\$/g, '\\\\$') : '';

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' https://cdn.jsdelivr.net; font-src https://cdn.jsdelivr.net;" />
      <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
      <style>
        body { font-family: var(--vscode-font-family); padding: 12px; color: var(--vscode-foreground); display: flex; flex-direction: row; height: 100vh; margin: 0; box-sizing: border-box; }
        .sidebar { width: 350px; overflow-y: auto; padding-right: 12px; border-right: 1px solid var(--vscode-panel-border); }
        .main-pane { flex: 1; padding-left: 12px; overflow: auto; display: flex; flex-direction: column; }
        button { margin: 4px 8px 4px 0; padding: 6px 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; cursor: pointer; }
        button:hover { background: var(--vscode-button-hoverBackground); }
        .card { border: 1px solid var(--vscode-panel-border); border-radius: 8px; padding: 12px; margin-bottom: 12px; background: var(--vscode-editor-background); }
        .muted { opacity: 0.75; font-size: 0.9em; margin-bottom: 4px; }
        #mermaid-container { flex: 1; display: flex; align-items: center; justify-content: center; background: var(--vscode-editor-background); border-radius: 8px; border: 1px solid var(--vscode-panel-border); padding: 16px; min-height: 400px; overflow: auto; }
        .node text { cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="sidebar">
        <div class="card">
          <h2>Foundry Orchestrator</h2>
          <div class="muted">Ecosystem: <code>${state.ecosystemId || 'not imported yet'}</code></div>
          <div class="muted">Auto approve: <code>${state.settings?.autoApproveDraftPlans ? 'on' : 'off'}</code></div>
          <p>
            <button data-action="start-server">Start Plane</button>
            <button data-action="import-workspace">Import</button>
            <button data-action="analyze-gaps">Gap Analysis</button>
            <button data-action="focus-impact">Generate Focus Graph</button>
            <button data-action="create-plan">Plan</button>
            <button data-action="refresh">Refresh</button>
          </p>
        </div>
        
        <div class="card">
          <h3>Latest Plan</h3>
          ${latestPlan ? `
            <div><strong>${latestPlan.title}</strong></div>
            <div class="muted">Status: ${latestPlan.status}</div>
            <p>
              <button data-action="approve-plan">Approve</button>
              <button data-action="create-run">Start Run</button>
            </p>
          ` : '<div class="muted">No plan yet.</div>'}
        </div>
        
        <div class="card">
          <h3>Latest Run (Ralph loop)</h3>
          ${latestRun ? `
            <div><strong>${latestRun.id}</strong></div>
            <div class="muted">Status: ${latestRun.status}</div>
            <p>
              <button data-action="pause-run">Pause</button>
              <button data-action="resume-run">Resume</button>
              <button data-action="stop-run">Stop</button>
            </p>
          ` : '<div class="muted">No runs yet.</div>'}
        </div>
      </div>

      <div class="main-pane">
        <h3>Interactive Visual Traversal</h3>
        <p class="muted">Click on a component in the graph to navigate to its source file.</p>
        <div id="mermaid-container">
          ${state.focusContent ? `<pre class="mermaid">${focusContentEscaped}</pre>` : '<div class="muted">No focus graph generated. Click "Generate Focus Graph" to build the AST view.</div>'}
        </div>
      </div>
      
      <script>
        const vscode = acquireVsCodeApi();
        mermaid.initialize({ startOnLoad: true, theme: 'dark', securityLevel: 'loose' });

        document.body.addEventListener('click', (event) => {
          const action = event.target?.dataset?.action;
          if (action) vscode.postMessage({ action });
          
          // Detect clicks on Mermaid nodes
          let el = event.target;
          while (el && el !== document.body) {
            if (el.classList && el.classList.contains('node')) {
               const nodeId = el.id.replace(/.*-([^-]+)-\\d+$/, '$1'); // Extract basic node name
               vscode.postMessage({ action: 'open-file', nodeId: el.textContent.trim() });
               break;
            }
            el = el.parentElement;
          }
        });
      </script>
    </body>
  </html>`;
}

async function collectOverlayState(context) {
  const baseUrl = await ensureServer(context);
  const settings = getSettings();
  const [plans, runs, knowledgeBases] = await Promise.all([
    fetchJson(`${baseUrl}/plans`).catch(()=>[]),
    fetchJson(`${baseUrl}/runs`).catch(()=>[]),
    fetchJson(`${baseUrl}/knowledge-bases`).catch(()=>[])
  ]);
  const gapSummary = latestEcosystemId
    ? await fetchJson(`${baseUrl}/ecosystems/${latestEcosystemId}/analysis/gap`).then((value) => value?.summary || latestGapSummary).catch(() => latestGapSummary)
    : latestGapSummary;
    
  let focusContent = null;
  if (latestFocusPath) {
    try {
      focusContent = await fs.readFile(latestFocusPath, 'utf8');
    } catch(e) {}
  }
  
  return { ecosystemId: latestEcosystemId, plans, runs, knowledgeBases, gapSummary, focusPath: latestFocusPath, focusContent, settings };
}

async function refreshOverlay(context, panel) {
  const state = await collectOverlayState(context);
  panel.webview.html = overlayHtml(state);
}

async function createPlanFromPrompt(context) {
  if (!latestEcosystemId) {
    await importCurrentWorkspace(context);
  }
  const objective = await vscode.window.showInputBox({
    prompt: 'Describe the plan objective',
    value: 'Bootstrap the current ecosystem into Foundry, generate visualizations and SME profiles, and enable approval plus run control.'
  });
  if (!objective) return;
  const settings = getSettings();
  const baseUrl = await ensureServer(context);
  const knowledgeBases = await fetchJson(`${baseUrl}/knowledge-bases`).catch(() => []);
  const riskyObjective = /harden|permission|auth|security|architecture|migration|state authority/i.test(objective);
  const plan = await fetchJson(`${baseUrl}/planning/create`, {
    method: 'POST',
    body: JSON.stringify({
      ecosystemId: latestEcosystemId,
      title: objective,
      objective,
      targetQuery: objective,
      sourceSignal: 'request',
      riskLevel: riskyObjective ? 'high' : 'medium',
      knowledgeBaseId: knowledgeBases[0]?.id || null,
      reviewPolicyId: riskyObjective ? 'review-policy:high-risk-adversarial' : 'review-policy:default',
      approval: {
        mode: settings.autoApproveDraftPlans ? 'auto' : 'manual',
        autoApprove: settings.autoApproveDraftPlans,
        autoStartOnApproval: settings.autoStartApprovedPlans
      }
    })
  });
  vscode.window.showInformationMessage(`Created plan ${plan.id}.`);
  if (latestPanel) await refreshOverlay(context, latestPanel);
}

async function updateSetting(name, value) {
  await vscode.workspace.getConfiguration('flagshipFoundry').update(name, value, vscode.ConfigurationTarget.Workspace);
}

async function actOnLatest(context, action) {
  const baseUrl = await ensureServer(context);
  const [plans, runs] = await Promise.all([
    fetchJson(`${baseUrl}/plans`),
    fetchJson(`${baseUrl}/runs`)
  ]);
  const latestPlan = plans[0];
  const latestRun = runs[0];
  if (action === 'approve-plan' && latestPlan) {
    await fetchJson(`${baseUrl}/plans/${latestPlan.id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvedBy: 'cursor-user', autoStartOnApproval: getSettings().autoStartApprovedPlans })
    });
  } else if (action === 'create-run' && latestPlan) {
    await fetchJson(`${baseUrl}/runs/start`, {
      method: 'POST',
      body: JSON.stringify({ planId: latestPlan.id, mode: 'simulate', adapterId: 'adapter:cursor-companion' })
    });
  } else if (['pause-run', 'resume-run', 'stop-run'].includes(action) && latestRun) {
    const endpoint = action.replace('-run', '');
    await fetchJson(`${baseUrl}/runs/${latestRun.id}/${endpoint}`, { method: 'POST', body: '{}' });
  }
  if (latestPanel) await refreshOverlay(context, latestPanel);
}

function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand('flagshipFoundry.startControlPlane', async () => {
    try {
      await ensureServer(context);
      vscode.window.showInformationMessage('Flagship Foundry control plane is running.');
    } catch (error) {
      vscode.window.showErrorMessage(error.message);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('flagshipFoundry.importCurrentWorkspace', async () => {
    try {
      await importCurrentWorkspace(context);
    } catch (error) {
      vscode.window.showErrorMessage(error.message);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('flagshipFoundry.ingestSeedKnowledge', async () => {
    try {
      await ingestSeedKnowledge(context);
    } catch (error) {
      vscode.window.showErrorMessage(error.message);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('flagshipFoundry.analyzeKnowledgeGaps', async () => {
    try {
      await analyzeGaps(context);
    } catch (error) {
      vscode.window.showErrorMessage(error.message);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('flagshipFoundry.focusImpactView', async () => {
    try {
      await focusImpact(context);
    } catch (error) {
      vscode.window.showErrorMessage(error.message);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('flagshipFoundry.openOverlay', async () => {
    latestPanel = vscode.window.createWebviewPanel('flagshipFoundryOverlay', 'Flagship Foundry Overlay', vscode.ViewColumn.Beside, {
      enableScripts: true,
      retainContextWhenHidden: true
    });
    latestPanel.webview.onDidReceiveMessage(async (message) => {
      try {
        if (message.action === 'start-server') await ensureServer(context);
        if (message.action === 'import-workspace') await importCurrentWorkspace(context);
        if (message.action === 'ingest-knowledge') await ingestSeedKnowledge(context);
        if (message.action === 'analyze-gaps') await analyzeGaps(context);
        if (message.action === 'create-plan') await createPlanFromPrompt(context);
        if (message.action === 'focus-impact') await focusImpact(context);
        if (message.action === 'refresh') await refreshOverlay(context, latestPanel);
        if (message.action === 'toggle-auto-approve') {
          const settings = getSettings();
          await updateSetting('autoApproveDraftPlans', !settings.autoApproveDraftPlans);
          await refreshOverlay(context, latestPanel);
        }
        if (message.action === 'toggle-auto-start') {
          const settings = getSettings();
          await updateSetting('autoStartApprovedPlans', !settings.autoStartApprovedPlans);
          await refreshOverlay(context, latestPanel);
        }
        if (['approve-plan', 'create-run', 'pause-run', 'resume-run', 'stop-run'].includes(message.action)) {
          await actOnLatest(context, message.action);
        }
        if (message.action === 'open-file' && message.nodeId) {
          // Find the file path by searching the workspace
          const files = await vscode.workspace.findFiles(`**/${message.nodeId}*`, '**/node_modules/**', 1);
          if (files && files.length > 0) {
            const document = await vscode.workspace.openTextDocument(files[0]);
            await vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.One });
          } else {
            vscode.window.showWarningMessage(`Could not find file corresponding to node: ${message.nodeId}`);
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage(error.message);
      }
    });
    try {
      await refreshOverlay(context, latestPanel);
    } catch (error) {
      latestPanel.webview.html = overlayHtml({ ecosystemId: latestEcosystemId, plans: [], runs: [], knowledgeBases: [], settings: getSettings() });
      vscode.window.showWarningMessage(error.message);
    }
  }));
}

function deactivate() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

module.exports = { activate, deactivate };
