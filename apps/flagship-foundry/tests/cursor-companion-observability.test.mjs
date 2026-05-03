import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { overlayHtml } = require('../apps/cursor-companion/operator-panel.js');

test('overlayHtml renders observability controls and browser windowing action', () => {
  const html = overlayHtml({
    ecosystemId: 'ecosystem:test',
    foundryRoot: '/tmp/foundry',
    settings: {
      runExecutionMode: 'simulate',
      autoApproveDraftPlans: false
    },
    plans: [],
    runs: [],
    phases: { phases: [{ id: 'discover' }, { id: 'architect' }] },
    graphStats: { nodeCount: 1, edgeCount: 1 },
    planningContext: { layer1_workspace: { projectCount: 1 } },
    mirroredFile: 'extension.js',
    focusContent: null,
    workspaceCandidates: [],
    contextCarts: [],
    refinementSessions: [],
    visualArtifacts: [],
    budgetSnapshot: { providers: [], adapters: [] },
    sessionBoard: null,
    actionLog: {
      size: 2,
      latestEntry: {
        action: 'export-action-log',
        status: 'ok',
        durationMs: 12,
        result: { summary: 'Exported 2 action entries' }
      }
    },
    browserPopoutUrl: 'http://127.0.0.1:4444/?token=test-token',
    browserConnectionCount: 1,
    bridgeConfig: {
      mode: 'vscode'
    }
  });

  assert.match(html, /Observability/);
  assert.match(html, /Export Log/);
  assert.match(html, /Export Last Action/);
  assert.match(html, /Open In Browser/);
  assert.match(html, /Buffered actions:\s*<span data-bind="actionLogSize">2<\/span>/);
  assert.match(html, /data-bind="ecosystemId"/);
  assert.match(html, /data-bind="actionLogSize"/);
  assert.match(html, /data-bind="browserConnectionLabel"/);
  assert.match(html, /1 browser client connected/);
});

test('overlayHtml emits browser relay bridge, theme links, and state-update renderer in browser mode', () => {
  const html = overlayHtml({
    ecosystemId: 'ecosystem:test',
    settings: {},
    plans: [],
    runs: [],
    phases: { phases: [] },
    graphStats: null,
    planningContext: null,
    mirroredFile: null,
    focusContent: null,
    workspaceCandidates: [],
    contextCarts: [],
    refinementSessions: [],
    visualArtifacts: [],
    bridgeConfig: {
      mode: 'browser',
      wsUrl: 'ws://127.0.0.1:4555/browser-popout?token=test-token',
      token: 'test-token',
      protocolVersion: '1',
      customThemeUrl: 'https://example.com/theme.css'
    }
  });

  assert.match(html, /new WebSocket/);
  assert.match(html, /Browser relay connected/);
  assert.match(html, /bridgeConfig\.mode === 'browser'/);
  assert.match(html, /<link rel="stylesheet" href="\/theme\.css\?token=test-token" \/>/);
  assert.match(html, /<link rel="stylesheet" href="https:\/\/example\.com\/theme\.css" \/>/);
  assert.match(html, /function renderState\(stateJson\)/);
  assert.match(html, /msg\.type === 'state-update'/);
  assert.match(html, /renderState\(msg\.state\)/);
  assert.match(html, /Browser relay disconnected\./);
});

test('cursor companion package contributes the optional custom theme setting', () => {
  const packageJson = JSON.parse(
    fs.readFileSync(new URL('../apps/cursor-companion/package.json', import.meta.url), 'utf8')
  );

  assert.equal(
    packageJson.contributes.configuration.properties['flagshipFoundry.customThemeUrl'].type,
    'string'
  );
});
