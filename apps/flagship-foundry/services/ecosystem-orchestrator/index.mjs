import { importWorkspace } from '../../packages/core/src/import-pipeline.mjs';
import { createPlan } from '../../packages/core/src/plans.mjs';

export async function bootstrapEcosystem(importRequest, changeRequest = null) {
  const imported = await importWorkspace(importRequest);
  const plan = changeRequest ? await createPlan({ ...changeRequest, ecosystemId: imported.ecosystem.id }) : null;
  return { ...imported, plan };
}
