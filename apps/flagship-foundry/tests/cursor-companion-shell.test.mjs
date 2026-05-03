import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { buildPlanPayload, buildRunRequest } = require('../apps/cursor-companion/control-plane-client.js');
const { overlayHtml } = require('../apps/cursor-companion/operator-panel.js');
const { createRuntimeState } = require('../apps/cursor-companion/panel-state.js');

test('runtime state preserves and updates extension session values', () => {
  const runtimeState = createRuntimeState();

  assert.equal(runtimeState.getValue('latestEcosystemId'), null);
  runtimeState.setValue('latestEcosystemId', 'ecosystem:test');
  runtimeState.update({ latestFocusPath: '/tmp/focus.mmd', latestMirroredFile: 'extension.js' });

  assert.equal(runtimeState.getValue('latestEcosystemId'), 'ecosystem:test');
  assert.equal(runtimeState.getValue('latestFocusPath'), '/tmp/focus.mmd');
  assert.equal(runtimeState.get().latestMirroredFile, 'extension.js');
});

test('buildPlanPayload maps approval and risk posture from settings', () => {
  const payload = buildPlanPayload({
    ecosystemId: 'ecosystem:test',
    objective: 'Harden architecture and state authority controls',
    knowledgeBaseId: 'kb:test',
    settings: {
      autoApproveDraftPlans: true,
      autoStartApprovedPlans: false
    }
  });

  assert.equal(payload.ecosystemId, 'ecosystem:test');
  assert.equal(payload.riskLevel, 'high');
  assert.equal(payload.reviewPolicyId, 'review-policy:high-risk-adversarial');
  assert.equal(payload.approval.mode, 'auto');
  assert.equal(payload.approval.autoApprove, true);
  assert.equal(payload.approval.autoStartOnApproval, false);
});

test('buildRunRequest chooses correct adapter for simulate and execute modes', () => {
  assert.deepEqual(buildRunRequest({ planId: 'plan:test', mode: 'simulate' }), {
    planId: 'plan:test',
    mode: 'simulate',
    adapterId: 'adapter:cursor-companion'
  });

  assert.deepEqual(buildRunRequest({ planId: 'plan:test', mode: 'execute' }), {
    planId: 'plan:test',
    mode: 'execute',
    adapterId: 'adapter:local-shell'
  });
});

test('overlayHtml renders core overlay metadata and focus graph placeholder', () => {
  const html = overlayHtml({
    ecosystemId: 'ecosystem:test',
    foundryRoot: '/tmp/foundry',
    settings: {
      runExecutionMode: 'simulate',
      autoApproveDraftPlans: false
    },
    plans: [],
    runs: [],
    phases: { phases: [{ id: 'discover' }, { id: 'plan' }] },
    graphStats: { nodeCount: 3, edgeCount: 2 },
    planningContext: { layer1_workspace: { projectCount: 4 } },
    mirroredFile: 'extension.js',
    focusContent: null,
    workspaceCandidates: [{ targetId: 'target:a', displayName: 'repo-a', workspaceRoot: '/tmp/repo-a' }],
    contextCarts: [],
    refinementSessions: [],
    visualArtifacts: [],
    planningBoard: [],
    budgetSnapshot: { providers: [], adapters: [] },
    sessionBoard: null
  });

  assert.match(html, /Foundry Orchestrator/);
  assert.match(html, /ecosystem:test/);
  assert.match(html, /No focus graph generated/);
  assert.match(html, /extension\.js/);
  assert.match(html, /Workspace Target/);
  assert.match(html, /Provider Posture/);
  assert.match(html, /Windowing/);
});
