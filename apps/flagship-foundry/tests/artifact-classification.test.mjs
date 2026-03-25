import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyArtifact,
  evaluateArtifactDrift,
  canCleanupArchive
} from '../packages/core/src/artifact-classification.mjs';

test('classifyArtifact marks foundry docs as canonical authority', () => {
  const result = classifyArtifact('flagship-foundry-work/docs/source-of-truth-matrix.md');
  assert.equal(result.artifactClass, 'canonical');
  assert.equal(result.authority, 'canonical');
  assert.ok(result.reasons.includes('canonical-docs-home'));
});

test('classifyArtifact marks state artifacts as generated non-authoritative', () => {
  const result = classifyArtifact('flagship-foundry-work/state/ecosystems/workspace/graph.json');
  assert.equal(result.artifactClass, 'generated');
  assert.equal(result.authority, 'non-authoritative');
  assert.ok(result.reasons.includes('state-artifacts-are-generated-outputs'));
});

test('classifyArtifact marks root plane research as reference-only archive', () => {
  const result = classifyArtifact('.cursor/plans/foundry-gap-analysis-intent_d20ed327.plan.md');
  assert.equal(result.artifactClass, 'archive');
  assert.equal(result.authority, 'reference-only');
  assert.ok(result.reasons.includes('outside-canonical-plane'));
});

test('evaluateArtifactDrift reports in-sync and drifted deterministically', () => {
  const inSync = evaluateArtifactDrift({
    canonicalPath: 'flagship-foundry-work/docs/adr/adr-001-artifact-authority-and-research-home.md',
    projectionPath: '.cursor/plans/foundry-gap-analysis-intent_d20ed327.plan.md',
    canonicalDigest: 'abc123',
    projectionDigest: 'abc123'
  });
  assert.equal(inSync.status, 'in-sync');

  const drifted = evaluateArtifactDrift({
    canonicalPath: 'flagship-foundry-work/docs/adr/adr-003-artifact-classification-drift-and-archive-retention.md',
    projectionPath: 'flagship-foundry-work/state/ecosystems/workspace/import-report.md',
    canonicalDigest: 'abc123',
    projectionDigest: 'def456'
  });
  assert.equal(drifted.status, 'drifted');
  assert.ok(drifted.reasons.includes('canonical-precedence'));
});

test('canCleanupArchive enforces parity approval retention and release cycle gates', () => {
  const blocked = canCleanupArchive({
    replacedAtIso: '2026-03-01T00:00:00.000Z',
    nowIso: '2026-03-10T00:00:00.000Z',
    parityChecksGreen: false,
    approvalRecorded: false,
    successfulReleaseCyclesSinceReplacement: 0
  });
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.reasons.includes('parity-checks-not-green'));
  assert.ok(blocked.reasons.includes('approval-not-recorded'));
  assert.ok(blocked.reasons.includes('minimum-30-day-retention-not-met'));
  assert.ok(blocked.reasons.includes('minimum-one-successful-release-cycle-not-met'));

  const allowed = canCleanupArchive({
    replacedAtIso: '2026-01-01T00:00:00.000Z',
    nowIso: '2026-03-15T00:00:00.000Z',
    parityChecksGreen: true,
    approvalRecorded: true,
    successfulReleaseCyclesSinceReplacement: 1
  });
  assert.equal(allowed.allowed, true);
  assert.deepEqual(allowed.reasons, []);
});

