import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { ensureDir, stateRoot, writeJson } from '../packages/core/src/io.mjs';
import { completeTask, failTask, loadRun } from '../packages/core/src/runs.mjs';

function toStoredFileName(id) {
  return `${id.replace(/[:/]+/g, '-')}.json`;
}

async function writeRunFixture(run) {
  const runsDir = path.join(stateRoot, 'runs');
  await ensureDir(runsDir);
  const runPath = path.join(runsDir, toStoredFileName(run.id));
  await writeJson(runPath, run);
  return runPath;
}

test('completeTask injects required correlation keys into telemetry references', async () => {
  const runId = `run:telemetry-complete-${Date.now()}`;
  const runPath = await writeRunFixture({
    id: runId,
    planId: 'plan:telemetry',
    ecosystemId: 'ecosystem:telemetry',
    adapterId: 'adapter:telemetry',
    status: 'running',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [{
      id: 'task:complete-correlation',
      status: 'running'
    }],
    agentSessions: []
  });

  try {
    await completeTask(runId, 'task:complete-correlation', {
      telemetryReferences: {
        before: [{ ref: 'telemetry://before', timestamp: new Date().toISOString() }],
        after: [{ ref: 'telemetry://after', timestamp: new Date().toISOString() }]
      }
    });

    const run = await loadRun(runId);
    const task = run.tasks[0];
    assert.equal(task.telemetryReferences.before[0].correlation.runId, runId);
    assert.equal(task.telemetryReferences.before[0].correlation.taskId, 'task:complete-correlation');
    assert.equal(task.telemetryReferences.after[0].correlation.runId, runId);
    assert.equal(task.telemetryReferences.after[0].correlation.taskId, 'task:complete-correlation');
  } finally {
    await fs.rm(runPath, { force: true });
  }
});

test('failTask injects required correlation keys into telemetry references', async () => {
  const runId = `run:telemetry-fail-${Date.now()}`;
  const runPath = await writeRunFixture({
    id: runId,
    planId: 'plan:telemetry-fail',
    ecosystemId: 'ecosystem:telemetry-fail',
    adapterId: 'adapter:telemetry-fail',
    status: 'running',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [{
      id: 'task:fail-correlation',
      status: 'running'
    }],
    agentSessions: []
  });

  try {
    await failTask(runId, 'task:fail-correlation', {
      telemetryReferences: {
        before: [{ ref: 'telemetry://fail-before', timestamp: new Date().toISOString() }]
      }
    });

    const run = await loadRun(runId);
    const task = run.tasks[0];
    assert.equal(task.telemetryReferences.before[0].correlation.runId, runId);
    assert.equal(task.telemetryReferences.before[0].correlation.taskId, 'task:fail-correlation');
    assert.equal(task.telemetryReferences.before[0].correlation.planId, 'plan:telemetry-fail');
  } finally {
    await fs.rm(runPath, { force: true });
  }
});
