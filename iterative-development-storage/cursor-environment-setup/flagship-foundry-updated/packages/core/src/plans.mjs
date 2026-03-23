import path from 'node:path';
import { makeId, nowIso, readJson, stateRoot, writeJson } from './io.mjs';
import { analyzeBlastRadius } from './blast-radius.mjs';
import { loadGraph } from './graph-store.mjs';

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

function pickPersonaIds(project) {
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
  personaIds.push('persona:telemetry-and-learning-curator');
  return [...new Set(personaIds)];
}

function buildTask(project, phase, sequence, sourceSignal) {
  const taskId = makeId('task', `${project.id}-${phase}-${sequence}`);
  const personaIds = pickPersonaIds(project);
  const titles = {
    inspect: 'Inspect impacted scope and design pattern',
    design: 'Update design and blast-radius coverage',
    implement: 'Implement bounded changes',
    verify: 'Run independent verification',
    document: 'Write handoff and fix-memory artifacts'
  };
  return {
    id: taskId,
    projectId: project.id,
    phase,
    title: titles[phase] ?? phase,
    status: 'queued',
    personaIds,
    sourceSignal,
    commands: phase === 'verify' ? project.verificationCommands : [],
    acceptanceCriteria: phase === 'verify'
      ? ['verification commands green', 'evidence bundle written']
      : phase === 'document'
        ? ['handoff updated', 'fix-memory candidate recorded']
        : ['phase-specific acceptance criteria satisfied']
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

  const projectPlans = impactedProjects.map((project) => {
    const projectPhases = ['inspect', 'design', 'implement', 'verify', 'document'];
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
      tasks: projectPhases.map((phase, index) => buildTask(projectContext, phase, index + 1, changeRequest.sourceSignal ?? 'request'))
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
    blastRadius,
    requestedTargets: changeRequest.requestedTargets ?? [],
    riskLevel: changeRequest.riskLevel ?? 'medium',
    projectPlans,
    nextActions: approval.status === 'approved'
      ? ['start a run when ready']
      : ['review blast radius', 'approve or reject the draft', 'toggle auto-approval if desired']
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
