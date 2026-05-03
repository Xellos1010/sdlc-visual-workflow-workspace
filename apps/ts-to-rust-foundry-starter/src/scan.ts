import { promises as fs } from 'node:fs';
import path from 'node:path';

const SUPPORTED_EXTENSIONS = new Set(['.ts', '.tsx']);
const IGNORED_SUFFIXES = ['.d.ts', '.spec.ts', '.test.ts'];

export async function statSafe(targetPath: string) {
  try {
    return await fs.stat(targetPath);
  } catch {
    return undefined;
  }
}

export async function findInputFiles(inputPath: string): Promise<string[]> {
  const stats = await statSafe(inputPath);
  if (!stats) {
    throw new Error(`Input path not found: ${inputPath}`);
  }
  if (stats.isFile()) {
    return isSupportedFile(inputPath) ? [path.resolve(inputPath)] : [];
  }
  const discovered: string[] = [];
  await walk(path.resolve(inputPath), discovered);
  discovered.sort();
  return discovered;
}

async function walk(currentPath: string, discovered: string[]): Promise<void> {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
      continue;
    }
    const fullPath = path.join(currentPath, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, discovered);
      continue;
    }
    if (entry.isFile() && isSupportedFile(fullPath)) {
      discovered.push(fullPath);
    }
  }
}

function isSupportedFile(filePath: string): boolean {
  if (IGNORED_SUFFIXES.some((suffix) => filePath.endsWith(suffix))) {
    return false;
  }
  return SUPPORTED_EXTENSIONS.has(path.extname(filePath));
}

export function relativeArtifactDir(inputRoot: string, filePath: string): string {
  const resolvedRoot = path.resolve(inputRoot);
  const resolvedFile = path.resolve(filePath);
  const rootStatsName = path.basename(resolvedRoot);
  const relative = resolvedFile.startsWith(resolvedRoot)
    ? path.relative(resolvedRoot, resolvedFile)
    : path.basename(resolvedFile);
  const noExt = relative.replace(/\.[^.]+$/, '');
  const normalized = noExt.split(path.sep).join('/');
  return normalized || rootStatsName.replace(/\.[^.]+$/, '');
}
