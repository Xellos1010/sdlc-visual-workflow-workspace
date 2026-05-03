import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
  createRuntimeState,
  snapshotRuntimeState
} = require('../apps/cursor-companion/panel-state.js');
const {
  PENDING_POP_OUT_STORAGE_KEY,
  WINDOW_STATE_STORAGE_KEY,
  createPopOutWindowHandler,
  openPendingOverlayIfRequested,
  queuePopOutWindow,
  readPendingPopOutWindow,
  restoreWindowState
} = require('../apps/cursor-companion/window-session.js');

function createWorkspaceState(initial = {}) {
  const store = new Map(Object.entries(initial));

  return {
    get(key, fallback = null) {
      return store.has(key) ? store.get(key) : fallback;
    },
    async update(key, value) {
      if (value === null || value === undefined) {
        store.delete(key);
      } else {
        store.set(key, value);
      }
      return value;
    },
    dump() {
      return Object.fromEntries(store.entries());
    }
  };
}

test('pop-out handler opens the browser pop-out and snapshots runtime state without vscode.openFolder', async () => {
  const runtimeState = createRuntimeState();
  runtimeState.update({
    latestEcosystemId: 'ecosystem:test',
    latestWorkspaceTarget: { targetId: 'target:test', displayName: 'repo', workspaceRoot: '/tmp/repo' },
    latestPipelineId: 'pipeline:test'
  });

  const workspaceState = createWorkspaceState();
  const openInBrowserCalls = [];
  const vscode = {
    workspace: {},
    window: {
      showWarningMessage() {
        throw new Error('unexpected warning');
      },
      showErrorMessage(message) {
        throw new Error(`unexpected error: ${message}`);
      }
    }
  };

  const handler = createPopOutWindowHandler({
    context: { workspaceState },
    runtimeState,
    vscode,
    openInBrowser: async () => {
      openInBrowserCalls.push('open');
      return { url: 'http://127.0.0.1:4444/?token=test-token' };
    }
  });
  await handler();

  assert.equal(openInBrowserCalls.length, 1);
  assert.equal(readPendingPopOutWindow({ workspaceState }), null);
  assert.equal(workspaceState.get(WINDOW_STATE_STORAGE_KEY).latestEcosystemId, 'ecosystem:test');
  assert.equal(workspaceState.get(WINDOW_STATE_STORAGE_KEY).latestWorkspaceTarget.targetId, 'target:test');
  assert.equal(workspaceState.get(WINDOW_STATE_STORAGE_KEY).latestPipelineId, 'pipeline:test');
});

test('pending pop-out replay restores runtime state and opens the overlay once', async () => {
  const runtimeState = createRuntimeState();
  runtimeState.update({
    latestEcosystemId: 'ecosystem:restored',
    latestWorkspaceTarget: { targetId: 'target:restored', displayName: 'repo', workspaceRoot: '/tmp/repo' },
    latestPipelineId: 'pipeline:restored'
  });
  const workspaceState = createWorkspaceState();

  await queuePopOutWindow({ workspaceState }, runtimeState);
  runtimeState.setValue('latestEcosystemId', 'ecosystem:stale');
  runtimeState.setValue('latestWorkspaceTarget', null);

  const overlayCalls = [];
  const opened = await openPendingOverlayIfRequested({
    context: { workspaceState },
    runtimeState,
    openOverlayPanel: async () => {
      overlayCalls.push('opened');
    }
  });

  assert.equal(opened, true);
  assert.equal(overlayCalls.length, 1);
  assert.equal(runtimeState.getValue('latestEcosystemId'), 'ecosystem:restored');
  assert.equal(runtimeState.getValue('latestWorkspaceTarget').targetId, 'target:restored');
  assert.equal(runtimeState.getValue('latestPipelineId'), 'pipeline:restored');
  assert.equal(workspaceState.get(PENDING_POP_OUT_STORAGE_KEY), null);
});

test('restoreWindowState hydrates runtime state from persisted window state', async () => {
  const runtimeState = createRuntimeState();
  const snapshot = snapshotRuntimeState({
    get() {
      return {
        latestEcosystemId: 'ecosystem:saved',
        latestFocusPath: '/tmp/focus.mmd'
      };
    }
  });
  const workspaceState = createWorkspaceState({
    [WINDOW_STATE_STORAGE_KEY]: snapshot
  });

  restoreWindowState({ workspaceState }, runtimeState);

  assert.equal(runtimeState.getValue('latestEcosystemId'), 'ecosystem:saved');
  assert.equal(runtimeState.getValue('latestFocusPath'), '/tmp/focus.mmd');
});

test('extension wires browser sync, browser refresh, and connection count into the windowing slice', () => {
  const source = fs.readFileSync(new URL('../apps/cursor-companion/extension.js', import.meta.url), 'utf8');

  assert.match(source, /browserConnectionCount/);
  assert.match(source, /await broadcastOverlayState\(context\);/);
  assert.match(source, /transport === 'browser'/);
  assert.match(source, /await refreshOverlay\(context\);/);
  assert.match(source, /customThemeUrl: state\.settings\?\.customThemeUrl \|\| ''/);
});
