import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, readFile } from 'node:fs/promises';
import { writeContinuityState } from '../continuity-writer.mjs';

test('writes import-aware continuity state with plan lifecycle stage', async () => {
  const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), 'import-bridge-continuity-'));
  const continuityPath = await writeContinuityState({
    projectSlug: 'sample-project',
    importedArtifacts: ['docs/imported/sample/intent-packet.md'],
    manifest: {
      projectName: 'Sample Project',
      phaseId: 'sample-phase',
      importStage: 'pre_implementation',
      targetWorkspace: 'flagship-foundry',
      artifacts: [],
      importOrder: ['intent-packet.md'],
      postImportActions: ['Review import'],
      sourceFormat: 'schema-v1'
    },
    workspaceRoot
  });
  const state = JSON.parse(await readFile(continuityPath, 'utf8'));
  assert.equal(state.lifecycleStage, 'plan');
  assert.equal(state.authority.runtimeInstanceAuthority, '.foundry/projects/sample-project/current-task.json');
});
