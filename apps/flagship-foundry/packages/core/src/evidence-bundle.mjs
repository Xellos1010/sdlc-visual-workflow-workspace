import path from 'node:path';
import { ensureDir, nowIso, stateRoot, writeJson } from './io.mjs';
import { loadRun } from './runs.mjs';

function summarizeVerification(results) {
  const total = results.length;
  const passed = results.filter((result) => Number(result?.exitCode) === 0).length;
  return {
    total,
    passed,
    failed: total - passed
  };
}

function createTaskCorrelation(run, task) {
  return {
    runId: run.id,
    taskId: task.id,
    planId: run.planId,
    ...(run.ecosystemId ? { ecosystemId: run.ecosystemId } : {}),
    ...(run.adapterId ? { adapterId: run.adapterId } : {})
  };
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

function normalizeTelemetryReferences(taskReferences, correlation) {
  const before = Array.isArray(taskReferences?.before) ? taskReferences.before : [];
  const after = Array.isArray(taskReferences?.after) ? taskReferences.after : [];
  return {
    before: before.map((reference) => normalizeTelemetryReference(reference, correlation)).filter(Boolean),
    after: after.map((reference) => normalizeTelemetryReference(reference, correlation)).filter(Boolean)
  };
}

function mergeTelemetryReferences(taskReferences, aggregate) {
  const before = Array.isArray(taskReferences?.before) ? taskReferences.before : [];
  const after = Array.isArray(taskReferences?.after) ? taskReferences.after : [];
  aggregate.before.push(...before);
  aggregate.after.push(...after);
}

/**
 * Assembles a verifier-oriented evidence bundle from a run.
 *
 * @param {string} runId
 * @returns {Promise<object>}
 */
export async function assembleEvidenceBundle(runId) {
  const run = await loadRun(runId);
  const bundleId = `bundle:${runId}`;
  const telemetryReferences = {
    before: [],
    after: []
  };
  const tasks = (run.tasks ?? []).map((t) => {
    const correlation = t.correlation ?? createTaskCorrelation(run, t);
    return {
      correlation,
      taskId: t.id,
      status: t.status,
      verificationResults: t.verificationResults ?? [],
      verificationSummary: summarizeVerification(t.verificationResults ?? []),
      evidenceArtifacts: t.evidenceArtifacts ?? [],
      telemetryReferences: normalizeTelemetryReferences(t.telemetryReferences, correlation),
      ...(t.fixMemoryRef ? { fixMemoryRef: t.fixMemoryRef } : {})
    };
  });
  for (const task of tasks) {
    mergeTelemetryReferences(task.telemetryReferences, telemetryReferences);
  }

  const verification = tasks.reduce((accumulator, task) => ({
    total: accumulator.total + task.verificationSummary.total,
    passed: accumulator.passed + task.verificationSummary.passed,
    failed: accumulator.failed + task.verificationSummary.failed
  }), { total: 0, passed: 0, failed: 0 });

  const bundle = {
    id: bundleId,
    runId,
    planId: run.planId,
    ecosystemId: run.ecosystemId,
    adapterId: run.adapterId,
    assembledAt: nowIso(),
    correlation: {
      runId,
      planId: run.planId,
      ...(run.ecosystemId ? { ecosystemId: run.ecosystemId } : {}),
      ...(run.adapterId ? { adapterId: run.adapterId } : {})
    },
    summary: {
      taskCount: tasks.length,
      completedTaskCount: tasks.filter((task) => task.status === 'completed').length,
      failedTaskCount: tasks.filter((task) => task.status === 'failed').length,
      verification
    },
    telemetryReferences,
    tasks
  };

  const outDir = path.join(stateRoot, 'evidence-bundles');
  await ensureDir(outDir);
  const filePath = path.join(outDir, `${runId.replace(/[:/]+/g, '-')}.json`);
  await writeJson(filePath, bundle);
  return { bundle, filePath };
}
