const vscode = require('vscode');
const cp = require('child_process');
const path = require('path');

let serverProcess = null;
let latestEcosystemId = null;
let latestPanel = null;

function getSettings() {
  const config = vscode.workspace.getConfiguration('flagshipFoundry');
  return {
    controlPlaneUrl: config.get('controlPlaneUrl', 'http://localhost:4010'),
    autoApproveDraftPlans: config.get('autoApproveDraftPlans', false),
    autoStartApprovedPlans: config.get('autoStartApprovedPlans', false)
  };
}

function getWorkspaceRoot() {
  const folder = vscode.workspace.workspaceFolders?.[0];
  return folder?.uri?.fsPath ?? null;
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

function overlayHtml(state) {
  const plans = state.plans || [];
  const runs = state.runs || [];
  const latestPlan = plans[0];
  const latestRun = runs[0];
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';" />
      <style>
        body { font-family: var(--vscode-font-family); padding: 12px; color: var(--vscode-foreground); }
        button { margin: 4px 8px 4px 0; }
        .card { border: 1px solid var(--vscode-panel-border); border-radius: 8px; padding: 12px; margin-bottom: 12px; }
        .muted { opacity: 0.75; }
        code { font-family: var(--vscode-editor-font-family); }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Flagship Foundry</h2>
        <div class="muted">Ecosystem: <code>${state.ecosystemId || 'not imported yet'}</code></div>
        <div class="muted">Auto approve: <code>${state.settings?.autoApproveDraftPlans ? 'on' : 'off'}</code> · Auto start: <code>${state.settings?.autoStartApprovedPlans ? 'on' : 'off'}</code></div>
        <p>
          <button data-action="start-server">Start Control Plane</button>
          <button data-action="import-workspace">Import Workspace</button>
          <button data-action="create-plan">Create Plan</button>
          <button data-action="toggle-auto-approve">Toggle Auto Approve</button>
          <button data-action="toggle-auto-start">Toggle Auto Start</button>
          <button data-action="refresh">Refresh</button>
        </p>
      </div>
      <div class="card">
        <h3>Latest Plan</h3>
        ${latestPlan ? `
          <div><strong>${latestPlan.title}</strong></div>
          <div class="muted">Status: ${latestPlan.status}</div>
          <div class="muted">Blast radius: ${latestPlan.blastRadius?.summary?.totalImpacted || 0} nodes</div>
          <p>
            <button data-action="approve-plan">Approve</button>
            <button data-action="create-run">Start Run</button>
          </p>
        ` : '<div class="muted">No plan created yet.</div>'}
      </div>
      <div class="card">
        <h3>Latest Run</h3>
        ${latestRun ? `
          <div><strong>${latestRun.id}</strong></div>
          <div class="muted">Status: ${latestRun.status}</div>
          <div class="muted">Tasks: ${latestRun.tasks?.length || 0}</div>
          <p>
            <button data-action="pause-run">Pause</button>
            <button data-action="resume-run">Resume</button>
            <button data-action="stop-run">Stop</button>
          </p>
        ` : '<div class="muted">No run created yet.</div>'}
      </div>
      <script>
        const vscode = acquireVsCodeApi();
        document.body.addEventListener('click', (event) => {
          const action = event.target?.dataset?.action;
          if (action) vscode.postMessage({ action });
        });
      </script>
    </body>
  </html>`;
}

async function collectOverlayState(context) {
  const baseUrl = await ensureServer(context);
  const settings = getSettings();
  const [plans, runs] = await Promise.all([
    fetchJson(`${baseUrl}/plans`),
    fetchJson(`${baseUrl}/runs`)
  ]);
  return { ecosystemId: latestEcosystemId, plans, runs, settings };
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
  const plan = await fetchJson(`${baseUrl}/planning/create`, {
    method: 'POST',
    body: JSON.stringify({
      ecosystemId: latestEcosystemId,
      title: objective,
      objective,
      targetQuery: objective,
      sourceSignal: 'request',
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

  context.subscriptions.push(vscode.commands.registerCommand('flagshipFoundry.openOverlay', async () => {
    latestPanel = vscode.window.createWebviewPanel('flagshipFoundryOverlay', 'Flagship Foundry Overlay', vscode.ViewColumn.Beside, {
      enableScripts: true,
      retainContextWhenHidden: true
    });
    latestPanel.webview.onDidReceiveMessage(async (message) => {
      try {
        if (message.action === 'start-server') await ensureServer(context);
        if (message.action === 'import-workspace') await importCurrentWorkspace(context);
        if (message.action === 'create-plan') await createPlanFromPrompt(context);
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
      } catch (error) {
        vscode.window.showErrorMessage(error.message);
      }
    });
    try {
      await refreshOverlay(context, latestPanel);
    } catch (error) {
      latestPanel.webview.html = overlayHtml({ ecosystemId: latestEcosystemId, plans: [], runs: [] });
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
