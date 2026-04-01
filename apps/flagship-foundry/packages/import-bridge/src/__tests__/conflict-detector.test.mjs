import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { detectConflicts } from '../conflict-detector.mjs';
import { applyMergeResolutions, planMergeResolutions } from '../diff-merge.mjs';

test('detects overwrite conflicts and emits unified diff', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'import-bridge-conflict-'));
  const existingPath = path.join(root, 'docs/imported/sample/intent-packet.md');
  const incomingPath = path.join(root, '.foundry/staging/sample/docs/imported/sample/intent-packet.md');
  await mkdir(path.dirname(existingPath), { recursive: true });
  await mkdir(path.dirname(incomingPath), { recursive: true });
  await writeFile(existingPath, 'old line\n');
  await writeFile(incomingPath, 'new line\n');

  const conflicts = await detectConflicts([{ targetPath: existingPath, incomingPath }]);
  assert.equal(conflicts.length, 1);
  assert.match(conflicts[0].diff, /^--- existing\//);
  assert.equal(conflicts[0].kind, 'file');
});

test('continuity conflicts expose field-level diffs and manual merge preview', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'import-bridge-continuity-conflict-'));
  const existingPath = path.join(root, '.foundry/projects/sample/current-task.json');
  const incomingPath = path.join(root, '.foundry/staging/sample/current-task.json');
  await mkdir(path.dirname(existingPath), { recursive: true });
  await mkdir(path.dirname(incomingPath), { recursive: true });
  await writeFile(existingPath, JSON.stringify({ lifecycleStage: 'plan', currentPhase: { status: 'pending' } }, null, 2));
  await writeFile(incomingPath, JSON.stringify({ lifecycleStage: 'release', currentPhase: { status: 'verified' } }, null, 2));

  const conflicts = await detectConflicts([{ targetPath: existingPath, incomingPath }]);
  assert.equal(conflicts[0].kind, 'continuity');
  assert.ok(conflicts[0].fieldDiffs.some((item) => item.fieldPath === '/lifecycleStage'));

  const planned = planMergeResolutions(conflicts, new Map([[existingPath, 'manual-merge']]), false);
  const applied = await applyMergeResolutions(planned);
  assert.ok(applied[0].previewPath);
  const preview = await readFile(applied[0].previewPath, 'utf8');
  assert.match(preview, /<<<<<<< existing/);
});
