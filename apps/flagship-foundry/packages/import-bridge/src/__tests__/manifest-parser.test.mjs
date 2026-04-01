import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseManifest } from '../manifest-parser.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../../../..');

test('parses real legacy manifests from SDLC-Building-Blocks', async () => {
  const manifests = [
    'chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-intake-ai-orchestration-pipeline-2026-03-28/foundry-import-manifest.json',
    'chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-orchestration-architecture-packet-2026-03-28/foundry-import-manifest.json',
    'chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-orchestration-composer-work-order-batch-2026-03-30/foundry-import-manifest.json'
  ];

  for (const relativePath of manifests) {
    const parsed = await parseManifest(path.join(repoRoot, relativePath));
    assert.ok(parsed.projectName.length > 0);
    assert.ok(parsed.importOrder.length > 0);
    assert.equal(parsed.artifacts.length, parsed.importOrder.length);
  }
});

test('rejects missing required manifest fields with structured error', async () => {
  const badPath = path.join(repoRoot, 'apps/flagship-foundry/packages/import-bridge/src/__tests__/fixtures/bad-manifest.json');
  await assert.rejects(() => parseManifest(badPath), /Manifest is missing projectName/);
});
