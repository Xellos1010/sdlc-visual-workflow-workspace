import type { FoundryWorkOrder, WorkOrderBatchTransformResult } from '../types.mjs';

interface ChatGptWorkOrder {
  workOrderId: string;
  title?: string;
  phaseId: string;
  systemId: string;
  agentRole: string;
  agentPersona: string;
  verificationPlan?: string[];
  acceptanceCriteria: string[];
  status?: string;
  [key: string]: unknown;
}

interface ChatGptWorkOrderBatch {
  projectName: string;
  phaseId: string;
  dependencyOrder?: string[];
  workOrders: ChatGptWorkOrder[];
  [key: string]: unknown;
}

function mapStatus(input: string | undefined): FoundryWorkOrder['status'] {
  if (input === 'running') return 'running';
  if (input === 'paused') return 'paused';
  if (input === 'done') return 'done';
  if (input === 'stopped') return 'stopped';
  return 'queued';
}

export function transformWorkOrder(workOrder: ChatGptWorkOrder, projectId: string): FoundryWorkOrder {
  const {
    workOrderId,
    title,
    phaseId,
    agentRole,
    agentPersona,
    verificationPlan,
    acceptanceCriteria,
    status,
    ...rest
  } = workOrder;

  return {
    id: workOrderId,
    projectId,
    phase: phaseId,
    title: title ?? phaseId,
    personaIds: [agentRole, agentPersona],
    commands: verificationPlan ? [...verificationPlan] : [],
    acceptanceCriteria: [...acceptanceCriteria],
    status: mapStatus(status),
    _unmapped: {
      ...rest,
      originalAgentRole: agentRole,
      originalAgentPersona: agentPersona
    }
  };
}

export function transformWorkOrderBatch(input: ChatGptWorkOrderBatch): WorkOrderBatchTransformResult {
  const { projectName, phaseId, dependencyOrder, workOrders, ...rest } = input;
  return {
    projectName,
    phaseId,
    dependencyOrder: dependencyOrder ? [...dependencyOrder] : workOrders.map((item) => item.workOrderId),
    workOrders: workOrders.map((workOrder) => transformWorkOrder(workOrder, projectName)),
    _unmapped: rest
  };
}
