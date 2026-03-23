import fs from 'node:fs/promises';
import path from 'node:path';
import { ensureDir, repoRoot } from './io.mjs';

const presetMap = {
  'claude-project': path.join(repoRoot, 'environments', 'claude', 'project'),
  'codex-project': path.join(repoRoot, 'environments', 'codex', 'project'),
  'cursor-project': path.join(repoRoot, 'environments', 'cursor', 'project')
};

async function copyRecursive(fromDir, toDir, planned = []) {
  const entries = await fs.readdir(fromDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(fromDir, entry.name);
    const targetPath = path.join(toDir, entry.name);
    if (entry.isDirectory()) {
      planned.push({ type: 'directory', path: targetPath });
      await ensureDir(targetPath);
      await copyRecursive(sourcePath, targetPath, planned);
      continue;
    }
    planned.push({ type: 'file', path: targetPath });
    await ensureDir(path.dirname(targetPath));
    await fs.copyFile(sourcePath, targetPath);
  }
  return planned;
}

export async function scaffoldEnvironment({ preset, targetDir, dryRun = false }) {
  const sourceDir = presetMap[preset];
  if (!sourceDir) {
    throw new Error(`Unknown preset: ${preset}`);
  }
  const absoluteTargetDir = path.isAbsolute(targetDir) ? targetDir : path.resolve(targetDir);
  const planned = [];

  if (dryRun) {
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    const stack = entries.map((entry) => ({ entry, from: sourceDir, to: absoluteTargetDir }));
    while (stack.length > 0) {
      const current = stack.pop();
      const currentFrom = path.join(current.from, current.entry.name);
      const currentTo = path.join(current.to, current.entry.name);
      if (current.entry.isDirectory()) {
        planned.push({ type: 'directory', path: currentTo });
        const nested = await fs.readdir(currentFrom, { withFileTypes: true });
        for (const entry of nested) {
          stack.push({ entry, from: currentFrom, to: currentTo });
        }
      } else {
        planned.push({ type: 'file', path: currentTo });
      }
    }
    return { preset, targetDir: absoluteTargetDir, planned, materialized: false };
  }

  await ensureDir(absoluteTargetDir);
  await copyRecursive(sourceDir, absoluteTargetDir, planned);
  return { preset, targetDir: absoluteTargetDir, planned, materialized: true };
}
