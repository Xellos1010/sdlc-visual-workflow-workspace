import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseManifest } from '../manifest-parser.mjs';
import { validateNormalizedManifest, validateWorkOrderBatch } from '../validator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../../../..');
const schemaRoot = path.join(repoRoot, 'chatgpt-workspace-setup/foundry-phone-projects-kit/schemas');
const foundrySchemaRoot = path.join(repoRoot, 'apps/flagship-foundry/schemas');

test('validates normalized legacy manifests against schema manifest contract', async () => {
  const manifest = await parseManifest(path.join(
    repoRoot,
    'chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-orchestration-architecture-packet-2026-03-28/foundry-import-manifest.json'
  ));
  await validateNormalizedManifest(manifest, schemaRoot);
});

test('rejects invalid work-order batch with artifact and field context', async () => {
  const invalidBatch = {
    projectName: 'Example',
    phaseId: 'phase',
    dependencyOrder: ['WO-1'],
    nextWorkspace: 'next',
    workOrders: [
      {
        workOrderId: 'WO-1',
        lifecycleStage: 'implement',
        phaseId: 'phase',
        systemId: 'sys',
        taskClass: 'deterministic_transformation',
        agentRole: 'builder',
        agentPersona: 'conservative_builder',
        modelTier: 'low_cost_executor',
        fileScope: [],
        sourceArtifacts: [],
        constraints: [],
        expectedOutputs: [],
        verificationPlan: [],
        functionSpecs: [],
        status: 'ready'
      }
    ]
  };

  await assert.rejects(
    () => validateWorkOrderBatch(invalidBatch, schemaRoot, foundrySchemaRoot),
    /acceptanceCriteria|failed validation/
  );
});
