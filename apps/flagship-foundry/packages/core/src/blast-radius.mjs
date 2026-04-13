import { indexGraph } from './graph-store.mjs';

function scoreReason(weight, reason, via = null) {
  return { weight, reason, via };
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function findSeedNodes(graph, query) {
  const lowered = String(query ?? '').toLowerCase().trim();
  const tokens = lowered.split(/[^a-z0-9]+/).filter((token) => token.length >= 3);
  return graph.nodes.filter((node) => {
    const haystacks = [node.id, node.name, node.properties?.path, ...(node.tags ?? [])]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    if (lowered && haystacks.some((value) => value.includes(lowered))) {
      return true;
    }
    const matchedTokens = tokens.filter((token) => haystacks.some((value) => value.includes(token)));
    return matchedTokens.length >= 1;
  });
}

function scoreNodeForQuery(node, lowered, tokens) {
  const haystacks = [
    node.id,
    node.name,
    node.properties?.path,
    node.properties?.summary,
    node.properties?.projectType,
    ...(node.tags ?? []),
    ...(node.properties?.capabilityIds ?? []),
    ...(node.properties?.platformIds ?? []),
    ...(node.properties?.frameworkIds ?? []),
    ...(node.properties?.targets ?? []),
    ...(node.properties?.verificationCommands ?? [])
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  let score = 0;
  if (lowered && haystacks.some((value) => value.includes(lowered))) score += 8;
  const matchedTokens = tokens.filter((token) => haystacks.some((value) => value.includes(token)));
  score += matchedTokens.length * 2;

  const surfaceTokens = ['service', 'worker', 'sidepanel', 'popup', 'content', 'storage', 'messaging', 'automation', 'chrome', 'extension', 'nx'];
  if (surfaceTokens.some((token) => lowered.includes(token))) {
    if ((node.properties?.platformIds ?? []).includes('platform:chrome-extension-mv3')) score += 4;
    if ((node.properties?.capabilityIds ?? []).some((capability) => /service-worker|sidepanel|storage|messaging|content|popup/.test(capability))) score += 3;
    if ((node.properties?.path ?? '').includes('chrome-extensions')) score += 2;
  }

  return { score, matchedTokens };
}

export function analyzeBlastRadius(graph, queryOrNodeIds) {
  const index = indexGraph(graph);
  const seedNodes = Array.isArray(queryOrNodeIds)
    ? queryOrNodeIds.map((id) => index.nodesById.get(id)).filter(Boolean)
    : findSeedNodes(graph, queryOrNodeIds);
  const lowered = String(queryOrNodeIds ?? '').toLowerCase().trim();
  const tokens = lowered.split(/[^a-z0-9]+/).filter((token) => token.length >= 3);

  const scored = new Map();

  function push(node, reason) {
    if (!node) return;
    const current = scored.get(node.id) ?? {
      id: node.id,
      name: node.name,
      type: node.type,
      path: node.properties?.path,
      score: 0,
      reasons: []
    };
    current.score += reason.weight;
    current.reasons.push(reason);
    scored.set(node.id, current);
  }

  for (const seed of seedNodes) {
    push(seed, scoreReason(10, 'direct match'));
    for (const edge of index.outgoing.get(seed.id) ?? []) {
      push(index.nodesById.get(edge.target), scoreReason(6, `outgoing dependency via ${edge.type}`, edge.id));
    }
    for (const edge of index.incoming.get(seed.id) ?? []) {
      push(index.nodesById.get(edge.source), scoreReason(5, `incoming dependency via ${edge.type}`, edge.id));
    }
  }

  if (seedNodes.length === 0) {
    const fallback = graph.nodes
      .map((node) => ({ node, ...scoreNodeForQuery(node, lowered, tokens) }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 3);
    for (const entry of fallback) {
      push(entry.node, scoreReason(Math.max(1, entry.score), 'fallback query match'));
      for (const edge of index.outgoing.get(entry.node.id) ?? []) {
        push(index.nodesById.get(edge.target), scoreReason(4, `fallback outgoing dependency via ${edge.type}`, edge.id));
      }
    }
  }

  if (scored.size === 0) {
    const firstProject = graph.nodes.find((node) => node.type === 'project');
    if (firstProject) {
      push(firstProject, scoreReason(1, 'workspace project fallback'));
    }
  }

  const projects = graph.nodes.filter((node) => node.type === 'project');
  for (const seed of seedNodes) {
    const seedTags = new Set(seed.tags ?? []);
    const seedPlatforms = new Set(seed.properties?.platformIds ?? []);
    const seedFrameworks = new Set(seed.properties?.frameworkIds ?? []);

    for (const project of projects) {
      if (project.id === seed.id) continue;
      const sharedTags = (project.tags ?? []).filter((tag) => seedTags.has(tag));
      if (sharedTags.length > 1) {
        push(project, scoreReason(4, `shared tags: ${sharedTags.join(', ')}`));
      }
      const projectPlatforms = project.properties?.platformIds ?? [];
      if (projectPlatforms.some((platformId) => seedPlatforms.has(platformId))) {
        push(project, scoreReason(3, 'shared platform family'));
      }
      const projectFrameworks = project.properties?.frameworkIds ?? [];
      if (projectFrameworks.some((frameworkId) => seedFrameworks.has(frameworkId))) {
        push(project, scoreReason(2, 'shared framework family'));
      }
    }

    const seedPath = String(seed.properties?.path ?? '');
    const mv3SurfaceCoupling = ['service_worker', 'sidepanel', 'popup', 'content', 'watch', 'inspector', 'storage', 'messaging'];
    if (mv3SurfaceCoupling.some((token) => seedPath.includes(token))) {
      for (const project of projects) {
        if (!project.properties?.path) continue;
        if (project.properties?.systemId === seed.properties?.systemId) {
          push(project, scoreReason(3, 'same system as touched MV3 surface'));
        }
      }
    }
  }

  const impacted = uniqueById([...scored.values()]).sort((left, right) => right.score - left.score);
  return {
    seedNodeIds: seedNodes.map((node) => node.id),
    impactedNodes: impacted,
    summary: {
      totalImpacted: impacted.length,
      highestScore: impacted[0]?.score ?? 0,
      directMatches: seedNodes.length
    }
  };
}
