import { makeId } from './ids.mjs';

const defaultBudgets = {
  strategic_reasoning: { maxInputArtifacts: 12, maxFiles: 50, tokenBudget: 24000, mustResetContextOnComplete: true },
  constraint_interpretation: { maxInputArtifacts: 10, maxFiles: 30, tokenBudget: 16000, mustResetContextOnComplete: true },
  deterministic_transformation: { maxInputArtifacts: 8, maxFiles: 12, tokenBudget: 8000, mustResetContextOnComplete: true },
  structured_generation: { maxInputArtifacts: 10, maxFiles: 20, tokenBudget: 12000, mustResetContextOnComplete: true },
  verification: { maxInputArtifacts: 8, maxFiles: 20, tokenBudget: 12000, mustResetContextOnComplete: true },
  diagnostics: { maxInputArtifacts: 10, maxFiles: 30, tokenBudget: 16000, mustResetContextOnComplete: true },
  learning: { maxInputArtifacts: 20, maxFiles: 10, tokenBudget: 20000, mustResetContextOnComplete: true }
};

export function initialLifecycleStageForRequest(changeRequest) {
  switch (changeRequest.type) {
    case 'bug':
      return 'diagnose';
    case 'incident':
      return 'diagnose';
    case 'change':
      return 'plan';
    case 'research':
      return 'discover';
    case 'feature':
    default:
      return 'define';
  }
}

export function defaultPhaseId(changeRequest) {
  const base = initialLifecycleStageForRequest(changeRequest);
  return `${base}-${changeRequest.type || 'feature'}-${(changeRequest.requestId || 'request').toLowerCase()}`;
}

export function createWorkOrder(input) {
  const {
    title,
    lifecycleStage,
    phaseId,
    systemId,
    componentId,
    fileScope = [],
    taskClass,
    agentRole,
    agentPersona,
    modelTier,
    sourceArtifacts = [],
    allowedTools = [],
    constraints = [],
    expectedOutputs = [],
    acceptanceCriteria = [],
    verificationPlan = [],
    approvalRequirements = [],
    parentWorkOrderId,
    status = 'ready',
    rollbackNotes = '',
    escalationRules = [],
    inputGraphRefs = []
  } = input;

  return {
    workOrderId: makeId('wo', `${systemId || 'global'}-${title}`),
    parentWorkOrderId,
    lifecycleStage,
    phaseId,
    systemId,
    componentId,
    fileScope,
    taskClass,
    agentRole,
    agentPersona,
    modelTier,
    contextBudget: defaultBudgets[taskClass],
    sourceArtifacts,
    inputGraphRefs,
    allowedTools,
    constraints,
    expectedOutputs,
    acceptanceCriteria,
    verificationPlan,
    rollbackNotes,
    escalationRules,
    approvalRequirements,
    status
  };
}
