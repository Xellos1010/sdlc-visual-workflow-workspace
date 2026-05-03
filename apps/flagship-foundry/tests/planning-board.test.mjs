import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPlanForBoard } from '../packages/core/src/plans.mjs';

test('planning board projection surfaces dependency and file-scope views', () => {
  const board = projectPlanForBoard({
    id: 'plan:test',
    ecosystemId: 'ecosystem:test',
    title: 'Operator rollout',
    objective: 'Ship the operator surface',
    status: 'draft',
    riskLevel: 'high',
    sourceSignal: 'request',
    createdAt: '2026-04-02T00:00:00.000Z',
    approval: { status: 'pending', mode: 'manual' },
    projectPlans: [
      {
        projectId: 'cursor-companion',
        tasks: [
          {
            id: 'task:one',
            title: 'Bind workspace',
            dependsOn: [],
            fileScope: ['apps/cursor-companion/extension.js'],
            acceptanceCriteria: ['Target visible before planning']
          }
        ]
      }
    ]
  });

  assert.equal(board.header.taskCount, 1);
  assert.equal(board.dependencies[0].title, 'Bind workspace');
  assert.deepEqual(board.dependencies[0].fileScope, ['apps/cursor-companion/extension.js']);
});
