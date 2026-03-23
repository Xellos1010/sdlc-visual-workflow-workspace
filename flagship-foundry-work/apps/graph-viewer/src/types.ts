export interface FoundryNodeProperties {
  path?: string;
  projectCount?: number;
  topology?: string;
  importedAt?: string;
  packageManager?: string;
  nodeEngine?: string;
  framework?: string;
  version?: string;
  [key: string]: unknown;
}

export interface FoundryNode {
  id: string;
  type: string;
  name: string;
  label?: string;
  tags: string[];
  refs: string[];
  properties: FoundryNodeProperties;
  metadata?: Record<string, unknown>;
}

export interface FoundryEdge {
  id?: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface EcosystemGraph {
  graphId: string;
  ecosystemId: string;
  ecosystemName: string;
  generatedAt: string;
  nodes: FoundryNode[];
  edges: FoundryEdge[];
}

export interface EcosystemManifest {
  id: string;
  name: string;
  [key: string]: unknown;
}

export type NodeType =
  | 'ecosystem'
  | 'system'
  | 'project'
  | 'framework'
  | 'platform'
  | 'rule-pack'
  | 'environment'
  | 'diagram'
  | 'repo'
  | string;
