import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { activateWorkOrderBatch } from '../wo-activator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../../../..');

test('activates real work-order batch and queues only dependency-free ready work', async () => {
  const batch = JSON.parse(await readFile(path.join(
    repoRoot,
    'chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-orchestration-composer-work-order-batch-2026-03-30/work-order-batch.json'
  ), 'utf8'));
  const activated = activateWorkOrderBatch(batch);
  assert.equal(activated.length, 15);
  assert.ok(activated.some((item) => item.id.endsWith('/WO-001A') && item.status === 'queued'));
  assert.ok(activated.some((item) => item.id.endsWith('/WO-001B') && item.status === 'pending'));
});
