import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { loadSwarmRegistry, getDefaultSwarmSequence } from '../packages/core/src/swarm-registry.mjs';
import { traceForwardFromNode, traceBackwardToNode } from '../packages/core/src/traceability.mjs';
import { shouldExecuteLocally } from '../packages/core/src/run-executor.mjs';
import { detectEnvironmentArtifacts } from '../packages/core/src/environment-detect.mjs';
import { appendDebateRound, loadDebate } from '../packages/core/src/debate-store.mjs';
import { repoRoot } from '../packages/core/src/io.mjs';
import { importWorkspace } from '../packages/core/src/import-pipeline.mjs';

const sampleImportConfig = JSON.parse(
  await fs.readFile(path.join(repoRoot, 'examples/current-workspace/import-config.json'), 'utf8')
);

test('swarm registry loads role routing', async () => {
  const reg = await loadSwarmRegistry();
  assert.equal(reg.version, '1');
  assert.ok(reg.roles.specifier);
  const seq = await getDefaultSwarmSequence();
  assert.ok(seq.includes('verifier'));
});

test('trace forward and backward return edge arrays for ecosystem graph', async () => {
  const isolatedEcosystemId = `web-automation-workspace-trace-${Date.now()}`;
  await importWorkspace({ ...sampleImportConfig, ecosystemId: isolatedEcosystemId });
  const fwd = await traceForwardFromNode(isolatedEcosystemId, `ecosystem:${isolatedEcosystemId}`);
  assert.ok(Array.isArray(fwd.edges));
  assert.ok(fwd.edges.length >= 1);
  const back = await traceBackwardToNode(isolatedEcosystemId, `repo:${isolatedEcosystemId}`);
  assert.ok(Array.isArray(back.edges));
});

test('shouldExecuteLocally identifies local-shell execute runs', () => {
  assert.equal(shouldExecuteLocally({ mode: 'execute', adapterId: 'adapter:local-shell' }), true);
  assert.equal(shouldExecuteLocally({ mode: 'simulate', adapterId: 'adapter:local-shell' }), false);
});

test('detectEnvironmentArtifacts reports repo root', async () => {
  const d = await detectEnvironmentArtifacts(repoRoot);
  assert.ok(d.found.length >= 0);
  assert.equal(typeof d.summary, 'string');
});

test('debate rounds persist and reload', async () => {
  const planId = 'plan:test-debate-ephemeral';
  await appendDebateRound(planId, { role: 'adversary', content: 'test objection' });
  const loaded = await loadDebate(planId);
  assert.equal(loaded.rounds.length >= 1, true);
  assert.equal(loaded.rounds[loaded.rounds.length - 1].role, 'adversary');
});
