import fs from 'node:fs';
import path from 'node:path';
import { repoPath } from './paths.mjs';
import { ensureDir, readJson, writeJson, fileExists } from './fs-utils.mjs';

export const sampleGraphPath = repoPath('state', 'graph.sample.json');
export const runtimeGraphPath = repoPath('state', 'graph.runtime.json');

export function seedRuntimeGraph() {
  if (!fileExists(runtimeGraphPath)) {
    ensureDir(path.dirname(runtimeGraphPath));
    fs.copyFileSync(sampleGraphPath, runtimeGraphPath);
  }
}

export function loadGraph(filePath = runtimeGraphPath) {
  seedRuntimeGraph();
  return readJson(filePath);
}

export function saveGraph(graph, filePath = runtimeGraphPath) {
  writeJson(filePath, graph);
}

function upsertNode(nodes, payload) {
  const idx = nodes.findIndex((node) => node.id === payload.id);
  if (idx >= 0) {
    nodes[idx] = { ...nodes[idx], ...payload, properties: { ...(nodes[idx].properties || {}), ...(payload.properties || {}) } };
  } else {
    nodes.push(payload);
  }
}

function upsertEdge(edges, payload) {
  const idx = edges.findIndex((edge) => edge.id === payload.id);
  if (idx >= 0) {
    edges[idx] = { ...edges[idx], ...payload, properties: { ...(edges[idx].properties || {}), ...(payload.properties || {}) } };
  } else {
    edges.push(payload);
  }
}

export function applyPatch(graph, patches = []) {
  const next = JSON.parse(JSON.stringify(graph));
  next.nodes ||= [];
  next.edges ||= [];

  for (const patch of patches) {
    if (patch.op === 'upsert_node') {
      upsertNode(next.nodes, patch.payload);
    } else if (patch.op === 'upsert_edge') {
      upsertEdge(next.edges, patch.payload);
    } else if (patch.op === 'set_property') {
      if (patch.targetType === 'node') {
        const node = next.nodes.find((item) => item.id === patch.targetId);
        if (node) node.properties = { ...(node.properties || {}), ...(patch.payload?.properties || {}) };
      }
      if (patch.targetType === 'edge') {
        const edge = next.edges.find((item) => item.id === patch.targetId);
        if (edge) edge.properties = { ...(edge.properties || {}), ...(patch.payload?.properties || {}) };
      }
    } else if (patch.op === 'remove_node') {
      next.nodes = next.nodes.filter((item) => item.id !== patch.targetId);
      next.edges = next.edges.filter((item) => item.source !== patch.targetId && item.target !== patch.targetId);
    } else if (patch.op === 'remove_edge') {
      next.edges = next.edges.filter((item) => item.id !== patch.targetId);
    }
  }

  next.metadata = {
    ...(next.metadata || {}),
    revision: new Date().toISOString(),
    lastPatchCount: patches.length
  };

  return next;
}

export function applyAndSavePatch(patches = [], filePath = runtimeGraphPath) {
  const graph = loadGraph(filePath);
  const next = applyPatch(graph, patches);
  saveGraph(next, filePath);
  return next;
}

export function summarizeGraph(graph) {
  const byType = graph.nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {});

  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    nodeTypes: byType,
    revision: graph.metadata?.revision || null
  };
}
