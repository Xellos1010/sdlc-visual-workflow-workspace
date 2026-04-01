import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile } from 'node:fs/promises';
import { createExportBundle } from '../../export-packager.mjs';
import { validateWithSchema } from '../../validator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../../../../..');

test('exports a verification bundle in ChatGPT kit format', async () => {
  const targetDir = await mkdtemp(path.join(os.tmpdir(), 'import-bridge-export-integration-'));
  const files = await createExportBundle({
    projectName: 'flagship-foundry',
    phaseId: 'flagship-foundry-verify',
    targetDir
  });

  const manifestPath = files.find((item) => item.endsWith('foundry-import-manifest.json'));
  assert.ok(manifestPath);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  await validateWithSchema(
    'export-manifest',
    manifest,
    path.join(repoRoot, 'chatgpt-workspace-setup/foundry-phone-projects-kit/schemas/foundry-import-manifest.schema.json')
  );
});
