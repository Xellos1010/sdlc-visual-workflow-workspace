import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { activateWorkOrderBatch } from '../../wo-activator.mjs';
import { validateWorkOrderBatch } from '../../validator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../../../../..');

test('activates and validates the real work-order batch with correct dependency resolution', async () => {
  const batchPath = path.join(
    repoRoot,
    'chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-orchestration-composer-work-order-batch-2026-03-30/work-order-batch.json'
  );
  const batch = JSON.parse(await readFile(batchPath, 'utf8'));
  await validateWorkOrderBatch(
    batch,
    path.join(repoRoot, 'chatgpt-workspace-setup/foundry-phone-projects-kit/schemas'),
    path.join(repoRoot, 'apps/flagship-foundry/schemas')
  );
  const activated = activateWorkOrderBatch(batch);
  assert.equal(activated.length, 15);
  assert.ok(activated.some((item) => item.id.endsWith('/WO-001A') && item.status === 'queued'));
});
