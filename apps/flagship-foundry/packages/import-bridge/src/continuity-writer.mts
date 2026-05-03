import path from 'node:path';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import type { ImportStage, NormalizedManifest } from './types.mts';

export interface ContinuityWriteOptions {
  projectSlug: string;
  importedArtifacts: string[];
  manifest: NormalizedManifest;
  workspaceRoot: string;
  force?: boolean;
}

function lifecycleStageForImportStage(importStage: ImportStage): 'plan' | 'release' | 'define' {
  if (importStage === 'post_verification') return 'release';
  if (importStage === 'knowledge_base_only') return 'define';
  return 'plan';
}

function sdlcPhaseForImportStage(importStage: ImportStage): 'plan' | 'release' {
  if (importStage === 'post_verification') return 'release';
  return 'plan';
}

export async function writeContinuityState(options: ContinuityWriteOptions): Promise<string> {
  const projectDir = path.join(options.workspaceRoot, '.foundry/projects', options.projectSlug);
  const continuityPath = path.join(projectDir, 'current-task.json');
  if (!options.force) {
    try {
      await access(continuityPath);
      throw new Error(`Continuity state already exists for ${options.projectSlug}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  await mkdir(projectDir, { recursive: true });
  const now = new Date().toISOString();
  const lifecycleStage = lifecycleStageForImportStage(options.manifest.importStage);
  const continuityState = {
    authority: {
      contractAuthority: 'apps/flagship-foundry/schemas/continuity-state.schema.json',
      runtimeInstanceAuthority: `.foundry/projects/${options.projectSlug}/current-task.json`,
      derivedMirrors: []
    },
    project: {
      name: options.projectSlug,
      path: `.foundry/projects/${options.projectSlug}`,
      worktree: `.foundry/projects/${options.projectSlug}`,
      baseBranch: 'main',
      technicalBaseBranch: 'main',
      ruleReferences: []
    },
    objective: `Imported from ${options.manifest.projectName}`,
    sdlcPhase: sdlcPhaseForImportStage(options.manifest.importStage),
    lifecycleStage,
    currentPhase: {
      id: options.manifest.phaseId,
      title: lifecycleStage,
      status: 'pending',
      branch: `import/${options.projectSlug}`,
      notes: [`Imported ${options.importedArtifacts.length} artifacts from ${options.manifest.projectName}`],
      updatedAt: now
    },
    activeBranch: `import/${options.projectSlug}`,
    nextCommit: {
      branch: `import/${options.projectSlug}`,
      message: `feat(import-bridge): import ${options.projectSlug}`,
      scope: options.importedArtifacts
    },
    nextCommandSet: ['foundry-bridge dry-run', 'foundry-bridge validate'],
    blockedBy: [],
    artifacts: {
      importedArtifacts: options.importedArtifacts,
      manifests: [options.manifest.sourcePath ?? '']
    },
    doneCriteria: options.manifest.postImportActions
  };

  await writeFile(continuityPath, JSON.stringify(continuityState, null, 2));
  return continuityPath;
}

export async function readContinuityState(continuityPath: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(continuityPath, 'utf8')) as Record<string, unknown>;
}
