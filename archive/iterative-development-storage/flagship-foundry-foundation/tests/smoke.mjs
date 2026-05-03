import assert from 'node:assert/strict';
import { planChangeRequest } from '../packages/core/src/planner.mjs';
import { telemetryToChangeRequest } from '../services/telemetry-intake/src/index.mjs';
import { applyPatch, loadGraph, summarizeGraph } from '../packages/core/src/graph-store.mjs';
import sampleChangeRequest from '../examples/minimum-executable-slice/sample-change-request.json' with { type: 'json' };
import sampleIncident from '../examples/minimum-executable-slice/sample-incident.json' with { type: 'json' };

const plan = planChangeRequest(sampleChangeRequest);
assert.equal(plan.requestId, 'CR-0001');
assert.ok(plan.workOrders.length >= 5, 'expected multiple work orders');
assert.ok(plan.workOrders.some((order) => order.agentRole === 'learning_agent'));

const derived = telemetryToChangeRequest(sampleIncident);
assert.equal(derived.type, 'incident');
assert.ok(derived.impactedSystems.includes('telemetry-intake'));

const graph = loadGraph();
const patched = applyPatch(graph, [
  {
    op: 'set_property',
    targetType: 'node',
    targetId: 'system:control-plane',
    payload: { properties: { status: 'planned' } }
  }
]);
assert.equal(patched.nodes.find((item) => item.id === 'system:control-plane').properties.status, 'planned');
assert.ok(summarizeGraph(patched).nodeCount >= 1);

console.log('Smoke tests passed.');
