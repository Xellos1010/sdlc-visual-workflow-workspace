import { createRunForPlan, transitionRun } from '../../packages/core/src/runs.mjs';

export async function startPlanRun(planId, options = {}) {
  const run = await createRunForPlan(planId, options);
  return transitionRun(run.id, 'start');
}

export async function controlRun(runId, action) {
  return transitionRun(runId, action);
}
