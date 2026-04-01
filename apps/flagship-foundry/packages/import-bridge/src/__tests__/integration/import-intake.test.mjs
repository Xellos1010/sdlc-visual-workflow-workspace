import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { mkdtemp, access, readFile } from 'node:fs/promises';
import { parseManifest } from '../../manifest-parser.mjs';
import { validateNormalizedManifest } from '../../validator.mjs';
import { routeArtifacts } from '../../artifact-router.mjs';
import { createStagePlan, stageArtifacts, commitStage } from '../../staging.mjs';
import { writeContinuityState } from '../../continuity-writer.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../../../../..');

test('imports the real intake workspace end-to-end into staging and continuity', async () => {
  const sourceDir = path.join(
    repoRoot,
    'chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-intake-ai-orchestration-pipeline-2026-03-28'
  );
  const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), 'import-bridge-intake-'));
  const manifest = await parseManifest(path.join(sourceDir, 'foundry-import-manifest.json'));
  await validateNormalizedManifest(manifest, path.join(repoRoot, 'chatgpt-workspace-setup/foundry-phone-projects-kit/schemas'));

  const routed = routeArtifacts(sourceDir, manifest);
  const plan = await createStagePlan(path.join(workspaceRoot, '.foundry/staging'), 'intake-test', routed);
  const staged = await stageArtifacts(plan);
  const committed = await commitStage(plan, workspaceRoot, true);
  const continuityPath = await writeContinuityState({
    projectSlug: 'intake-test',
    importedArtifacts: committed.map((item) => path.relative(workspaceRoot, item)),
    manifest,
    workspaceRoot,
    force: true
  });

  assert.ok(staged.length > 0);
  await access(continuityPath);
  const continuity = JSON.parse(await readFile(continuityPath, 'utf8'));
  assert.equal(continuity.lifecycleStage, 'plan');
});
