import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, readdir } from 'node:fs/promises';
import { createExportBundle } from '../export-packager.mjs';

test('creates required export bundle files', async () => {
  const targetDir = await mkdtemp(path.join(os.tmpdir(), 'import-bridge-export-'));
  await createExportBundle({
    projectName: 'flagship-foundry',
    phaseId: 'verify-1',
    targetDir
  });
  const files = await readdir(targetDir);
  assert.equal(files.length, 7);
  assert.ok(files.includes('foundry-import-manifest.json'));
});
