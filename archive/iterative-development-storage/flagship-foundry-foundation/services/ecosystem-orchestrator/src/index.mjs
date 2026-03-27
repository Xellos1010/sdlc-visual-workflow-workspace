import { createWorkOrder, initialLifecycleStageForRequest, defaultPhaseId } from '../../../packages/core/src/work-orders.mjs';
import { resolveProviderForTask } from '../../../packages/core/src/provider-router.mjs';
import { createSystemPlan } from '../../system-orchestrator/src/index.mjs';
import { makeId } from '../../../packages/core/src/ids.mjs';

export function buildEcosystemPlan(changeRequest, graphSummary = null) {
  const lifecycleStage = initialLifecycleStageForRequest(changeRequest);
  const phaseId = changeRequest.phaseId || defaultPhaseId(changeRequest);
  const planId = makeId('plan', changeRequest.title || changeRequest.requestId);
  const impactSelection = resolveProviderForTask({ taskClass: lifecycleStage === 'diagnose' ? 'diagnostics' : 'strategic_reasoning', riskLevel: changeRequest.riskLevel });

  const ecosystemOrder = createWorkOrder({
    title: `${changeRequest.title} ecosystem impact analysis`,
    lifecycleStage,
    phaseId,
    systemId: 'ecosystem:flagship-foundry',
    taskClass: lifecycleStage === 'diagnose' ? 'diagnostics' : 'strategic_reasoning',
    agentRole: 'impact_analyst',
    agentPersona: lifecycleStage === 'diagnose' ? 'incident_commander' : 'curious_architect',
    modelTier: impactSelection.modelTier,
    sourceArtifacts: [
      'docs/FOUNDRY_ECOSYSTEM_SPEC.md',
      'schemas/change-request.schema.json',
      'schemas/agent-work-order.schema.json'
    ],
    allowedTools: ['graph-read', 'catalog-read', 'telemetry-reader'],
    constraints: changeRequest.constraints || [],
    expectedOutputs: ['ecosystem impact report', 'system routing decision', 'orchestration plan'],
    acceptanceCriteria: ['all impacted systems enumerated', 'risk posture declared'],
    verificationPlan: ['confirm graph references exist', 'confirm each system has a downstream plan'],
    approvalRequirements: ['ecosystem-level approval for critical changes'],
    inputGraphRefs: (changeRequest.impactedSystems || []).map((item) => `system:${item}`),
    escalationRules: ['escalate when system ownership is missing']
  });

  const impactedSystems = changeRequest.impactedSystems?.length
    ? changeRequest.impactedSystems
    : ['control-plane'];

  const systemPlans = impactedSystems.flatMap((systemId) => {
    const normalizedSystemId = systemId.startsWith('system:') ? systemId.replace('system:', '') : systemId;
    return createSystemPlan({
      changeRequest,
      lifecycleStage,
      phaseId,
      systemId: `system:${normalizedSystemId}`,
      parentWorkOrderId: ecosystemOrder.workOrderId
    });
  });

  const handoffSelection = resolveProviderForTask({ taskClass: 'structured_generation', riskLevel: changeRequest.riskLevel });
  const handoffOrder = createWorkOrder({
    title: `${changeRequest.title} handoff`,
    lifecycleStage: 'document',
    phaseId,
    systemId: 'ecosystem:flagship-foundry',
    taskClass: 'structured_generation',
    agentRole: 'context_curator',
    agentPersona: 'sync_editor',
    modelTier: handoffSelection.modelTier,
    sourceArtifacts: ['runbooks/task-completion-and-handoff.md', 'schemas/evidence-bundle.schema.json'],
    allowedTools: ['artifact-reader', 'doc-writer'],
    constraints: ['handoff must be resumable by another agent'],
    expectedOutputs: ['handoff summary', 'updated continuity state', 'artifact index'],
    acceptanceCriteria: ['next agent can resume without hidden context'],
    verificationPlan: ['cross-check work orders against handoff summary'],
    approvalRequirements: ['handoff published to repo docs'],
    parentWorkOrderId: ecosystemOrder.workOrderId,
    escalationRules: ['escalate if evidence or ownership is missing']
  });

  const learningSelection = resolveProviderForTask({ taskClass: 'learning', riskLevel: changeRequest.riskLevel });
  const learningOrder = createWorkOrder({
    title: `${changeRequest.title} learning capture`,
    lifecycleStage: 'improve',
    phaseId,
    systemId: 'ecosystem:flagship-foundry',
    taskClass: 'learning',
    agentRole: 'learning_agent',
    agentPersona: 'sync_editor',
    modelTier: learningSelection.modelTier,
    sourceArtifacts: ['schemas/fix-memory.schema.json', 'runbooks/learning-and-memory-curation.md'],
    allowedTools: ['artifact-reader', 'embedding-writer', 'catalog-writer'],
    constraints: ['capture problem, environment, solution, design paradigm, and prevention value'],
    expectedOutputs: ['fix memory records', 'pattern updates', 'guardrail recommendations'],
    acceptanceCriteria: ['reusable learning written in structured form'],
    verificationPlan: ['ensure memory references at least one work order and one evidence bundle'],
    approvalRequirements: ['learning entry reviewed before promotion to training corpus'],
    parentWorkOrderId: ecosystemOrder.workOrderId,
    escalationRules: ['escalate when root cause is still unresolved']
  });

  const graphPatchPreview = impactedSystems.map((systemId) => ({
    op: 'set_property',
    targetType: 'node',
    targetId: systemId.startsWith('system:') ? systemId : `system:${systemId}`,
    payload: { properties: { lastRequestedChange: changeRequest.requestId, requestedState: 'planned' } }
  }));

  return {
    planId,
    requestId: changeRequest.requestId,
    title: changeRequest.title,
    lifecycleStage,
    phaseId,
    graphSummary,
    workOrders: [ecosystemOrder, ...systemPlans, handoffOrder, learningOrder],
    graphPatchPreview,
    summary: {
      impactedSystems,
      workOrderCount: 1 + systemPlans.length + 2,
      nextStep: 'bind provider adapters and execution envelopes to each ready work order'
    }
  };
}
