import path from 'node:path';
import { ensureDir, nowIso, readJson, stateRoot, writeJson } from './io.mjs';

function resultsDir(ecosystemId) {
  return path.join(stateRoot, 'ecosystems', ecosystemId, 'pipeline-results');
}

function resultPath(ecosystemId, resultId) {
  return path.join(resultsDir(ecosystemId), `${resultId.replace(/[:/]+/g, '-')}.json`);
}

export async function saveStageResult(ecosystemId, stageResult, options = {}) {
  await ensureDir(resultsDir(ecosystemId));
  const payload = {
    ...stageResult,
    pipelineId: options.pipelineId ?? stageResult.pipelineId,
    savedAt: nowIso()
  };
  await writeJson(resultPath(ecosystemId, payload.stageResultId), payload);
  return payload;
}

export async function ingestResult(ecosystemId, stageResult, options = {}) {
  const payload = await saveStageResult(ecosystemId, stageResult, options);
  return {
    packetId: payload.stageResultId,
    ecosystemId,
    createdArtifactIds: payload.producedArtifacts ?? [],
    validation: {
      status: payload.status === 'succeeded' ? 'passed' : 'passed-with-warnings',
      warnings: payload.status === 'succeeded' ? [] : [`Stage completed with status ${payload.status}`],
      errors: []
    },
    provenance: {
      sourceAgent: payload.adapterId,
      sessionId: options.sessionId ?? payload.pipelineId,
      sourceRunId: options.runId ?? null
    },
    importedAt: nowIso()
  };
}

export async function loadStageResult(ecosystemId, resultId) {
  return readJson(resultPath(ecosystemId, resultId), null);
}

