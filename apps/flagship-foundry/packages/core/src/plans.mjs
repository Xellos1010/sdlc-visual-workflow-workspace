import path from 'node:path';
import { makeId, nowIso, readJson, stateRoot, writeJson } from './io.mjs';
import { analyzeBlastRadius } from './blast-radius.mjs';
import { loadGraph } from './graph-store.mjs';
import { loadCatalogs } from './catalogs.mjs';

function planFilePath(planId) {
  return path.join(stateRoot, 'plans', `${planId.replace(/[:/]+/g, '-')}.json`);
}

function approvalFilePath(planId) {
  return path.join(stateRoot, 'approvals', `${planId.replace(/[:/]+/g, '-')}.json`);
}

function defaultApprovalFor(changeRequest) {
  const risk = changeRequest.riskLevel ?? 'medium';
  const requestedMode = changeRequest.approval?.mode ?? null;
  const autoApprove = requestedMode === 'auto' || Boolean(changeRequest.approval?.autoApprove);
  const autoStart = Boolean(changeRequest.approval?.autoStartOnApproval);
  return {
    mode: requestedMode ?? (autoApprove ? 'auto' : 'manual'),
    autoApprove,
    autoStartOnApproval: autoStart,
    requiredReason: risk === 'high' || risk === 'critical',
    status: autoApprove ? 'approved' : 'pending'
  };
}

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function normalizeReviewPolicy(policy) {
  return {
    id: policy?.id ?? 'review-policy:inline',
    debateRounds: Number(policy?.debateRounds ?? 0),
    reviewerPersonaId: policy?.reviewerPersonaId ?? 'persona:adversarial-architect',
    enableArchitectureChallenge: Boolean(policy?.enableArchitectureChallenge),
    requireReconciliationMemo: Boolean(policy?.requireReconciliationMemo),
    stopConditions: unique(policy?.stopConditions ?? [])
  };
}

async function resolveReviewPolicy(changeRequest) {
  if (changeRequest.reviewPolicy) {
    return normalizeReviewPolicy(changeRequest.reviewPolicy);
  }

  const catalogs = await loadCatalogs();
  const requestedId = changeRequest.reviewPolicyId;
  const defaultId = ['high', 'critical'].includes(changeRequest.riskLevel ?? 'medium')
    ? 'review-policy:high-risk-adversarial'
    : 'review-policy:default';
  const policyId = requestedId ?? defaultId;
  const match = (catalogs.reviewPolicies ?? []).find((policy) => policy.id === policyId);
  return normalizeReviewPolicy(match ?? { id: policyId });
}

function pickPersonaIds(project, phase, reviewPolicy) {
  const personaIds = ['persona:ecosystem-orchestrator', 'persona:independent-verifier'];
  const platformIds = project.platformIds ?? [];
  const frameworkIds = project.frameworkIds ?? [];

  if (platformIds.includes('platform:chrome-extension-mv3')) {
    personaIds.push('persona:chrome-extension-mv3-sme');
  }
  if (frameworkIds.includes('framework:react')) {
    personaIds.push('persona:react-vite-ui-sme');
  }
  if (frameworkIds.includes('framework:nx')) {
    personaIds.push('persona:nx-monorepo-cartographer');
  }
  if (platformIds.includes('platform:node-runtime')) {
    personaIds.push('persona:typescript-node-runtime-sme');
  }
  if (phase === 'challenge' || phase === 'reconcile') {
    personaIds.push(reviewPolicy.reviewerPersonaId);
  }
  if (phase === 'learn') {
    personaIds.push('persona:telemetry-and-learning-curator');
  }
  if (phase === 'document') {
    personaIds.push('persona:knowledge-curator');
  }
  personaIds.push('persona:plan-approval-governor');
  return unique(personaIds);
}

function taskBlueprintFor(phase) {
  if (phase === 'inspect') {
    return {
      title: 'Inspect impacted scope and current design pattern',
      acceptanceCriteria: [
        'primary change surface identified',
        'initial blast radius and sibling surfaces listed'
      ],
      commands: []
    };
  }
  if (phase === 'propose') {
    return {
      title: 'Propose implementation approach and explicit assumptions',
      acceptanceCriteria: [
        'candidate implementation path documented',
        'assumptions and unknowns made explicit'
      ],
      commands: []
    };
  }
  if (phase === 'challenge') {
    return {
      title: 'Challenge the proposal for hidden blast radius and trade-offs',
      acceptanceCriteria: [
        'adversarial objections captured',
        'hidden dependencies and rollback concerns listed'
      ],
      commands: []
    };
  }
  if (phase === 'reconcile') {
    return {
      title: 'Reconcile challenged design into an approved execution shape',
      acceptanceCriteria: [
        'reconciliation memo written',
        'updated blast radius and decision rationale recorded'
      ],
      commands: []
    };
  }
  if (phase === 'design') {
    return {
      title: 'Update design and implementation boundaries',
      acceptanceCriteria: [
        'design delta captured',
        'contracts and shared patterns reviewed'
      ],
      commands: []
    };
  }
  if (phase === 'implement') {
    return {
      title: 'Implement bounded changes',
      acceptanceCriteria: [
        'bounded code changes applied',
        'changed components and shared siblings updated'
      ],
      commands: []
    };
  }
  if (phase === 'verify') {
    return {
      title: 'Run independent verification',
      acceptanceCriteria: [
        'verification commands green',
        'evidence bundle written'
      ],
      commands: null
    };
  }
  if (phase === 'document') {
    return {
      title: 'Write handoff, runbook, and fix-memory artifacts',
      acceptanceCriteria: [
        'handoff updated',
        'continuity and task-state outputs refreshed'
      ],
      commands: []
    };
  }
  if (phase === 'learn') {
    return {
      title: 'Capture self-improvement and training signals',
      acceptanceCriteria: [
        'problem environment solution record emitted',
        'guardrail or training export candidate proposed'
      ],
      commands: []
    };
  }
  return {
    title: phase,
    acceptanceCriteria: ['phase-specific acceptance criteria satisfied'],
    commands: []
  };
}

function buildPhasePlan(reviewPolicy) {
  const phases = ['inspect'];
  if (reviewPolicy.enableArchitectureChallenge || reviewPolicy.debateRounds > 0) {
    phases.push('propose');
    for (let round = 1; round <= Math.max(1, reviewPolicy.debateRounds); round += 1) {
      phases.push(`challenge:${round}`);
      if (reviewPolicy.requireReconciliationMemo || round < reviewPolicy.debateRounds) {
        phases.push(`reconcile:${round}`);
      }
    }
  }
  phases.push('design', 'implement', 'verify', 'document', 'learn');
  return phases;
}

function buildTask(project, phaseToken, sequence, sourceSignal, reviewPolicy) {
  const [phase, roundRaw] = phaseToken.split(':');
  const round = roundRaw ? Number(roundRaw) : null;
  const taskId = makeId('task', `${project.id}-${phaseToken}-${sequence}`);
  const personaIds = pickPersonaIds(project, phase, reviewPolicy);
  const blueprint = taskBlueprintFor(phase);
  const title = round ? `${blueprint.title} (round ${round})` : blueprint.title;
  const commands = phase === 'verify' ? project.verificationCommands : blueprint.commands;
  return {
    id: taskId,
    projectId: project.id,
    phase,
    phaseToken,
    sequence,
    round,
    title,
    status: 'queued',
    personaIds,
    sourceSignal,
    commands,
    acceptanceCriteria: blueprint.acceptanceCriteria,
    stopConditions: phase === 'challenge' || phase === 'reconcile' ? reviewPolicy.stopConditions : []
  };
}

export async function createPlan(changeRequest, options = {}) {
  const ecosystemId = changeRequest.ecosystemId;
  const graph = await loadGraph(ecosystemId, ecosystemId);
  const blastRadius = analyzeBlastRadius(graph, changeRequest.targetQuery ?? changeRequest.title);
  const impactedProjects = graph.nodes
    .filter((node) => node.type === 'project' && blastRadius.impactedNodes.some((entry) => entry.id === node.id))
    .sort((left, right) => left.name.localeCompare(right.name));

  const planId = makeId('plan', `${ecosystemId}-${changeRequest.title}-${Date.now()}`);
  const approval = {
    ...defaultApprovalFor(changeRequest),
    approvedAt: null,
    approvedBy: null,
    notes: changeRequest.approval?.notes ?? null
  };
  const reviewPolicy = await resolveReviewPolicy(changeRequest);

  const projectPlans = impactedProjects.map((project) => {
    const projectPhases = buildPhasePlan(reviewPolicy);
    const projectContext = {
      id: project.id,
      name: project.name,
      ...(project.properties ?? {})
    };
    return {
      projectId: project.id,
      name: project.name,
      status: approval.status === 'approved' && approval.autoStartOnApproval ? 'ready' : 'planned',
      phases: projectPhases,
      tasks: projectPhases.map((phase, index) => buildTask(projectContext, phase, index + 1, changeRequest.sourceSignal ?? 'request', reviewPolicy))
    };
  });

  const plan = {
    id: planId,
    ecosystemId,
    createdAt: nowIso(),
    title: changeRequest.title,
    objective: changeRequest.objective,
    sourceSignal: changeRequest.sourceSignal ?? 'request',
    status: approval.status === 'approved' ? (approval.autoStartOnApproval ? 'approved-ready' : 'approved') : 'pending-approval',
    approval,
    reviewPolicy,
    blastRadius,
    requestedTargets: changeRequest.requestedTargets ?? [],
    riskLevel: changeRequest.riskLevel ?? 'medium',
    knowledgeBaseId: changeRequest.knowledgeBaseId ?? null,
    projectPlans,
    nextActions: approval.status === 'approved'
      ? ['start a run when ready']
      : ['review blast radius', 'review debate requirements', 'approve or reject the draft', 'toggle auto-approval if desired']
  };

  await writeJson(planFilePath(planId), plan);
  await writeJson(approvalFilePath(planId), approval);
  return plan;
}

export async function listPlans() {
  const plansDir = path.join(stateRoot, 'plans');
  try {
    const files = await import('node:fs/promises').then((fs) => fs.readdir(plansDir));
    const plans = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      plans.push(await readJson(path.join(plansDir, file)));
    }
    return plans.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } catch {
    return [];
  }
}

export async function loadPlan(planId) {
  return readJson(planFilePath(planId));
}

export async function updatePlanApproval(planId, update) {
  const plan = await loadPlan(planId);
  const approval = {
    ...(plan.approval ?? {}),
    ...update,
    approvedAt: update.status === 'approved' ? nowIso() : plan.approval?.approvedAt ?? null
  };
  plan.approval = approval;
  if (update.status === 'approved') {
    plan.status = approval.autoStartOnApproval ? 'approved-ready' : 'approved';
  }
  if (update.status === 'rejected') {
    plan.status = 'rejected';
  }
  await writeJson(planFilePath(planId), plan);
  await writeJson(approvalFilePath(planId), approval);
  return plan;
}
