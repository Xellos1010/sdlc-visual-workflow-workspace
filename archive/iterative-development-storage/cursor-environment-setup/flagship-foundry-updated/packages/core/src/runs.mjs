import path from 'node:path';
import { makeId, nowIso, readJson, stateRoot, writeJson } from './io.mjs';
import { loadPlan } from './plans.mjs';

function runFilePath(runId) {
  return path.join(stateRoot, 'runs', `${runId.replace(/[:/]+/g, '-')}.json`);
}

function flattenTasks(plan) {
  return plan.projectPlans.flatMap((projectPlan) =>
    projectPlan.tasks.map((task) => ({
      ...task,
      projectPlanId: projectPlan.projectId
    }))
  );
}

export async function createRunForPlan(planId, options = {}) {
  const plan = await loadPlan(planId);
  const runId = makeId('run', `${planId}-${Date.now()}`);
  const tasks = flattenTasks(plan).map((task) => ({ ...task, status: 'queued' }));
  const run = {
    id: runId,
    planId,
    ecosystemId: plan.ecosystemId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    status: 'ready',
    mode: options.mode ?? 'simulate',
    adapterId: options.adapterId ?? 'adapter:dry-run',
    tasks,
    agentSessions: tasks.map((task) => ({
      id: makeId('agent-session', `${runId}-${task.id}`),
      taskId: task.id,
      status: 'idle',
      personaIds: task.personaIds,
      adapterId: options.adapterId ?? 'adapter:dry-run'
    }))
  };
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
  } else if (action === 'pause') {
    run.status = 'paused';
    for (const task of run.tasks) {
      if (task.status === 'running') task.status = 'paused';
    }
    for (const session of run.agentSessions) {
      if (session.status === 'running') session.status = 'paused';
    }
  } else if (action === 'resume') {
    for (const task of run.tasks) {
      if (task.status === 'paused') task.status = 'queued';
    }
    for (const session of run.agentSessions) {
      if (session.status === 'paused') session.status = 'idle';
    }
    activateNextTasks(run);
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
  }
  run.updatedAt = nowIso();
  await writeJson(runFilePath(runId), run);
  return run;
}
