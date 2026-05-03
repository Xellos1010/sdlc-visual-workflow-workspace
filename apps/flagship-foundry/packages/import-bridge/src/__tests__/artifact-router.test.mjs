import test from 'node:test';
import assert from 'node:assert/strict';
import { routeArtifacts } from '../artifact-router.mjs';

test('routes ADRs, contracts, diagrams, and documents into Foundry targets', () => {
  const manifest = {
    projectName: 'Example',
    phaseId: 'phase',
    importStage: 'pre_implementation',
    targetWorkspace: 'flagship-foundry',
    artifacts: [],
    importOrder: [
      'adr-001-example.md',
      'contracts/example.schema.json',
      'system-sequence.mmd',
      'architecture-packet.md'
    ],
    postImportActions: [],
    sourceFormat: 'schema-v1'
  };
  const routed = routeArtifacts('/tmp/source', manifest);
  assert.equal(routed[0].relativeTargetPath, 'docs/adr/adr-001-example.md');
  assert.equal(routed[1].relativeTargetPath, 'apps/flagship-foundry/schemas/example.schema.json');
  assert.equal(routed[2].relativeTargetPath, 'docs/diagrams/system-sequence.mmd');
  assert.match(routed[3].relativeTargetPath, /^docs\/imported\//);
});
