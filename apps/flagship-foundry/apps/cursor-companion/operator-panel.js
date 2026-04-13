const { workspaceTargetSection } = require('./workspace-target');
const { contextCartSection } = require('./context-cart');
const { requirementPanelSection } = require('./requirement-panel');
const { diagramPanelSection } = require('./diagram-panel');
const { planningBoardSection } = require('./planning-board');
const { providerDashboardSection } = require('./provider-dashboard');
const { sessionBoardSection } = require('./session-board');
const { windowLauncherSection } = require('./window-launcher');

function serializeForScript(value) {
  return JSON.stringify(value ?? null).replace(/</g, '\\u003c');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderLatestAction(actionLog = {}) {
  const latestAction = actionLog.latestEntry || null;
  if (!latestAction) {
    return '<div id="latest-action-empty" class="muted">No recorded actions yet.</div>';
  }

  return `
    <div id="latest-action-summary"><strong>${escapeHtml(latestAction.action)}</strong></div>
    <div id="latest-action-meta" class="muted">${escapeHtml(latestAction.status)} in ${escapeHtml(latestAction.durationMs)}ms</div>
    <div id="latest-action-result" class="muted">${escapeHtml(latestAction.result?.summary ?? latestAction.error?.message ?? 'No summary')}</div>
  `;
}

function renderFocusContent(focusContent) {
  if (focusContent) {
    const focusContentEscaped = focusContent.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    return `<pre class="mermaid">${focusContentEscaped}</pre>`;
  }

  return '<div class="muted">No focus graph generated. Click "Generate Focus Graph" to build the AST view.</div>';
}

function overlayHtml(state) {
  const plans = state.plans || [];
  const runs = state.runs || [];
  const latestPlan = plans[0];
  const latestRun = runs[0];
  const actionLog = state.actionLog || {};
  const bridgeConfig = state.bridgeConfig || { mode: 'vscode' };
  const browserThemeHref = bridgeConfig.mode === 'browser'
    ? escapeHtml(bridgeConfig.themeUrl || `/theme.css?token=${encodeURIComponent(bridgeConfig.token || '')}`)
    : null;
  const customThemeHref = bridgeConfig.mode === 'browser' && bridgeConfig.customThemeUrl
    ? escapeHtml(bridgeConfig.customThemeUrl)
    : null;

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta
        http-equiv="Content-Security-Policy"
        content="default-src 'none'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net ${bridgeConfig.customThemeUrl ? bridgeConfig.customThemeUrl : ''}; script-src 'unsafe-inline' https://cdn.jsdelivr.net; font-src https://cdn.jsdelivr.net; connect-src ws: http: https:;"
      />
      <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
      ${browserThemeHref ? `<link rel="stylesheet" href="${browserThemeHref}" />` : ''}
      ${customThemeHref ? `<link rel="stylesheet" href="${customThemeHref}" />` : ''}
      <style>
        body { font-family: var(--vscode-font-family); padding: 12px; color: var(--vscode-foreground); display: flex; flex-direction: row; height: 100vh; margin: 0; box-sizing: border-box; }
        .sidebar { width: 350px; overflow-y: auto; padding-right: 12px; border-right: 1px solid var(--vscode-panel-border); }
        .main-pane { flex: 1; padding-left: 12px; overflow: auto; display: flex; flex-direction: column; }
        button { margin: 4px 8px 4px 0; padding: 6px 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; cursor: pointer; }
        button:hover { background: var(--vscode-button-hoverBackground); }
        .card { border: 1px solid var(--vscode-panel-border); border-radius: 8px; padding: 12px; margin-bottom: 12px; background: var(--vscode-editor-background); }
        .muted { opacity: 0.75; font-size: 0.9em; margin-bottom: 4px; }
        .status-line { font-size: 0.95em; margin: 8px 0 0; }
        .status-line.error { color: #f87171; }
        #mermaid-container { flex: 1; display: flex; align-items: center; justify-content: center; background: var(--vscode-editor-background); border-radius: 8px; border: 1px solid var(--vscode-panel-border); padding: 16px; min-height: 400px; overflow: auto; }
        .node text { cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="sidebar">
        <div class="card">
          <h2>Foundry Orchestrator</h2>
          <div class="muted">Ecosystem: <code data-bind="ecosystemId">${escapeHtml(state.ecosystemId || 'not imported yet')}</code></div>
          <div class="muted">Foundry root: <code data-bind="foundryRoot">${escapeHtml(state.foundryRoot ? state.foundryRoot : 'auto')}</code></div>
          <div class="muted">Run mode: <code data-bind="runExecutionMode">${escapeHtml(state.settings?.runExecutionMode ?? 'simulate')}</code></div>
          <div class="muted">Auto approve: <code data-bind="autoApproveDraftPlans">${escapeHtml(state.settings?.autoApproveDraftPlans ? 'on' : 'off')}</code></div>
          <p>
            <button data-action="start-server">Start Plane</button>
            <button data-action="import-workspace">Import</button>
            <button data-action="analyze-gaps">Gap Analysis</button>
            <button data-action="focus-impact">Generate Focus Graph</button>
            <button data-action="create-plan">Plan</button>
            <button data-action="refresh">Refresh</button>
          </p>
          <div id="action-status" class="status-line">${escapeHtml(state.actionStatus || 'Idle')}</div>
        </div>
        <div class="card">
          <h3>Observability</h3>
          <div class="muted">Buffered actions: <span data-bind="actionLogSize">${escapeHtml(actionLog.size ?? 0)}</span></div>
          <div id="latest-action">${renderLatestAction(actionLog)}</div>
          <p>
            <button data-action="export-action-log">Export Log</button>
            <button data-action="export-last-action">Export Last Action</button>
          </p>
        </div>
        ${workspaceTargetSection(state)}
        ${contextCartSection(state)}
        ${requirementPanelSection(state)}
        ${diagramPanelSection(state)}
        ${planningBoardSection(state)}
        ${providerDashboardSection(state)}
        ${sessionBoardSection(state)}
        ${windowLauncherSection(state)}

        <div class="card">
          <h3>Latest Plan</h3>
          ${latestPlan ? `
            <div id="latest-plan-title"><strong>${escapeHtml(latestPlan.title)}</strong></div>
            <div id="latest-plan-status" class="muted">Status: ${escapeHtml(latestPlan.status)}</div>
            <p>
              <button data-action="approve-plan">Approve</button>
              <button data-action="create-run">Start Run</button>
            </p>
          ` : '<div class="muted">No plan yet.</div>'}
        </div>
        
        <div class="card">
          <h3>Latest Run</h3>
          ${latestRun ? `
            <div id="latest-run-id"><strong>${escapeHtml(latestRun.id)}</strong></div>
            <div id="latest-run-status" class="muted">Status: ${escapeHtml(latestRun.status)} | Mode: ${escapeHtml(latestRun.mode ?? '—')}</div>
            <p>
              <button data-action="pause-run">Pause</button>
              <button data-action="resume-run">Resume</button>
              <button data-action="stop-run">Stop</button>
            </p>
          ` : '<div class="muted">No runs yet.</div>'}
        </div>

        <div class="card">
          <h3>Lifecycle (ontology)</h3>
          <div class="muted" data-bind="phaseCount">${escapeHtml(state.phases && state.phases.phases ? `${state.phases.phases.length} phases` : 'Start control plane to load')}</div>
        </div>

        <div class="card">
          <h3>Graph snapshot</h3>
          <div class="muted">Nodes: <span data-bind="graphNodeCount">${escapeHtml(state.graphStats ? state.graphStats.nodeCount : '—')}</span> | Edges: <span data-bind="graphEdgeCount">${escapeHtml(state.graphStats ? state.graphStats.edgeCount : '—')}</span></div>
          <div class="muted">RAG index: <span data-bind="ragIndexedArtifacts">${escapeHtml(state.ragStatus ? `${state.ragStatus.indexedArtifacts ?? 0} artifacts` : '—')}</span></div>
          <p>
            <button data-action="rebuild-graph">Rebuild Graph</button>
            <button data-action="run-rag-query">RAG Search</button>
          </p>
        </div>

        <div class="card">
          <h3>Mirrored focus</h3>
          <div class="muted">Active editor: <code id="mirrored-file">${escapeHtml(state.mirroredFile ? state.mirroredFile : '—')}</code></div>
          <p class="muted">Select a file in the IDE to link visual drill-down (stub).</p>
        </div>

        <div class="card">
          <h3>Layered planning context</h3>
          <div class="muted" data-bind="planningContextProjectCount">${escapeHtml(state.planningContext ? `${state.planningContext.layer1_workspace?.projectCount ?? 0} projects in workspace slice` : 'Import ecosystem to load')}</div>
        </div>
      </div>

      <div class="main-pane">
        <h3>Interactive Visual Traversal</h3>
        <p class="muted">Click on a component in the graph to navigate to its source file.</p>
        <div id="mermaid-container" data-bind="focusContent">${renderFocusContent(state.focusContent)}</div>
      </div>
      
      <script>
        const bridgeConfig = ${serializeForScript(bridgeConfig)};
        const vscode = bridgeConfig.mode === 'vscode' ? acquireVsCodeApi() : null;
        let browserSocket = null;
        let browserBridgeReady = bridgeConfig.mode !== 'browser';
        let latestFocusContent = ${serializeForScript(state.focusContent || null)};
        mermaid.initialize({ startOnLoad: true, theme: 'dark', securityLevel: 'loose' });

        function setActionStatus(text, isError = false) {
          const el = document.getElementById('action-status');
          if (!el) return;
          el.textContent = text;
          el.classList.toggle('error', Boolean(isError));
        }

        function setTextBinding(name, value) {
          document.querySelectorAll('[data-bind="' + name + '"]').forEach((el) => {
            el.textContent = value == null ? '' : String(value);
          });
        }

        function setLatestAction(actionLog) {
          const container = document.getElementById('latest-action');
          if (!container) return;

          if (!actionLog || !actionLog.latestEntry) {
            container.innerHTML = '<div id="latest-action-empty" class="muted">No recorded actions yet.</div>';
            return;
          }

          const latest = actionLog.latestEntry;
          container.innerHTML =
            '<div id="latest-action-summary"><strong>' + escapeHtml(latest.action) + '</strong></div>' +
            '<div id="latest-action-meta" class="muted">' + escapeHtml(latest.status) + ' in ' + escapeHtml(latest.durationMs) + 'ms</div>' +
            '<div id="latest-action-result" class="muted">' + escapeHtml((latest.result && latest.result.summary) || (latest.error && latest.error.message) || 'No summary') + '</div>';
        }

        function renderFocusContent(content) {
          const container = document.getElementById('mermaid-container');
          if (!container) return;
          if (content === latestFocusContent) return;

          latestFocusContent = content || null;
          if (!content) {
            container.innerHTML = '<div class="muted">No focus graph generated. Click "Generate Focus Graph" to build the AST view.</div>';
            return;
          }

          const pre = document.createElement('pre');
          pre.className = 'mermaid';
          pre.textContent = content;
          container.innerHTML = '';
          container.appendChild(pre);
          mermaid.init(undefined, pre);
        }

        function renderState(stateJson) {
          if (!stateJson || typeof stateJson !== 'object') return;

          setTextBinding('ecosystemId', stateJson.ecosystemId || 'not imported yet');
          setTextBinding('foundryRoot', stateJson.foundryRoot || 'auto');
          setTextBinding('runExecutionMode', stateJson.settings && stateJson.settings.runExecutionMode ? stateJson.settings.runExecutionMode : 'simulate');
          setTextBinding('autoApproveDraftPlans', stateJson.settings && stateJson.settings.autoApproveDraftPlans ? 'on' : 'off');
          setTextBinding('actionLogSize', stateJson.actionLog && Number.isFinite(stateJson.actionLog.size) ? stateJson.actionLog.size : 0);
          setTextBinding('phaseCount', stateJson.phases && stateJson.phases.phases ? stateJson.phases.phases.length + ' phases' : 'Start control plane to load');
          setTextBinding('graphNodeCount', stateJson.graphStats ? stateJson.graphStats.nodeCount : '—');
          setTextBinding('graphEdgeCount', stateJson.graphStats ? stateJson.graphStats.edgeCount : '—');
          setTextBinding('planningContextProjectCount', stateJson.planningContext ? ((stateJson.planningContext.layer1_workspace && stateJson.planningContext.layer1_workspace.projectCount) || 0) + ' projects in workspace slice' : 'Import ecosystem to load');
          setTextBinding('browserPopoutUrl', stateJson.browserPopoutUrl || 'Not opened yet');
          setTextBinding('browserConnectionLabel', (stateJson.browserConnectionCount || 0) === 1 ? '1 browser client connected' : (stateJson.browserConnectionCount || 0) + ' browser clients connected');
          setTextBinding('windowingStatus', bridgeConfig.mode === 'browser' ? 'Connected through the local browser relay.' : 'Host windowing stays default. The browser relay is opt-in and loopback-only.');
          const mirroredFile = document.getElementById('mirrored-file');
          if (mirroredFile) mirroredFile.textContent = stateJson.mirroredFile || '—';
          setLatestAction(stateJson.actionLog);
          renderFocusContent(stateJson.focusContent || null);

          if (stateJson.actionStatus) {
            setActionStatus(stateJson.actionStatus, String(stateJson.actionStatus).startsWith('Error:'));
          }
        }

        function buildPayload(message) {
          const payload = {};
          for (const [key, value] of Object.entries(message || {})) {
            if (key !== 'action') payload[key] = value;
          }
          return Object.keys(payload).length ? payload : undefined;
        }

        function postBridgeMessage(message) {
          if (bridgeConfig.mode === 'browser') {
            if (!browserBridgeReady || !browserSocket || browserSocket.readyState !== WebSocket.OPEN) {
              setActionStatus('Browser relay is not ready.', true);
              return;
            }
            const payload = buildPayload(message);
            browserSocket.send(JSON.stringify({
              type: 'command',
              requestId: 'browser-' + Date.now() + '-' + Math.random().toString(16).slice(2),
              action: message.action,
              timestamp: new Date().toISOString(),
              ...(payload ? { payload } : {})
            }));
            setActionStatus('Working: ' + message.action);
            return;
          }

          vscode.postMessage(message);
          setActionStatus('Working: ' + message.action);
        }

        window.addEventListener('message', (event) => {
          const msg = event.data;
          if (msg && msg.type === 'mirrored-file' && msg.fileName) {
            const el = document.getElementById('mirrored-file');
            if (el) el.textContent = msg.fileName;
          }
          if (msg && msg.type === 'action-status') {
            const summary = msg.summary || (msg.entry && ((msg.entry.result && msg.entry.result.summary) || (msg.entry.error && msg.entry.error.message))) || msg.action || 'Idle';
            if (msg.phase === 'error') {
              setActionStatus('Error: ' + summary, true);
            } else if (msg.phase === 'done') {
              setActionStatus('Done: ' + summary, false);
            } else if (msg.phase === 'working') {
              setActionStatus('Working: ' + summary, false);
            }
          }
        });

        if (bridgeConfig.mode === 'browser') {
          browserSocket = new WebSocket(bridgeConfig.wsUrl);
          browserSocket.addEventListener('open', () => {
            browserBridgeReady = true;
            browserSocket.send(JSON.stringify({
              type: 'handshake',
              protocolVersion: bridgeConfig.protocolVersion,
              token: bridgeConfig.token,
              clientId: 'browser-' + Date.now(),
              timestamp: new Date().toISOString()
            }));
            setActionStatus('Browser relay connected.');
          });
          browserSocket.addEventListener('message', (event) => {
            try {
              const msg = JSON.parse(event.data);
              if (msg.type === 'state-update') {
                renderState(msg.state);
                return;
              }
              if (msg.type !== 'response') return;
              if (msg.status === 'error') {
                setActionStatus('Error: ' + ((msg.error && msg.error.message) || 'Command failed'), true);
                return;
              }
              setActionStatus('Done: ' + ((msg.result && msg.result.summary) || 'Command completed'));
            } catch (error) {
              setActionStatus('Error: ' + error.message, true);
            }
          });
          browserSocket.addEventListener('close', () => {
            browserBridgeReady = false;
            setActionStatus('Browser relay disconnected.', true);
          });
          browserSocket.addEventListener('error', () => {
            browserBridgeReady = false;
            setActionStatus('Browser relay error.', true);
          });
        }

        document.body.addEventListener('click', (event) => {
          const action = event.target && event.target.dataset ? event.target.dataset.action : null;
          if (action) postBridgeMessage({ action });
          
          let el = event.target;
          while (el && el !== document.body) {
            if (el.classList && el.classList.contains('node')) {
               postBridgeMessage({ action: 'open-file', nodeId: el.textContent.trim() });
               break;
            }
            el = el.parentElement;
          }
        });

        function escapeHtml(value) {
          return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        }
      </script>
    </body>
  </html>`;
}

module.exports = {
  overlayHtml
};
