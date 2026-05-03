import { nowIso } from './io.mjs';
import { composePipeline } from './pipeline-composer.mjs';
import { retrieve } from './retrieval-engine.mjs';
import { queryConnected } from './graph-query.mjs';
import { estimateTokenCount } from './derived-artifacts.mjs';

function normalizeItem(item, sourceKind) {
  return {
    itemId: item.itemId ?? `${sourceKind}:${item.artifactId ?? item.label ?? Date.now()}`,
    authority: item.authority ?? sourceKind,
    kind: item.kind ?? 'note',
    label: item.label ?? item.artifactId ?? 'context-item',
    tokenCount: Number(item.tokenCount ?? estimateTokenCount(item.chunkText ?? item.content ?? item.label ?? '')),
    source: item.source ?? { ref: item.artifactId ?? item.path ?? item.label ?? 'unknown', kind: sourceKind },
    provenance: item.provenance ?? null,
    pinned: Boolean(item.pinned)
  };
}

export async function assembleContextPacket(input) {
  const pipeline = input.pipelineDefinition ? composePipeline(input.pipelineDefinition) : null;
  const ragResults = input.ragQuery ? await retrieve(input.ecosystemId, input.ragQuery) : { results: [] };
  const graphResults = input.graphQuery?.startNodeIds?.length
    ? queryConnected(input.graph, input.graphQuery.startNodeIds, input.graphQuery)
    : { nodes: [], edges: [] };

  const cartItems = Array.isArray(input.contextCart?.items) ? input.contextCart.items.map((item) => normalizeItem(item, 'context-cart')) : [];
  const ragItems = (ragResults.results ?? []).map((item) => normalizeItem({
    ...item,
    authority: 'rag-retrieval',
    kind: 'rag-result',
    source: { ref: item.artifactId, kind: 'artifact' }
  }, 'rag-retrieval'));
  const graphItems = (graphResults.nodes ?? []).map((node) => normalizeItem({
    itemId: node.id,
    authority: 'graph-query',
    kind: node.type,
    label: node.name ?? node.id,
    tokenCount: estimateTokenCount(node.properties?.summary ?? node.name ?? node.id),
    source: { ref: node.id, kind: 'graph-node' },
    provenance: null
  }, 'graph-query'));

  const allItems = [...cartItems, ...ragItems, ...graphItems];
  const tokenBudget = input.tokenBudget ?? pipeline?.stages?.[0]?.tokenBudget ?? 12000;
  const pinnedItems = allItems.filter((item) => item.pinned);
  const ranked = [...pinnedItems, ...allItems.filter((item) => !item.pinned)].filter((item, index, array) => array.findIndex((entry) => entry.itemId === item.itemId) === index);

  const selected = [];
  let totalTokenCount = 0;
  for (const item of ranked) {
    const nextCount = totalTokenCount + item.tokenCount;
    if (nextCount > tokenBudget && !item.pinned) {
      continue;
    }
    selected.push(item);
    totalTokenCount = nextCount;
    if (totalTokenCount >= tokenBudget) {
      break;
    }
  }

  return {
    packetId: input.packetId ?? `packet:${input.ecosystemId}:${Date.now()}`,
    workOrderRef: input.workOrderRef,
    ecosystemId: input.ecosystemId,
    items: selected,
    totalTokenCount,
    manifest: {
      schemaVersion: '1.0.0',
      generatedAt: nowIso(),
      pipelineId: pipeline?.pipelineId ?? null
    },
    createdAt: nowIso()
  };
}

