import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { ensureDir, readJson, stateRoot, writeJson } from '../packages/core/src/io.mjs';
import { assembleEvidenceBundle } from '../packages/core/src/evidence-bundle.mjs';

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

test('assembleEvidenceBundle returns correlated summary with telemetry references', async () => {
  const runId = `run:evidence-contract-${Date.now()}`;
  const runPath = await writeRunFixture({
    id: runId,
    planId: 'plan:test',
    ecosystemId: 'web-automation-workspace',
    adapterId: 'adapter:dry-run',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [{
      id: 'task:verify-contract',
      status: 'completed',
      verificationResults: [
        { command: 'npm test', exitCode: 0, timestamp: new Date().toISOString() },
        { command: 'npm run lint', exitCode: 1, timestamp: new Date().toISOString() }
      ],
      evidenceArtifacts: ['state/evidence/task-verify.json'],
      fixMemoryRef: 'fix-memory:incident-123',
      telemetryReferences: {
        before: [{
          ref: 'telemetry://snapshot/before/123',
          kind: 'snapshot',
          timestamp: new Date().toISOString()
        }],
        after: [{
          ref: 'telemetry://snapshot/after/123',
          kind: 'snapshot',
          timestamp: new Date().toISOString()
        }]
      }
    }],
    agentSessions: []
  });

  let bundlePath;
  try {
    const result = await assembleEvidenceBundle(runId);
    bundlePath = result.filePath;

    assert.equal(result.bundle.correlation.runId, runId);
    assert.equal(result.bundle.correlation.planId, 'plan:test');
    assert.equal(result.bundle.correlation.ecosystemId, 'web-automation-workspace');
    assert.equal(result.bundle.correlation.adapterId, 'adapter:dry-run');

    assert.equal(result.bundle.summary.taskCount, 1);
    assert.equal(result.bundle.summary.completedTaskCount, 1);
    assert.equal(result.bundle.summary.failedTaskCount, 0);
    assert.deepEqual(result.bundle.summary.verification, {
      total: 2,
      passed: 1,
      failed: 1
    });

    assert.equal(result.bundle.tasks[0].correlation.runId, runId);
    assert.equal(result.bundle.tasks[0].correlation.taskId, 'task:verify-contract');
    assert.equal(result.bundle.tasks[0].fixMemoryRef, 'fix-memory:incident-123');
    assert.equal(result.bundle.telemetryReferences.before.length, 1);
    assert.equal(result.bundle.telemetryReferences.after.length, 1);
    assert.equal(result.bundle.tasks[0].telemetryReferences.before[0].correlation.runId, runId);
    assert.equal(result.bundle.tasks[0].telemetryReferences.before[0].correlation.taskId, 'task:verify-contract');
    assert.equal(result.bundle.telemetryReferences.after[0].correlation.runId, runId);
    assert.equal(result.bundle.telemetryReferences.after[0].correlation.taskId, 'task:verify-contract');
  } finally {
    await fs.rm(runPath, { force: true });
    if (bundlePath) {
      await fs.rm(bundlePath, { force: true });
    }
  }
});

test('assembleEvidenceBundle backfills task correlation when absent on run task', async () => {
  const runId = `run:evidence-backfill-${Date.now()}`;
  const runPath = await writeRunFixture({
    id: runId,
    planId: 'plan:backfill',
    ecosystemId: 'ecosystem:test',
    adapterId: 'adapter:test',
    status: 'running',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [{
      id: 'task:no-correlation',
      status: 'running',
      verificationResults: [],
      evidenceArtifacts: []
    }],
    agentSessions: []
  });

  let bundlePath;
  try {
    const { bundle, filePath } = await assembleEvidenceBundle(runId);
    bundlePath = filePath;
    assert.equal(bundle.tasks[0].correlation.runId, runId);
    assert.equal(bundle.tasks[0].correlation.taskId, 'task:no-correlation');
    assert.equal(bundle.tasks[0].correlation.planId, 'plan:backfill');
    assert.equal(bundle.tasks[0].correlation.ecosystemId, 'ecosystem:test');
    assert.equal(bundle.tasks[0].correlation.adapterId, 'adapter:test');
    assert.equal(bundle.tasks[0].telemetryReferences.before.length, 0);
    assert.equal(bundle.tasks[0].telemetryReferences.after.length, 0);
    const stored = await readJson(filePath);
    assert.equal(stored.id, `bundle:${runId}`);
  } finally {
    await fs.rm(runPath, { force: true });
    if (bundlePath) {
      await fs.rm(bundlePath, { force: true });
    }
  }
});
