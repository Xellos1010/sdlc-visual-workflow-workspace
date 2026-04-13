import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { ensureDir, stateRoot, writeJson } from '../packages/core/src/io.mjs';
import { buildArtifactGraph, queryConnected, selectSubgraph } from '../packages/core/src/artifact-graph.mjs';

test('artifact graph builds nodes from canonical ecosystem state and supports traversal', async () => {
  const ecosystemId = `test-graph-${Date.now()}`;
  const cartDir = path.join(stateRoot, 'ecosystems', ecosystemId, 'operator', 'context-carts');
  await ensureDir(cartDir);
  const cartPath = path.join(cartDir, 'cart.json');
  await writeJson(cartPath, {
    cartId: 'cart:test',
    workspaceTargetId: 'target:test',
    title: 'Test Cart',
    status: 'draft',
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const graph = await buildArtifactGraph(ecosystemId, { ecosystemName: 'Test Ecosystem' });
  const artifactNode = graph.nodes.find((node) => node.properties?.artifactId?.endsWith('cart.json'));

  assert.ok(artifactNode, 'expected cart.json to appear as a graph node');
  assert.equal(artifactNode.type, 'context-cart');

  const connected = queryConnected(graph, [artifactNode.id], { direction: 'both', maxDepth: 1 });
  assert.ok(connected.nodes.some((node) => node.id === artifactNode.id));

  const subgraph = selectSubgraph(graph, [artifactNode.id]);
  assert.equal(subgraph.nodes.length, 1);
});

