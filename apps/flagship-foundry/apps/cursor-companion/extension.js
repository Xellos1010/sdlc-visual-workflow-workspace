const vscode = require('vscode');
const cp = require('node:child_process');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const path = require('node:path');

const {
  buildPlanPayload,
  buildRunRequest,
  createPipeline,
  fetchJson,
  latestItems,
  indexRag,
  importExport,
  launchPipeline,
  loadGapSummary,
  loadGraphStatsAndPlanningContext,
  loadOverlayCollections,
  loadOperatorCollections,
  loadPhases,
  packageExport,
  pausePipeline,
  queryGraph,
  queryRag,
  rebuildGraph,
  resumePipeline,
  getPipelineStatus
} = require('./control-plane-client');
const { overlayHtml } = require('./operator-panel');
const { createRuntimeState } = require('./panel-state');
const { createActionLog, summarizeActionResult } = require('./action-log');
const { startBrowserPopoutServer, stopBrowserPopoutServer } = require('./browser-popout-server');
const foundryLog = require('./logger');
const companionPackage = require('./package.json');
const {
  createPopOutWindowHandler,
  openPendingOverlayIfRequested,
  restoreWindowState
} = require('./window-session');

const runtimeState = createRuntimeState();
const actionLog = createActionLog({ capacity: 500, logger: foundryLog });
const LAST_ACTIVATED_AT_KEY = 'flagshipFoundry.cursorCompanion.lastActivatedAt';

function getWorkspaceRoot() {
  return vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath ?? null;
}

function getHostKind() {
  const appName = vscode.env.appName?.toLowerCase() || '';
  if (appName.includes('cursor')) return 'cursor';
  if (appName.includes('visual studio code')) return 'vscode';
  return 'vscode-compatible';
}

function resolveFoundryRoot() {
  const configuration = vscode.workspace.getConfiguration('flagshipFoundry');
  const configured = configuration.get('foundryRoot', '');
  if (configured && String(configured).trim() !== '') {
    return String(configured).trim();
  }

  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return null;
  }

  const directServer = path.join(workspaceRoot, 'apps', 'control-plane', 'src', 'server.mjs');
  if (fsSync.existsSync(directServer)) {
    return workspaceRoot;
  }

  const nested = path.join(workspaceRoot, 'flagship-foundry-work');
  const nestedServer = path.join(nested, 'apps', 'control-plane', 'src', 'server.mjs');
  if (fsSync.existsSync(nestedServer)) {
    return nested;
  }

  return null;
}

function getDefaultKnowledgeManifestPath() {
  const base = resolveFoundryRoot() ?? getWorkspaceRoot();
  if (!base) {
    return 'examples/knowledge-sources/input/foundry-foundational-docs.manifest.json';
  }
  return path.join(base, 'examples', 'knowledge-sources', 'input', 'foundry-foundational-docs.manifest.json');
}

function getSettings() {
  const configuration = vscode.workspace.getConfiguration('flagshipFoundry');
  return {
    controlPlaneUrl: configuration.get('controlPlaneUrl', 'http://localhost:4010'),
    autoApproveDraftPlans: configuration.get('autoApproveDraftPlans', false),
    autoStartApprovedPlans: configuration.get('autoStartApprovedPlans', false),
    knowledgeManifestPath: configuration.get('knowledgeManifestPath', getDefaultKnowledgeManifestPath()),
    defaultFocusQuery: configuration.get('defaultFocusQuery', 'service worker messaging storage sidepanel'),
    runExecutionMode: configuration.get('runExecutionMode', 'simulate'),
    customThemeUrl: configuration.get('customThemeUrl', '')
  };
}

function countAuthenticatedBrowserConnections(server) {
  if (!server?.connections) {
    return 0;
  }

  return [...server.connections].filter((connection) => Boolean(connection?.clientId)).length;
}

function postActionStatus(panel, payload) {
  panel?.webview?.postMessage({
    type: 'action-status',
    ...payload
  });
}

function buildActionSummary(action, result, message) {
  if (action === 'export-action-log' || action === 'export-last-action') {
    return {
      summary: `Exported ${result.entryCount} action entr${result.entryCount === 1 ? 'y' : 'ies'}`,
      details: { filePath: result.filePath, scope: result.scope },
      metadata: { filePath: result.filePath, scope: result.scope }
    };
  }

  if (action === 'open-in-browser') {
    return {
      summary: 'Opened browser pop-out',
      details: { url: result.url },
      metadata: { url: result.url, reload: false }
    };
  }

  if (action === 'pop-out-window') {
    return {
      summary: 'Opened detached browser window',
      metadata: { reload: false }
    };
  }

  if (action === 'open-file' && message?.nodeId) {
    return {
      summary: `Opened ${message.nodeId}`,
      metadata: { nodeId: message.nodeId, reload: false }
    };
  }

  return summarizeActionResult(result);
}

function shouldReloadBrowserForAction(action) {
  return !['export-action-log', 'export-last-action', 'open-file', 'open-in-browser', 'pop-out-window'].includes(action);
}

async function exportActionLogToFile(scope) {
  const entries = actionLog.exportEntries(scope);
  const workspaceRoot = getWorkspaceRoot();
  const defaultFileName = scope === 'last' ? 'flagship-foundry-last-action.json' : 'flagship-foundry-action-log.json';
  const defaultUri = vscode.Uri.file(path.join(workspaceRoot || process.cwd(), defaultFileName));
  const targetUri = await vscode.window.showSaveDialog({
    defaultUri,
    filters: {
      JSON: ['json']
    },
    saveLabel: scope === 'last' ? 'Export Last Action' : 'Export Action Log'
  });

  if (!targetUri) {
    return {
      summary: 'Export cancelled',
      entryCount: 0,
      scope,
      filePath: null
    };
  }

  await fs.writeFile(targetUri.fsPath, JSON.stringify(entries, null, 2), 'utf8');
  vscode.window.showInformationMessage(`Exported ${entries.length} action entr${entries.length === 1 ? 'y' : 'ies'} to ${targetUri.fsPath}.`);
  return {
    summary: `Exported ${entries.length} action entr${entries.length === 1 ? 'y' : 'ies'}`,
    entryCount: entries.length,
    scope,
    filePath: targetUri.fsPath
  };
}

async function ensureServer(context) {
  const settings = getSettings();
  try {
    await fetchJson(`${settings.controlPlaneUrl}/health`);
    return settings.controlPlaneUrl;
  } catch {
    const foundryRoot = resolveFoundryRoot();
    if (!foundryRoot) {
      throw new Error(
        'Could not find Flagship Foundry app root. Open flagship-foundry-work as the folder, the parent repo with a nested flagship-foundry-work/, or set flagshipFoundry.foundryRoot.'
      );
    }

    if (!runtimeState.getValue('serverProcess')) {
      const serverPath = path.join(foundryRoot, 'apps', 'control-plane', 'src', 'server.mjs');
      const serverProcess = cp.spawn(process.execPath, [serverPath], {
        cwd: foundryRoot,
        stdio: 'ignore',
        detached: false
      });
      runtimeState.setValue('serverProcess', serverProcess);
      context.subscriptions.push({
        dispose: () => {
          const activeProcess = runtimeState.getValue('serverProcess');
          if (activeProcess) {
            activeProcess.kill();
            runtimeState.setValue('serverProcess', null);
          }
        }
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    await fetchJson(`${settings.controlPlaneUrl}/health`);
    return settings.controlPlaneUrl;
  }
}

async function refreshOverlay(context, panel = runtimeState.getValue('latestPanel')) {
  if (!panel) {
    return;
  }
  const state = await collectOverlayState(context);
  panel.webview.html = overlayHtml(state);
}

async function broadcastOverlayState(context) {
  const server = runtimeState.getValue('browserPopoutServer');
  if (!server?.httpServer?.listening || typeof server.broadcastState !== 'function') {
    return 0;
  }

  if (countAuthenticatedBrowserConnections(server) === 0) {
    return 0;
  }

  const state = await collectOverlayState(context);
  return server.broadcastState(state);
}

function getWorkspaceFolderPayloads() {
  return (vscode.workspace.workspaceFolders ?? []).map((folder) => ({
    name: folder.name,
    uri: { fsPath: folder.uri.fsPath },
    selectionEvidence: [`workspaceFolders:${folder.name}`]
  }));
}

function targetIdForWorkspaceRoot(workspaceRoot) {
  return `target:${String(workspaceRoot)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')}`;
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

  runtimeState.setValue('latestEcosystemId', result.ecosystem.id);
  vscode.window.showInformationMessage(`Imported workspace into Foundry as ${result.ecosystem.id}.`);
  await refreshOverlay(context);
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

  vscode.window.showInformationMessage(
    `Ingested knowledge base ${result.knowledgeBase.id} with ${result.documents.length} documents.`
  );
  await refreshOverlay(context);
  return result;
}

async function analyzeGaps(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
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
      ecosystemId: runtimeState.getValue('latestEcosystemId'),
      knowledgeBaseId: latestKnowledgeBase.id
    })
  });

  runtimeState.setValue('latestGapSummary', report.summary);
  vscode.window.showInformationMessage(
    `Gap analysis complete. Incomplete packs: ${report.summary.incompletePackCount}.`
  );
  await refreshOverlay(context);
  return report;
}

async function resolveWorkspaceTarget(context, explicitTargetId = null) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }

  const baseUrl = await ensureServer(context);
  const result = await fetchJson(`${baseUrl}/operator/workspace-target`, {
    method: 'POST',
    body: JSON.stringify({
      ecosystemId: runtimeState.getValue('latestEcosystemId'),
      workspaceFolders: getWorkspaceFolderPayloads(),
      hostKind: getHostKind(),
      targetId: explicitTargetId,
      source: explicitTargetId ? 'manual-selection' : 'active-workspace'
    })
  });
  runtimeState.setValue('latestWorkspaceTarget', result.target?.targetId ?? null);
  await refreshOverlay(context);
  return result;
}

async function captureActiveFileInCart(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const operator = await loadOperatorCollections(baseUrl, ecosystemId);
  const target = operator.workspaceTarget ?? (await resolveWorkspaceTarget(context)).target;
  let cart = operator.contextCarts[0];
  if (!cart) {
    cart = await fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/context-carts`, {
      method: 'POST',
      body: JSON.stringify({
        workspaceTargetId: target.targetId,
        title: 'Operator context cart',
        objective: 'Curate system context for refinement',
        status: 'draft'
      })
    });
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor?.document?.fileName) {
    vscode.window.showWarningMessage('No active editor file to add.');
    return null;
  }

  const saved = await fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/context-carts/${cart.cartId}/items`, {
    method: 'POST',
    body: JSON.stringify({
      kind: 'file',
      label: path.basename(editor.document.fileName),
      authority: 'workspace',
      path: editor.document.fileName,
      selectedBy: 'cursor-companion'
    })
  });
  runtimeState.setValue('latestContextCartId', saved.cartId);
  await refreshOverlay(context);
  return saved;
}

async function captureManualNote(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }
  const note = await vscode.window.showInputBox({
    prompt: 'Add a note to the current context cart'
  });
  if (!note) {
    return null;
  }
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const operator = await loadOperatorCollections(baseUrl, ecosystemId);
  const target = operator.workspaceTarget ?? (await resolveWorkspaceTarget(context)).target;
  let cart = operator.contextCarts[0];
  if (!cart) {
    cart = await fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/context-carts`, {
      method: 'POST',
      body: JSON.stringify({
        workspaceTargetId: target.targetId,
        title: 'Operator context cart',
        objective: 'Curate system context for refinement',
        status: 'draft'
      })
    });
  }
  const saved = await fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/context-carts/${cart.cartId}/items`, {
    method: 'POST',
    body: JSON.stringify({
      kind: 'note',
      label: `Note ${new Date().toLocaleTimeString()}`,
      authority: 'manual',
      content: note,
      selectedBy: 'cursor-companion'
    })
  });
  runtimeState.setValue('latestContextCartId', saved.cartId);
  await refreshOverlay(context);
  return saved;
}

async function refineRequirements(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const operator = await loadOperatorCollections(baseUrl, ecosystemId);
  const target = operator.workspaceTarget ?? (await resolveWorkspaceTarget(context)).target;
  const cart = operator.contextCarts[0];
  if (!cart) {
    vscode.window.showWarningMessage('Capture context into a cart first.');
    return null;
  }

  const objective = await vscode.window.showInputBox({
    prompt: 'Describe the requirement to refine',
    value: cart.objective || 'Refine the current SDLC operator requirement'
  });
  if (!objective) {
    return null;
  }

  const session = await fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/refinement-sessions`, {
    method: 'POST',
    body: JSON.stringify({
      workspaceTargetId: target.targetId,
      contextCartId: cart.cartId,
      objective,
      acceptanceCriteria: [
        'Workspace target is explicit before plan and run actions.',
        'Context and assumptions are traceable to selected artifacts.'
      ],
      constraints: [
        'Approval remains authoritative before execution.',
        'Usage limits remain advisory in v1.'
      ],
      risks: [
        'Multi-root targeting can drift without explicit binding.'
      ],
      knowledgeGaps: runtimeState.getValue('latestGapSummary')?.incompletePacks?.map((pack, index) => ({
        id: `gap-${index + 1}`,
        title: pack,
        severity: 'medium',
        recommendedAction: 'Collect more context before generating the plan.',
        resolved: false
      })) || []
    })
  });
  runtimeState.setValue('latestRefinementSessionId', session.sessionId);
  await refreshOverlay(context);
  return session;
}

async function createPlanFromRefinement(context) {
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const operator = await loadOperatorCollections(baseUrl, ecosystemId);
  const session = operator.refinementSessions[0];
  if (!session) {
    vscode.window.showWarningMessage('Refine requirements first.');
    return null;
  }
  const readiness = await fetchJson(`${baseUrl}/planning/readiness?ecosystemId=${encodeURIComponent(ecosystemId)}&sessionId=${encodeURIComponent(session.sessionId)}`);
  if (!readiness.ready) {
    vscode.window.showWarningMessage(`Plan generation blocked. DoR status: ${session.definitionOfReady.status}.`);
    return null;
  }

  const settings = getSettings();
  const knowledgeBases = await fetchJson(`${baseUrl}/knowledge-bases`).catch(() => []);
  const payload = buildPlanPayload({
    ecosystemId,
    objective: session.objective,
    knowledgeBaseId: knowledgeBases[0]?.id || null,
    settings
  });
  const plan = await fetchJson(`${baseUrl}/planning/create`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  await refreshOverlay(context);
  return plan;
}

function buildArtifactBody(kind, state) {
  const ecosystemId = state.ecosystemId || 'ecosystem';
  if (kind === 'c4-context') {
    return `C4Context\n  title ${ecosystemId} System Context\n  Person(operator, "Operator")\n  System(companion, "Cursor Companion", "Extension-first SDLC cockpit")\n  System(controlPlane, "Control Plane", "Plans, runs, artifacts, continuity")\n  Rel(operator, companion, "Uses")\n  Rel(companion, controlPlane, "Reads and writes operator artifacts")`;
  }
  if (kind === 'c4-container') {
    return `C4Container\n  title ${ecosystemId} Container View\n  Person(operator, "Operator")\n  System_Boundary(companion, "Cursor Companion") {\n    Container(extension, "Extension Host", "Node", "Commands and panel bridge")\n    Container(webview, "Operator Panel", "Webview", "Traversal and control surface")\n  }\n  System_Ext(controlPlane, "Control Plane", "Artifact and run APIs")\n  Rel(operator, webview, "Interacts with")\n  Rel(webview, extension, "Posts messages to")\n  Rel(extension, controlPlane, "Calls HTTP APIs")`;
  }
  return `# ${kind}\n\nObjective: ${state.refinementSessions?.[0]?.objective ?? 'Explain the current system slice.'}\n\nSelected context items: ${state.contextCarts?.[0]?.items?.length ?? 0}\n\nNext step:\n- Generate work orders only when Definition of Ready is satisfied.`;
}

async function generateVisualArtifact(context, kind) {
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const operator = await loadOperatorCollections(baseUrl, ecosystemId);
  const target = operator.workspaceTarget ?? (await resolveWorkspaceTarget(context)).target;
  const body = buildArtifactBody(kind, { ...operator, ecosystemId });
  const artifact = await fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/visual-artifacts`, {
    method: 'POST',
    body: JSON.stringify({
      workspaceTargetId: target.targetId,
      kind,
      title: `${kind} for ${target.displayName}`,
      body,
      sourceRefs: [
        target.workspaceRoot ? { kind: 'file', ref: target.workspaceRoot, label: target.displayName } : { kind: 'note', ref: 'workspace-target', label: target.displayName }
      ]
    })
  });
  runtimeState.setValue('latestVisualArtifactId', artifact.artifactId);
  await refreshOverlay(context);
  return artifact;
}

async function rebuildArtifactGraph(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const result = await rebuildGraph(baseUrl, ecosystemId);
  await refreshOverlay(context);
  return result;
}

async function queryArtifactGraph(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }
  const query = await vscode.window.showInputBox({
    prompt: 'Enter a graph query or feature name',
    value: getSettings().defaultFocusQuery
  });
  if (!query) {
    return null;
  }
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const result = await queryGraph(baseUrl, ecosystemId, {
    queryType: 'lifecycle-trace',
    featureId: query,
    startNodeIds: [query],
    direction: 'both',
    maxDepth: 4
  });
  runtimeState.setValue('latestFocusPath', null);
  vscode.window.showInformationMessage(`Graph query returned ${result.nodes?.length ?? 0} nodes.`);
  await refreshOverlay(context);
  return result;
}

async function runRagQuery(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }
  const query = await vscode.window.showInputBox({
    prompt: 'Describe the retrieval query',
    value: 'Find related ADRs, schemas, and fix-memory for the current work order'
  });
  if (!query) {
    return null;
  }
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const status = await getPipelineStatus(baseUrl, runtimeState.getValue('latestPipelineId') ?? 'pipeline:unknown', ecosystemId).catch(() => null);
  const result = await queryRag(baseUrl, ecosystemId, {
    queryId: `rag:${Date.now()}`,
    query,
    maxResults: 6,
    tokenBudget: 12000
  });
  if (result.results?.length) {
    const operator = await loadOperatorCollections(baseUrl, ecosystemId);
    const target = operator.workspaceTarget ?? (await resolveWorkspaceTarget(context)).target;
    let cart = operator.contextCarts[0];
    if (!cart) {
      cart = await fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/context-carts`, {
        method: 'POST',
        body: JSON.stringify({
          workspaceTargetId: target.targetId,
          title: 'Operator context cart',
          objective: 'Curate system context for refinement',
          status: 'draft'
        })
      });
    }
    for (const hit of result.results.slice(0, 3)) {
      await fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/context-carts/${cart.cartId}/items`, {
        method: 'POST',
        body: JSON.stringify({
          kind: 'rag-result',
          label: hit.artifactId,
          authority: 'rag-retrieval',
          artifactPath: hit.artifactId,
          content: hit.chunkText,
          rationale: `similarity=${hit.similarityScore}`,
          provenance: hit.provenance,
          score: hit.similarityScore,
          pinned: false,
          selectedBy: 'cursor-companion'
        })
      });
    }
  }
  runtimeState.setValue('latestPipelineStatus', status);
  await refreshOverlay(context);
  return result;
}

async function exportGraphPacket(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const operator = await loadOperatorCollections(baseUrl, ecosystemId);
  const cart = operator.contextCarts[0];
  const selection = {
    artifactPaths: cart?.items?.map((item) => item.artifactPath || item.path || item.nodeId).filter(Boolean) ?? []
  };
  const result = await packageExport(baseUrl, ecosystemId, selection);
  vscode.window.showInformationMessage(`Exported packet ${result.manifest.packetId}`);
  return result;
}

async function importGraphPacket(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const result = await importExport(baseUrl, ecosystemId, { manifest: { packetId: `packet:${Date.now()}`, artifacts: [] }, content: {} });
  vscode.window.showInformationMessage(`Imported packet ${result.packetId}`);
  await refreshOverlay(context);
  return result;
}

async function createPipelineFlow(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const operator = await loadOperatorCollections(baseUrl, ecosystemId);
  const cart = operator.contextCarts[0];
  const session = operator.refinementSessions[0];
  const pipelineDefinition = {
    pipelineId: `pipeline:${Date.now()}`,
    ecosystemId,
    title: session?.objective ?? cart?.objective ?? 'Cursor Companion pipeline',
    defaultFailurePolicy: 'halt',
    stages: [
      {
        stageId: 'stage-1',
        order: 0,
        adapterId: 'adapter:dry-run',
        agentRole: 'builder',
        workOrderRef: session?.sessionId ?? cart?.cartId ?? 'work-order:unknown',
        tokenBudget: 12000,
        failurePolicy: 'halt'
      }
    ]
  };
  const pipeline = await createPipeline(baseUrl, pipelineDefinition);
  runtimeState.setValue('latestPipelineId', pipeline.pipelineId);
  await refreshOverlay(context);
  return pipeline;
}

async function launchLatestPipeline(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const pipelines = await loadOperatorCollections(baseUrl, ecosystemId);
  const latest = pipelines.pipelines?.[0] ?? null;
  if (!latest) {
    vscode.window.showWarningMessage('Create a pipeline first.');
    return null;
  }
  runtimeState.setValue('latestPipelineId', latest.pipelineId);
  const result = await launchPipeline(baseUrl, latest.pipelineId, ecosystemId, {});
  await refreshOverlay(context);
  return result;
}

async function pauseLatestPipeline(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const pipelineId = runtimeState.getValue('latestPipelineId');
  if (!pipelineId) return null;
  const result = await pausePipeline(baseUrl, pipelineId, ecosystemId);
  await refreshOverlay(context);
  return result;
}

async function resumeLatestPipeline(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }
  const baseUrl = await ensureServer(context);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const pipelineId = runtimeState.getValue('latestPipelineId');
  if (!pipelineId) return null;
  const result = await resumePipeline(baseUrl, pipelineId, ecosystemId);
  await refreshOverlay(context);
  return result;
}

async function focusImpact(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }

  const query = await vscode.window.showInputBox({
    prompt: 'Enter a focus query for impacted systems, modules, or patterns',
    value: getSettings().defaultFocusQuery
  });
  if (!query) {
    return null;
  }

  const baseUrl = await ensureServer(context);
  const result = await fetchJson(`${baseUrl}/analysis/focus`, {
    method: 'POST',
    body: JSON.stringify({
      ecosystemId: runtimeState.getValue('latestEcosystemId'),
      query,
      persist: true
    })
  });

  runtimeState.setValue('latestFocusPath', result.filePath || null);
  if (result.filePath) {
    const document = await vscode.workspace.openTextDocument(result.filePath);
    await vscode.window.showTextDocument(document, {
      preview: false,
      viewColumn: vscode.ViewColumn.Beside
    });
  }

  await refreshOverlay(context);
  return result;
}

async function collectOverlayState(context) {
  const baseUrl = await ensureServer(context);
  const settings = getSettings();
  const foundryRoot = resolveFoundryRoot();
  const { plans, runs, knowledgeBases } = await loadOverlayCollections(baseUrl);
  const ecosystemId = runtimeState.getValue('latestEcosystemId');
  const workspaceCandidates = getWorkspaceFolderPayloads().map((folder) => ({
    targetId: targetIdForWorkspaceRoot(folder.uri.fsPath),
    displayName: folder.name,
    workspaceRoot: folder.uri.fsPath
  }));
  const gapSummary = await loadGapSummary(baseUrl, ecosystemId, runtimeState.getValue('latestGapSummary'));
  const phases = await loadPhases(baseUrl);
  const { graphStats, planningContext } = await loadGraphStatsAndPlanningContext(baseUrl, ecosystemId, knowledgeBases);
  const operatorCollections = await loadOperatorCollections(baseUrl, ecosystemId);
  const browserPopoutServer = runtimeState.getValue('browserPopoutServer');
  const browserConnectionCount = countAuthenticatedBrowserConnections(browserPopoutServer);

  let focusContent = null;
  const latestFocusPath = runtimeState.getValue('latestFocusPath');
  if (latestFocusPath) {
    try {
      focusContent = await fs.readFile(latestFocusPath, 'utf8');
    } catch {
      focusContent = null;
    }
  }

  return {
    ecosystemId,
    plans,
    runs,
    knowledgeBases,
    gapSummary,
    focusPath: latestFocusPath,
    focusContent,
    settings,
    foundryRoot,
    phases,
    graphStats,
    planningContext,
    mirroredFile: runtimeState.getValue('latestMirroredFile'),
    actionLog: {
      size: actionLog.getSize(),
      latestEntry: actionLog.getLastEntry()
    },
    actionStatus: runtimeState.getValue('latestActionStatus'),
    browserPopoutUrl: runtimeState.getValue('latestBrowserPopoutUrl'),
    browserConnectionCount,
    bridgeConfig: {
      mode: 'vscode'
    },
    workspaceCandidates,
    ...operatorCollections,
    focusContent: operatorCollections.visualArtifacts?.[0]?.representation === 'mermaid'
      ? operatorCollections.visualArtifacts[0].content?.body
      : focusContent
  };
}

async function createPlanFromPrompt(context) {
  if (!runtimeState.getValue('latestEcosystemId')) {
    await importCurrentWorkspace(context);
  }

  const objective = await vscode.window.showInputBox({
    prompt: 'Describe the plan objective',
    value: 'Bootstrap the current ecosystem into Foundry, generate visualizations and SME profiles, and enable approval plus run control.'
  });
  if (!objective) {
    return null;
  }

  const settings = getSettings();
  const baseUrl = await ensureServer(context);
  const knowledgeBases = await fetchJson(`${baseUrl}/knowledge-bases`).catch(() => []);
  const payload = buildPlanPayload({
    ecosystemId: runtimeState.getValue('latestEcosystemId'),
    objective,
    knowledgeBaseId: knowledgeBases[0]?.id || null,
    settings
  });
  const plan = await fetchJson(`${baseUrl}/planning/create`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  vscode.window.showInformationMessage(`Created plan ${plan.id}.`);
  await refreshOverlay(context);
  return plan;
}

async function updateSetting(name, value) {
  await vscode.workspace
    .getConfiguration('flagshipFoundry')
    .update(name, value, vscode.ConfigurationTarget.Workspace);
}

async function actOnLatest(context, action) {
  const baseUrl = await ensureServer(context);
  const { plans, runs } = await loadOverlayCollections(baseUrl);
  const { latestPlan, latestRun } = latestItems({ plans, runs });

  if (action === 'approve-plan' && latestPlan) {
    await fetchJson(`${baseUrl}/plans/${latestPlan.id}/approve`, {
      method: 'POST',
      body: JSON.stringify({
        approvedBy: 'cursor-user',
        autoStartOnApproval: getSettings().autoStartApprovedPlans
      })
    });
  } else if (action === 'create-run' && latestPlan) {
    await fetchJson(`${baseUrl}/runs/start`, {
      method: 'POST',
      body: JSON.stringify(buildRunRequest({
        planId: latestPlan.id,
        mode: getSettings().runExecutionMode
      }))
    });
  } else if (['pause-run', 'resume-run', 'stop-run'].includes(action) && latestRun) {
    const endpoint = action.replace('-run', '');
    await fetchJson(`${baseUrl}/runs/${latestRun.id}/${endpoint}`, {
      method: 'POST',
      body: '{}'
    });
  }

  await refreshOverlay(context);
}

async function openInBrowser(context, popOutWindow) {
  const server = await ensureBrowserPopoutServer(context, popOutWindow);
  runtimeState.setValue('latestBrowserPopoutUrl', server.pageUrl);
  await vscode.env.openExternal(vscode.Uri.parse(server.pageUrl));
  vscode.window.showInformationMessage(`Opened browser pop-out at ${server.pageUrl}.`);
  return {
    summary: 'Opened browser pop-out',
    url: server.pageUrl
  };
}

async function ensureBrowserPopoutServer(context, popOutWindow) {
  const existingServer = runtimeState.getValue('browserPopoutServer');
  if (existingServer?.httpServer?.listening) {
    return existingServer;
  }

  const server = await startBrowserPopoutServer({
    renderPage: async ({ pageUrl, themeUrl, webSocketUrl, token, protocolVersion }) => {
      runtimeState.setValue('latestBrowserPopoutUrl', pageUrl);
      const state = await collectOverlayState(context);
      return overlayHtml({
        ...state,
        browserPopoutUrl: pageUrl,
        bridgeConfig: {
          mode: 'browser',
          themeUrl,
          wsUrl: webSocketUrl,
          token,
          protocolVersion,
          customThemeUrl: state.settings?.customThemeUrl || ''
        }
      });
    },
    onCommand: async ({ message }) => {
      const payload = message.payload && typeof message.payload === 'object' && !Array.isArray(message.payload)
        ? message.payload
        : {};
      const result = await dispatchOverlayAction({
        context,
        panel: null,
        popOutWindow,
        openInBrowser: () => openInBrowser(context, popOutWindow),
        message: {
          action: message.action,
          ...payload
        },
        transport: 'browser'
      });

      await refreshOverlay(context);

      return {
        summary: result.summary,
        details: result.details,
        metadata: {
          ...(result.metadata || {}),
          reload: shouldReloadBrowserForAction(message.action)
        }
      };
    }
  });

  runtimeState.setValue('browserPopoutServer', server);
  runtimeState.setValue('latestBrowserPopoutUrl', server.pageUrl);
  return server;
}

async function dispatchOverlayAction({ context, panel, popOutWindow, openInBrowser, message, transport = 'webview' }) {
  const action = message?.action;
  if (!action) {
    throw new Error('Overlay action is required.');
  }

  const handlerMap = {
    'start-server': () => ensureServer(context),
    'import-workspace': () => importCurrentWorkspace(context),
    'ingest-knowledge': () => ingestSeedKnowledge(context),
    'analyze-gaps': () => analyzeGaps(context),
    'create-plan': () => createPlanFromPrompt(context),
    'retarget-workspace': () => resolveWorkspaceTarget(context),
    'bind-workspace-target': () => resolveWorkspaceTarget(context, message.targetId),
    'capture-active-file': () => captureActiveFileInCart(context),
    'capture-note': () => captureManualNote(context),
    'refine-requirements': () => refineRequirements(context),
    'create-plan-from-refinement': () => createPlanFromRefinement(context),
    'generate-c4-context': () => generateVisualArtifact(context, 'c4-context'),
    'generate-c4-container': () => generateVisualArtifact(context, 'c4-container'),
    'generate-pseudocode': () => generateVisualArtifact(context, 'pseudocode'),
    'rebuild-graph': () => rebuildArtifactGraph(context),
    'query-graph': () => queryArtifactGraph(context),
    'run-rag-query': () => runRagQuery(context),
    'export-graph': () => exportGraphPacket(context),
    'import-graph': () => importGraphPacket(context),
    'create-pipeline': () => createPipelineFlow(context),
    'launch-pipeline': () => launchLatestPipeline(context),
    'pause-pipeline': () => pauseLatestPipeline(context),
    'resume-pipeline': () => resumeLatestPipeline(context),
    'pop-out-window': () => popOutWindow(),
    'open-in-browser': () => openInBrowser(),
    'focus-impact': () => focusImpact(context),
    'refresh': () => refreshOverlay(context, panel),
    'toggle-auto-approve': async () => {
      const settings = getSettings();
      await updateSetting('autoApproveDraftPlans', !settings.autoApproveDraftPlans);
      await refreshOverlay(context, panel);
      return { summary: `Auto approve ${!settings.autoApproveDraftPlans ? 'enabled' : 'disabled'}` };
    },
    'toggle-auto-start': async () => {
      const settings = getSettings();
      await updateSetting('autoStartApprovedPlans', !settings.autoStartApprovedPlans);
      await refreshOverlay(context, panel);
      return { summary: `Auto start ${!settings.autoStartApprovedPlans ? 'enabled' : 'disabled'}` };
    },
    'approve-plan': () => actOnLatest(context, action),
    'create-run': () => actOnLatest(context, action),
    'stop-run': () => actOnLatest(context, action),
    'open-file': () => openMatchingFile(message.nodeId),
    'export-action-log': () => exportActionLogToFile('all'),
    'export-last-action': () => exportActionLogToFile('last')
  };

  if (['pause-run', 'resume-run'].includes(action)) {
    handlerMap[action] = () => actOnLatest(context, action);
  }

  const handler = handlerMap[action];
  if (!handler) {
    throw new Error(`Unknown overlay action: ${action}`);
  }

  runtimeState.setValue('latestActionStatus', `Working: ${action}`);
  postActionStatus(panel, { phase: 'working', action });

  try {
    const result = await actionLog.run(action, handler, {
      resultSummarizer: (value) => buildActionSummary(action, value, message)
    });
    const entry = actionLog.getLastEntry();
    const summary = entry?.result?.summary ?? action;
    runtimeState.setValue('latestActionStatus', `Done: ${summary}`);
    postActionStatus(panel, { phase: 'done', action, entry, summary });

    if (transport === 'browser') {
      await refreshOverlay(context);
    } else if (panel && action !== 'refresh') {
      await refreshOverlay(context, panel);
    }

    await broadcastOverlayState(context);

    return {
      summary,
      details: entry?.result?.details,
      metadata: entry?.result?.metadata
    };
  } catch (error) {
    const entry = actionLog.getLastEntry();
    const summary = entry?.error?.message ?? error.message;
    runtimeState.setValue('latestActionStatus', `Error: ${summary}`);
    postActionStatus(panel, { phase: 'error', action, entry, summary });
    if (transport === 'browser') {
      await refreshOverlay(context);
    } else if (panel && action !== 'refresh') {
      await refreshOverlay(context, panel);
    }
    await broadcastOverlayState(context);
    throw error;
  }
}

async function openMatchingFile(nodeId) {
  const files = await vscode.workspace.findFiles(`**/${nodeId}*`, '**/node_modules/**', 1);
  if (files && files.length > 0) {
    const document = await vscode.workspace.openTextDocument(files[0]);
    await vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.One });
    return true;
  }

  vscode.window.showWarningMessage(`Could not find file corresponding to node: ${nodeId}`);
  return false;
}

function registerCommand(context, command, handler) {
  context.subscriptions.push(vscode.commands.registerCommand(command, async () => {
    try {
      await handler();
    } catch (error) {
      vscode.window.showErrorMessage(error.message);
    }
  }));
}

async function openOverlayPanel(context, popOutWindow) {
  const panel = vscode.window.createWebviewPanel(
    'flagshipFoundryOverlay',
    'Flagship Foundry Overlay',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );
  runtimeState.setValue('latestPanel', panel);

  panel.onDidDispose?.(() => {
    if (runtimeState.getValue('latestPanel') === panel) {
      runtimeState.setValue('latestPanel', null);
    }
  });

  panel.webview.onDidReceiveMessage(async (message) => {
    try {
      await dispatchOverlayAction({
        context,
        panel,
        popOutWindow,
        openInBrowser: () => openInBrowser(context, popOutWindow),
        message
      });
    } catch (error) {
      runtimeState.setValue('latestActionStatus', `Error: ${error.message}`);
      postActionStatus(panel, { phase: 'error', action: message?.action, summary: error.message });
      foundryLog.error(
        `Overlay webview handler error (action=${message?.action ?? 'unknown'})`,
        error?.message ?? String(error)
      );
      vscode.window.showErrorMessage(error.message);
    }
  });

  try {
    await refreshOverlay(context, panel);
  } catch (error) {
    panel.webview.html = overlayHtml({
      ecosystemId: runtimeState.getValue('latestEcosystemId'),
      plans: [],
      runs: [],
      knowledgeBases: [],
      settings: getSettings()
    });
    vscode.window.showWarningMessage(error.message);
  }

  return panel;
}

async function activate(context) {
  foundryLog.init(vscode);
  const activatedAt = new Date().toISOString();
  const previousActivatedAt = context.globalState.get(LAST_ACTIVATED_AT_KEY, null);
  foundryLog.info('Flagship Foundry Companion startup banner', {
    version: companionPackage.version,
    host: getHostKind(),
    activatedAt
  });
  if (previousActivatedAt) {
    foundryLog.info('Extension reloaded', {
      previousActivatedAt,
      activatedAt
    });
  }
  await context.globalState.update(LAST_ACTIVATED_AT_KEY, activatedAt);

  restoreWindowState(context, runtimeState);

  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
    const panel = runtimeState.getValue('latestPanel');
    if (!editor || !panel) {
      return;
    }

    const base = editor.document?.fileName ? path.basename(editor.document.fileName) : '';
    runtimeState.setValue('latestMirroredFile', base || null);
    panel.webview.postMessage({
      type: 'mirrored-file',
      fileName: runtimeState.getValue('latestMirroredFile') || ''
    });
  }));

  registerCommand(context, 'flagshipFoundry.startControlPlane', () => ensureServer(context).then(() => {
    vscode.window.showInformationMessage('Flagship Foundry control plane is running.');
  }));
  registerCommand(context, 'flagshipFoundry.importCurrentWorkspace', () => importCurrentWorkspace(context));
  registerCommand(context, 'flagshipFoundry.ingestSeedKnowledge', () => ingestSeedKnowledge(context));
  registerCommand(context, 'flagshipFoundry.analyzeKnowledgeGaps', () => analyzeGaps(context));
  registerCommand(context, 'flagshipFoundry.focusImpactView', () => focusImpact(context));

  let popOutWindow;
  const openBrowserPopout = () => openInBrowser(context, popOutWindow);
  popOutWindow = createPopOutWindowHandler({ context, runtimeState, vscode, openInBrowser: openBrowserPopout });

  context.subscriptions.push(vscode.commands.registerCommand('flagshipFoundry.openOverlay', async () => {
    await openOverlayPanel(context, popOutWindow);
  }));

  context.subscriptions.push(
    vscode.commands.registerCommand('flagshipFoundry.showCompanionLog', () => {
      foundryLog.show(true);
      foundryLog.info('Output channel focused (View → Output → Flagship Foundry Companion)');
    })
  );

  await openPendingOverlayIfRequested({
    context,
    runtimeState,
    openOverlayPanel: () => openOverlayPanel(context, popOutWindow)
  });
}

function deactivate() {
  foundryLog.info('Flagship Foundry Companion deactivating');
  const serverProcess = runtimeState.getValue('serverProcess');
  if (serverProcess) {
    serverProcess.kill();
    runtimeState.setValue('serverProcess', null);
  }
  const browserPopoutServer = runtimeState.getValue('browserPopoutServer');
  if (browserPopoutServer) {
    stopBrowserPopoutServer(browserPopoutServer).catch(() => {});
    runtimeState.setValue('browserPopoutServer', null);
  }
  foundryLog.dispose();
}

module.exports = {
  activate,
  deactivate
};
