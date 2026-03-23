import path from 'node:path';
import { ensureDir, repoRoot } from './io.mjs';
import { projectWithParityPolicy } from './parity-projection.mjs';

const presetMap = {
  'claude-project': path.join(repoRoot, 'environments', 'claude', 'project'),
  'codex-project': path.join(repoRoot, 'environments', 'codex', 'project'),
  'cursor-project': path.join(repoRoot, 'environments', 'cursor', 'project')
};

export async function scaffoldEnvironment({
  preset,
  targetDir,
  dryRun = false,
  approveUserOwnedConflicts = false
}) {
  const sourceDir = presetMap[preset];
  if (!sourceDir) {
    throw new Error(`Unknown preset: ${preset}`);
  }
  const absoluteTargetDir = path.isAbsolute(targetDir) ? targetDir : path.resolve(targetDir);
  await ensureDir(absoluteTargetDir);
  const projection = await projectWithParityPolicy({
    sourceDir,
    targetDir: absoluteTargetDir,
    dryRun,
    approveUserOwnedConflicts
  });
  return {
    preset,
    targetDir: absoluteTargetDir,
    materialized: !dryRun,
    ...projection
  };
}
