import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp } from 'node:fs/promises';
import { writeProvenanceRecord, readProvenanceChain } from '../provenance.mjs';

test('writes and reads provenance sidecars', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'import-bridge-provenance-'));
  const targetPath = path.join(root, 'artifact.md');
  await writeProvenanceRecord(targetPath, {
    sourceWorkspace: 'Workspace',
    pipelineProject: '3',
    generatedAt: new Date().toISOString(),
    importedAt: new Date().toISOString(),
    artifactType: 'document'
  });
  const chain = await readProvenanceChain(targetPath);
  assert.equal(chain.length, 1);
  assert.equal(chain[0].pipelineProject, '3');
});
