#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const defaultOutputDir = path.join(repoRoot, 'exports', 'ai-context');
const profilesDir = path.join(repoRoot, 'tools', 'ai-context', 'profiles');

const textDenylist = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.gz',
  '.7z', '.tar', '.mp4', '.mp3', '.mov', '.wav', '.doc', '.docx', '.xls',
  '.xlsx', '.ppt', '.pptx', '.db', '.sqlite', '.woff', '.woff2', '.ttf', '.otf'
]);

const builtInIgnoreFragments = [
  '.git/', '.DS_Store',
  'node_modules/', '.next/', '.turbo/', '.cache/', '.parcel-cache/',
  '.nx/cache/', '.vite/', '.output/',
  'dist/', 'build/', 'coverage/', 'reports/',
  'tmp/', 'temp/',
  'iterative-development-storage/',
  'foundry_research_package/',
  // Repo-root `ralph/` only (do not match `Example AI Agent Pipelines/ralph/`)
  '^ralph/'
];

const lockFileNames = new Set([
  'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'bun.lockb', 'bun.lock'
]);

const sensitiveNamePatterns = [
  /(^|\/)\.env(\.|$)/i,
  /(^|\/)\.envrc$/i,
  /secret/i,
  /credential/i,
  /token/i,
  /private[-_.]?key/i,
  /(^|\/)id_rsa(\.pub)?$/i,
  /\.pem$/i,
  /\.p12$/i,
  /\.key$/i
];

function parseArgs(argv) {
  const args = {
    mode: 'all',
    profilePath: null,
    outputDir: defaultOutputDir,
    versioned: false,
    dryRun: false,
    outputFileName: null,
    maxFileBytes: 512 * 1024
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--mode' && argv[i + 1]) {
      args.mode = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--profile' && argv[i + 1]) {
      args.profilePath = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--outputDir' && argv[i + 1]) {
      args.outputDir = path.resolve(repoRoot, argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--outputFileName' && argv[i + 1]) {
      args.outputFileName = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--maxFileBytes' && argv[i + 1]) {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid --maxFileBytes value: ${argv[i + 1]}`);
      }
      args.maxFileBytes = value;
      i += 1;
      continue;
    }
    if (token === '--versioned') {
      args.versioned = true;
      continue;
    }
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
  }

  if (!['all', 'latest', 'profile'].includes(args.mode)) {
    throw new Error(`Unsupported mode "${args.mode}". Use all | latest | profile`);
  }

  return args;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function normalizeSlashes(value) {
  return value.split(path.sep).join('/');
}

function toRelativeOrThrow(absolutePath) {
  const resolved = path.resolve(repoRoot, absolutePath);
  const rel = path.relative(repoRoot, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Path escapes repository root: ${absolutePath}`);
  }
  return normalizeSlashes(rel || '.');
}

function resolveInputPath(inputPath) {
  if (!inputPath) {
    return null;
  }
  if (path.isAbsolute(inputPath)) {
    return path.resolve(inputPath);
  }
  return path.resolve(repoRoot, inputPath);
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function matchesIgnoreFragment(rel, normalized) {
  if (normalized.startsWith('^') && normalized.endsWith('/')) {
    const rootSegment = normalized.slice(1, -1);
    return rel === rootSegment || rel.startsWith(`${rootSegment}/`);
  }
  if (normalized.endsWith('/')) {
    return rel === normalized.slice(0, -1) || rel.includes(normalized);
  }
  return rel === normalized || rel.includes(`/${normalized}`);
}

function shouldSkipByName(relPath, baseIgnore, extraIgnore) {
  const rel = normalizeSlashes(relPath);
  if (lockFileNames.has(path.basename(rel))) {
    return 'lock-file';
  }
  for (const pattern of sensitiveNamePatterns) {
    if (pattern.test(rel)) {
      return 'sensitive-pattern';
    }
  }

  for (const fragment of [...baseIgnore, ...extraIgnore]) {
    const normalized = normalizeSlashes(fragment);
    if (matchesIgnoreFragment(rel, normalized)) {
      return 'ignored-path';
    }
  }

  return null;
}

function shouldSkipByType(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  if (textDenylist.has(ext)) {
    return 'non-text-extension';
  }
  return null;
}

function minifyContent(content) {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, ' ')
    .replace(/\t+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function estTimestampForFolder(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );

  return `${parts.year}-${parts.month}-${parts.day}_${parts.hour}-${parts.minute}-${parts.second}_EST`;
}

async function collectFiles(startPath, options, collector) {
  const { baseIgnore, extraIgnore, maxFileBytes } = options;
  const resolvedStart = resolveInputPath(startPath);

  if (!resolvedStart) {
    return;
  }

  if (!(await pathExists(resolvedStart))) {
    collector.skipped.push({ path: normalizeSlashes(startPath), reason: 'missing-path' });
    return;
  }

  const relStart = toRelativeOrThrow(resolvedStart);
  const ignoredStart = shouldSkipByName(relStart, baseIgnore, extraIgnore);
  if (ignoredStart) {
    collector.skipped.push({ path: relStart, reason: ignoredStart });
    return;
  }

  const stat = await fs.stat(resolvedStart);
  if (stat.isFile()) {
    collector.fileSet.add(relStart);
    return;
  }

  async function walk(currentAbs) {
    const entries = await fs.readdir(currentAbs, { withFileTypes: true });
    for (const entry of entries) {
      const entryAbs = path.join(currentAbs, entry.name);
      const entryRel = toRelativeOrThrow(entryAbs);

      const skipNameReason = shouldSkipByName(entryRel, baseIgnore, extraIgnore);
      if (skipNameReason) {
        collector.skipped.push({ path: entryRel, reason: skipNameReason });
        continue;
      }

      if (entry.isDirectory()) {
        await walk(entryAbs);
        continue;
      }

      if (!entry.isFile()) {
        collector.skipped.push({ path: entryRel, reason: 'unsupported-file-type' });
        continue;
      }

      const skipTypeReason = shouldSkipByType(entryRel);
      if (skipTypeReason) {
        collector.skipped.push({ path: entryRel, reason: skipTypeReason });
        continue;
      }

      const fileStat = await fs.stat(entryAbs);
      if (fileStat.size > maxFileBytes) {
        collector.skipped.push({ path: entryRel, reason: `file-too-large:${fileStat.size}` });
        continue;
      }

      collector.fileSet.add(entryRel);
    }
  }

  await walk(resolvedStart);
}

function filterExcluded(filePaths, excludes) {
  if (!excludes.length) {
    return filePaths;
  }

  const normalizedExcludes = excludes.map((value) => normalizeSlashes(value));
  return filePaths.filter((file) => {
    const rel = normalizeSlashes(file);
    return !normalizedExcludes.some((pattern) => matchesIgnoreFragment(rel, pattern));
  });
}

async function resolveModeConfig(mode, profilePath) {
  const defaultIgnorePath = path.join(profilesDir, 'default-ignore.json');
  const defaultIgnore = await readJson(defaultIgnorePath);

  if (mode === 'all') {
    return {
      mode,
      include: ['.'],
      exclude: defaultIgnore.exclude ?? [],
      extraIgnore: defaultIgnore.extraIgnore ?? []
    };
  }

  if (mode === 'latest') {
    const latestPath = path.join(profilesDir, 'latest.json');
    const latest = await readJson(latestPath);
    return {
      mode,
      include: latest.include ?? [],
      exclude: [...(defaultIgnore.exclude ?? []), ...(latest.exclude ?? [])],
      extraIgnore: [...(defaultIgnore.extraIgnore ?? []), ...(latest.extraIgnore ?? [])],
      outputFileName: latest.outputFileName ?? null,
      versioned: latest.versioned ?? false
    };
  }

  if (mode === 'profile') {
    if (!profilePath) {
      throw new Error('Profile mode requires --profile <path>');
    }
    const profileAbs = resolveInputPath(profilePath);
    const profile = await readJson(profileAbs);
    if (!Array.isArray(profile.include)) {
      throw new Error('Profile must include an "include" array');
    }

    return {
      mode,
      include: profile.include,
      exclude: [...(defaultIgnore.exclude ?? []), ...(profile.exclude ?? [])],
      extraIgnore: [...(defaultIgnore.extraIgnore ?? []), ...(profile.extraIgnore ?? [])],
      outputFileName: profile.outputFileName ?? null,
      versioned: profile.versioned ?? false
    };
  }

  throw new Error(`Unrecognized mode: ${mode}`);
}

async function readAndMinifyFile(relPath, collector) {
  const absPath = path.join(repoRoot, relPath);
  const buffer = await fs.readFile(absPath);

  if (buffer.includes(0x00)) {
    collector.skipped.push({ path: relPath, reason: 'binary-nul-byte' });
    return null;
  }

  const text = buffer.toString('utf8');
  return minifyContent(text);
}

async function ensureOutput(args, effectiveVersioned) {
  const outputDir = args.outputDir;
  await fs.mkdir(outputDir, { recursive: true });

  if (!effectiveVersioned) {
    const latestFile = path.join(outputDir, args.outputFileName ?? 'latest.txt');
    if (await pathExists(latestFile)) {
      await fs.rm(latestFile, { force: true });
    }
    return { outputFile: latestFile, outputFolder: outputDir };
  }

  const folderName = estTimestampForFolder();
  const versionedFolder = path.join(outputDir, folderName);
  await fs.mkdir(versionedFolder, { recursive: true });
  const outputFile = path.join(versionedFolder, args.outputFileName ?? 'export.txt');
  return { outputFile, outputFolder: versionedFolder };
}

function summarizeSkipped(skipped) {
  const counts = new Map();
  for (const row of skipped) {
    const previous = counts.get(row.reason) ?? 0;
    counts.set(row.reason, previous + 1);
  }
  return Object.fromEntries([...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

async function main() {
  const argv = process.argv.slice(2).filter((token) => token !== '--');
  const args = parseArgs(argv);
  const modeConfig = await resolveModeConfig(args.mode, args.profilePath);

  const effectiveVersioned = args.versioned || Boolean(modeConfig.versioned);
  if (!args.outputFileName && modeConfig.outputFileName) {
    args.outputFileName = modeConfig.outputFileName;
  }

  const collector = {
    fileSet: new Set(),
    skipped: []
  };

  const collectOptions = {
    baseIgnore: [...builtInIgnoreFragments, ...(modeConfig.exclude ?? [])],
    extraIgnore: modeConfig.extraIgnore ?? [],
    maxFileBytes: args.maxFileBytes
  };

  for (const includePath of modeConfig.include) {
    await collectFiles(includePath, collectOptions, collector);
  }

  let files = [...collector.fileSet].sort((a, b) => a.localeCompare(b));
  files = filterExcluded(files, modeConfig.exclude ?? []);

  const summary = {
    mode: args.mode,
    versioned: effectiveVersioned,
    includeCount: modeConfig.include.length,
    fileCount: files.length,
    skippedCount: collector.skipped.length,
    skippedByReason: summarizeSkipped(collector.skipped)
  };

  if (args.dryRun) {
    console.log(JSON.stringify({ ...summary, files: files.slice(0, 200) }, null, 2));
    return;
  }

  const { outputFile, outputFolder } = await ensureOutput(args, effectiveVersioned);

  const lines = [];
  lines.push(`# AI_CONTEXT_EXPORT mode=${args.mode} generated_at=${new Date().toISOString()} file_count=${files.length}`);

  for (const relPath of files) {
    const minified = await readAndMinifyFile(relPath, collector);
    if (minified === null) {
      continue;
    }
    lines.push(`===FILE:${relPath}===${minified}`);
  }

  await fs.writeFile(outputFile, `${lines.join('\n')}\n`, 'utf8');

  const manifest = {
    ...summary,
    outputFile: normalizeSlashes(path.relative(repoRoot, outputFile)),
    outputFolder: normalizeSlashes(path.relative(repoRoot, outputFolder)),
    writtenLines: lines.length,
    skipped: collector.skipped.slice(0, 2000)
  };

  const manifestPath = path.join(outputFolder, 'manifest.json');
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(`[ai-context-exporter] ${error.message}`);
  process.exitCode = 1;
});
