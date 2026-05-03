const {
  hydrateRuntimeState,
  snapshotRuntimeState
} = require('./panel-state');
const log = require('./logger');

const WINDOW_STATE_STORAGE_KEY = 'flagshipFoundry.cursorCompanion.windowState';
const PENDING_POP_OUT_STORAGE_KEY = 'flagshipFoundry.cursorCompanion.pendingPopOut';

function queuePopOutWindow(context, runtimeState) {
  return context.workspaceState.update(PENDING_POP_OUT_STORAGE_KEY, {
    requestedAt: new Date().toISOString(),
    snapshot: snapshotRuntimeState(runtimeState)
  });
}

function readPendingPopOutWindow(context) {
  return context.workspaceState.get(PENDING_POP_OUT_STORAGE_KEY, null);
}

function clearPendingPopOutWindow(context) {
  return context.workspaceState.update(PENDING_POP_OUT_STORAGE_KEY, null);
}

function persistWindowState(context, runtimeState) {
  return context.workspaceState.update(WINDOW_STATE_STORAGE_KEY, snapshotRuntimeState(runtimeState));
}

function restoreWindowState(context, runtimeState) {
  const snapshot = context.workspaceState.get(WINDOW_STATE_STORAGE_KEY, null);
  return hydrateRuntimeState(runtimeState, snapshot);
}

function createPopOutWindowHandler({ context, runtimeState, vscode, openInBrowser }) {
  return async function popOutWindow() {
    log.info('Pop-out: handler invoked');
    try {
      await persistWindowState(context, runtimeState);
      if (typeof openInBrowser !== 'function') {
        throw new Error('Browser pop-out launcher is not available.');
      }

      log.info('Pop-out: opening browser-based detached window');
      const result = await openInBrowser();
      log.info('Pop-out: browser-based detached window opened', result);
    } catch (err) {
      log.error('Pop-out: failed', err?.message ?? String(err));
      vscode.window.showErrorMessage(`Flagship Foundry pop-out failed: ${err?.message ?? err}`);
    }
  };
}

async function openPendingOverlayIfRequested({ context, runtimeState, openOverlayPanel }) {
  const pending = readPendingPopOutWindow(context);
  if (!pending) {
    return false;
  }

  log.info('Pop-out: new window opened with pending overlay — restoring state and opening panel', {
    requestedAt: pending.requestedAt
  });

  if (pending.snapshot) {
    hydrateRuntimeState(runtimeState, pending.snapshot);
    await persistWindowState(context, runtimeState);
  }

  await clearPendingPopOutWindow(context);
  await openOverlayPanel();
  log.info('Pop-out: overlay panel opened in new window');
  return true;
}

module.exports = {
  WINDOW_STATE_STORAGE_KEY,
  PENDING_POP_OUT_STORAGE_KEY,
  clearPendingPopOutWindow,
  createPopOutWindowHandler,
  openPendingOverlayIfRequested,
  persistWindowState,
  queuePopOutWindow,
  readPendingPopOutWindow,
  restoreWindowState
};
