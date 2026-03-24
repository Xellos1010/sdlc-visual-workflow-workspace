import path from 'node:path';
import { addEdge, createEmptyGraph, saveGraph, upsertNode } from './graph-store.mjs';
import {
  ensureDir,
  exists,
  listFilesRecursive,
  makeId,
  nowIso,
  readText,
  relativeWorkspacePath,
  repoRoot,
  sha1,
  slugify,
  stateRoot,
  tryJson,
  writeJson,
  writeText
} from './io.mjs';
import { buildVisualizationSpecs, writeVisualizationSet } from './visualizations.mjs';
import { generateSmeProfiles, writeSmeProfiles } from './sme-profiles.mjs';

const INTERESTING_FILE_PATTERN = /(^|\/)(package\.json|project\.json|nx\.json|pnpm-workspace\.yaml|tsconfig(?:\.[^/]+)?\.json|manifest\.json|README\.md|HANDOFF_PLAYBOOK\.md|phase-ledger\.md|current-task\.json)$/i;
const TEXT_FILE_PATTERN = /\.(?:ts|tsx|js|jsx|json|md|mdc|mmd|yaml|yml|txt)$/i;

function dedupeSections(sections) {
  const byPath = new Map();
  for (const section of sections) {
    const key = section.path;
    const current = byPath.get(key);
    if (!current || (section.content?.length ?? 0) > (current.content?.length ?? 0)) {
      byPath.set(key, section);
    }
  }
  return [...byPath.values()].sort((left, right) => left.path.localeCompare(right.path));
}

function splitBundleSections(text, sourceLabel) {
  const headerPattern = /^==== (?:RULE FILE|FILE): (.+?) ====$/gm;
  const matches = [...text.matchAll(headerPattern)];
  const sections = [];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const rawPath = match[1].trim();
    const cleanedPath = rawPath.replace(/\s+\(skipped[^)]*\)$/i, '');
    const start = match.index + match[0].length + 1;
    const end = index + 1 < matches.length ? matches[index + 1].index : text.length;
    const content = text.slice(start, end).trim();
    sections.push({
      source: sourceLabel,
      path: relativeWorkspacePath(cleanedPath),
      rawPath: cleanedPath,
      skipped: /\(skipped/i.test(rawPath),
      content
    });
  }

  return sections;
}

async function loadSectionsFromExportBundle(source) {
  const sections = [];
  if (source.codeExportPath && await exists(source.codeExportPath)) {
    sections.push(...splitBundleSections(await readText(source.codeExportPath), 'code-export'));
  }
  if (source.configExportPath && await exists(source.configExportPath)) {
    sections.push(...splitBundleSections(await readText(source.configExportPath), 'config-export'));
  }
  if (source.rulesExportPath && await exists(source.rulesExportPath)) {
    sections.push(...splitBundleSections(await readText(source.rulesExportPath), 'rules-export'));
  }
  if (source.chromeDocsPath && await exists(source.chromeDocsPath)) {
    sections.push({
      source: 'chrome-api-docs',
      path: 'documentation/chrome-ext-api-documentation.md',
      rawPath: source.chromeDocsPath,
      skipped: false,
      content: await readText(source.chromeDocsPath)
    });
  }
  return dedupeSections(sections);
}

function shouldReadFilesystemPath(relativePath) {
  if (relativePath.startsWith('.cursor/rules/')) return true;
  if (relativePath.startsWith('.claude/')) return true;
  if (relativePath.startsWith('.foundry/')) return true;
  if (relativePath.startsWith('.codex/')) return true;
  if (relativePath === '.mcp.json') return true;
  if (relativePath === 'CLAUDE.md' || relativePath === 'AGENTS.md') return true;
  if (relativePath.includes('/docs/diagrams/') && relativePath.endsWith('.mmd')) return true;
  if (INTERESTING_FILE_PATTERN.test(relativePath)) return true;
  if (relativePath.endsWith('.mdc')) return true;
  return false;
}

async function loadSectionsFromFilesystem(source) {
  const workspaceRoot = source.workspaceRoot;
  const files = await listFilesRecursive(workspaceRoot, {
    includeMatcher: (fullPath) => {
      const relativePath = path.relative(workspaceRoot, fullPath).replace(/\\/g, '/');
      return shouldReadFilesystemPath(relativePath) || (relativePath.startsWith('docs/') && TEXT_FILE_PATTERN.test(relativePath));
    }
  });

  const sections = [];
  for (const file of files) {
    const relativePath = path.relative(workspaceRoot, file.path).replace(/\\/g, '/');
    if (file.skipped) {
      sections.push({ source: 'filesystem', path: relativePath, rawPath: file.path, skipped: true, content: '' });
      continue;
    }
    sections.push({
      source: 'filesystem',
      path: relativePath,
      rawPath: file.path,
      skipped: false,
      content: await readText(file.path)
    });
  }
  return dedupeSections(sections);
}

function parseYamlList(text) {
  return [...text.matchAll(/^\s*-\s*['"]?([^'"\n]+)['"]?\s*$/gm)].map((match) => match[1]);
}

function parseRuleFile(section) {
  const descriptionMatch = section.content.match(/^description:\s*(.+)$/m);
  const alwaysApplyMatch = section.content.match(/^alwaysApply:\s*(.+)$/m);
  const folder = section.path.split('/').slice(0, 3).join('/');
  return {
    id: makeId('rule', section.path),
    path: section.path,
    title: path.basename(section.path),
    description: descriptionMatch ? descriptionMatch[1].replace(/^['"]|['"]$/g, '') : 'No description provided',
    alwaysApply: alwaysApplyMatch ? alwaysApplyMatch[1].trim() === 'true' : false,
    folder,
    summary: section.content.split('\n').slice(0, 18).join('\n')
  };
}

function projectNameFromPath(relativePath) {
  const segments = relativePath.split('/');
  if (segments[0] === 'apps' && segments.length >= 3) return segments[2];
  if (segments[0] === 'libs' && segments.length >= 3) return segments[2] === 'Google-Chrome-Extension-Library' && segments.length >= 5
    ? `${segments[2]}/${segments[3]}/${segments[4]}`
    : segments[2];
  if (segments[0] === 'tools' && segments.length >= 2) return segments[1];
  return segments[segments.length - 2] ?? segments[segments.length - 1];
}

function titleFromPath(relativePath) {
  return path.basename(relativePath).replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
}

function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

function extractRootConfig(sections, targetPath) {
  return tryJson(sections.find((section) => section.path === targetPath)?.content ?? '', null);
}

function extractPathAliases(tsconfigBase) {
  const aliases = [];
  const paths = tsconfigBase?.compilerOptions?.paths ?? {};
  for (const [alias, destinations] of Object.entries(paths)) {
    for (const destination of destinations) {
      aliases.push({ alias, destination });
    }
  }
  return aliases;
}

function detectTopology(sections, rootPackage) {
  const reasons = [];
  let kind = 'single-repo';
  let confidence = 0.6;

  if (sections.some((section) => section.path === 'nx.json')) {
    kind = 'nx-monorepo';
    confidence = 0.99;
    reasons.push('nx.json present');
  }
  if (sections.some((section) => section.path === 'pnpm-workspace.yaml')) {
    reasons.push('pnpm-workspace.yaml present');
    confidence = Math.max(confidence, 0.9);
  }
  if (rootPackage?.workspaces || sections.some((section) => section.path.endsWith('/project.json'))) {
    reasons.push('multiple package/project manifests detected');
    confidence = Math.max(confidence, 0.85);
  }
  if (kind !== 'nx-monorepo') {
    const packageCount = sections.filter((section) => section.path.endsWith('/package.json') || section.path === 'package.json').length;
    if (packageCount > 3) {
      kind = 'polyrepo-or-loose-monorepo';
      reasons.push('multiple package.json files without Nx control plane');
      confidence = Math.max(confidence, 0.8);
    }
  }

  return { kind, confidence, reasons };
}

function extractProjectManifests(sections) {
  const projectSections = sections.filter((section) => section.path.endsWith('/project.json'));
  const projects = [];
  for (const section of projectSections) {
    const json = tryJson(section.content, null);
    if (!json) continue;
    const root = path.dirname(section.path).replace(/\\/g, '/');
    const category = root.split('/')[0] ?? 'project';
    projects.push({
      id: makeId('project', json.name ?? root),
      name: json.name ?? projectNameFromPath(root),
      projectType: json.projectType ?? 'unknown',
      root,
      category,
      sourceRoot: json.sourceRoot ?? null,
      tags: json.tags ?? [],
      targets: Object.keys(json.targets ?? {}),
      targetCommands: Object.fromEntries(
        Object.entries(json.targets ?? {}).map(([name, value]) => [name, value?.options?.command ?? null])
      )
    });
  }
  return projects;
}

function collectSectionsForPrefix(sections, prefix) {
  return sections.filter((section) => section.path === prefix || section.path.startsWith(`${prefix}/`));
}

function countChromeApis(sections) {
  const counts = new Map();
  for (const section of sections) {
    for (const match of section.content.matchAll(/chrome\.([A-Za-z0-9_]+)/g)) {
      const api = match[1];
      counts.set(api, (counts.get(api) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1]).map(([api, count]) => ({ api, count }));
}

function inferProjectAttributes(project, allSections, rootPackage, pathAliases) {
  const sections = collectSectionsForPrefix(allSections, project.root);
  const filePaths = sections.map((section) => section.path);
  const dependencyNames = new Set([
    ...Object.keys(rootPackage?.dependencies ?? {}),
    ...Object.keys(rootPackage?.devDependencies ?? {})
  ]);

  const frameworkIds = new Set(['framework:typescript']);
  const platformIds = new Set();
  const capabilities = new Set();

  if (project.targets.length > 0) frameworkIds.add('framework:nx');
  if (dependencyNames.has('react') || sections.some((section) => section.path.endsWith('.tsx'))) frameworkIds.add('framework:react');
  if (dependencyNames.has('vite') || filePaths.some((entry) => entry.includes('vite.config'))) frameworkIds.add('framework:vite');
  if (dependencyNames.has('playwright') || project.targets.some((target) => target.includes('e2e'))) frameworkIds.add('framework:playwright');
  if (dependencyNames.has('vitest') || dependencyNames.has('jest') || project.targets.some((target) => target.includes('test'))) frameworkIds.add('framework:test-harness');
  if (dependencyNames.has('puppeteer') || dependencyNames.has('playwright-extra')) frameworkIds.add('framework:web-automation');
  if (dependencyNames.has('googleapis') || dependencyNames.has('@google/clasp')) frameworkIds.add('framework:google-apps-script');

  if (project.tags.includes('platform:web') || project.root.startsWith('apps/chrome-extensions/')) {
    platformIds.add('platform:web-runtime');
  }
  if (project.tags.includes('platform:node') || project.category === 'tools' || project.root.startsWith('apps/documentation-scraper')) {
    platformIds.add('platform:node-runtime');
  }
  if (project.root.startsWith('apps/chrome-extensions/') || project.tags.includes('scope:chrome-ext')) {
    platformIds.add('platform:chrome-extension-mv3');
    capabilities.add('chrome-extension');
  }
  if (dependencyNames.has('googleapis') || filePaths.some((filePath) => filePath.includes('google-apps-script'))) {
    platformIds.add('platform:google-apps-script');
  }

  const capabilityMatchers = [
    ['service-worker', /service_worker\/|background\./],
    ['content-script', /\/content(?:\/|\.ts|\.tsx)/],
    ['sidepanel-ui', /sidepanel/],
    ['popup-ui', /popup/],
    ['watch-runtime', /watch/],
    ['inspector-runtime', /inspector/],
    ['telemetry', /telemetry|metrics|run-log/],
    ['storage-contracts', /storage|session-state|config/],
    ['authentication', /auth/],
    ['automation', /automation|recipe|flow/],
    ['documentation', /documentation|README|docs\//],
    ['provider-integration', /platforms|integrations/]
  ];

  for (const [capability, pattern] of capabilityMatchers) {
    if (filePaths.some((filePath) => pattern.test(filePath))) {
      capabilities.add(capability);
    }
  }

  const imports = new Set();
  for (const section of sections) {
    for (const match of section.content.matchAll(/(?:from|import)\s*[('"`]([^'"`]+)['"`]/g)) {
      imports.add(match[1]);
    }
  }

  const dependencyRoots = new Set();
  for (const imported of imports) {
    for (const alias of pathAliases) {
      if (alias.alias === imported) {
        dependencyRoots.add(alias.destination.split('/src/')[0]);
      } else if (alias.alias.endsWith('*')) {
        const prefix = alias.alias.slice(0, -1);
        if (imported.startsWith(prefix)) {
          const remainder = imported.slice(prefix.length);
          dependencyRoots.add(alias.destination.replace('*', remainder).split('/src/')[0]);
        }
      }
    }
  }

  const verificationCommands = [];
  for (const command of Object.values(project.targetCommands)) {
    if (command) verificationCommands.push(command);
  }
  if (verificationCommands.length === 0) {
    verificationCommands.push(`pnpm exec nx run ${project.name}:test`);
    verificationCommands.push(`pnpm exec nx run ${project.name}:build`);
  }

  const chromeApis = countChromeApis(sections);

  return {
    ...project,
    frameworkIds: [...frameworkIds],
    platformIds: [...platformIds],
    capabilities: [...capabilities],
    dependencyRoots: [...dependencyRoots],
    verificationCommands: verificationCommands.slice(0, 6),
    chromeApis,
    fileCount: sections.length,
    sectionHashes: sections.slice(0, 20).map((section) => sha1(section.path))
  };
}

function buildSystems(projects) {
  const systems = new Map();
  for (const project of projects) {
    const rootSegments = project.root.split('/');
    const systemPath = rootSegments.length >= 2 ? `${rootSegments[0]}/${rootSegments[1]}` : project.root;
    const systemId = makeId('system', systemPath);
    const existing = systems.get(systemId) ?? {
      id: systemId,
      name: systemPath,
      path: systemPath,
      projectIds: []
    };
    existing.projectIds.push(project.id);
    systems.set(systemId, existing);
    project.systemId = systemId;
  }
  return [...systems.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function buildFrameworkCatalog(projects, rootPackage) {
  const frameworkNameMap = {
    'framework:typescript': 'TypeScript',
    'framework:nx': 'Nx',
    'framework:react': 'React',
    'framework:vite': 'Vite',
    'framework:playwright': 'Playwright',
    'framework:test-harness': 'Test Harnesses',
    'framework:web-automation': 'Browser Automation',
    'framework:google-apps-script': 'Google Apps Script'
  };
  const frameworkIds = new Set(projects.flatMap((project) => project.frameworkIds));
  if (Object.keys(rootPackage?.dependencies ?? {}).includes('docx')) frameworkIds.add('framework:document-generation');
  if (frameworkIds.has('framework:document-generation')) {
    frameworkNameMap['framework:document-generation'] = 'Document Generation';
  }
  return [...frameworkIds].map((frameworkId) => ({
    id: frameworkId,
    name: frameworkNameMap[frameworkId] ?? frameworkId.replace(/^framework:/, '').replace(/-/g, ' ')
  }));
}

function buildPlatformCatalog(projects) {
  const platformNameMap = {
    'platform:web-runtime': 'Web Runtime',
    'platform:node-runtime': 'Node Runtime',
    'platform:chrome-extension-mv3': 'Chrome Extension MV3',
    'platform:google-apps-script': 'Google Apps Script'
  };
  const platformIds = new Set(projects.flatMap((project) => project.platformIds));
  return [...platformIds].map((platformId) => ({
    id: platformId,
    name: platformNameMap[platformId] ?? platformId.replace(/^platform:/, '').replace(/-/g, ' ')
  }));
}

function buildRulePacks(ruleFiles) {
  const grouped = groupBy(ruleFiles, (ruleFile) => ruleFile.folder);
  return [...grouped.entries()].map(([folder, files]) => ({
    id: makeId('rule-pack', folder),
    name: folder.split('/').slice(-1)[0].replace(/[-_]+/g, ' '),
    folder,
    ruleIds: files.map((file) => file.id),
    descriptions: files.map((file) => file.description).slice(0, 5)
  }));
}

function buildExistingVisualizations(diagramSections) {
  return diagramSections.map((section) => ({
    id: makeId('diagram', section.path),
    path: section.path,
    title: titleFromPath(section.path),
    projectName: projectNameFromPath(section.path),
    content: section.content
  }));
}

function buildTaskStates(taskStateSections) {
  return taskStateSections.map((section) => {
    const json = tryJson(section.content, {});
    return {
      id: makeId('task-state', section.path),
      path: section.path,
      project: json.project ?? projectNameFromPath(section.path),
      currentPhase: json.currentPhase ?? json.sdlcPhase ?? 'unknown',
      activeBranch: json.activeBranch ?? null,
      verificationCommands: json.nextCommandSet ?? [],
      doneCriteria: json.doneCriteria ?? [],
      objective: json.objective ?? null
    };
  });
}

function buildAgentEnvironments(sections) {
  const environments = [];
  const paths = sections.map((section) => section.path);
  const cursorRuleCount = paths.filter((entry) => entry.startsWith('.cursor/rules/') && entry.endsWith('.mdc')).length;
  const claudeSettings = sections.find((section) => section.path === '.claude/settings.json');
  const codexConfig = sections.find((section) => section.path === '.codex/config.toml');
  const mcpConfig = sections.find((section) => section.path === '.mcp.json');
  const claudeGuide = sections.find((section) => section.path === 'CLAUDE.md');
  const agentsGuide = sections.find((section) => section.path === 'AGENTS.md');

  if (cursorRuleCount > 0 || paths.includes('.cursor/rules')) {
    environments.push({
      id: makeId('environment', 'cursor'),
      tool: 'cursor',
      name: 'Cursor',
      ruleCount: cursorRuleCount,
      paths: paths.filter((entry) => entry.startsWith('.cursor/')).slice(0, 40),
      hasProjectRules: cursorRuleCount > 0,
      hasAgentMarkdown: paths.includes('AGENTS.md')
    });
  }

  if (claudeSettings || claudeGuide) {
    const settingsJson = claudeSettings ? tryJson(claudeSettings.content, {}) : {};
    environments.push({
      id: makeId('environment', 'claude'),
      tool: 'claude',
      name: 'Claude Code',
      paths: paths.filter((entry) => entry.startsWith('.claude/') || entry === 'CLAUDE.md').slice(0, 40),
      hasSettings: Boolean(claudeSettings),
      hasGuide: Boolean(claudeGuide),
      hasHooks: Boolean(settingsJson?.hooks),
      hasMcpConfig: Boolean(mcpConfig)
    });
  }

  if (paths.some((entry) => entry.startsWith('.codex/')) || codexConfig || agentsGuide) {
    environments.push({
      id: makeId('environment', 'codex'),
      tool: 'codex',
      name: 'Codex',
      paths: paths.filter((entry) => entry.startsWith('.codex/') || entry === 'AGENTS.md').slice(0, 40),
      hasConfig: Boolean(codexConfig),
      hasAgentsMd: Boolean(agentsGuide),
      hasMcpConfig: Boolean(mcpConfig)
    });
  }

  if (paths.some((entry) => entry.startsWith('.foundry/'))) {
    environments.push({
      id: makeId('environment', 'foundry'),
      tool: 'foundry',
      name: 'Flagship Foundry',
      paths: paths.filter((entry) => entry.startsWith('.foundry/')).slice(0, 40),
      hasContinuity: paths.some(
        (entry) => entry.includes('.foundry/projects/') && entry.endsWith('current-task.json')
      )
    });
  }

  if (mcpConfig) {
    const json = tryJson(mcpConfig.content, {});
    environments.push({
      id: makeId('environment', 'mcp'),
      tool: 'mcp',
      name: 'Shared MCP Config',
      paths: ['.mcp.json'],
      serverCount: Object.keys(json?.mcpServers ?? {}).length
    });
  }

  return environments;
}

function buildManifest({ request, sections }) {
  const rootPackage = extractRootConfig(sections, 'package.json');
  const nxConfig = extractRootConfig(sections, 'nx.json');
  const tsconfigBase = extractRootConfig(sections, 'tsconfig.base.json');
  const pnpmWorkspaceText = sections.find((section) => section.path === 'pnpm-workspace.yaml')?.content ?? '';
  const pathAliases = extractPathAliases(tsconfigBase ?? {});
  const topology = detectTopology(sections, rootPackage);
  const rawProjects = extractProjectManifests(sections);
  const projects = rawProjects.map((project) => inferProjectAttributes(project, sections, rootPackage ?? {}, pathAliases));
  const systems = buildSystems(projects);
  const frameworks = buildFrameworkCatalog(projects, rootPackage ?? {});
  const platforms = buildPlatformCatalog(projects);
  const ruleFiles = sections.filter((section) => section.path.endsWith('.mdc') || section.path.includes('.cursor/rules/')).map(parseRuleFile);
  const rulePacks = buildRulePacks(ruleFiles);
  const existingVisualizations = buildExistingVisualizations(sections.filter((section) => section.path.endsWith('.mmd')));
  const taskStates = buildTaskStates(sections.filter((section) => section.path.endsWith('current-task.json')));
  const agentEnvironments = buildAgentEnvironments(sections);
  const chromeApiUsage = countChromeApis(sections.filter((section) => section.path.startsWith('apps/') || section.path.startsWith('libs/') || section.path.startsWith('tools/')));
  const workspacePackages = parseYamlList(pnpmWorkspaceText);

  const projectRootsByRoot = new Map(projects.map((project) => [project.root, project]));
  for (const project of projects) {
    project.dependencies = project.dependencyRoots
      .map((root) => projectRootsByRoot.get(root)?.id)
      .filter(Boolean);
  }

  return {
    id: request.ecosystemId ?? slugify(request.name ?? request.source.workspaceRoot ?? 'imported-ecosystem'),
    name: request.name ?? 'Imported Ecosystem',
    importedAt: nowIso(),
    source: request.source,
    topology,
    workspacePackages,
    manifests: {
      rootPackageName: rootPackage?.name ?? 'unknown',
      packageManager: rootPackage?.packageManager ?? 'unknown',
      nodeEngine: rootPackage?.engines?.node ?? null,
      nxDefaultBase: nxConfig?.defaultBase ?? null,
      pathAliasCount: pathAliases.length
    },
    frameworks,
    platforms,
    projects,
    systems,
    ruleFiles,
    rulePacks,
    existingVisualizations,
    taskStates,
    agentEnvironments,
    knowledgeBase: {
      chromeApiDocsAvailable: sections.some((section) => section.source === 'chrome-api-docs'),
      chromeApiUsage: chromeApiUsage.slice(0, 20),
      ruleCount: ruleFiles.length,
      diagramCount: existingVisualizations.length,
      taskStateCount: taskStates.length,
      agentEnvironmentCount: agentEnvironments.length
    },
    findings: [
      `${projects.length} projects detected`,
      `${systems.length} system groups detected`,
      `${ruleFiles.length} rule files imported`,
      `${existingVisualizations.length} existing Mermaid diagrams ingested`,
      `${taskStates.length} current task states ingested`,
      `${agentEnvironments.length} agent environments detected`
    ]
  };
}

function renderImportReport(ecosystem) {
  const topApis = ecosystem.knowledgeBase.chromeApiUsage.slice(0, 8)
    .map((entry) => `- \`${entry.api}\`: ${entry.count} references`)
    .join('\n');
  const topSystems = ecosystem.systems
    .map((system) => `- ${system.name}: ${system.projectIds.length} projects`)
    .join('\n');
  const topFrameworks = ecosystem.frameworks.map((framework) => `- ${framework.name}`).join('\n');
  const topPlatforms = ecosystem.platforms.map((platform) => `- ${platform.name}`).join('\n');
  const topEnvironments = (ecosystem.agentEnvironments ?? []).length > 0
    ? ecosystem.agentEnvironments.map((environment) => `- ${environment.name}: ${environment.paths.join(', ')}`).join('\n')
    : '- none detected';

  return `# Current Workspace Import Report\n\n## Topology\n- Kind: **${ecosystem.topology.kind}**\n- Confidence: **${ecosystem.topology.confidence}**\n- Reasons: ${ecosystem.topology.reasons.join(', ')}\n\n## Detected Scope\n- Projects: **${ecosystem.projects.length}**\n- Systems: **${ecosystem.systems.length}**\n- Rule files: **${ecosystem.ruleFiles.length}**\n- Existing Mermaid diagrams: **${ecosystem.existingVisualizations.length}**\n- Current task states: **${ecosystem.taskStates.length}**\n- Agent environments: **${ecosystem.agentEnvironments.length}**\n\n## Agent Environment Parity\n${topEnvironments}\n\n## System Groups\n${topSystems}\n\n## Framework Coverage\n${topFrameworks}\n\n## Platform Coverage\n${topPlatforms}\n\n## Highest Chrome API Usage Signals\n${topApis || '- none detected'}\n\n## Immediate Planning Implications\n- Treat the repository as a graph of apps, libs, tools, rules, diagrams, task states, and agent-environment contracts.\n- Expand blast radius beyond touched files when a change touches shared Chrome extension patterns, shared libraries, workflow rule packs, or shared environment rules.\n- Preserve manual approval as the default until a plan explicitly opts into auto approval.\n- Use imported diagrams and task states as continuity artifacts, not as decoration.\n`;
}

function buildGraph(ecosystem) {
  const graph = createEmptyGraph({ ecosystemId: ecosystem.id, ecosystemName: ecosystem.name });

  upsertNode(graph, {
    id: `ecosystem:${ecosystem.id}`,
    type: 'ecosystem',
    name: ecosystem.name,
    tags: [ecosystem.topology.kind],
    refs: ['manifest.json'],
    properties: {
      topology: ecosystem.topology.kind,
      importedAt: ecosystem.importedAt,
      projectCount: ecosystem.projects.length
    }
  });

  upsertNode(graph, {
    id: `repo:${ecosystem.id}`,
    type: 'repo',
    name: ecosystem.manifests.rootPackageName,
    properties: {
      packageManager: ecosystem.manifests.packageManager,
      nodeEngine: ecosystem.manifests.nodeEngine
    }
  });
  addEdge(graph, { id: makeId('edge', `${ecosystem.id}-contains-repo`), type: 'contains', source: `ecosystem:${ecosystem.id}`, target: `repo:${ecosystem.id}` });

  for (const system of ecosystem.systems) {
    upsertNode(graph, {
      id: system.id,
      type: 'system',
      name: system.name,
      properties: { path: system.path, projectCount: system.projectIds.length }
    });
    addEdge(graph, { id: makeId('edge', `${ecosystem.id}-${system.id}`), type: 'contains', source: `repo:${ecosystem.id}`, target: system.id });
  }

  for (const framework of ecosystem.frameworks) {
    upsertNode(graph, {
      id: framework.id,
      type: 'framework',
      name: framework.name,
      properties: { category: 'framework' }
    });
    addEdge(graph, { id: makeId('edge', `${ecosystem.id}-${framework.id}`), type: 'uses-framework', source: `repo:${ecosystem.id}`, target: framework.id });
  }

  for (const platform of ecosystem.platforms) {
    upsertNode(graph, {
      id: platform.id,
      type: 'platform',
      name: platform.name,
      properties: { category: 'platform' }
    });
    addEdge(graph, { id: makeId('edge', `${ecosystem.id}-${platform.id}`), type: 'targets-platform', source: `repo:${ecosystem.id}`, target: platform.id });
  }

  for (const pack of ecosystem.rulePacks) {
    upsertNode(graph, {
      id: pack.id,
      type: 'rule-pack',
      name: pack.name,
      properties: {
        folder: pack.folder,
        ruleCount: pack.ruleIds.length
      }
    });
    addEdge(graph, { id: makeId('edge', `${ecosystem.id}-${pack.id}`), type: 'governed-by', source: `repo:${ecosystem.id}`, target: pack.id });
  }

  for (const environment of ecosystem.agentEnvironments ?? []) {
    upsertNode(graph, {
      id: environment.id,
      type: 'environment',
      name: environment.name,
      refs: environment.paths,
      properties: {
        tool: environment.tool,
        pathCount: environment.paths.length,
        ruleCount: environment.ruleCount ?? 0,
        hasMcpConfig: environment.hasMcpConfig ?? false
      }
    });
    addEdge(graph, { id: makeId('edge', `${ecosystem.id}-${environment.id}`), type: 'configured-with', source: `repo:${ecosystem.id}`, target: environment.id });
  }

  for (const project of ecosystem.projects) {
    upsertNode(graph, {
      id: project.id,
      type: 'project',
      name: project.name,
      tags: project.tags,
      refs: [project.root, ...(project.sourceRoot ? [project.sourceRoot] : [])],
      properties: {
        path: project.root,
        projectType: project.projectType,
        targets: project.targets,
        targetCommands: project.targetCommands,
        frameworkIds: project.frameworkIds,
        platformIds: project.platformIds,
        capabilityIds: project.capabilities,
        verificationCommands: project.verificationCommands,
        systemId: project.systemId,
        topChromeApis: project.chromeApis.slice(0, 8)
      }
    });
    addEdge(graph, { id: makeId('edge', `${project.systemId}-${project.id}`), type: 'contains', source: project.systemId, target: project.id });
    for (const frameworkId of project.frameworkIds) {
      addEdge(graph, { id: makeId('edge', `${project.id}-${frameworkId}`), type: 'uses-framework', source: project.id, target: frameworkId });
    }
    for (const platformId of project.platformIds) {
      addEdge(graph, { id: makeId('edge', `${project.id}-${platformId}`), type: 'targets-platform', source: project.id, target: platformId });
    }
    for (const dependencyId of project.dependencies ?? []) {
      addEdge(graph, { id: makeId('edge', `${project.id}-${dependencyId}`), type: 'depends-on', source: project.id, target: dependencyId });
    }
    for (const pack of ecosystem.rulePacks) {
      const pathTokens = project.root.split('/');
      if (pack.folder.includes('15-chome-extension') && project.platformIds.includes('platform:chrome-extension-mv3')) {
        addEdge(graph, { id: makeId('edge', `${project.id}-${pack.id}-pack`), type: 'governed-by', source: project.id, target: pack.id });
      } else if (pack.folder.includes('10-observability') && project.capabilities.includes('telemetry')) {
        addEdge(graph, { id: makeId('edge', `${project.id}-${pack.id}-pack`), type: 'governed-by', source: project.id, target: pack.id });
      } else if (pack.folder.includes('03-workflow')) {
        addEdge(graph, { id: makeId('edge', `${project.id}-${pack.id}-pack`), type: 'governed-by', source: project.id, target: pack.id });
      } else if (pack.folder.includes('02-architecture') && pathTokens[0] === 'libs') {
        addEdge(graph, { id: makeId('edge', `${project.id}-${pack.id}-pack`), type: 'governed-by', source: project.id, target: pack.id });
      }
    }
  }

  for (const project of ecosystem.projects) {
    for (const otherProject of ecosystem.projects) {
      if (project.id >= otherProject.id) continue;
      const sharedTags = project.tags.filter((tag) => otherProject.tags.includes(tag));
      if (sharedTags.length >= 2) {
        addEdge(graph, {
          id: makeId('edge', `${project.id}-${otherProject.id}-pattern`),
          type: 'shares-pattern',
          source: project.id,
          target: otherProject.id,
          properties: { sharedTags }
        });
      }
    }
  }

  for (const diagram of ecosystem.existingVisualizations) {
    const diagramNodeId = diagram.id;
    upsertNode(graph, {
      id: diagramNodeId,
      type: 'diagram',
      name: diagram.title,
      refs: [diagram.path],
      properties: { path: diagram.path, projectName: diagram.projectName }
    });
    const owningProject = ecosystem.projects.find((project) => project.name === diagram.projectName);
    if (owningProject) {
      addEdge(graph, { id: makeId('edge', `${owningProject.id}-${diagramNodeId}`), type: 'visualized-by', source: owningProject.id, target: diagramNodeId });
    }
  }

  for (const taskState of ecosystem.taskStates) {
    const stateNodeId = taskState.id;
    upsertNode(graph, {
      id: stateNodeId,
      type: 'task-state',
      name: `${taskState.project} ${taskState.currentPhase}`,
      refs: [taskState.path],
      properties: {
        project: taskState.project,
        currentPhase: taskState.currentPhase,
        activeBranch: taskState.activeBranch,
        verificationCommands: taskState.verificationCommands
      }
    });
    const owningProject = ecosystem.projects.find((project) => project.name === taskState.project);
    if (owningProject) {
      addEdge(graph, { id: makeId('edge', `${owningProject.id}-${stateNodeId}`), type: 'has-state', source: owningProject.id, target: stateNodeId });
    }
  }

  graph.generatedAt = ecosystem.importedAt;
  return graph;
}

async function writeEcosystemArtifacts(ecosystem, graph) {
  const ecosystemRoot = path.join(stateRoot, 'ecosystems', ecosystem.id);
  const visualizationsDir = path.join(ecosystemRoot, 'visualizations');
  const profilesDir = path.join(ecosystemRoot, 'profiles');
  const analysisDir = path.join(ecosystemRoot, 'analysis');

  await ensureDir(ecosystemRoot);
  await writeJson(path.join(ecosystemRoot, 'manifest.json'), ecosystem);
  await saveGraph(graph);
  const visualizationSpecs = buildVisualizationSpecs({ ecosystem, graph });
  await writeVisualizationSet(visualizationsDir, visualizationSpecs);
  const profiles = generateSmeProfiles({ ecosystem });
  await writeSmeProfiles(profilesDir, profiles);
  await writeJson(path.join(analysisDir, 'chrome-api-usage.json'), ecosystem.knowledgeBase.chromeApiUsage);
  await writeText(path.join(ecosystemRoot, 'import-report.md'), renderImportReport(ecosystem));

  return {
    ecosystemRoot,
    visualizationSpecs,
    profiles
  };
}

export async function importWorkspace(request) {
  const sections = request.source.type === 'filesystem'
    ? await loadSectionsFromFilesystem(request.source)
    : await loadSectionsFromExportBundle(request.source);

  const ecosystem = buildManifest({ request, sections });
  const graph = buildGraph(ecosystem);
  const artifacts = await writeEcosystemArtifacts(ecosystem, graph);

  return {
    ecosystem,
    graph,
    visualizations: artifacts.visualizationSpecs,
    profiles: artifacts.profiles,
    outputRoot: artifacts.ecosystemRoot
  };
}

export async function materializeImportToExamples(ecosystemId, exampleDir) {
  const ecosystemRoot = path.join(stateRoot, 'ecosystems', ecosystemId);
  await ensureDir(exampleDir);
  const manifestPath = path.join(ecosystemRoot, 'manifest.json');
  const graphPath = path.join(ecosystemRoot, 'graph.json');
  const reportPath = path.join(ecosystemRoot, 'import-report.md');
  await writeText(path.join(exampleDir, 'README.txt'), `Generated from ${ecosystemRoot}\n`);
  await writeText(path.join(exampleDir, 'manifest-path.txt'), manifestPath);
  await writeText(path.join(exampleDir, 'graph-path.txt'), graphPath);
  await writeText(path.join(exampleDir, 'report-path.txt'), reportPath);
}

export function defaultImportConfigForSample() {
  return {
    ecosystemId: 'web-automation-workspace',
    name: 'Web Automation Workspace',
    source: {
      type: 'export-bundle',
      codeExportPath: path.join(repoRoot, 'examples', 'current-workspace', 'input', 'master-codebase.txt'),
      configExportPath: path.join(repoRoot, 'examples', 'current-workspace', 'input', 'master-configs.txt'),
      rulesExportPath: path.join(repoRoot, 'examples', 'current-workspace', 'input', 'master-rules.txt'),
      chromeDocsPath: path.join(repoRoot, 'examples', 'current-workspace', 'input', 'master-chrome-ext-api-documentation.md')
    }
  };
}
