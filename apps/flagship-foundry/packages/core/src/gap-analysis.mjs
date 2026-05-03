import path from 'node:path';
import { repoRoot, writeJson, writeText } from './io.mjs';
import { loadKnowledgeBaseManifest, loadKnowledgeDocuments, loadDomainPackCatalog } from './knowledge-base.mjs';
import { loadCatalogs } from './catalogs.mjs';

const CRITICAL_PACK_IDS = new Set([
  'pack:knowledge-ingestion-and-rag',
  'pack:environment-parity-and-tooling',
  'pack:testing-quality-and-verification',
  'pack:observability-telemetry-and-operations'
]);

const CANONICAL_DOWNSTREAM_PROFILE_BY_PACK = Object.freeze({
  'pack:knowledge-ingestion-and-rag': path.join(
    repoRoot,
    'state',
    'ecosystems',
    'web-automation-workspace',
    'profiles',
    'sme-web-automation-workspace-knowledge-ingestion-and-rag.json'
  ),
  'pack:environment-parity-and-tooling': path.join(
    repoRoot,
    'state',
    'ecosystems',
    'web-automation-workspace',
    'profiles',
    'sme-web-automation-workspace-environment-parity-and-tooling.json'
  )
});

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function intersects(left, right) {
  const rightSet = new Set(right ?? []);
  return (left ?? []).some((value) => rightSet.has(value));
}

function inferRequiredPackIds(ecosystem, packs) {
  const frameworkIds = ecosystem.frameworks?.map((entry) => entry.id) ?? [];
  const platformIds = ecosystem.platforms?.map((entry) => entry.id) ?? [];
  const topologyKind = ecosystem.topology?.kind ?? null;
  const required = [];

  for (const pack of packs) {
    const triggers = pack.triggers ?? {};
    if (triggers.always) {
      required.push(pack.id);
      continue;
    }
    if (triggers.topologyKinds?.includes(topologyKind)) {
      required.push(pack.id);
      continue;
    }
    if (intersects(triggers.frameworkIds, frameworkIds)) {
      required.push(pack.id);
      continue;
    }
    if (intersects(triggers.platformIds, platformIds)) {
      required.push(pack.id);
      continue;
    }
  }

  return unique(required);
}

function presentIdSet(items) {
  return new Set((items ?? []).map((item) => item.id));
}

async function environmentCoverage(ecosystem) {
  const environments = ecosystem.agentEnvironments ?? [];
  const tools = new Set(environments.map((entry) => entry.tool));

  // Gap analysis should not fail parity solely because an imported manifest is stale.
  // Merge canonical repository environment signals as a fallback.
  const fs = await import('node:fs/promises');
  const paritySignals = [
    { tool: 'cursor', relPath: '.cursor' },
    { tool: 'codex', relPath: '.codex' },
    { tool: 'claude', relPath: '.claude' },
    { tool: 'claude', relPath: 'CLAUDE.md' },
    { tool: 'claude', relPath: '.mcp.json' }
  ];
  const candidateRoots = [repoRoot, path.resolve(repoRoot, '..')];

  for (const rootPath of candidateRoots) {
    for (const signal of paritySignals) {
      try {
        await fs.access(path.join(rootPath, signal.relPath));
        tools.add(signal.tool);
      } catch {
        // Ignore missing optional parity signal.
      }
    }
  }

  return tools;
}

function buildRecommendation(pack, reasons, catalogs, ecosystem) {
  const frameworkHints = (catalogs.frameworkRegistry ?? []).filter((entry) =>
    (entry.knowledgePackIds ?? []).includes(pack.id)
    || (entry.id && (ecosystem.frameworks ?? []).some((framework) => framework.id === entry.id))
    || (entry.id && (ecosystem.platforms ?? []).some((platform) => platform.id === entry.id))
  );
  const suggestedSources = unique(frameworkHints.flatMap((entry) => entry.recommendedDocs ?? []));
  const suggestedPersonas = unique(frameworkHints.flatMap((entry) => entry.recommendedPersonas ?? []));
  const suggestedRunbooks = unique(frameworkHints.flatMap((entry) => entry.recommendedRunbooks ?? []));
  const actions = [];
  if (reasons.includes('docs')) actions.push('ingest or refresh source documents for this pack');
  if (reasons.includes('personas')) actions.push('add or wire the required persona pack');
  if (reasons.includes('runbooks')) actions.push('add the missing runbook and handoff expectations');
  if (reasons.includes('guardrails')) actions.push('add the missing guardrail policy');
  if (reasons.includes('environment-parity')) actions.push('scaffold Cursor, Codex, and Claude parity artifacts');
  if (reasons.includes('freshness')) actions.push('refresh source versions and re-ingest this knowledge pack');
  if (reasons.includes('downstream-linkage')) actions.push('wire canonical SME profile linkage for this pack');
  return {
    packId: pack.id,
    title: pack.title,
    severity: reasons.includes('docs') || reasons.includes('environment-parity') ? 'high' : 'medium',
    reasons,
    actions,
    suggestedSources,
    suggestedPersonas,
    suggestedRunbooks
  };
}

function parseIsoDate(value) {
  if (typeof value !== 'string') return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed) : null;
}

function dayDiff(older, newer) {
  const deltaMs = newer.getTime() - older.getTime();
  return Math.max(0, Math.floor(deltaMs / (24 * 60 * 60 * 1000)));
}

function tierForPack(packId) {
  return CRITICAL_PACK_IDS.has(packId) ? 'critical' : 'important';
}

function freshnessWindowDaysForTier(tier) {
  return tier === 'critical' ? 14 : 30;
}

async function hasCanonicalDownstreamLinkage(packId) {
  const profilePath = CANONICAL_DOWNSTREAM_PROFILE_BY_PACK[packId];
  if (!profilePath) return true;
  try {
    const fs = await import('node:fs/promises');
    const raw = await fs.readFile(profilePath, 'utf8');
    const profile = JSON.parse(raw);
    const linkedIds = profile.knowledgePackIds ?? [];
    return Array.isArray(linkedIds) && linkedIds.includes(packId);
  } catch {
    return false;
  }
}

export async function analyzeKnowledgeGaps(ecosystem, knowledgeBaseId = null) {
  const [packs, catalogs, knowledgeBase, documents] = await Promise.all([
    loadDomainPackCatalog(),
    loadCatalogs(),
    knowledgeBaseId ? loadKnowledgeBaseManifest(knowledgeBaseId) : Promise.resolve(null),
    knowledgeBaseId ? loadKnowledgeDocuments(knowledgeBaseId) : Promise.resolve([])
  ]);

  const requiredPackIds = inferRequiredPackIds(ecosystem, packs);
  const personas = presentIdSet(catalogs.personas);
  const runbooks = presentIdSet(catalogs.runbooks);
  const guardrails = presentIdSet(catalogs.guardrails);
  const environmentTools = await environmentCoverage(ecosystem);

  const coverage = [];
  const recommendations = [];

  for (const packId of requiredPackIds) {
    const pack = packs.find((entry) => entry.id === packId);
    if (!pack) continue;
    const docsCount = documents.filter((document) => document.knowledgePackIds?.includes(pack.id)).length;
    const missing = [];
    if (docsCount === 0) missing.push('docs');
    if ((pack.requiredPersonaIds ?? []).some((id) => !personas.has(id))) missing.push('personas');
    if ((pack.requiredRunbookIds ?? []).some((id) => !runbooks.has(id))) missing.push('runbooks');
    if ((pack.requiredGuardrailIds ?? []).some((id) => !guardrails.has(id))) missing.push('guardrails');
    if (pack.id === 'pack:environment-parity-and-tooling' && (!environmentTools.has('cursor') || !environmentTools.has('codex') || !environmentTools.has('claude'))) {
      missing.push('environment-parity');
    }
    const tier = tierForPack(pack.id);
    const freshnessWindowDays = freshnessWindowDaysForTier(tier);
    const relevantDocuments = documents.filter((document) => document.knowledgePackIds?.includes(pack.id));
    const newestVersion = relevantDocuments
      .map((document) => ({ raw: document.metadata?.version ?? null, date: parseIsoDate(document.metadata?.version ?? null) }))
      .filter((entry) => entry.date)
      .sort((left, right) => right.date.getTime() - left.date.getTime())[0] ?? null;
    const importedAtDate = parseIsoDate(knowledgeBase?.importedAt) ?? new Date();
    const freshnessAgeDays = newestVersion ? dayDiff(newestVersion.date, importedAtDate) : null;
    const freshnessStatus = freshnessAgeDays !== null && freshnessAgeDays <= freshnessWindowDays ? 'fresh' : 'stale';
    if (freshnessStatus === 'stale') missing.push('freshness');
    const hasDownstreamLinkage = await hasCanonicalDownstreamLinkage(pack.id);
    if (!hasDownstreamLinkage) missing.push('downstream-linkage');

    const dimensions = [
      1,
      docsCount > 0 ? 1 : 0,
      (pack.requiredPersonaIds ?? []).every((id) => personas.has(id)) ? 1 : 0,
      (pack.requiredRunbookIds ?? []).every((id) => runbooks.has(id)) ? 1 : 0,
      (pack.requiredGuardrailIds ?? []).every((id) => guardrails.has(id)) ? 1 : 0,
      pack.id === 'pack:environment-parity-and-tooling'
        ? ((!missing.includes('environment-parity')) ? 1 : 0)
        : 1,
      freshnessStatus === 'fresh' ? 1 : 0,
      hasDownstreamLinkage ? 1 : 0
    ];
    const completeness = Number((dimensions.reduce((sum, value) => sum + value, 0) / dimensions.length).toFixed(2));

    coverage.push({
      packId: pack.id,
      title: pack.title,
      completeness,
      docsCount,
      requiredPersonaIds: pack.requiredPersonaIds ?? [],
      requiredRunbookIds: pack.requiredRunbookIds ?? [],
      requiredGuardrailIds: pack.requiredGuardrailIds ?? [],
      slaTier: tier,
      freshness: {
        windowDays: freshnessWindowDays,
        ageDays: freshnessAgeDays,
        sourceVersion: newestVersion?.raw ?? null,
        status: freshnessStatus
      },
      missing
    });

    if (missing.length > 0) {
      recommendations.push(buildRecommendation(pack, missing, catalogs, ecosystem));
    }
  }

  coverage.sort((left, right) => left.completeness - right.completeness || left.title.localeCompare(right.title));
  recommendations.sort((left, right) => {
    const severityRank = { high: 0, medium: 1, low: 2 };
    return severityRank[left.severity] - severityRank[right.severity] || left.title.localeCompare(right.title);
  });

  return {
    ecosystemId: ecosystem.id,
    knowledgeBaseId,
    knowledgeBaseName: knowledgeBase?.name ?? null,
    requiredPacks: requiredPackIds,
    coverage,
    recommendations,
    summary: {
      requiredPackCount: requiredPackIds.length,
      incompletePackCount: coverage.filter((entry) => entry.missing.length > 0).length,
      criticalMissingDocs: coverage.filter((entry) => entry.missing.includes('docs')).length,
      staleCriticalPackCount: coverage.filter((entry) => entry.slaTier === 'critical' && entry.missing.includes('freshness')).length,
      weakestPack: coverage[0]?.packId ?? null
    }
  };
}

function buildGapReportMarkdown(report) {
  const weakest = report.coverage[0] ?? null;
  return [
    '# Knowledge Gap Report',
    '',
    `- Ecosystem: **${report.ecosystemId}**`,
    `- Knowledge base: **${report.knowledgeBaseName ?? report.knowledgeBaseId ?? 'none'}**`,
    `- Required packs: **${report.summary.requiredPackCount}**`,
    `- Incomplete packs: **${report.summary.incompletePackCount}**`,
    `- Weakest pack: **${weakest?.title ?? 'n/a'}**`,
    '',
    '## Coverage',
    ...report.coverage.map((entry) =>
      `- ${entry.title}: completeness ${entry.completeness} (tier=${entry.slaTier}, freshness=${entry.freshness.status}${entry.freshness.ageDays !== null ? `, age=${entry.freshness.ageDays}d` : ''}${entry.missing.length > 0 ? `, missing ${entry.missing.join(', ')}` : ', complete'})`
    ),
    '',
    '## Recommendations',
    ...(report.recommendations.length > 0
      ? report.recommendations.map((entry) => `- ${entry.title}: ${entry.actions.join('; ')}${entry.suggestedSources.length > 0 ? ` | suggested sources: ${entry.suggestedSources.join(', ')}` : ''}`)
      : ['- no major gaps detected'])
  ].join('\n') + '\n';
}

export async function writeGapReport(report) {
  const analysisDir = path.join(repoRoot, 'state', 'ecosystems', report.ecosystemId, 'analysis');
  const reportFile = path.join(analysisDir, 'gap-report.json');
  const markdownFile = path.join(analysisDir, 'gap-report.md');
  await writeJson(reportFile, report);
  await writeText(markdownFile, buildGapReportMarkdown(report));
  return { json: reportFile, markdown: markdownFile };
}
