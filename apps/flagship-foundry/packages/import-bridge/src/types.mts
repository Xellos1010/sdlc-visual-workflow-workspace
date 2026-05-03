export type ImportStage =
  | 'pre_implementation'
  | 'post_verification'
  | 'knowledge_base_only';

export type FoundryLifecycleStage =
  | 'discover'
  | 'define'
  | 'visualize'
  | 'architect'
  | 'plan'
  | 'implement'
  | 'verify'
  | 'release'
  | 'operate'
  | 'diagnose'
  | 'improve';

export interface SourceArtifactRef {
  path: string;
  purpose: string;
  requiredBeforeExecution: boolean;
}

export interface NormalizedManifest {
  projectName: string;
  phaseId: string;
  importStage: ImportStage;
  targetWorkspace: string;
  artifacts: SourceArtifactRef[];
  importOrder: string[];
  postImportActions: string[];
  sourceFormat: 'schema-v1' | 'legacy';
  sourcePath?: string;
}

export interface FoundryWorkOrder {
  id: string;
  projectId: string;
  phase: string;
  title: string;
  personaIds: string[];
  commands: string[];
  acceptanceCriteria: string[];
  status: 'queued' | 'running' | 'paused' | 'done' | 'stopped';
  _unmapped?: Record<string, unknown>;
}

export interface WorkOrderBatchTransformResult {
  projectName: string;
  phaseId: string;
  dependencyOrder: string[];
  workOrders: FoundryWorkOrder[];
  _unmapped?: Record<string, unknown>;
}

export interface ContinuityArtifactCatalog {
  importedArtifacts: string[];
  manifests: string[];
}
