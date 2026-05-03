import { resolveReadyStatuses } from './dependency-resolver.mjs';
import { transformWorkOrderBatch } from './transforms/work-order-batch.transform.mjs';

export interface ActivatedWorkOrder {
  id: string;
  projectId: string;
  phase: string;
  title: string;
  personaIds: string[];
  commands: string[];
  acceptanceCriteria: string[];
  status: 'queued' | 'blocked' | 'pending';
  _unmapped?: Record<string, unknown>;
}

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function activateWorkOrderBatch(input: Record<string, unknown>): ActivatedWorkOrder[] {
  const transformed = transformWorkOrderBatch(input as never);
  const rawOrders = (input.workOrders as Array<Record<string, unknown>> | undefined) ?? [];
  const projectSlug = slugify(transformed.projectName);
  const dependencyGraph = rawOrders.map((workOrder) => ({
    id: `${projectSlug}/${String(workOrder.workOrderId)}`,
    dependsOn: Array.isArray(workOrder.dependsOn) ? (workOrder.dependsOn as string[]).map((dep) => `${projectSlug}/${dep}`) : [],
    status: String(workOrder.status ?? 'ready')
  }));

  const statuses = new Map(resolveReadyStatuses(dependencyGraph).map((item) => [item.id, item.resolvedStatus]));
  return transformed.workOrders.map((workOrder) => ({
    ...workOrder,
    id: `${projectSlug}/${workOrder.id}`,
    status: statuses.get(`${projectSlug}/${workOrder.id}`) ?? 'pending'
  }));
}
