export function buildExecutionSessionBoard(input = {}) {
  const plans = Array.isArray(input.plans) ? input.plans : [];
  const runs = Array.isArray(input.runs) ? input.runs : [];
  const refinements = Array.isArray(input.refinements) ? input.refinements : [];
  const snapshots = Array.isArray(input.budgetSnapshots) ? input.budgetSnapshots : [];
  const pipelines = Array.isArray(input.pipelines) ? input.pipelines : [];

  const latestPlan = plans[0] ?? null;
  const latestRun = runs[0] ?? null;
  const latestRefinement = refinements[0] ?? null;
  const latestBudgetSnapshot = snapshots[0] ?? null;
  const latestPipeline = pipelines[0] ?? null;

  return {
    latestPlan,
    latestRun,
    latestRefinement,
    latestBudgetSnapshot,
    latestPipeline,
    approvals: {
      latestPlanApproved: latestPlan?.approvalStatus === 'approved' || latestPlan?.approval?.status === 'approved',
      runLaunchAllowed: (latestPlan?.approvalStatus === 'approved' || latestPlan?.approval?.status === 'approved')
        && latestRefinement?.definitionOfReady?.status === 'ready',
      pipelineLaunchAllowed: (latestPlan?.approvalStatus === 'approved' || latestPlan?.approval?.status === 'approved')
        && latestRefinement?.definitionOfReady?.status === 'ready'
    },
    counts: {
      plans: plans.length,
      runs: runs.length,
      readyRefinements: refinements.filter((item) => item.definitionOfReady?.status === 'ready').length,
      pipelines: pipelines.length
    }
  };
}
