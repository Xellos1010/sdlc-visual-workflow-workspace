import { analyzeBlastRadius } from '../../packages/core/src/blast-radius.mjs';
import { loadGraph } from '../../packages/core/src/graph-store.mjs';

export async function assessSystemImpact(ecosystemId, query) {
  const graph = await loadGraph(ecosystemId, ecosystemId);
  return analyzeBlastRadius(graph, query);
}
