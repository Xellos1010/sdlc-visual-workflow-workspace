import path from 'node:path';
import { cp, mkdir, rm, stat } from 'node:fs/promises';

export interface StageFile {
  sourcePath: string;
  relativeTargetPath: string;
}

export interface StagePlan {
  slug: string;
  stagingRoot: string;
  stageDir: string;
  files: StageFile[];
}

export async function createStagePlan(stagingRoot: string, slug: string, files: StageFile[]): Promise<StagePlan> {
  const stageDir = path.join(stagingRoot, slug);
  await rm(stageDir, { recursive: true, force: true });
  await mkdir(stageDir, { recursive: true });
  return { slug, stagingRoot, stageDir, files };
}

export async function stageArtifacts(plan: StagePlan): Promise<string[]> {
  const stagedPaths: string[] = [];
  for (const file of plan.files) {
    const destination = path.join(plan.stageDir, file.relativeTargetPath);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(file.sourcePath, destination, { force: true });
    stagedPaths.push(destination);
  }
  return stagedPaths;
}

export async function commitStage(plan: StagePlan, workspaceRoot: string, force = false): Promise<string[]> {
  const committed: string[] = [];
  for (const file of plan.files) {
    const source = path.join(plan.stageDir, file.relativeTargetPath);
    const destination = path.join(workspaceRoot, file.relativeTargetPath);
    await mkdir(path.dirname(destination), { recursive: true });
    if (!force) {
      try {
        await stat(destination);
        throw new Error(`Refusing to overwrite existing file without force: ${file.relativeTargetPath}`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }
    }
    await cp(source, destination, { force: true });
    committed.push(destination);
  }
  return committed;
}

export async function rollbackStage(plan: StagePlan): Promise<void> {
  await rm(plan.stageDir, { recursive: true, force: true });
}
