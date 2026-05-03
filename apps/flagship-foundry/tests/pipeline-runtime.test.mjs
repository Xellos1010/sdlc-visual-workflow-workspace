import test from 'node:test';
import assert from 'node:assert/strict';
import { composePipeline } from '../packages/core/src/pipeline-composer.mjs';
import { assembleContextPacket } from '../packages/core/src/context-assembler.mjs';
import { dispatchPipeline, loadPipeline } from '../packages/core/src/stage-dispatcher.mjs';

test('pipeline composition and dispatch produce resumable state', async () => {
  const ecosystemId = `test-pipeline-${Date.now()}`;
  const pipelineDefinition = composePipeline({
    pipelineId: `pipeline:${ecosystemId}`,
    ecosystemId,
    title: 'Test pipeline',
    defaultFailurePolicy: 'halt',
    stages: [
      {
        stageId: 'stage-1',
        order: 0,
        adapterId: 'adapter:dry-run',
        agentRole: 'builder',
        workOrderRef: 'wo:test',
        tokenBudget: 100,
        failurePolicy: 'halt'
      }
    ]
  });

  const contextPacket = await assembleContextPacket({
    packetId: 'packet:test',
    ecosystemId,
    workOrderRef: 'wo:test',
    contextCart: { items: [{ itemId: 'i1', kind: 'note', label: 'Test item', authority: 'manual', selectedAt: new Date().toISOString() }] },
    pipelineDefinition
  });

  assert.equal(contextPacket.items.length, 1);
  assert.ok(contextPacket.totalTokenCount >= 1);

  const state = await dispatchPipeline(pipelineDefinition, {
    contextCart: { items: [{ itemId: 'i1', kind: 'note', label: 'Test item', authority: 'manual', selectedAt: new Date().toISOString() }] }
  });

  assert.equal(state.status, 'completed');
  assert.equal(state.stageResults.length, 1);

  const persisted = await loadPipeline(ecosystemId, pipelineDefinition.pipelineId);
  assert.equal(persisted.status, 'completed');
});

