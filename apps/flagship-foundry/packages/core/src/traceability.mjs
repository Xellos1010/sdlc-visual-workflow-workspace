import { loadGraph } from './graph-store.mjs';

/**
 * Forward trace: list nodes impacted from a starting node id (one hop via edges).
 *
 * @param {string} ecosystemId
 * @param {string} nodeId
 * @returns {Promise<object>}
 */
export async function traceForwardFromNode(ecosystemId, nodeId) {
  const graph = await loadGraph(ecosystemId, ecosystemId);
  const edges = graph.edges ?? [];
  const outgoing = edges.filter((e) => e.source === nodeId || e.sourceId === nodeId);
  return {
    ecosystemId,
    origin: nodeId,
    direction: 'forward',
    edges: outgoing
  };
}

/**
 * Backward trace: edges pointing at a node.
 *
 * @param {string} ecosystemId
 * @param {string} nodeId
 * @returns {Promise<object>}
 */
export async function traceBackwardToNode(ecosystemId, nodeId) {
  const graph = await loadGraph(ecosystemId, ecosystemId);
  const edges = graph.edges ?? [];
  const incoming = edges.filter((e) => e.target === nodeId || e.targetId === nodeId);
  return {
    ecosystemId,
    target: nodeId,
    direction: 'backward',
    edges: incoming
  };
}

/**
 * Map a file path substring to likely graph nodes by name match (lightweight stub).
 *
 * @param {string} ecosystemId
 * @param {string} filePathFragment
 * @returns {Promise<object>}
 */
export async function traceFileHeuristic(ecosystemId, filePathFragment) {
  const graph = await loadGraph(ecosystemId, ecosystemId);
  const needle = filePathFragment.toLowerCase();
  const nodes = (graph.nodes ?? []).filter((n) => {
    const name = (n.name ?? '').toLowerCase();
    const id = (n.id ?? '').toLowerCase();
    return name.includes(needle) || id.includes(needle) || needle.includes(name);
  });
  return { ecosystemId, filePathFragment, matches: nodes.slice(0, 20) };
}
