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

async function loadOverlayCollections(baseUrl) {
  const [plans, runs, knowledgeBases] = await Promise.all([
    fetchJson(`${baseUrl}/plans`).catch(() => []),
    fetchJson(`${baseUrl}/runs`).catch(() => []),
    fetchJson(`${baseUrl}/knowledge-bases`).catch(() => [])
  ]);
  return { plans, runs, knowledgeBases };
}

async function loadOperatorCollections(baseUrl, ecosystemId) {
  if (!ecosystemId) {
    return {
      workspaceTarget: null,
      contextCarts: [],
      refinementSessions: [],
      visualArtifacts: [],
      planningBoard: [],
      budgetSnapshot: null,
      sessionBoard: null,
      graphSnapshot: null,
      ragStatus: null,
      pipelines: []
    };
  }

  const [
    workspaceTarget,
    contextCarts,
    refinementSessions,
    visualArtifacts,
    planningBoard,
    budgetSnapshot,
    sessionBoard,
    graphSnapshot,
    ragStatus,
    pipelines
  ] = await Promise.all([
    fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/workspace-target`).catch(() => null),
    fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/context-carts`).catch(() => []),
    fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/refinement-sessions`).catch(() => []),
    fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/visual-artifacts`).catch(() => []),
    fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/planning-board`).catch(() => []),
    fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/budget-snapshot`).catch(() => null),
    fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/operator/session-board`).catch(() => null),
    fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/graph`).catch(() => null),
    fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/rag/status`).catch(() => null),
    fetchJson(`${baseUrl}/pipelines?ecosystemId=${encodeURIComponent(ecosystemId)}`).catch(() => [])
  ]);

  return {
    workspaceTarget,
    contextCarts,
    refinementSessions,
    visualArtifacts,
    planningBoard,
    budgetSnapshot,
    sessionBoard,
    graphSnapshot,
    ragStatus,
    pipelines
  };
}

async function loadGapSummary(baseUrl, ecosystemId, fallback) {
  if (!ecosystemId) {
    return fallback;
  }
  return fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/analysis/gap`)
    .then((value) => value?.summary || fallback)
    .catch(() => fallback);
}

async function loadPhases(baseUrl) {
  try {
    return await fetchJson(`${baseUrl}/ontology/phases`);
  } catch {
    return null;
  }
}

async function loadGraphStatsAndPlanningContext(baseUrl, ecosystemId, knowledgeBases) {
  if (!ecosystemId) {
    return { graphStats: null, planningContext: null };
  }

  try {
    const graph = await fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/graph`);
    const graphStats = {
      nodeCount: graph.nodes?.length ?? 0,
      edgeCount: graph.edges?.length ?? 0
    };
    const knowledgeBaseId = knowledgeBases[0]?.id;
    const queryString = knowledgeBaseId
      ? `ecosystemId=${encodeURIComponent(ecosystemId)}&knowledgeBaseId=${encodeURIComponent(knowledgeBaseId)}`
      : `ecosystemId=${encodeURIComponent(ecosystemId)}`;
    const planningContext = await fetchJson(`${baseUrl}/planning/context?${queryString}`);
    return { graphStats, planningContext };
  } catch {
    return { graphStats: null, planningContext: null };
  }
}

async function rebuildGraph(baseUrl, ecosystemId) {
  return fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/graph/rebuild`, {
    method: 'POST',
    body: JSON.stringify({ ecosystemId })
  });
}

async function queryGraph(baseUrl, ecosystemId, query) {
  return fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/graph/query`, {
    method: 'POST',
    body: JSON.stringify({ ecosystemId, ...query })
  });
}

async function getRagStatus(baseUrl, ecosystemId) {
  return fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/rag/status`);
}

async function indexRag(baseUrl, ecosystemId) {
  return fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/rag/index`, {
    method: 'POST',
    body: JSON.stringify({ ecosystemId })
  });
}

async function queryRag(baseUrl, ecosystemId, query) {
  return fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/rag/query`, {
    method: 'POST',
    body: JSON.stringify({ ecosystemId, ...query })
  });
}

async function packageExport(baseUrl, ecosystemId, selection) {
  return fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/export`, {
    method: 'POST',
    body: JSON.stringify({ ecosystemId, selection })
  });
}

async function importExport(baseUrl, ecosystemId, archive) {
  return fetchJson(`${baseUrl}/ecosystems/${ecosystemId}/import`, {
    method: 'POST',
    body: JSON.stringify({ ecosystemId, archive })
  });
}

async function createPipeline(baseUrl, pipelineDefinition) {
  return fetchJson(`${baseUrl}/pipelines/create`, {
    method: 'POST',
    body: JSON.stringify(pipelineDefinition)
  });
}

async function launchPipeline(baseUrl, pipelineId, ecosystemId, input = {}) {
  return fetchJson(`${baseUrl}/pipelines/${pipelineId}/launch`, {
    method: 'POST',
    body: JSON.stringify({ ecosystemId, ...input })
  });
}

async function getPipelineStatus(baseUrl, pipelineId, ecosystemId) {
  return fetchJson(`${baseUrl}/pipelines/${pipelineId}/status?ecosystemId=${encodeURIComponent(ecosystemId)}`);
}

async function pausePipeline(baseUrl, pipelineId, ecosystemId) {
  return fetchJson(`${baseUrl}/pipelines/${pipelineId}/pause`, {
    method: 'POST',
    body: JSON.stringify({ ecosystemId })
  });
}

async function resumePipeline(baseUrl, pipelineId, ecosystemId) {
  return fetchJson(`${baseUrl}/pipelines/${pipelineId}/resume`, {
    method: 'POST',
    body: JSON.stringify({ ecosystemId })
  });
}

function isRiskyObjective(objective) {
  return /harden|permission|auth|security|architecture|migration|state authority/i.test(objective);
}

function buildPlanPayload({ ecosystemId, objective, knowledgeBaseId, settings }) {
  const riskyObjective = isRiskyObjective(objective);
  return {
    ecosystemId,
    title: objective,
    objective,
    targetQuery: objective,
    sourceSignal: 'request',
    riskLevel: riskyObjective ? 'high' : 'medium',
    knowledgeBaseId: knowledgeBaseId || null,
    reviewPolicyId: riskyObjective ? 'review-policy:high-risk-adversarial' : 'review-policy:default',
    approval: {
      mode: settings.autoApproveDraftPlans ? 'auto' : 'manual',
      autoApprove: settings.autoApproveDraftPlans,
      autoStartOnApproval: settings.autoStartApprovedPlans
    }
  };
}

function buildRunRequest({ planId, mode }) {
  if (mode === 'execute') {
    return { planId, mode: 'execute', adapterId: 'adapter:local-shell' };
  }
  return { planId, mode: 'simulate', adapterId: 'adapter:cursor-companion' };
}

function latestItems({ plans, runs }) {
  return {
    latestPlan: plans[0] || null,
    latestRun: runs[0] || null
  };
}

module.exports = {
  buildPlanPayload,
  buildRunRequest,
  createPipeline,
  fetchJson,
  isRiskyObjective,
  importExport,
  latestItems,
  loadGapSummary,
  loadGraphStatsAndPlanningContext,
  loadOverlayCollections,
  loadOperatorCollections,
  loadPhases,
  getPipelineStatus,
  getRagStatus,
  indexRag,
  launchPipeline,
  packageExport,
  pausePipeline,
  queryGraph,
  queryRag,
  rebuildGraph,
  resumePipeline
};
