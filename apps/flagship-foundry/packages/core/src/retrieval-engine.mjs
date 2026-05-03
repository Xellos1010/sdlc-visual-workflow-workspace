import { nowIso } from './io.mjs';
import { loadRagIndex } from './embedding-pipeline.mjs';
import { estimateTokenCount } from './derived-artifacts.mjs';

function tokenize(value) {
  return String(value ?? '')
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 1);
}

function overlapScore(queryTokens, chunkTokens) {
  if (queryTokens.length === 0 || chunkTokens.length === 0) return 0;
  const querySet = new Set(queryTokens);
  const chunkSet = new Set(chunkTokens);
  let matched = 0;
  for (const token of querySet) {
    if (chunkSet.has(token)) matched += 1;
  }
  return matched / Math.max(1, querySet.size);
}

function vectorScore(queryTokens, entry) {
  const chunkTokens = tokenize(entry.chunkText);
  const lexical = overlapScore(queryTokens, chunkTokens);
  const artifactBias = entry.artifactType === 'adr' ? 0.04 : entry.artifactType === 'schema' ? 0.03 : 0;
  return Math.min(1, lexical + artifactBias);
}

export async function retrieve(ecosystemId, ragQuery) {
  const index = await loadRagIndex(ecosystemId);
  const queryTokens = tokenize(ragQuery.query);
  const artifactTypes = new Set(ragQuery.artifactTypes ?? []);
  const phases = new Set(ragQuery.phases ?? []);

  const ranked = (index.entries ?? [])
    .filter((entry) => {
      if (artifactTypes.size > 0 && !artifactTypes.has(entry.artifactType)) return false;
      if (phases.size > 0 && !phases.has(entry.phase)) return false;
      return true;
    })
    .map((entry) => ({
      ...entry,
      similarityScore: vectorScore(queryTokens, entry),
      tokenCount: entry.tokenCount ?? estimateTokenCount(entry.chunkText),
      provenance: { ...(entry.provenance ?? {}), retrievedAt: nowIso() }
    }))
    .sort((left, right) => right.similarityScore - left.similarityScore || left.entryId.localeCompare(right.entryId));

  const results = [];
  let totalTokenCount = 0;
  for (const entry of ranked) {
    if (results.length >= (ragQuery.maxResults ?? 10)) break;
    const nextTokenCount = totalTokenCount + entry.tokenCount;
    if (nextTokenCount > (ragQuery.tokenBudget ?? 12000)) break;
    results.push({
      resultId: `result:${entry.entryId}`,
      artifactId: entry.artifactId,
      chunkIndex: entry.chunkIndex,
      chunkText: entry.chunkText,
      similarityScore: Number(entry.similarityScore.toFixed(4)),
      tokenCount: entry.tokenCount,
      rank: results.length + 1,
      provenance: entry.provenance
    });
    totalTokenCount = nextTokenCount;
  }

  return {
    queryId: ragQuery.queryId,
    ecosystemId,
    results,
    totalTokenCount,
    createdAt: nowIso()
  };
}

export async function buildRagStatus(ecosystemId) {
  const index = await loadRagIndex(ecosystemId);
  return {
    ecosystemId,
    indexedArtifacts: index.stats?.artifactCount ?? 0,
    indexedChunks: index.stats?.chunkCount ?? 0,
    updatedAt: index.updatedAt ?? index.createdAt ?? null,
    status: index.entries?.length > 0 ? 'ready' : 'empty'
  };
}

