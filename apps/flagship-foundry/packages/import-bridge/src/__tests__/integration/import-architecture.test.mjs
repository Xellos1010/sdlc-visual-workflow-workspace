import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { mkdtemp } from 'node:fs/promises';
import { parseManifest } from '../../manifest-parser.mjs';
import { routeArtifacts } from '../../artifact-router.mjs';
import { createStagePlan, stageArtifacts, commitStage } from '../../staging.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../../../../..');

test('imports the real architecture workspace and places ADRs, schemas, and diagrams in target locations', async () => {
  const sourceDir = path.join(
    repoRoot,
    'chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-orchestration-architecture-packet-2026-03-28'
  );
  const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), 'import-bridge-arch-'));
  const manifest = await parseManifest(path.join(sourceDir, 'foundry-import-manifest.json'));
  const routed = routeArtifacts(sourceDir, manifest);
  const plan = await createStagePlan(path.join(workspaceRoot, '.foundry/staging'), 'arch-test', routed);
  await stageArtifacts(plan);
  const committed = await commitStage(plan, workspaceRoot, true);

  assert.ok(committed.some((item) => item.endsWith('docs/adr/adr-001-select-cursor-companion-as-canonical-operator-surface.md')));
  assert.ok(committed.some((item) => item.endsWith('apps/flagship-foundry/schemas/building-block-library-index.schema.json')));
  assert.ok(committed.some((item) => item.endsWith('docs/diagrams/c4-context.mmd')));
});
