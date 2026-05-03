import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCli } from '../cli.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../../../..');

test('dry-run CLI reports artifact routes without writing files', async () => {
  process.chdir(repoRoot);
  const result = await runCli([
    'dry-run',
    'chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-intake-ai-orchestration-pipeline-2026-03-28'
  ]);
  assert.equal(result.command, 'dry-run');
  assert.ok(Array.isArray(result.routes));
});
