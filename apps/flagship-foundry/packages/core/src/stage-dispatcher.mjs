import path from 'node:path';
import { ensureDir, nowIso, readJson, stateRoot, writeJson } from './io.mjs';
import { composePipeline } from './pipeline-composer.mjs';
import { assembleContextPacket } from './context-assembler.mjs';
import { saveStageResult } from './result-ingestor.mjs';

function pipelinesDir(ecosystemId) {
  return path.join(stateRoot, 'ecosystems', ecosystemId, 'pipelines');
}

function pipelinePath(ecosystemId, pipelineId) {
  return path.join(pipelinesDir(ecosystemId), `${pipelineId.replace(/[:/]+/g, '-')}.json`);
}

async function loadPipelineState(ecosystemId, pipelineId) {
  try {
    return await readJson(pipelinePath(ecosystemId, pipelineId));
  } catch {
    return null;
  }
}

async function savePipelineState(ecosystemId, pipelineState) {
  await ensureDir(pipelinesDir(ecosystemId));
  await writeJson(pipelinePath(ecosystemId, pipelineState.pipelineId), pipelineState);
  return pipelineState;
}

function buildStageResult({ pipeline, stage, contextPacket, status, failure = null, producedArtifacts = [] }) {
  const timestamp = nowIso();
  return {
    stageResultId: `stage-result:${pipeline.pipelineId}:${stage.stageId}:${Date.now()}`,
    pipelineId: pipeline.pipelineId,
    stageId: stage.stageId,
    adapterId: stage.adapterId,
    status,
    producedArtifacts,
    evidenceRefs: contextPacket.items.map((item) => item.source?.ref).filter(Boolean),
    telemetryRefs: [],
    durationMs: 0,
    failure,
    startedAt: timestamp,
    completedAt: timestamp
  };
}

async function simulateStageExecution(pipeline, stage, contextPacket) {
  return buildStageResult({
    pipeline,
    stage,
    contextPacket,
    status: 'succeeded',
    producedArtifacts: contextPacket.items.slice(0, 3).map((item) => item.source?.ref).filter(Boolean)
  });
}

export async function dispatchPipeline(pipelineDefinition, input = {}) {
  const pipeline = composePipeline(pipelineDefinition);
  const state = await loadPipelineState(pipeline.ecosystemId, pipeline.pipelineId) ?? {
    pipelineId: pipeline.pipelineId,
    ecosystemId: pipeline.ecosystemId,
    status: 'pending',
    currentStageIndex: 0,
    stageResults: [],
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  await savePipelineState(pipeline.ecosystemId, state);

  state.status = 'running';
  state.updatedAt = nowIso();
  state.currentContextPacket = null;

  for (let index = state.currentStageIndex ?? 0; index < pipeline.stages.length; index += 1) {
    const stage = pipeline.stages[index];
    const contextPacket = await assembleContextPacket({
      packetId: `${pipeline.pipelineId}:${stage.stageId}:context`,
      ecosystemId: pipeline.ecosystemId,
      workOrderRef: stage.workOrderRef,
      graph: input.graph,
      contextCart: input.contextCart,
      ragQuery: input.ragQuery,
      graphQuery: input.graphQuery,
      pipelineDefinition: pipeline,
      tokenBudget: stage.tokenBudget
    });
    state.currentContextPacket = contextPacket;

    const result = await simulateStageExecution(pipeline, stage, contextPacket);
    state.stageResults.push(result);
    state.currentStageIndex = index + 1;
    state.updatedAt = nowIso();
    await saveStageResult(pipeline.ecosystemId, result, { pipelineId: pipeline.pipelineId });

    if (result.status !== 'succeeded') {
      const policy = stage.failurePolicy ?? pipeline.defaultFailurePolicy ?? 'halt';
      if (policy === 'skip') continue;
      if (policy === 'retry' && (stage.retryLimit ?? 0) > 0) {
        stage.retryLimit -= 1;
        index -= 1;
        continue;
      }
      state.status = 'failed';
      await savePipelineState(pipeline.ecosystemId, state);
      return state;
    }
  }

  state.status = 'completed';
  state.completedAt = nowIso();
  await savePipelineState(pipeline.ecosystemId, state);
  return state;
}

export async function loadPipeline(ecosystemId, pipelineId) {
  return loadPipelineState(ecosystemId, pipelineId);
}

export async function listPipelines(ecosystemId) {
  try {
    const fs = await import('node:fs/promises');
    const dir = pipelinesDir(ecosystemId);
    const entries = await fs.readdir(dir);
    return Promise.all(entries.filter((entry) => entry.endsWith('.json')).map((entry) => readJson(path.join(dir, entry), null)));
  } catch {
    return [];
  }
}
