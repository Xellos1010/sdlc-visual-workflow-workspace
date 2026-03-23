import { createWorkOrder } from '../../../packages/core/src/work-orders.mjs';
import { resolveProviderForTask } from '../../../packages/core/src/provider-router.mjs';

export function createRepoExecutionOrders({ changeRequest, lifecycleStage, phaseId, systemId, parentWorkOrderId }) {
  const builderSelection = resolveProviderForTask({ taskClass: 'deterministic_transformation', riskLevel: changeRequest.riskLevel });
  const verifierSelection = resolveProviderForTask({ taskClass: 'verification', riskLevel: changeRequest.riskLevel });

  const builder = createWorkOrder({
    title: `${changeRequest.title} builder`,
    lifecycleStage: 'implement',
    phaseId,
    systemId,
    taskClass: 'deterministic_transformation',
    agentRole: 'builder',
    agentPersona: 'conservative_builder',
    modelTier: builderSelection.modelTier,
    sourceArtifacts: ['schemas/agent-work-order.schema.json', 'runbooks/feature-intake.md'],
    allowedTools: ['file-system', 'git-worktree', 'formatter', 'test-runner'],
    constraints: changeRequest.constraints || [],
    expectedOutputs: ['changed source files', 'updated tests', 'graph patch'],
    acceptanceCriteria: changeRequest.acceptanceCriteria || [],
    verificationPlan: ['run targeted tests', 'ensure acceptance criteria are mapped'],
    approvalRequirements: ['repo-level approval for code changes'],
    parentWorkOrderId,
    escalationRules: ['escalate on missing contract', 'escalate on cross-system hidden coupling']
  });

  const verifier = createWorkOrder({
    title: `${changeRequest.title} verifier`,
    lifecycleStage: 'verify',
    phaseId,
    systemId,
    taskClass: 'verification',
    agentRole: 'verifier',
    agentPersona: 'skeptical_verifier',
    modelTier: verifierSelection.modelTier,
    sourceArtifacts: ['schemas/evidence-bundle.schema.json', 'runbooks/task-completion-and-handoff.md'],
    allowedTools: ['test-runner', 'static-analysis', 'artifact-reader'],
    constraints: ['builder agent output is not trusted without evidence'],
    expectedOutputs: ['verification evidence', 'independent summary', 'release recommendation'],
    acceptanceCriteria: ['all declared acceptance criteria mapped to evidence'],
    verificationPlan: ['execute verification checklist', 'record failures and missing evidence'],
    approvalRequirements: ['verification sign-off before release'],
    parentWorkOrderId,
    escalationRules: ['escalate when evidence conflicts with builder claim']
  });

  return [builder, verifier];
}
