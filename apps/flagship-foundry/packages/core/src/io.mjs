import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
export const stateRoot = path.join(repoRoot, 'state');

export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
  return dirPath;
}

export async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readText(filePath) {
  return fs.readFile(filePath, 'utf8');
}

export async function readJson(filePath, fallback = null) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (fallback !== null) {
      return fallback;
    }
    throw error;
  }
}

export async function writeText(filePath, text) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, text, 'utf8');
  return filePath;
}

export async function writeJson(filePath, value) {
  await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
  return filePath;
}

export function nowIso() {
  return new Date().toISOString();
}

export function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

export function makeId(prefix, value) {
  return `${prefix}:${slugify(value)}`;
}

export function sha1(value) {
  return crypto.createHash('sha1').update(String(value)).digest('hex');
}

export function tryJson(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function relativeWorkspacePath(originalPath) {
  const normalized = String(originalPath).replace(/\\/g, '/');
  const markers = [
    '/apps/',
    '/libs/',
    '/tools/',
    '/scripts/',
    '/archived/',
    '/documentation-3rd-party/',
    '/docx-generation-export/',
    '/package.json',
    '/pnpm-workspace.yaml',
    '/nx.json',
    '/tsconfig.base.json',
    '/README.md'
  ];

  for (const marker of markers) {
    const index = normalized.indexOf(marker);
    if (index >= 0) {
      return normalized.slice(index + 1);
    }
  }

  return normalized.replace(/^\/+/, '');
}

export async function listFilesRecursive(rootDir, options = {}) {
  const ignoreNames = new Set(options.ignoreNames ?? ['node_modules', '.git', 'dist', 'build', 'coverage', '.nx']);
  const maxFileSizeBytes = options.maxFileSizeBytes ?? 1_200_000;
  const includeMatcher = options.includeMatcher ?? (() => true);
  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (ignoreNames.has(entry.name)) {
        continue;
      }
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (!includeMatcher(fullPath)) {
        continue;
      }
      const stat = await fs.stat(fullPath);
      if (stat.size > maxFileSizeBytes) {
        files.push({ path: fullPath, size: stat.size, skipped: true, reason: 'too-large' });
        continue;
      }
      files.push({ path: fullPath, size: stat.size, skipped: false });
    }
  }

  await walk(rootDir);
  return files;
}

export function chunkArray(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

export async function copyFile(fromPath, toPath) {
  await ensureDir(path.dirname(toPath));
  await fs.copyFile(fromPath, toPath);
  return toPath;
}

export async function copyTextFileIfPresent(fromPath, toPath) {
  if (await exists(fromPath)) {
    await copyFile(fromPath, toPath);
  }
}

export function sanitizeForFileName(value) {
  return String(value).replace(/[^a-zA-Z0-9._-]+/g, '-');
}
