import path from 'node:path';
import { analyzeBlastRadius } from './blast-radius.mjs';
import { ensureDir, sanitizeForFileName, stateRoot, writeJson, writeText } from './io.mjs';

function mermaidSafe(value) {
  return String(value).replace(/"/g, '\\"');
}

function nodeId(value) {
  return `node_${String(value).replace(/[^a-zA-Z0-9]/g, '_')}`;
}

export function buildFocusView(graph, query) {
  const blastRadius = analyzeBlastRadius(graph, query);
  const impactedNodes = blastRadius.impactedNodes.slice(0, 12);
  const seedNodeIds = blastRadius.seedNodeIds;
  const impactedIdSet = new Set(impactedNodes.map((entry) => entry.id));
  const lines = ['flowchart LR'];

  for (const nodeIdValue of new Set([...seedNodeIds, ...impactedNodes.map((entry) => entry.id)])) {
    const node = graph.nodes.find((entry) => entry.id === nodeIdValue);
    if (!node) continue;
    const label = seedNodeIds.includes(node.id)
      ? `${node.name}\nseed`
      : `${node.name}\n${node.type}`;
    lines.push(`  ${nodeId(node.id)}["${mermaidSafe(label)}"]`);
  }

  for (const edge of graph.edges) {
    if (!impactedIdSet.has(edge.source) && !seedNodeIds.includes(edge.source)) continue;
    if (!impactedIdSet.has(edge.target) && !seedNodeIds.includes(edge.target)) continue;
    lines.push(`  ${nodeId(edge.source)} -->|${mermaidSafe(edge.type)}| ${nodeId(edge.target)}`);
  }

  return {
    ecosystemId: graph.ecosystemId,
    query,
    seedNodeIds,
    impactedNodes,
    mermaid: `${lines.join('\n')}\n`
  };
}

export async function writeFocusView(graph, query) {
  const view = buildFocusView(graph, query);
  const focusDir = path.join(stateRoot, 'ecosystems', graph.ecosystemId, 'focus');
  const slug = sanitizeForFileName(query.toLowerCase()).slice(0, 80) || 'focus';
  const filePath = path.join(focusDir, `${slug}.mmd`);
  await ensureDir(focusDir);
  await writeText(filePath, view.mermaid);
  await writeJson(path.join(focusDir, `${slug}.json`), view);
  return {
    ...view,
    filePath
  };
}
