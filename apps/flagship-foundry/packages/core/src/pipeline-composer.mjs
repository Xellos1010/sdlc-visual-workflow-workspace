export function composePipeline(pipelineDefinition) {
  if (!pipelineDefinition || typeof pipelineDefinition !== 'object') {
    throw new Error('pipeline definition is required');
  }
  const stages = Array.isArray(pipelineDefinition.stages) ? pipelineDefinition.stages : [];
  if (stages.length === 0) {
    throw new Error('pipeline definition must include at least one stage');
  }

  const normalizedStages = [...stages]
    .map((stage, index) => ({
      stageId: stage.stageId ?? `stage-${index + 1}`,
      order: Number.isInteger(stage.order) ? stage.order : index,
      adapterId: stage.adapterId,
      agentRole: stage.agentRole ?? 'builder',
      workOrderRef: stage.workOrderRef,
      tokenBudget: Number(stage.tokenBudget ?? 0),
      failurePolicy: stage.failurePolicy ?? pipelineDefinition.defaultFailurePolicy ?? 'halt',
      retryLimit: stage.retryLimit ?? null
    }))
    .sort((left, right) => left.order - right.order);

  const stageIds = new Set();
  for (const stage of normalizedStages) {
    if (!stage.adapterId) throw new Error(`stage ${stage.stageId} requires adapterId`);
    if (!stage.workOrderRef) throw new Error(`stage ${stage.stageId} requires workOrderRef`);
    if (stage.tokenBudget <= 0) throw new Error(`stage ${stage.stageId} requires tokenBudget`);
    if (stageIds.has(stage.stageId)) throw new Error(`duplicate stageId ${stage.stageId}`);
    stageIds.add(stage.stageId);
  }

  return {
    pipelineId: pipelineDefinition.pipelineId,
    ecosystemId: pipelineDefinition.ecosystemId,
    title: pipelineDefinition.title,
    description: pipelineDefinition.description ?? null,
    defaultFailurePolicy: pipelineDefinition.defaultFailurePolicy ?? 'halt',
    stages: normalizedStages,
    createdAt: pipelineDefinition.createdAt ?? new Date().toISOString()
  };
}

