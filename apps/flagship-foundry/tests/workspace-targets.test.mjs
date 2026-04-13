import test from 'node:test';
import assert from 'node:assert/strict';
import { loadWorkspaceTarget, resolveWorkspaceCandidates, chooseWorkspaceTarget, saveWorkspaceTarget } from '../packages/core/src/workspace-targets.mjs';

test('workspace target resolution requires explicit choice for multi-root and persists the selected target', async () => {
  const candidates = resolveWorkspaceCandidates({
    hostKind: 'cursor',
    workspaceFolders: [
      { name: 'app-one', uri: { fsPath: '/tmp/app-one' } },
      { name: 'app-two', uri: { fsPath: '/tmp/app-two' } }
    ]
  });

  assert.equal(candidates.length, 2);
  assert.throws(() => chooseWorkspaceTarget({ candidates }), /Explicit workspace target selection required/);

  const selected = chooseWorkspaceTarget({
    candidates,
    targetId: candidates[1].targetId
  });
  assert.equal(selected.bindingMode, 'multi-root-explicit');
  assert.equal(selected.displayName, 'app-two');

  const ecosystemId = `test-workspace-targets-${Date.now()}`;
  await saveWorkspaceTarget(ecosystemId, selected);
  const loaded = await loadWorkspaceTarget(ecosystemId);
  assert.equal(loaded.targetId, selected.targetId);
  assert.equal(loaded.workspaceRoot, '/tmp/app-two');
});
