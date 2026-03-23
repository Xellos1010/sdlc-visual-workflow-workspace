import path from 'node:path';
import { ensureDir, nowIso, readJson, stateRoot, writeJson } from './io.mjs';

export function createEmptyGraph({ ecosystemId, ecosystemName }) {
  return {
    graphId: `graph:${ecosystemId}`,
    ecosystemId,
    ecosystemName,
    generatedAt: nowIso(),
    nodes: [],
    edges: [],
    metadata: {
      schemaVersion: '0.2.0',
      patchCount: 0
    }
  };
}

export function upsertNode(graph, node) {
  const existingIndex = graph.nodes.findIndex((entry) => entry.id === node.id);
  const normalized = {
    ...node,
    properties: { ...(node.properties ?? {}) },
    tags: [...new Set(node.tags ?? [])],
    refs: [...new Set(node.refs ?? [])]
  };

  if (existingIndex >= 0) {
    graph.nodes[existingIndex] = {
      ...graph.nodes[existingIndex],
      ...normalized,
      properties: {
        ...(graph.nodes[existingIndex].properties ?? {}),
        ...(normalized.properties ?? {})
      },
      tags: [...new Set([...(graph.nodes[existingIndex].tags ?? []), ...(normalized.tags ?? [])])],
      refs: [...new Set([...(graph.nodes[existingIndex].refs ?? []), ...(normalized.refs ?? [])])]
    };
    return graph.nodes[existingIndex];
  }

  graph.nodes.push(normalized);
  return normalized;
}

export function addEdge(graph, edge) {
  const normalized = {
    ...edge,
    properties: { ...(edge.properties ?? {}) }
  };
  const duplicate = graph.edges.find(
    (entry) => entry.type === normalized.type && entry.source === normalized.source && entry.target === normalized.target
  );
  if (duplicate) {
    duplicate.properties = { ...(duplicate.properties ?? {}), ...(normalized.properties ?? {}) };
    return duplicate;
  }
  graph.edges.push(normalized);
  return normalized;
}

export function indexGraph(graph) {
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const outgoing = new Map();
  const incoming = new Map();

  for (const edge of graph.edges) {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    if (!incoming.has(edge.target)) incoming.set(edge.target, []);
    outgoing.get(edge.source).push(edge);
    incoming.get(edge.target).push(edge);
  }

  return { nodesById, outgoing, incoming };
}

export function getNeighbors(graph, nodeId, direction = 'both') {
  const { outgoing, incoming } = indexGraph(graph);
  const results = [];
  if (direction === 'out' || direction === 'both') {
    results.push(...(outgoing.get(nodeId) ?? []));
  }
  if (direction === 'in' || direction === 'both') {
    results.push(...(incoming.get(nodeId) ?? []));
  }
  return results;
}

export function applyGraphPatches(graph, patches = []) {
  for (const patch of patches) {
    if (patch.op === 'add_node' && patch.payload) {
      upsertNode(graph, patch.payload);
      continue;
    }
    if (patch.op === 'add_edge' && patch.payload) {
      addEdge(graph, patch.payload);
      continue;
    }
    if (patch.op === 'set_property') {
      const collection = patch.targetType === 'edge' ? graph.edges : graph.nodes;
      const target = collection.find((entry) => entry.id === patch.targetId);
      if (!target) continue;
      target.properties = { ...(target.properties ?? {}), ...(patch.payload?.properties ?? {}) };
      continue;
    }
  }
  graph.generatedAt = nowIso();
  graph.metadata.patchCount += patches.length;
  return graph;
}

export function graphFilePath(ecosystemId) {
  return path.join(stateRoot, 'ecosystems', ecosystemId, 'graph.json');
}

export async function loadGraph(ecosystemId, fallbackName = ecosystemId) {
  const filePath = graphFilePath(ecosystemId);
  const fallback = createEmptyGraph({ ecosystemId, ecosystemName: fallbackName });
  return readJson(filePath, fallback);
}

export async function saveGraph(graph) {
  const filePath = graphFilePath(graph.ecosystemId);
  await ensureDir(path.dirname(filePath));
  await writeJson(filePath, graph);
  return filePath;
}
