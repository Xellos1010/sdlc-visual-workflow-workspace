import { queryConnected as queryConnectedGraph, queryLifecycleTrace as traceLifecycleGraph, selectSubgraph as selectGraphSubgraph } from './artifact-graph.mjs';

export function queryConnected(graph, startNodeIds, options = {}) {
  return queryConnectedGraph(graph, startNodeIds, options);
}

export function queryLifecycleTrace(graph, featureId) {
  return traceLifecycleGraph(graph, featureId);
}

export function selectSubgraph(graph, nodeIds = []) {
  return selectGraphSubgraph(graph, nodeIds);
}

