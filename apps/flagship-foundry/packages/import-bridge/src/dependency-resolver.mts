export interface DependencyNode {
  id: string;
  dependsOn: string[];
  status: string;
}

export class DependencyResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DependencyResolutionError';
  }
}

export function assertAcyclic(nodes: DependencyNode[]): void {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const map = new Map(nodes.map((node) => [node.id, node]));

  function visit(id: string): void {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      throw new DependencyResolutionError(`Circular dependency detected at ${id}`);
    }
    visiting.add(id);
    const node = map.get(id);
    if (node) {
      for (const dependency of node.dependsOn) visit(dependency);
    }
    visiting.delete(id);
    visited.add(id);
  }

  for (const node of nodes) visit(node.id);
}

export function resolveReadyStatuses<T extends DependencyNode>(nodes: T[]): Array<T & { resolvedStatus: 'queued' | 'blocked' | 'pending' }> {
  assertAcyclic(nodes);
  const completed = new Set(nodes.filter((node) => node.status === 'done').map((node) => node.id));
  return nodes.map((node) => {
    if (node.status !== 'ready') {
      return { ...node, resolvedStatus: 'pending' as const };
    }
    const unmet = node.dependsOn.filter((dependency) => !completed.has(dependency));
    return { ...node, resolvedStatus: unmet.length === 0 ? 'queued' as const : 'blocked' as const };
  });
}
