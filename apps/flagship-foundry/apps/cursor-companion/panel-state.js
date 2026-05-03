function createRuntimeState() {
  const state = {
    serverProcess: null,
    latestEcosystemId: null,
    latestPanel: null,
    latestGapSummary: null,
    latestFocusPath: null,
    latestMirroredFile: null,
    latestWorkspaceTarget: null,
    latestContextCartId: null,
    latestRefinementSessionId: null,
    latestVisualArtifactId: null,
    latestPipelineId: null,
    latestPipelineStatus: null,
    latestBrowserPopoutUrl: null,
    browserPopoutServer: null
  };

  return {
    get() {
      return state;
    },
    getValue(key) {
      return state[key];
    },
    setValue(key, value) {
      state[key] = value;
      return value;
    },
    update(patch) {
      Object.assign(state, patch);
      return state;
    }
  };
}

const PERSISTED_RUNTIME_STATE_KEYS = [
  'latestEcosystemId',
  'latestGapSummary',
  'latestFocusPath',
  'latestMirroredFile',
  'latestWorkspaceTarget',
  'latestContextCartId',
  'latestRefinementSessionId',
  'latestVisualArtifactId',
  'latestPipelineId',
  'latestPipelineStatus',
  'latestBrowserPopoutUrl'
];

function snapshotRuntimeState(runtimeState) {
  const snapshot = {};
  const current = runtimeState.get();

  for (const key of PERSISTED_RUNTIME_STATE_KEYS) {
    snapshot[key] = current[key] ?? null;
  }

  return snapshot;
}

function hydrateRuntimeState(runtimeState, snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    return runtimeState.get();
  }

  runtimeState.update(snapshot);
  return runtimeState.get();
}

module.exports = {
  createRuntimeState,
  hydrateRuntimeState,
  snapshotRuntimeState,
  PERSISTED_RUNTIME_STATE_KEYS
};
