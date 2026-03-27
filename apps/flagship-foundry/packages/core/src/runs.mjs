import path from 'node:path';
import fs from 'node:fs/promises';
import { makeId, nowIso, readJson, stateRoot, writeJson } from './io.mjs';
import { loadPlan } from './plans.mjs';

// ── Index helpers (shared with plans.mjs) ─────────────────────────────────────

const indexPath = path.join(stateRoot, '_index.json');

async function readIndex() {
  return readJson(indexPath, { plans: {}, runs: {} });
}

async function updateIndex(updater) {
  const index = await readIndex();
  updater(index);
  await writeJson(indexPath, index);
  return index;
}

// ── Path builders ─────────────────────────────────────────────────────────────

function safeId(runId) {
  return runId.replace(/[:/]+/g, '-');
}

function ecoscopedRunDir(ecosystemId, location) {
  return path.join(stateRoot, 'ecosystems', ecosystemId, location, 'runs');
}

function ecoscopedRunPath(runId, ecosystemId, location) {
  return path.join(ecoscopedRunDir(ecosystemId, location), `${safeId(runId)}.json`);
}

function ecoscopedRunHeaderPath(runId, ecosystemId, location) {
  return path.join(ecoscopedRunDir(ecosystemId, location), `${safeId(runId)}.header.json`);
}

function runWorkspacePath(runId) {
  return path.join(stateRoot, 'run-workspaces', safeId(runId));
}

function legacyRunPath(runId) {
  return path.join(stateRoot, 'runs', `${safeId(runId)}.json`);
}

const DONE_STATUSES = new Set(['completed', 'stopped', 'failed']);

function runLocation(status) {
  return DONE_STATUSES.has(status) ? 'completed' : 'live';
}

async function resolveRunPaths(runId) {
  const sid = safeId(runId);
  const index = await readIndex();
  const entry = index.runs[sid];
  if (entry) {
    return {
      detail: ecoscopedRunPath(runId, entry.ecosystemId, entry.location),
      header: ecoscopedRunHeaderPath(runId, entry.ecosystemId, entry.location),
      ecosystemId: entry.ecosystemId,
      location: entry.location,
    };
  }
  // Legacy fallback
  return {
    detail: legacyRunPath(runId),
    header: null,
    ecosystemId: null,
    location: null,
  };
}

// ── Run header builder ────────────────────────────────────────────────────────

function buildRunHeader(run) {
  return {
    id: run.id,
    planId: run.planId,
    ecosystemId: run.ecosystemId,
    status: run.status,
    mode: run.mode,
    adapterId: run.adapterId,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    startedAt: run.startedAt ?? null,
    completedAt: run.completedAt ?? null,
    taskCount: run.tasks?.length ?? 0,
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

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
  const correlation = { runId, taskId, planId };
  if (ecosystemId) correlation.ecosystemId = ecosystemId;
  if (adapterId) correlation.adapterId = adapterId;
  return correlation;
}

function normalizeTelemetryReference(reference, correlation) {
  if (!reference || typeof reference !== 'object') return null;
  return { ...reference, correlation: { ...correlation, ...(reference.correlation ?? {}) } };
}

function normalizeTelemetryReferences(telemetryReferences, correlation) {
  const before = Array.isArray(telemetryReferences?.before) ? telemetryReferences.before : [];
  const after = Array.isArray(telemetryReferences?.after) ? telemetryReferences.after : [];
  return {
    before: before.map((r) => normalizeTelemetryReference(r, correlation)).filter(Boolean),
    after: after.map((r) => normalizeTelemetryReference(r, correlation)).filter(Boolean)
  };
}

async function persistRun(run) {
  const paths = await resolveRunPaths(run.id);
  if (!paths.ecosystemId) {
    // Newly created run — write to ecosystem-scoped path and register in index
    const location = runLocation(run.status);
    const detailPath = ecoscopedRunPath(run.id, run.ecosystemId, location);
    const headerPath = ecoscopedRunHeaderPath(run.id, run.ecosystemId, location);
    await writeJson(detailPath, run);
    await writeJson(headerPath, buildRunHeader(run));
    await updateIndex((index) => {
      index.runs[safeId(run.id)] = { ecosystemId: run.ecosystemId, location };
    });
    return;
  }

  // Determine if the run has moved to a different lifecycle bucket
  const newLocation = runLocation(run.status);
  if (newLocation !== paths.location && paths.ecosystemId) {
    // Move from live → completed
    const newDetailPath = ecoscopedRunPath(run.id, paths.ecosystemId, newLocation);
    const newHeaderPath = ecoscopedRunHeaderPath(run.id, paths.ecosystemId, newLocation);
    await writeJson(newDetailPath, run);
    await writeJson(newHeaderPath, buildRunHeader(run));
    // Remove from old location
    try { await fs.unlink(paths.detail); } catch { /* ok */ }
    if (paths.header) { try { await fs.unlink(paths.header); } catch { /* ok */ } }
    // Write per-task files on completion
    if (newLocation === 'completed' && Array.isArray(run.tasks)) {
      const tasksDir = path.join(ecoscopedRunDir(paths.ecosystemId, newLocation), `${safeId(run.id)}-tasks`);
      for (let i = 0; i < run.tasks.length; i++) {
        const task = run.tasks[i];
        const taskFile = path.join(tasksDir, `task-${String(i + 1).padStart(3, '0')}-${safeId(task.id)}.json`);
        await writeJson(taskFile, task);
      }
    }
    await updateIndex((index) => {
      index.runs[safeId(run.id)] = { ecosystemId: paths.ecosystemId, location: newLocation };
    });
  } else {
    // In-place update
    await writeJson(paths.detail, run);
    if (paths.header) await writeJson(paths.header, buildRunHeader(run));
  }
}

function activateNextTasks(run) {
  if (run.status === 'stopped') return run;
  const runningTasks = run.tasks.filter((task) => task.status === 'running');
  if (runningTasks.length > 0) return run;

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

// ── Public API ────────────────────────────────────────────────────────────────

export async function createRunForPlan(planId, options = {}) {
  const plan = await loadPlan(planId);
  const runId = makeId('run', `${planId}-${Date.now()}`);
  const adapterId = options.adapterId ?? 'adapter:dry-run';
  const tasks = flattenTasks(plan).map((task) => ({
    ...task,
    status: 'queued',
    verificationResults: [],
    evidenceArtifacts: [],
    telemetryReferences: { before: [], after: [] },
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

  const location = 'live';
  const detailPath = ecoscopedRunPath(runId, run.ecosystemId, location);
  const headerPath = ecoscopedRunHeaderPath(runId, run.ecosystemId, location);
  await writeJson(detailPath, run);
  await writeJson(headerPath, buildRunHeader(run));
  await updateIndex((index) => {
    index.runs[safeId(runId)] = { ecosystemId: run.ecosystemId, location };
  });

  return run;
}

export async function loadRun(runId) {
  const paths = await resolveRunPaths(runId);
  return readJson(paths.detail);
}

/** List run headers for a given ecosystem (or all ecosystems if omitted). */
export async function listRuns(ecosystemId = null) {
  const index = await readIndex();
  const headers = [];

  // Determine which ecosystems to scan
  let ecosystemIds;
  if (ecosystemId) {
    ecosystemIds = [ecosystemId];
  } else {
    const seen = new Set();
    for (const entry of Object.values(index.runs)) {
      if (entry.ecosystemId) seen.add(entry.ecosystemId);
    }
    try {
      const dirs = await fs.readdir(path.join(stateRoot, 'ecosystems'), { withFileTypes: true });
      for (const d of dirs) {
        if (d.isDirectory() && !d.name.startsWith('_')) seen.add(d.name);
      }
    } catch { /* ignore */ }
    ecosystemIds = [...seen];
  }

  for (const id of ecosystemIds) {
    for (const location of ['live', 'completed']) {
      const runsDir = path.join(stateRoot, 'ecosystems', id, location, 'runs');
      try {
        const files = await fs.readdir(runsDir);
        for (const file of files) {
          if (!file.endsWith('.header.json')) continue;
          const header = await readJson(path.join(runsDir, file));
          if (header) headers.push(header);
        }
      } catch { /* directory doesn't exist yet */ }
    }
  }

  // Legacy fallback: scan old flat runs/ directory for unmigrated runs
  const legacyDir = path.join(stateRoot, 'runs');
  try {
    const files = await fs.readdir(legacyDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const run = await readJson(path.join(legacyDir, file));
      if (run && run.id && !index.runs[safeId(run.id)]) {
        headers.push(buildRunHeader(run));
      }
    }
  } catch { /* no legacy dir */ }

  return headers.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
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
  await persistRun(run);
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
  if (options.verificationResults) task.verificationResults = options.verificationResults;
  if (options.evidenceArtifacts) task.evidenceArtifacts = options.evidenceArtifacts;
  if (options.telemetryReferences) {
    task.telemetryReferences = normalizeTelemetryReferences(options.telemetryReferences, task.correlation);
  }
  if (options.fixMemoryRef) task.fixMemoryRef = options.fixMemoryRef;
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
  await persistRun(run);
  return run;
}

export async function failTask(runId, taskId, options = {}) {
  const run = await loadRun(runId);
  const task = run.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error(`Task ${taskId} not found in run ${runId}`);
  task.correlation = task.correlation ?? createTaskCorrelation(run.id, run.planId, run.ecosystemId, run.adapterId, task.id);
  stampTaskCompletion(task, 'failed');
  if (options.verificationResults) task.verificationResults = options.verificationResults;
  if (options.evidenceArtifacts) task.evidenceArtifacts = options.evidenceArtifacts;
  if (options.telemetryReferences) {
    task.telemetryReferences = normalizeTelemetryReferences(options.telemetryReferences, task.correlation);
  }
  if (options.fixMemoryRef) task.fixMemoryRef = options.fixMemoryRef;
  appendRunEvent(run, 'task-failed', {
    taskId,
    evidenceCount: Array.isArray(task.evidenceArtifacts) ? task.evidenceArtifacts.length : 0
  });
  const session = run.agentSessions.find((s) => s.taskId === taskId);
  if (session) session.status = 'failed';
  run.status = 'failed';
  run.updatedAt = nowIso();
  await persistRun(run);
  return run;
}
