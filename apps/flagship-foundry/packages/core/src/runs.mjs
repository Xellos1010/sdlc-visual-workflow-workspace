import path from 'node:path';
import { makeId, nowIso, readJson, stateRoot, writeJson } from './io.mjs';
import { loadPlan } from './plans.mjs';

function runFilePath(runId) {
  return path.join(stateRoot, 'runs', `${runId.replace(/[:/]+/g, '-')}.json`);
}

function runWorkspacePath(runId) {
  return path.join(stateRoot, 'run-workspaces', runId.replace(/[:/]+/g, '-'));
}

function appendRunEvent(run, type, details = {}) {
  run.timeline = Array.isArray(run.timeline) ? run.timeline : [];
  run.timeline.push({
    type,
    timestamp: nowIso(),
    details
  });
}

function flattenTasks(plan) {
  return plan.projectPlans.flatMap((projectPlan) =>
    projectPlan.tasks.map((task) => ({
      ...task,
      projectPlanId: projectPlan.projectId
    }))
  );
}

function createTaskCorrelation(runId, planId, ecosystemId, adapterId, taskId) {
  const correlation = {
    runId,
    taskId,
    planId
  };
  if (ecosystemId) {
    correlation.ecosystemId = ecosystemId;
  }
  if (adapterId) {
    correlation.adapterId = adapterId;
  }
  return correlation;
}

function normalizeTelemetryReference(reference, correlation) {
  if (!reference || typeof reference !== 'object') {
    return null;
  }
  return {
    ...reference,
    correlation: {
      ...correlation,
      ...(reference.correlation ?? {})
    }
  };
}

function normalizeTelemetryReferences(telemetryReferences, correlation) {
  const before = Array.isArray(telemetryReferences?.before) ? telemetryReferences.before : [];
  const after = Array.isArray(telemetryReferences?.after) ? telemetryReferences.after : [];
  return {
    before: before.map((reference) => normalizeTelemetryReference(reference, correlation)).filter(Boolean),
    after: after.map((reference) => normalizeTelemetryReference(reference, correlation)).filter(Boolean)
  };
}

export async function createRunForPlan(planId, options = {}) {
  const plan = await loadPlan(planId);
  const runId = makeId('run', `${planId}-${Date.now()}`);
  const adapterId = options.adapterId ?? 'adapter:dry-run';
  const tasks = flattenTasks(plan).map((task) => ({
    ...task,
    status: 'queued',
    verificationResults: [],
    evidenceArtifacts: [],
    telemetryReferences: {
      before: [],
      after: []
    },
    correlation: createTaskCorrelation(runId, planId, plan.ecosystemId, adapterId, task.id)
  }));
  const run = {
    id: runId,
    planId,
    ecosystemId: plan.ecosystemId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    status: 'ready',
    mode: options.mode ?? 'simulate',
    adapterId,
    isolation: {
      mode: 'run-scoped',
      workspaceRoot: runWorkspacePath(runId),
      defaultWritePolicy: 'workspace-only',
      allowExternalWritesByDefault: false
    },
    rollback: {
      boundary: 'run-instance',
      pausePreservesEvidence: true,
      stopPreservesEvidence: true
    },
    timeline: [],
    tasks,
    agentSessions: tasks.map((task) => ({
      id: makeId('agent-session', `${runId}-${task.id}`),
      taskId: task.id,
      status: 'idle',
      personaIds: task.personaIds,
      adapterId
    }))
  };
  appendRunEvent(run, 'run-created', { mode: run.mode, adapterId: run.adapterId });
  await writeJson(runFilePath(runId), run);
  return run;
}

export async function loadRun(runId) {
  return readJson(runFilePath(runId));
}

export async function listRuns() {
  const runsDir = path.join(stateRoot, 'runs');
  try {
    const files = await import('node:fs/promises').then((fs) => fs.readdir(runsDir));
    const runs = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      runs.push(await readJson(path.join(runsDir, file)));
    }
    return runs.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  } catch {
    return [];
  }
}

function activateNextTasks(run) {
  if (run.status === 'stopped') {
    return run;
  }
  const runningTasks = run.tasks.filter((task) => task.status === 'running');
  if (runningTasks.length > 0) {
    return run;
  }
  const nextTasks = [];
  for (const task of run.tasks) {
    if (task.status === 'queued') {
      nextTasks.push(task);
      const sameProjectRunning = nextTasks.some((item) => item.projectPlanId === task.projectPlanId);
      if (sameProjectRunning) {
        continue;
      }
    }
  }
  const byProject = new Set();
  for (const task of run.tasks) {
    if (task.status !== 'queued') continue;
    if (byProject.has(task.projectPlanId)) continue;
    task.status = 'running';
    task.startedAt = nowIso();
    byProject.add(task.projectPlanId);
    const session = run.agentSessions.find((entry) => entry.taskId === task.id);
    if (session) session.status = 'running';
  }
  run.status = 'running';
  return run;
}

export async function transitionRun(runId, action) {
  const run = await loadRun(runId);
  if (action === 'start') {
    activateNextTasks(run);
    if (!run.startedAt && run.status === 'running') {
      run.startedAt = nowIso();
    }
    appendRunEvent(run, 'run-started', { status: run.status });
  } else if (action === 'pause') {
    run.status = 'paused';
    for (const task of run.tasks) {
      if (task.status === 'running') task.status = 'paused';
    }
    for (const session of run.agentSessions) {
      if (session.status === 'running') session.status = 'paused';
    }
    appendRunEvent(run, 'run-paused', { rollbackBoundary: run.rollback?.boundary ?? 'run-instance' });
  } else if (action === 'resume') {
    for (const task of run.tasks) {
      if (task.status === 'paused') task.status = 'queued';
    }
    for (const session of run.agentSessions) {
      if (session.status === 'paused') session.status = 'idle';
    }
    activateNextTasks(run);
    appendRunEvent(run, 'run-resumed', { status: run.status });
  } else if (action === 'stop') {
    run.status = 'stopped';
    for (const task of run.tasks) {
      if (task.status === 'running' || task.status === 'paused' || task.status === 'queued') {
        task.status = 'stopped';
      }
    }
    for (const session of run.agentSessions) {
      if (session.status !== 'done') session.status = 'stopped';
    }
    appendRunEvent(run, 'run-stopped', {
      rollbackBoundary: run.rollback?.boundary ?? 'run-instance',
      preservedEvidence: true
    });
  }
  run.updatedAt = nowIso();
  await writeJson(runFilePath(runId), run);
  return run;
}

function stampTaskCompletion(task, finalStatus) {
  const now = nowIso();
  task.status = finalStatus;
  task.completedAt = now;
  if (task.startedAt) {
    task.durationMs = new Date(now).getTime() - new Date(task.startedAt).getTime();
  }
}

export async function completeTask(runId, taskId, options = {}) {
  const run = await loadRun(runId);
  const task = run.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error(`Task ${taskId} not found in run ${runId}`);
  task.correlation = task.correlation ?? createTaskCorrelation(run.id, run.planId, run.ecosystemId, run.adapterId, task.id);
  stampTaskCompletion(task, 'completed');
  if (options.verificationResults) {
    task.verificationResults = options.verificationResults;
  }
  if (options.evidenceArtifacts) {
    task.evidenceArtifacts = options.evidenceArtifacts;
  }
  if (options.telemetryReferences) {
    task.telemetryReferences = normalizeTelemetryReferences(options.telemetryReferences, task.correlation);
  }
  if (options.fixMemoryRef) {
    task.fixMemoryRef = options.fixMemoryRef;
  }
  appendRunEvent(run, 'task-completed', {
    taskId,
    evidenceCount: Array.isArray(task.evidenceArtifacts) ? task.evidenceArtifacts.length : 0
  });
  const session = run.agentSessions.find((s) => s.taskId === taskId);
  if (session) session.status = 'done';
  activateNextTasks(run);
  const allDone = run.tasks.every((t) => t.status === 'completed' || t.status === 'stopped' || t.status === 'failed');
  if (allDone) {
    run.status = 'completed';
    run.completedAt = nowIso();
  }
  run.updatedAt = nowIso();
  await writeJson(runFilePath(runId), run);
  return run;
}

export async function failTask(runId, taskId, options = {}) {
  const run = await loadRun(runId);
  const task = run.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error(`Task ${taskId} not found in run ${runId}`);
  task.correlation = task.correlation ?? createTaskCorrelation(run.id, run.planId, run.ecosystemId, run.adapterId, task.id);
  stampTaskCompletion(task, 'failed');
  if (options.verificationResults) {
    task.verificationResults = options.verificationResults;
  }
  if (options.evidenceArtifacts) {
    task.evidenceArtifacts = options.evidenceArtifacts;
  }
  if (options.telemetryReferences) {
    task.telemetryReferences = normalizeTelemetryReferences(options.telemetryReferences, task.correlation);
  }
  if (options.fixMemoryRef) {
    task.fixMemoryRef = options.fixMemoryRef;
  }
  appendRunEvent(run, 'task-failed', {
    taskId,
    evidenceCount: Array.isArray(task.evidenceArtifacts) ? task.evidenceArtifacts.length : 0
  });
  const session = run.agentSessions.find((s) => s.taskId === taskId);
  if (session) session.status = 'failed';
  run.status = 'failed';
  run.updatedAt = nowIso();
  await writeJson(runFilePath(runId), run);
  return run;
}
