import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExecutionSessionBoard } from '../packages/core/src/session-projection.mjs';

test('execution session board only allows launches when plan approval and DoR readiness are both satisfied', () => {
  const board = buildExecutionSessionBoard({
    plans: [
      { id: 'plan:test', approvalStatus: 'approved' }
    ],
    runs: [
      { id: 'run:test', status: 'running' }
    ],
    refinements: [
      { sessionId: 'refine:test', definitionOfReady: { status: 'ready' } }
    ],
    budgetSnapshots: [
      { snapshotId: 'budget:test' }
    ]
  });

  assert.equal(board.approvals.latestPlanApproved, true);
  assert.equal(board.approvals.runLaunchAllowed, true);
  assert.equal(board.counts.runs, 1);
});
