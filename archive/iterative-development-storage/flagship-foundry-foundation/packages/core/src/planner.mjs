import { buildEcosystemPlan } from '../../../services/ecosystem-orchestrator/src/index.mjs';
import { loadGraph, summarizeGraph } from './graph-store.mjs';
import { saveChangeRequest } from './change-requests.mjs';

export function planChangeRequest(changeRequest) {
  saveChangeRequest(changeRequest);
  const graph = loadGraph();
  const graphSummary = summarizeGraph(graph);
  return buildEcosystemPlan(changeRequest, graphSummary);
}
