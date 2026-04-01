import type { NormalizedManifest } from '../types.mjs';

interface LegacyManifestArtifact {
  path: string;
  reason: string;
}

interface LegacyManifest {
  workspace: string;
  stage: string;
  importNow: LegacyManifestArtifact[];
  notes?: string[];
}

interface SchemaManifestArtifact {
  path: string;
  purpose: string;
  requiredBeforeExecution: boolean;
}

interface SchemaManifest {
  projectName: string;
  phaseId: string;
  importStage: NormalizedManifest['importStage'];
  targetWorkspace: string;
  artifacts: SchemaManifestArtifact[];
  importOrder: string[];
  postImportActions: string[];
}

function normalizeStage(input: string): NormalizedManifest['importStage'] {
  if (input === 'post_verification') return 'post_verification';
  if (input === 'knowledge_base_only') return 'knowledge_base_only';
  return 'pre_implementation';
}

export function fromSchemaManifest(input: SchemaManifest, sourcePath?: string): NormalizedManifest {
  return {
    projectName: input.projectName,
    phaseId: input.phaseId,
    importStage: input.importStage,
    targetWorkspace: input.targetWorkspace,
    artifacts: input.artifacts.map((artifact) => ({ ...artifact })),
    importOrder: [...input.importOrder],
    postImportActions: [...input.postImportActions],
    sourceFormat: 'schema-v1',
    ...(sourcePath ? { sourcePath } : {})
  };
}

export function fromLegacyManifest(input: LegacyManifest, sourcePath?: string): NormalizedManifest {
  const importStage = normalizeStage(input.stage);
  const legacyArtifacts = Array.isArray(input.importNow) ? input.importNow : [];
  const artifacts = legacyArtifacts.map((artifact) => ({
    path: artifact.path,
    purpose: artifact.reason,
    requiredBeforeExecution: true
  }));

  return {
    projectName: input.workspace ?? '',
    phaseId: input.workspace
      ? `${input.workspace.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${importStage}`
      : '',
    importStage,
    targetWorkspace: 'flagship-foundry',
    artifacts,
    importOrder: artifacts.map((artifact) => artifact.path),
    postImportActions: input.notes ? [...input.notes] : [],
    sourceFormat: 'legacy',
    ...(sourcePath ? { sourcePath } : {})
  };
}

export function toSchemaManifest(input: NormalizedManifest): SchemaManifest {
  return {
    projectName: input.projectName,
    phaseId: input.phaseId,
    importStage: input.importStage,
    targetWorkspace: input.targetWorkspace,
    artifacts: input.artifacts.map((artifact) => ({ ...artifact })),
    importOrder: [...input.importOrder],
    postImportActions: [...input.postImportActions]
  };
}

export function normalizeManifest(input: Record<string, unknown>, sourcePath?: string): NormalizedManifest {
  if ('projectName' in input && 'artifacts' in input) {
    return fromSchemaManifest(input as unknown as SchemaManifest, sourcePath);
  }
  return fromLegacyManifest(input as unknown as LegacyManifest, sourcePath);
}
