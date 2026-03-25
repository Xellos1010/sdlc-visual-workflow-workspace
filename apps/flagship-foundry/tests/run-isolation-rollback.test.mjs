import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { ensureDir, stateRoot, writeJson } from '../packages/core/src/io.mjs';
import { createRunForPlan, loadRun, transitionRun } from '../packages/core/src/runs.mjs';
import { scheduleLocalShellExecution } from '../packages/core/src/run-executor.mjs';

function toStoredFileName(id) {
  return `${id.replace(/[:/]+/g, '-')}.json`;
}

async function writePlanFixture(plan) {
  const plansDir = path.join(stateRoot, 'plans');
  await ensureDir(plansDir);
  const planPath = path.join(plansDir, toStoredFileName(plan.id));
  await writeJson(planPath, plan);
  return planPath;
}

async function writeRunFixture(run) {
  const runsDir = path.join(stateRoot, 'runs');
  await ensureDir(runsDir);
  const runPath = path.join(runsDir, toStoredFileName(run.id));
  await writeJson(runPath, run);
  return runPath;
}

async function waitForTerminalRunStatus(runId, timeoutMs = 5000) {
  const start = Date.now();
  for (;;) {
    const run = await loadRun(runId);
    if (run.status === 'completed' || run.status === 'failed' || run.status === 'stopped') {
      return run;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Run ${runId} did not reach terminal status within ${timeoutMs}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

test('createRunForPlan stamps isolation and rollback contracts', async () => {
  const planId = `plan:isolation-${Date.now()}`;
  const planPath = await writePlanFixture({
    id: planId,
    ecosystemId: 'ecosystem:isolation',
    projectPlans: [{
      projectId: 'project:isolation',
      tasks: [{
        id: 'task:isolation-1',
        title: 'Isolation task',
        personaIds: []
      }]
    }]
  });

  let run = null;
  try {
    run = await createRunForPlan(planId, { mode: 'execute', adapterId: 'adapter:local-shell' });
    assert.equal(run.isolation.mode, 'run-scoped');
    assert.equal(run.isolation.defaultWritePolicy, 'workspace-only');
    assert.equal(run.isolation.allowExternalWritesByDefault, false);
    assert.equal(run.rollback.boundary, 'run-instance');
    assert.equal(run.rollback.pausePreservesEvidence, true);
    assert.equal(run.rollback.stopPreservesEvidence, true);
    assert.equal(run.timeline[0].type, 'run-created');
  } finally {
    await fs.rm(planPath, { force: true });
    if (run) {
      const runPath = path.join(stateRoot, 'runs', toStoredFileName(run.id));
      await fs.rm(runPath, { force: true });
    }
  }
});

test('pause and stop preserve evidence and rollback timeline', async () => {
  const runId = `run:rollback-${Date.now()}`;
  const runPath = await writeRunFixture({
    id: runId,
    planId: 'plan:rollback',
    status: 'running',
    mode: 'execute',
    adapterId: 'adapter:local-shell',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isolation: {
      mode: 'run-scoped',
      workspaceRoot: path.join(stateRoot, 'run-workspaces', runId.replace(/[:/]+/g, '-')),
      defaultWritePolicy: 'workspace-only',
      allowExternalWritesByDefault: false
    },
    rollback: {
      boundary: 'run-instance',
      pausePreservesEvidence: true,
      stopPreservesEvidence: true
    },
    tasks: [{
      id: 'task:rollback-1',
      status: 'running',
      evidenceArtifacts: [{ type: 'json', path: '/tmp/evidence.json' }]
    }],
    agentSessions: [{ id: 'agent-session:rollback-1', taskId: 'task:rollback-1', status: 'running' }],
    timeline: []
  });

  try {
    await transitionRun(runId, 'pause');
    const paused = await loadRun(runId);
    assert.equal(paused.status, 'paused');
    assert.equal(paused.tasks[0].status, 'paused');
    assert.equal(paused.tasks[0].evidenceArtifacts.length, 1);

    await transitionRun(runId, 'stop');
    const stopped = await loadRun(runId);
    assert.equal(stopped.status, 'stopped');
    assert.equal(stopped.tasks[0].status, 'stopped');
    assert.equal(stopped.tasks[0].evidenceArtifacts.length, 1);
    assert.ok(stopped.timeline.some((event) => event.type === 'run-paused'));
    assert.ok(stopped.timeline.some((event) => event.type === 'run-stopped'));
  } finally {
    await fs.rm(runPath, { force: true });
  }
});

test('local-shell execution persists evidence and fails run on non-zero exit', async () => {
  const runId = `run:executor-fail-${Date.now()}`;
  const workspaceRoot = path.join(stateRoot, 'run-workspaces', runId.replace(/[:/]+/g, '-'));
  const runPath = await writeRunFixture({
    id: runId,
    planId: 'plan:executor',
    status: 'running',
    mode: 'execute',
    adapterId: 'adapter:local-shell',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isolation: {
      mode: 'run-scoped',
      workspaceRoot,
      defaultWritePolicy: 'workspace-only',
      allowExternalWritesByDefault: false
    },
    rollback: {
      boundary: 'run-instance',
      pausePreservesEvidence: true,
      stopPreservesEvidence: true
    },
    tasks: [{
      id: 'task:executor-fail',
      title: 'Force failure',
      status: 'running',
      verificationResults: [],
      evidenceArtifacts: [],
      telemetryReferences: { before: [], after: [] },
      correlation: { runId, taskId: 'task:executor-fail', planId: 'plan:executor', adapterId: 'adapter:local-shell' }
    }],
    agentSessions: [{ id: 'agent-session:executor-fail', taskId: 'task:executor-fail', status: 'running' }],
    timeline: []
  });

  const prior = process.env.FOUNDRY_LOCAL_TASK_CMD;
  process.env.FOUNDRY_LOCAL_TASK_CMD = `${process.execPath} -e "process.exit(2)"`;

  try {
    scheduleLocalShellExecution(runId);
    const terminal = await waitForTerminalRunStatus(runId);
    assert.equal(terminal.status, 'failed');
    assert.equal(terminal.tasks[0].status, 'failed');
    assert.ok(Array.isArray(terminal.tasks[0].evidenceArtifacts));
    assert.ok(terminal.tasks[0].evidenceArtifacts.length >= 1);

    const evidencePath = terminal.tasks[0].evidenceArtifacts[0].path;
    const evidence = JSON.parse(await fs.readFile(evidencePath, 'utf8'));
    assert.equal(evidence.runId, runId);
    assert.equal(evidence.isolationBoundary.workspaceRoot, workspaceRoot);
    assert.equal(evidence.rollbackBoundary.boundary, 'run-instance');
    assert.equal(evidence.exitCode, 2);
  } finally {
    if (prior === undefined) {
      delete process.env.FOUNDRY_LOCAL_TASK_CMD;
    } else {
      process.env.FOUNDRY_LOCAL_TASK_CMD = prior;
    }
    await fs.rm(runPath, { force: true });
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  }
});

test('workspace-only containment denies external writes and preserves denial evidence', async () => {
  const runId = `run:executor-containment-${Date.now()}`;
  const workspaceRoot = path.join(stateRoot, 'run-workspaces', runId.replace(/[:/]+/g, '-'));
  const runPath = await writeRunFixture({
    id: runId,
    planId: 'plan:executor-containment',
    status: 'running',
    mode: 'execute',
    adapterId: 'adapter:local-shell',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isolation: {
      mode: 'run-scoped',
      workspaceRoot,
      defaultWritePolicy: 'workspace-only',
      allowExternalWritesByDefault: false
    },
    rollback: {
      boundary: 'run-instance',
      pausePreservesEvidence: true,
      stopPreservesEvidence: true
    },
    tasks: [{
      id: 'task:executor-containment',
      title: 'Attempt external write',
      status: 'running',
      verificationResults: [],
      evidenceArtifacts: [],
      telemetryReferences: { before: [], after: [] },
      correlation: { runId, taskId: 'task:executor-containment', planId: 'plan:executor-containment', adapterId: 'adapter:local-shell' }
    }],
    agentSessions: [{ id: 'agent-session:executor-containment', taskId: 'task:executor-containment', status: 'running' }],
    timeline: []
  });

  const forbiddenTarget = path.join('/tmp', `foundry-external-write-${Date.now()}`);
  const prior = process.env.FOUNDRY_LOCAL_TASK_CMD;
  process.env.FOUNDRY_LOCAL_TASK_CMD = `echo denied > ${JSON.stringify(forbiddenTarget)}`;

  try {
    scheduleLocalShellExecution(runId);
    const terminal = await waitForTerminalRunStatus(runId);
    assert.equal(terminal.status, 'failed');
    assert.equal(terminal.tasks[0].status, 'failed');
    assert.ok(Array.isArray(terminal.tasks[0].evidenceArtifacts));
    assert.ok(terminal.tasks[0].evidenceArtifacts.length >= 1);

    const evidencePath = terminal.tasks[0].evidenceArtifacts[0].path;
    const evidence = JSON.parse(await fs.readFile(evidencePath, 'utf8'));
    assert.equal(evidence.runId, runId);
    assert.equal(evidence.isolationBoundary.workspaceRoot, workspaceRoot);
    assert.equal(evidence.containment.enforced, true);
    assert.equal(evidence.containment.mechanism === 'sandbox-exec' || evidence.containment.mechanism === 'deny-no-sandbox', true);
    assert.equal(evidence.containment.denied, true);
    assert.ok(typeof evidence.containment.reason === 'string' && evidence.containment.reason.length > 0);

    await assert.rejects(() => fs.access(forbiddenTarget));
  } finally {
    if (prior === undefined) {
      delete process.env.FOUNDRY_LOCAL_TASK_CMD;
    } else {
      process.env.FOUNDRY_LOCAL_TASK_CMD = prior;
    }
    await fs.rm(forbiddenTarget, { force: true });
    await fs.rm(runPath, { force: true });
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  }
});
