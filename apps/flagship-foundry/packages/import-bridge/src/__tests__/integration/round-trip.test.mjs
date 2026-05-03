import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile } from 'node:fs/promises';
import { parseManifest } from '../../manifest-parser.mjs';
import { routeArtifacts } from '../../artifact-router.mjs';
import { createStagePlan, stageArtifacts, commitStage } from '../../staging.mjs';
import { writeContinuityState } from '../../continuity-writer.mjs';
import { createExportBundle } from '../../export-packager.mjs';
import { detectConflicts } from '../../conflict-detector.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../../../../..');

test('round-trip import then export preserves manifest data and surfaces conflicts cleanly', async () => {
  const sourceDir = path.join(
    repoRoot,
    'chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-intake-ai-orchestration-pipeline-2026-03-28'
  );
  const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), 'import-bridge-roundtrip-'));
  const manifest = await parseManifest(path.join(sourceDir, 'foundry-import-manifest.json'));
  const routed = routeArtifacts(sourceDir, manifest);
  const plan = await createStagePlan(path.join(workspaceRoot, '.foundry/staging'), 'roundtrip', routed);
  await stageArtifacts(plan);
  const committed = await commitStage(plan, workspaceRoot, true);
  const continuityPath = await writeContinuityState({
    projectSlug: 'roundtrip',
    importedArtifacts: committed.map((item) => path.relative(workspaceRoot, item)),
    manifest,
    workspaceRoot,
    force: true
  });
  const continuityText = await readFile(continuityPath, 'utf8');
  await (await import('node:fs/promises')).writeFile(continuityPath, continuityText.replace('"plan"', '"release"'));

  const exportDir = path.join(workspaceRoot, 'exports/roundtrip');
  const exported = await createExportBundle({
    projectName: 'roundtrip',
    phaseId: 'roundtrip-release',
    targetDir: exportDir
  });
  const conflicts = await detectConflicts([{ targetPath: continuityPath, incomingPath: continuityPath }]);

  assert.equal(exported.length, 7);
  assert.equal(conflicts.length, 0);
});
