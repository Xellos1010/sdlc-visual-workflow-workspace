import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVisualArtifact, listVisualArtifacts, loadVisualArtifact, saveVisualArtifact } from '../packages/core/src/visual-artifacts.mjs';

test('visual artifacts persist mermaid and non-diagram explainers as typed outputs', async () => {
  const ecosystemId = `test-visual-artifacts-${Date.now()}`;
  const artifact = buildVisualArtifact({
    workspaceTargetId: 'target:workspace',
    kind: 'c4-context',
    title: 'Context Diagram',
    body: 'C4Context\n  title Example'
  });
  await saveVisualArtifact(ecosystemId, artifact);

  const pseudocode = buildVisualArtifact({
    workspaceTargetId: 'target:workspace',
    kind: 'pseudocode',
    title: 'Execution explainer',
    body: '# Pseudocode\n\nDo the thing.'
  });
  await saveVisualArtifact(ecosystemId, pseudocode);

  const loaded = await loadVisualArtifact(ecosystemId, artifact.artifactId);
  const listed = await listVisualArtifacts(ecosystemId);

  assert.equal(loaded.representation, 'mermaid');
  assert.equal(listed.length >= 2, true);
  assert.ok(listed.some((entry) => entry.kind === 'pseudocode'));
});
