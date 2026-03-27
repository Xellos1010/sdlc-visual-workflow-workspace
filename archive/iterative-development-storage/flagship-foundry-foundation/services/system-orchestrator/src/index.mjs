import { createWorkOrder } from '../../../packages/core/src/work-orders.mjs';
import { resolveProviderForTask } from '../../../packages/core/src/provider-router.mjs';
import { createRepoExecutionOrders } from '../../repo-orchestrator/src/index.mjs';

export function createSystemPlan({ changeRequest, lifecycleStage, phaseId, systemId, parentWorkOrderId }) {
  const designSelection = resolveProviderForTask({ taskClass: 'strategic_reasoning', riskLevel: changeRequest.riskLevel });

  const planner = createWorkOrder({
    title: `${changeRequest.title} system plan`,
    lifecycleStage: lifecycleStage === 'diagnose' ? 'diagnose' : 'architect',
    phaseId,
    systemId,
    taskClass: lifecycleStage === 'diagnose' ? 'diagnostics' : 'strategic_reasoning',
    agentRole: lifecycleStage === 'diagnose' ? 'impact_analyst' : 'systems_architect',
    agentPersona: lifecycleStage === 'diagnose' ? 'incident_commander' : 'curious_architect',
    modelTier: designSelection.modelTier,
    sourceArtifacts: ['docs/FOUNDRY_ECOSYSTEM_SPEC.md', 'schemas/change-request.schema.json'],
    allowedTools: ['graph-read', 'contract-reader', 'design-diff'],
    constraints: changeRequest.constraints || [],
    expectedOutputs: ['system impact statement', 'component plan', 'repo execution envelope'],
    acceptanceCriteria: ['system boundaries identified', 'impacted components enumerated'],
    verificationPlan: ['cross-check component list against graph'],
    approvalRequirements: ['system-level design approval for high-risk work'],
    parentWorkOrderId,
    escalationRules: ['escalate on missing owner', 'escalate on multi-system contract ambiguity']
  });

  return [planner, ...createRepoExecutionOrders({ changeRequest, lifecycleStage, phaseId, systemId, parentWorkOrderId: planner.workOrderId })];
}
