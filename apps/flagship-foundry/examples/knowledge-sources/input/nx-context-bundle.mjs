#!/usr/bin/env node
/**
 * Nx graph-driven context bundle: transitive static workspace deps, repo + project files,
 * single minified .txt for AI review. See tools/nx-context-bundle/README.md.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DEFAULT_DEFAULTS = join(
  ROOT,
  'tools/nx-context-bundle/defaults.json',
);

const GLOB_IGNORE = ['**/node_modules/**', '**/dist/**', '**/coverage/**'];

function usage() {
  console.error(`Usage: node tools/nx-context-bundle.mjs --project <nxName> | --root <path>
  --mode timestamped|one-time (default: timestamped)
  --output-dir <dir> (default: artifacts/context-bundles)
  --output <file.txt> (override output path; parent must exist for one-time cleanup rules)
  --minify safe|aggressive (default: aggressive)
  --config <defaults.json> (override repo file list)
`);
}

function parseArgs(argv) {
  const out = {
    project: undefined,
    root: undefined,
    mode: 'timestamped',
    outputDir: join(ROOT, 'artifacts/context-bundles'),
    output: undefined,
    minify: 'aggressive',
    config: undefined,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--project') out.project = argv[++i];
    else if (a === '--root') out.root = argv[++i];
    else if (a === '--mode') out.mode = argv[++i];
    else if (a === '--output-dir') out.outputDir = argv[++i];
    else if (a === '--output') out.output = argv[++i];
    else if (a === '--minify') out.minify = argv[++i];
    else if (a === '--config') out.config = argv[++i];
    else if (a === '--help' || a === '-h') {
      usage();
      process.exit(0);
    }
  }
  if (!out.project && !out.root) {
    usage();
    process.exit(1);
  }
  if (out.mode !== 'timestamped' && out.mode !== 'one-time') {
    console.error('Invalid --mode: use timestamped or one-time');
    process.exit(1);
  }
  if (out.minify !== 'safe' && out.minify !== 'aggressive') {
    console.error('Invalid --minify: use safe or aggressive');
    process.exit(1);
  }
  return out;
}

function loadNxGraph(workspaceRoot) {
  const buf = execFileSync('pnpm', ['exec', 'nx', 'graph', '--print'], {
    cwd: workspaceRoot,
    maxBuffer: 512 * 1024 * 1024,
    encoding: 'utf-8',
  });
  return JSON.parse(buf);
}

function normalizeRelInput(input, workspaceRoot) {
  const x = input.trim().replaceAll('\\', '/');
  if (isAbsolute(x)) {
    return relative(workspaceRoot, x).replaceAll(sep, '/');
  }
  return x.replace(/^\.\//, '');
}

/**
 * @param {ReturnType<typeof loadNxGraph>['graph']} graph
 * @param {string} rawInput
 */
function resolveProjectName(graph, rawInput, workspaceRoot) {
  const key = rawInput.trim();
  if (graph.nodes[key]) return key;

  const rel = normalizeRelInput(rawInput, workspaceRoot);
  for (const [name, node] of Object.entries(graph.nodes)) {
    const r = node.data?.root?.replaceAll('\\', '/');
    if (r === rel) return name;
  }
  throw new Error(
    `Could not resolve Nx project from "${rawInput}". Try nx show projects.`,
  );
}

/**
 * @param {ReturnType<typeof loadNxGraph>['graph']} graph
 * @param {string} seedName
 */
function collectTransitiveStatic(graph, seedName) {
  const names = new Set([seedName]);
  const q = [seedName];
  while (q.length) {
    const p = q.shift();
    const edges = graph.dependencies[p] ?? [];
    for (const e of edges) {
      if (e.type !== 'static') continue;
      const t = e.target;
      if (!graph.nodes[t]) continue;
      if (!names.has(t)) {
        names.add(t);
        q.push(t);
      }
    }
  }
  return names;
}

function isLockFile(rel) {
  const b = basename(rel);
  if (b.endsWith('.lock')) return true;
  if (
    b === 'pnpm-lock.yaml' ||
    b === 'package-lock.json' ||
    b === 'yarn.lock'
  )
    return true;
  return false;
}

/**
 * @param {string} wsRoot
 * @param {string} relRoot posix-style
 */
async function collectProjectSourceFiles(wsRoot, relRoot) {
  const base = relRoot.replaceAll('\\', '/');
  const patterns = [
    `${base}/package.json`,
    `${base}/project.json`,
    `${base}/README.md`,
    `${base}/tsconfig.json`,
    `${base}/tsconfig.*.json`,
    `${base}/vitest.config.*`,
    `${base}/eslint.config.*`,
    `${base}/src/**/*.{ts,tsx,js,jsx,mjs,cjs}`,
  ];
  /** @type {Set<string>} */
  const out = new Set();
  for (const pattern of patterns) {
    const iter = glob(pattern, {
      cwd: wsRoot,
      nodir: true,
      ignore: GLOB_IGNORE,
    });
    for await (const m of iter) {
      const rel = m.replaceAll('\\', '/');
      if (isLockFile(rel)) continue;
      out.add(rel);
    }
  }
  return out;
}

/**
 * @param {string} wsRoot
 * @param {string[]} repoRelative
 */
async function collectRepoFiles(wsRoot, repoRelative) {
  const out = new Set();
  for (const f of repoRelative) {
    const p = join(wsRoot, f);
    try {
      const st = await stat(p);
      if (st.isFile()) out.add(f.replaceAll('\\', '/'));
    } catch {
      /* skip missing */
    }
  }
  return out;
}

async function loadRepoFileList(configPath) {
  const path = configPath ?? DEFAULT_DEFAULTS;
  const raw = await readFile(path, 'utf-8');
  const j = JSON.parse(raw);
  if (!Array.isArray(j.repoFiles)) {
    throw new Error('defaults.json must contain repoFiles array');
  }
  return j.repoFiles;
}

/**
 * @param {string[]} paths
 */
function buildAsciiTree(paths) {
  const sorted = [...paths].sort();
  /** @type {Record<string, unknown>} */
  const trie = {};
  for (const p of sorted) {
    const parts = p.split('/');
    let cur = trie;
    for (const part of parts) {
      if (!cur[part]) cur[part] = {};
      cur = cur[part];
    }
  }
  /**
   * @param {Record<string, unknown>} node
   * @param {string} prefix
   */
  function walk(node, prefix) {
    const keys = Object.keys(node).sort();
    const lines = [];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const last = i === keys.length - 1;
      const branch = last ? '`-- ' : '|-- ';
      lines.push(`${prefix}${branch}${k}`);
      const child = node[k];
      if (child && typeof child === 'object' && Object.keys(child).length) {
        const ext = last ? '    ' : '|   ';
        lines.push(...walk(/** @type {Record<string, unknown>} */ (child), prefix + ext));
      }
    }
    return lines;
  }
  return walk(trie, '').join('\n');
}

function minifyCodeSafe(text) {
  let out = text.replace(/\/\*[\s\S]*?\*\//g, '');
  out = out.replace(/^\s*\/\/[^\n]*$/gm, '');
  out = out.replace(/\n{3,}/g, '\n\n');
  return out
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .trim();
}

function minifyCodeAggressive(text) {
  let s = text.replace(/\/\*[\s\S]*?\*\//g, '');
  s = s.replace(/^\s*\/\/[^\n]*$/gm, '');
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * @param {string} relPath
 * @param {string} content
 * @param {'safe' | 'aggressive'} mode
 */
function minifyBody(relPath, content, mode) {
  const ext = (relPath.split('.').pop() ?? '').toLowerCase();
  const isJson = ext === 'json' || relPath.endsWith('.json');
  const isCode = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'].includes(ext);

  if (mode === 'aggressive') {
    if (isJson) {
      try {
        return JSON.stringify(JSON.parse(content));
      } catch {
        return content.replace(/\s+/g, ' ').trim();
      }
    }
    if (isCode) return minifyCodeAggressive(content);
    return content.replace(/\s+/g, ' ').trim();
  }

  if (isJson) {
    try {
      return JSON.stringify(JSON.parse(content));
    } catch {
      return minifyCodeSafe(content);
    }
  }
  if (isCode) return minifyCodeSafe(content);
  return content.trim();
}

/**
 * @param {string} projectName
 */
function safeFileSlug(projectName) {
  return projectName.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

async function collectNpmNamesAsync(graph, projectNames) {
  const names = new Set();
  for (const n of projectNames) {
    const root = graph.nodes[n]?.data?.root;
    if (!root) continue;
    const pkgPath = join(ROOT, root, 'package.json');
    if (!existsSync(pkgPath)) continue;
    try {
      const raw = await readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(raw);
      for (const k of Object.keys(pkg.dependencies ?? {})) names.add(k);
      for (const k of Object.keys(pkg.devDependencies ?? {})) names.add(k);
      for (const k of Object.keys(pkg.peerDependencies ?? {})) names.add(k);
    } catch {
      /* ignore */
    }
  }
  const rootPkg = join(ROOT, 'package.json');
  if (existsSync(rootPkg)) {
    try {
      const raw = await readFile(rootPkg, 'utf-8');
      const pkg = JSON.parse(raw);
      for (const k of Object.keys(pkg.dependencies ?? {})) names.add(k);
      for (const k of Object.keys(pkg.devDependencies ?? {})) names.add(k);
    } catch {
      /* ignore */
    }
  }
  return [...names].sort();
}

async function clearOneTimeDir(oneTimeDir) {
  await rm(oneTimeDir, { recursive: true, force: true });
  await mkdir(oneTimeDir, { recursive: true });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const graph = loadNxGraph(ROOT).graph;

  const seedName = opts.project
    ? resolveProjectName(graph, opts.project, ROOT)
    : resolveProjectName(graph, opts.root, ROOT);

  const depNames = collectTransitiveStatic(graph, seedName);
  const sortedDepNames = [...depNames].sort();

  const repoList = await loadRepoFileList(opts.config);
  const allRelPaths = new Set(await collectRepoFiles(ROOT, repoList));

  for (const name of depNames) {
    const pr = graph.nodes[name]?.data?.root;
    if (!pr) continue;
    const files = await collectProjectSourceFiles(ROOT, pr.replaceAll('\\', '/'));
    for (const f of files) allRelPaths.add(f);
  }

  const sortedPaths = [...allRelPaths].sort();
  const tree = buildAsciiTree(sortedPaths);
  const npmNames = await collectNpmNamesAsync(graph, depNames);

  const seedRoot = graph.nodes[seedName]?.data?.root ?? '';
  const sections = [];
  sections.push('=== NX_CONTEXT_BUNDLE ===');
  sections.push(`project: ${seedName}`);
  sections.push(`project_root: ${seedRoot}`);
  sections.push(`transitive_static_workspace_projects: ${sortedDepNames.join(', ')}`);
  sections.push(
    `npm_dependency_names (not_inlined): ${npmNames.join(', ')}`,
  );
  sections.push('');
  sections.push('=== PATH_HIERARCHY ===');
  sections.push(tree);
  sections.push('');

  for (const rel of sortedPaths) {
    const abs = join(ROOT, rel);
    let raw;
    try {
      raw = await readFile(abs, 'utf-8');
    } catch (e) {
      sections.push(`=== FILE ${rel} ===`);
      sections.push(`(unreadable: ${e})`);
      sections.push('');
      continue;
    }
    const body = minifyBody(rel, raw, opts.minify);
    sections.push(`=== FILE ${rel} ===`);
    sections.push(body);
    sections.push('');
  }

  const text = sections.join('\n');

  const outDir = isAbsolute(opts.outputDir)
    ? opts.outputDir
    : join(ROOT, opts.outputDir);
  const oneTimeDir = join(outDir, 'one-time');
  const historyDir = join(outDir, 'history');

  if (opts.mode === 'one-time') {
    await clearOneTimeDir(oneTimeDir);
  }

  let outPath;
  if (opts.output) {
    outPath = isAbsolute(opts.output) ? opts.output : join(ROOT, opts.output);
  } else if (opts.mode === 'one-time') {
    outPath = join(oneTimeDir, `${safeFileSlug(seedName)}.txt`);
  } else {
    await mkdir(historyDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    outPath = join(historyDir, `${ts}-${safeFileSlug(seedName)}.txt`);
  }

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, text, 'utf-8');
  console.log(outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
