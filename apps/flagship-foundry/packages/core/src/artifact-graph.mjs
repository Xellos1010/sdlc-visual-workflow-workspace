import path from 'node:path';
import { createEmptyGraph, addEdge, loadGraph, saveGraph, upsertNode } from './graph-store.mjs';
import { artifactPhaseFromPath, artifactProjectFromPath, artifactTypeFromPath, defaultArtifactRoots, listArtifactFiles, readArtifactSource, trunc, estimateTokenCount } from './derived-artifacts.mjs';
import { makeId, nowIso } from './io.mjs';

function safeNodeId(ecosystemId, relativePath) {
  return `artifact:${ecosystemId}:${relativePath.replace(/\\/g, '/').replace(/[^a-zA-Z0-9._/-]+/g, '-').replace(/\//g, ':')}`;
}

function parseObjectLinks(value) {
  const refs = [];
  if (!value || typeof value !== 'object') return refs;
  for (const key of ['sourceRefs', 'linkedArtifacts', 'sourceArtifacts', 'dependsOn', 'references', 'verifies', 'supersedes']) {
    const entries = value[key];
    if (Array.isArray(entries)) {
      for (const entry of entries) {
        if (typeof entry === 'string') refs.push(entry);
        else if (entry && typeof entry === 'object') {
          if (typeof entry.ref === 'string') refs.push(entry.ref);
          if (typeof entry.path === 'string') refs.push(entry.path);
          if (typeof entry.id === 'string') refs.push(entry.id);
        }
      }
    }
  }
  return refs;
}

function resolveRefTarget(ref, candidates) {
  const normalized = String(ref).replace(/\\/g, '/');
  return candidates.get(normalized)
    ?? candidates.get(normalized.replace(/^\.\/+/, ''))
    ?? candidates.get(path.basename(normalized))
    ?? candidates.get(normalized.split('/').slice(-2).join('/'))
    ?? null;
}

function addArtifactLinks(graph, node, artifact, candidates) {
  for (const ref of parseObjectLinks(artifact)) {
    const target = resolveRefTarget(ref, candidates);
    if (!target || target.nodeId === node.id) continue;
    addEdge(graph, {
      id: makeId('edge', `${node.id}-${target.nodeId}`),
      type: 'references',
      source: node.id,
      target: target.nodeId,
      properties: { reference: ref }
    });
  }
}

async function buildNodeForFile(ecosystemId, rootDir, file) {
  const relativePath = path.relative(rootDir, file.path).replace(/\\/g, '/');
  let source;
  try {
    source = await readArtifactSource(file.path);
  } catch {
    try {
      source = await import('node:fs/promises').then((fs) => fs.readFile(file.path, 'utf8'));
    } catch {
      return null;
    }
  }
  const artifactType = artifactTypeFromPath(relativePath);
  const nodeId = safeNodeId(ecosystemId, relativePath);
  const summary = typeof source === 'string'
    ? trunc(source.split('\n').slice(0, 12).join(' '), 240)
    : trunc(JSON.stringify(source).slice(0, 240), 240);
  return {
    node: {
      id: nodeId,
      type: artifactType,
      name: path.basename(relativePath),
      refs: [relativePath],
      properties: {
        artifactId: relativePath,
        path: relativePath,
        phase: artifactPhaseFromPath(relativePath),
        project: artifactProjectFromPath(relativePath),
        summary,
        tokenCount: estimateTokenCount(summary),
        mtimeMs: file.mtimeMs ?? null
      }
    },
    source,
    relativePath
  };
}

async function scanGraphSources(ecosystemId, options = {}) {
  const roots = options.roots ?? defaultArtifactRoots(ecosystemId);
  const files = [];
  const seen = new Set();
  for (const root of roots) {
    let entries = [];
    try {
      entries = await listArtifactFiles(root, {
        includeMatcher: (fullPath, relativePath) => {
          const normalized = relativePath.replace(/\\/g, '/');
          if (normalized.includes('/node_modules/') || normalized.includes('/dist/') || normalized.includes('/coverage/')) return false;
          if (normalized.includes('/state/ecosystems/') && !normalized.includes(`/state/ecosystems/${ecosystemId}/`)) return false;
          return true;
        }
      });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (seen.has(entry.path)) continue;
      seen.add(entry.path);
      files.push({ ...entry, root });
    }
  }
  return files;
}

export async function buildArtifactGraph(ecosystemId, options = {}) {
  const graph = createEmptyGraph({ ecosystemId, ecosystemName: options.ecosystemName ?? ecosystemId });
  const roots = await scanGraphSources(ecosystemId, options);
  const candidates = new Map();
  const artifacts = [];

  for (const file of roots) {
    const built = await buildNodeForFile(ecosystemId, file.root, file);
    if (!built) continue;
    const { node, source, relativePath } = built;
    artifacts.push({ node, source, relativePath, filePath: file.path, root: file.root });
    candidates.set(relativePath, node);
    candidates.set(path.basename(relativePath), node);
    candidates.set(relativePath.split('/').slice(-2).join('/'), node);
  }

  for (const artifact of artifacts) {
    upsertNode(graph, artifact.node);
  }

  const rootNodeId = `ecosystem:${ecosystemId}`;
  upsertNode(graph, {
    id: rootNodeId,
    type: 'ecosystem',
    name: options.ecosystemName ?? ecosystemId,
    refs: [],
    properties: {
      builtAt: nowIso(),
      rootCount: (options.roots ?? defaultArtifactRoots(ecosystemId)).length,
      artifactCount: artifacts.length
    }
  });

  for (const artifact of artifacts) {
    addEdge(graph, {
      id: makeId('edge', `${rootNodeId}-${artifact.node.id}`),
      type: 'contains',
      source: rootNodeId,
      target: artifact.node.id,
      properties: { artifactType: artifact.node.type }
    });
    if (typeof artifact.source === 'object') {
      addArtifactLinks(graph, artifact.node, artifact.source, candidates);
    }
  }

  graph.generatedAt = nowIso();
  graph.metadata = { ...(graph.metadata ?? {}), schemaVersion: '0.3.0', patchCount: (graph.metadata?.patchCount ?? 0) + artifacts.length };
  return graph;
}

export async function rebuildArtifactGraph(ecosystemId, options = {}) {
  const graph = await buildArtifactGraph(ecosystemId, options);
  await saveGraph(graph);
  return graph;
}

export async function loadArtifactGraph(ecosystemId) {
  return loadGraph(ecosystemId, ecosystemId);
}

export function selectSubgraph(graph, nodeIds = []) {
  const selected = new Set(nodeIds);
  const nodes = (graph.nodes ?? []).filter((node) => selected.has(node.id));
  const edges = (graph.edges ?? []).filter((edge) => selected.has(edge.source) && selected.has(edge.target));
  return {
    ...graph,
    nodes,
    edges,
    metadata: { ...(graph.metadata ?? {}), selectedCount: nodes.length }
  };
}

export function queryConnected(graph, startNodeIds = [], options = {}) {
  const maxDepth = Number.isInteger(options.maxDepth) ? options.maxDepth : 3;
  const direction = options.direction ?? 'both';
  const nodeTypeFilters = new Set(options.typeFilters ?? []);
  const phaseFilters = new Set(options.phaseFilters ?? []);
  const projectFilters = new Set(options.projectFilters ?? []);
  const dateRange = options.dateRange ?? {};
  const nodesById = new Map((graph.nodes ?? []).map((node) => [node.id, node]));
  const outgoing = new Map();
  const incoming = new Map();
  for (const edge of graph.edges ?? []) {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    outgoing.get(edge.source).push(edge);
    if (!incoming.has(edge.target)) incoming.set(edge.target, []);
    incoming.get(edge.target).push(edge);
  }

  const visited = new Set();
  const queue = [...startNodeIds.map((nodeId) => ({ nodeId, depth: 0, path: [nodeId] }))];
  const edges = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current.nodeId)) continue;
    visited.add(current.nodeId);
    const neighbors = [];
    if (direction === 'out' || direction === 'both') neighbors.push(...(outgoing.get(current.nodeId) ?? []));
    if (direction === 'in' || direction === 'both') neighbors.push(...(incoming.get(current.nodeId) ?? []));
    for (const edge of neighbors) {
      edges.push(edge);
      const nextId = edge.source === current.nodeId ? edge.target : edge.source;
      const nextNode = nodesById.get(nextId);
      if (!nextNode) continue;
      if (current.depth + 1 > maxDepth) continue;
      if (nodeTypeFilters.size && !nodeTypeFilters.has(nextNode.type)) continue;
      if (phaseFilters.size && !phaseFilters.has(nextNode.properties?.phase ?? nextNode.phase ?? '')) continue;
      if (projectFilters.size && !projectFilters.has(nextNode.properties?.project ?? nextNode.project ?? '')) continue;
      if (dateRange.from && nextNode.properties?.updatedAt && nextNode.properties.updatedAt < dateRange.from) continue;
      if (dateRange.to && nextNode.properties?.updatedAt && nextNode.properties.updatedAt > dateRange.to) continue;
      if (!visited.has(nextId)) {
        queue.push({ nodeId: nextId, depth: current.depth + 1, path: [...current.path, nextId] });
      }
    }
  }

  const nodes = [...visited].map((nodeId) => nodesById.get(nodeId)).filter(Boolean);
  return { nodes, edges: edges.filter(Boolean), startNodeIds, maxDepth, direction };
}

export function queryLifecycleTrace(graph, featureId) {
  const needle = String(featureId).toLowerCase();
  const matchedNodeIds = (graph.nodes ?? [])
    .filter((node) => {
      const values = [
        node.id,
        node.name,
        node.properties?.artifactId,
        node.properties?.path,
        node.properties?.summary
      ].filter(Boolean).map((value) => String(value).toLowerCase());
      return values.some((value) => value.includes(needle));
    })
    .map((node) => node.id);

  const connected = queryConnected(graph, matchedNodeIds, { direction: 'both', maxDepth: 4 });
  return {
    featureId,
    ...connected
  };
}

export async function saveArtifactGraph(ecosystemId, options = {}) {
  return rebuildArtifactGraph(ecosystemId, options);
}
