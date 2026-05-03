import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ConflictRecord } from './conflict-detector.mjs';

export type MergeDecision = 'accept-incoming' | 'keep-existing' | 'manual-merge';

export interface MergeResolution {
  targetPath: string;
  incomingPath: string;
  decision: MergeDecision;
  editorCommand?: string;
  previewPath?: string;
}

function defaultEditor(): string {
  return process.env.EDITOR || 'vi';
}

export function parseDecisionArgs(args: string[]): Map<string, MergeDecision> {
  const decisions = new Map<string, MergeDecision>();
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== '--decision') continue;
    const raw = args[index + 1];
    if (!raw) continue;
    const separatorIndex = raw.indexOf('=');
    if (separatorIndex < 0) continue;
    const targetPath = raw.slice(0, separatorIndex);
    const decision = raw.slice(separatorIndex + 1) as MergeDecision;
    decisions.set(targetPath, decision);
  }
  return decisions;
}

export function planMergeResolutions(
  conflicts: ConflictRecord[],
  explicitDecisions: Map<string, MergeDecision>,
  force = false
): MergeResolution[] {
  return conflicts.map((conflict) => ({
    targetPath: conflict.targetPath,
    incomingPath: conflict.incomingPath,
    decision: explicitDecisions.get(conflict.targetPath) ?? (force ? 'accept-incoming' : 'manual-merge')
  }));
}

export async function applyMergeResolutions(resolutions: MergeResolution[]): Promise<MergeResolution[]> {
  const applied: MergeResolution[] = [];

  for (const resolution of resolutions) {
    if (resolution.decision === 'keep-existing') {
      const existingContent = await readFile(resolution.targetPath, 'utf8');
      await writeFile(resolution.incomingPath, existingContent);
      applied.push(resolution);
      continue;
    }

    if (resolution.decision === 'manual-merge') {
      const existingContent = await readFile(resolution.targetPath, 'utf8');
      const incomingContent = await readFile(resolution.incomingPath, 'utf8');
      const previewPath = `${resolution.incomingPath}.manual-merge`;
      const mergedContent = [
        '<<<<<<< existing',
        existingContent.trimEnd(),
        '=======',
        incomingContent.trimEnd(),
        '>>>>>>> incoming',
        ''
      ].join('\n');
      await mkdir(path.dirname(previewPath), { recursive: true });
      await writeFile(previewPath, mergedContent);
      applied.push({
        ...resolution,
        previewPath,
        editorCommand: `${defaultEditor()} ${previewPath}`
      });
      continue;
    }

    applied.push(resolution);
  }

  return applied;
}
