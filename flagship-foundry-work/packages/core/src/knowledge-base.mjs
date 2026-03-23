import path from 'node:path';
import { ensureDir, nowIso, readJson, readText, repoRoot, sanitizeForFileName, stateRoot, writeJson, writeText } from './io.mjs';

const domainPacksPath = path.join(repoRoot, 'knowledge', 'catalogs', 'domain-packs.json');
const sourcePresetsPath = path.join(repoRoot, 'knowledge', 'catalogs', 'source-presets.json');
const knowledgeRoot = path.join(stateRoot, 'knowledge');

function resolveRepoPath(relativeOrAbsolutePath) {
  return path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.resolve(repoRoot, relativeOrAbsolutePath);
}

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function summarize(content, maxLength = 280) {
  const normalized = String(content ?? '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
}

function detectSourceMetadata(block) {
  const sourceMatch = block.match(/^Source:\s*(.+)$/m);
  return {
    sourceUrl: sourceMatch ? sourceMatch[1].trim() : null
  };
}

function splitByTopLevelHeading(text) {
  const normalized = String(text ?? '').replace(/\r\n/g, '\n');
  const matches = [...normalized.matchAll(/^##\s+(.+)$/gm)];
  if (matches.length === 0) {
    return [{ title: 'Document', content: normalized.trim(), metadata: detectSourceMetadata(normalized) }];
  }

  const sections = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const start = match.index;
    const end = index + 1 < matches.length ? matches[index + 1].index : normalized.length;
    const content = normalized.slice(start, end).trim();
    sections.push({
      title: match[1].trim(),
      content,
      metadata: detectSourceMetadata(content)
    });
  }
  return sections;
}

function splitTextBundleSections(text) {
  const normalized = String(text ?? '').replace(/\r\n/g, '\n');
  const headerPattern = /^(?:====\s+(?:RULE FILE|FILE):\s+(.+?)\s+====|===\s+FILE\s+(.+?)\s+===)$/gm;
  const matches = [...normalized.matchAll(headerPattern)];
  if (matches.length === 0) {
    return [{ title: 'Bundle', content: normalized.trim(), metadata: {} }];
  }

  const sections = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const filePath = (match[1] ?? match[2] ?? 'bundle-section').trim();
    const start = match.index + match[0].length + 1;
    const end = index + 1 < matches.length ? matches[index + 1].index : normalized.length;
    const content = normalized.slice(start, end).trim();
    sections.push({
      title: filePath,
      content,
      metadata: { filePath }
    });
  }
  return sections;
}

function splitSourceDocuments(source, content) {
  const type = source.type ?? 'markdown';
  if (type === 'combined-markdown') {
    return splitByTopLevelHeading(content);
  }
  if (type === 'text-bundle') {
    return splitTextBundleSections(content);
  }
  return [{
    title: source.title ?? path.basename(source.path),
    content: String(content ?? '').trim(),
    metadata: detectSourceMetadata(content)
  }];
}

function keywordScore(haystack, keywords) {
  const lowered = haystack.toLowerCase();
  const matched = [];
  for (const keyword of keywords ?? []) {
    const normalized = String(keyword).toLowerCase();
    if (normalized && lowered.includes(normalized)) {
      matched.push(keyword);
    }
  }
  return matched;
}

function tagDocument(document, source, packs) {
  const haystack = `${document.title}\n${document.content}`;
  const knowledgePackIds = [];
  const frameworkIds = [];
  const platformIds = [];
  const domains = [];
  const matchedKeywords = [];

  for (const pack of packs) {
    const matched = keywordScore(haystack, pack.keywords);
    const shouldAttach = matched.length > 0
      || (source.id?.includes('cursor') && pack.id === 'pack:environment-parity-and-tooling')
      || (source.id?.includes('codex') && pack.id === 'pack:environment-parity-and-tooling')
      || (source.id?.includes('claude') && pack.id === 'pack:environment-parity-and-tooling');
    if (!shouldAttach) continue;
    knowledgePackIds.push(pack.id);
    frameworkIds.push(...(pack.frameworkIds ?? []));
    platformIds.push(...(pack.platformIds ?? []));
    domains.push(...(pack.domains ?? []));
    matchedKeywords.push(...matched);
  }

  const tags = unique([
    ...(source.tags ?? []),
    ...domains,
    ...knowledgePackIds.map((value) => value.replace(/^pack:/, 'pack/')),
    ...matchedKeywords.map((value) => `keyword/${String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)
  ]);

  return {
    knowledgePackIds: unique(knowledgePackIds),
    frameworkIds: unique(frameworkIds),
    platformIds: unique(platformIds),
    tags
  };
}

export async function loadDomainPackCatalog() {
  return readJson(domainPacksPath, []);
}

export async function loadSourcePresets() {
  return readJson(sourcePresetsPath, []);
}

async function resolveManifestSources(manifest) {
  const presets = await loadSourcePresets();
  const presetIds = unique([manifest.presetId, ...(manifest.presetIds ?? [])]);
  const presetSources = [];
  for (const presetId of presetIds) {
    const preset = presets.find((entry) => entry.id === presetId);
    if (!preset) continue;
    presetSources.push(...(preset.sources ?? []));
  }
  return unique([...presetSources, ...(manifest.sources ?? [])].map((source) => JSON.stringify(source))).map((value) => JSON.parse(value));
}

function knowledgeBaseDir(knowledgeBaseId) {
  return path.join(knowledgeRoot, knowledgeBaseId);
}

function docsIndexPath(knowledgeBaseId) {
  return path.join(knowledgeBaseDir(knowledgeBaseId), 'documents', 'index.json');
}

function manifestPath(knowledgeBaseId) {
  return path.join(knowledgeBaseDir(knowledgeBaseId), 'manifest.json');
}

function reportPath(knowledgeBaseId) {
  return path.join(knowledgeBaseDir(knowledgeBaseId), 'coverage-report.md');
}

function buildCoverageReport(knowledgeBase, documents) {
  const lines = [
    '# Knowledge Base Coverage Report',
    '',
    `- Knowledge base: **${knowledgeBase.name}**`,
    `- Sources: **${knowledgeBase.sources.length}**`,
    `- Documents: **${documents.length}**`,
    `- Imported at: **${knowledgeBase.importedAt}**`,
    '',
    '## Pack Coverage',
    ...knowledgeBase.packCoverage.map((entry) => `- ${entry.packId}: ${entry.documentCount} documents`),
    '',
    '## Sources',
    ...knowledgeBase.sources.map((source) => `- ${source.id}: ${source.documentCount} documents (${source.type})`)
  ];
  return `${lines.join('\n')}\n`;
}

export async function ingestKnowledgeSources(manifest) {
  const packs = await loadDomainPackCatalog();
  const documents = [];
  const sources = [];
  const resolvedSources = await resolveManifestSources(manifest);

  for (const source of resolvedSources) {
    const absolutePath = resolveRepoPath(source.path);
    const raw = await readText(absolutePath);
    const splitDocuments = splitSourceDocuments(source, raw);
    const sourceDocuments = splitDocuments.map((document, index) => {
      const tagged = tagDocument(document, source, packs);
      return {
        id: `knowledge-document:${sanitizeForFileName(source.id)}-${index + 1}`,
        sourceId: source.id,
        title: document.title,
        kind: source.type,
        content: document.content,
        summary: summarize(document.content),
        tags: tagged.tags,
        knowledgePackIds: tagged.knowledgePackIds,
        frameworkIds: tagged.frameworkIds,
        platformIds: tagged.platformIds,
        metadata: {
          ...(document.metadata ?? {}),
          sourcePath: source.path,
          version: source.version ?? null,
          sourceTitle: source.title ?? null
        }
      };
    });
    documents.push(...sourceDocuments);
    sources.push({
      id: source.id,
      title: source.title ?? source.id,
      type: source.type,
      path: source.path,
      version: source.version ?? null,
      documentCount: sourceDocuments.length,
      tags: unique(sourceDocuments.flatMap((document) => document.tags)).slice(0, 24)
    });
  }

  const packCoverage = packs.map((pack) => ({
    packId: pack.id,
    title: pack.title,
    documentCount: documents.filter((document) => document.knowledgePackIds.includes(pack.id)).length
  })).filter((entry) => entry.documentCount > 0).sort((left, right) => right.documentCount - left.documentCount);

  const knowledgeBase = {
    id: manifest.knowledgeBaseId,
    name: manifest.name,
    description: manifest.description ?? null,
    importedAt: nowIso(),
    sources,
    documentCount: documents.length,
    packCoverage,
    frameworks: unique(documents.flatMap((document) => document.frameworkIds)),
    platforms: unique(documents.flatMap((document) => document.platformIds)),
    tags: unique(documents.flatMap((document) => document.tags)).slice(0, 128)
  };

  const outDir = knowledgeBaseDir(knowledgeBase.id);
  await ensureDir(path.join(outDir, 'documents'));
  await writeJson(manifestPath(knowledgeBase.id), knowledgeBase);
  await writeJson(docsIndexPath(knowledgeBase.id), documents);
  await writeText(reportPath(knowledgeBase.id), buildCoverageReport(knowledgeBase, documents));

  return {
    knowledgeBase,
    documents,
    outputRoot: outDir
  };
}

export async function listKnowledgeBases() {
  try {
    const entries = await import('node:fs/promises').then((fs) => fs.readdir(knowledgeRoot, { withFileTypes: true }));
    const manifests = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      manifests.push(await readJson(manifestPath(entry.name)));
    }
    return manifests.sort((left, right) => right.importedAt.localeCompare(left.importedAt));
  } catch {
    return [];
  }
}

export async function loadKnowledgeBaseManifest(knowledgeBaseId) {
  return readJson(manifestPath(knowledgeBaseId));
}

export async function loadKnowledgeDocuments(knowledgeBaseId) {
  return readJson(docsIndexPath(knowledgeBaseId), []);
}
