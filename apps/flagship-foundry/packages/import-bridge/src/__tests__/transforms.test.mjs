import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { createSchemaDiffStub } from '../codegen/schema-diff.mjs';
import { normalizeManifest, toSchemaManifest } from '../transforms/import-manifest.transform.mjs';
import { transformWorkOrderBatch } from '../transforms/work-order-batch.transform.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../../../..');

test('schema diff codegen produces stub metadata', async () => {
  const sourceSchema = JSON.parse(await readFile(path.join(
    repoRoot,
    'chatgpt-workspace-setup/foundry-phone-projects-kit/schemas/work-order-batch.schema.json'
  ), 'utf8'));
  const targetSchema = JSON.parse(await readFile(path.join(
    repoRoot,
    'apps/flagship-foundry/schemas/agent-work-order.schema.json'
  ), 'utf8'));
  const diff = createSchemaDiffStub(sourceSchema, targetSchema);
  assert.ok(Array.isArray(diff.requiredInSourceOnly));
  assert.ok(Array.isArray(diff.requiredInTargetOnly));
});

test('manifest transform round-trips normalized schema representation', async () => {
  const legacyManifest = JSON.parse(await readFile(path.join(
    repoRoot,
    'chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-intake-ai-orchestration-pipeline-2026-03-28/foundry-import-manifest.json'
  ), 'utf8'));
  const normalized = normalizeManifest(legacyManifest);
  const schemaManifest = toSchemaManifest(normalized);
  assert.equal(schemaManifest.artifacts.length, normalized.artifacts.length);
  assert.deepEqual(schemaManifest.importOrder, normalized.importOrder);
});

test('work-order batch transform maps to foundry agent work orders', async () => {
  const batch = JSON.parse(await readFile(path.join(
    repoRoot,
    'chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-orchestration-composer-work-order-batch-2026-03-30/work-order-batch.json'
  ), 'utf8'));
  const transformed = transformWorkOrderBatch(batch);
  assert.equal(transformed.workOrders.length, batch.workOrders.length);
  assert.ok(transformed.workOrders.every((item) => item.id && item.personaIds.length === 2));
});
