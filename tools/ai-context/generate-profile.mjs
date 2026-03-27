#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const defaultOutput = path.join(repoRoot, 'tools', 'ai-context', 'profiles', 'generated-profile.json');

function parseArgs(argv) {
  const args = {
    out: defaultOutput,
    include: [],
    exclude: [],
    extraIgnore: [],
    mode: 'include-only',
    versioned: false,
    outputFileName: 'profile-export.txt',
    prompt: ''
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--out' && argv[i + 1]) {
      args.out = path.resolve(repoRoot, argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--include' && argv[i + 1]) {
      args.include.push(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--exclude' && argv[i + 1]) {
      args.exclude.push(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--extraIgnore' && argv[i + 1]) {
      args.extraIgnore.push(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--mode' && argv[i + 1]) {
      args.mode = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--versioned') {
      args.versioned = true;
      continue;
    }
    if (token === '--outputFileName' && argv[i + 1]) {
      args.outputFileName = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--prompt' && argv[i + 1]) {
      args.prompt = argv[i + 1];
      i += 1;
      continue;
    }
  }

  if (!['all', 'include-only'].includes(args.mode)) {
    throw new Error('Invalid --mode. Use all or include-only');
  }
  return args;
}

function normalizeRel(inputPath) {
  if (path.isAbsolute(inputPath)) {
    const rel = path.relative(repoRoot, inputPath);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      return null;
    }
    return rel.split(path.sep).join('/');
  }
  return inputPath.split(path.sep).join('/');
}

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const include = args.include.length ? args.include : ['.'];

  const unresolved = [];
  const normalizedInclude = [];
  for (const item of include) {
    const normalized = normalizeRel(item);
    if (!normalized) {
      unresolved.push(item);
      continue;
    }
    const abs = path.resolve(repoRoot, normalized);
    if (!(await pathExists(abs))) {
      unresolved.push(item);
    }
    normalizedInclude.push(normalized);
  }

  const normalizedExclude = args.exclude
    .map((item) => normalizeRel(item))
    .filter(Boolean);
  const normalizedExtraIgnore = [...args.extraIgnore];

  const profile = {
    include: normalizedInclude,
    exclude: normalizedExclude,
    extraIgnore: normalizedExtraIgnore,
    mode: args.mode,
    versioned: args.versioned,
    outputFileName: args.outputFileName,
    metadata: {
      generatedAt: new Date().toISOString(),
      prompt: args.prompt,
      unresolvedPaths: unresolved
    }
  };

  await fs.mkdir(path.dirname(args.out), { recursive: true });
  await fs.writeFile(args.out, `${JSON.stringify(profile, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    output: path.relative(repoRoot, args.out).split(path.sep).join('/'),
    includeCount: normalizedInclude.length,
    unresolvedCount: unresolved.length,
    unresolved
  }, null, 2));
}

main().catch((error) => {
  console.error(`[generate-profile] ${error.message}`);
  process.exitCode = 1;
});
