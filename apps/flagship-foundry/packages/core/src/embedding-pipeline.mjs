import path from 'node:path';
import { ensureDir, nowIso, readJson, readText, stateRoot, writeJson } from './io.mjs';
import { artifactPhaseFromPath, artifactProjectFromPath, artifactTypeFromPath, estimateTokenCount, hashVector, listArtifactFiles, splitTextIntoChunks, trunc } from './derived-artifacts.mjs';

function ragDir(ecosystemId) {
  return path.join(stateRoot, 'ecosystems', ecosystemId, 'rag');
}

function ragIndexPath(ecosystemId) {
  return path.join(ragDir(ecosystemId), 'index.json');
}

function splitChunksForFile(text, artifactType) {
  const maxWords = artifactType === 'schema' ? 220 : artifactType === 'adr' ? 260 : 320;
  return splitTextIntoChunks(text, maxWords);
}

async function embedText(text, gatewayUrl = process.env.FLAGSHIP_MODEL_GATEWAY_URL ?? 'http://localhost:4011') {
  try {
    const response = await fetch(`${gatewayUrl}/v1/embeddings`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ input: text, model: 'local-embedding-hash' })
    });
    if (response.ok) {
      const payload = await response.json();
      const vector = payload?.data?.[0]?.embedding;
      if (Array.isArray(vector)) {
        return vector;
      }
    }
  } catch {
    // fallback below
  }
  return hashVector(text);
}

async function loadIndex(ecosystemId) {
  return readJson(ragIndexPath(ecosystemId), {
    ecosystemId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    entries: [],
    stats: {
      artifactCount: 0,
      chunkCount: 0
    }
  });
}

async function saveIndex(ecosystemId, index) {
  const payload = {
    ...index,
    updatedAt: nowIso()
  };
  await ensureDir(ragDir(ecosystemId));
  await writeJson(ragIndexPath(ecosystemId), payload);
  return payload;
}

async function scanArtifactFiles(ecosystemId, roots = []) {
  const candidates = roots.length > 0 ? roots : [path.join(stateRoot, 'ecosystems', ecosystemId), process.cwd()];
  const files = [];
  const seen = new Set();
  for (const root of candidates) {
    const entries = await listArtifactFiles(root, {
      includeMatcher: (fullPath, relativePath) => {
        const normalized = relativePath.replace(/\\/g, '/');
        if (normalized.includes('/node_modules/') || normalized.includes('/dist/') || normalized.includes('/coverage/')) {
          return false;
        }
        return /\.json$|\.md$|\.mmd$|\.mdc$/i.test(normalized);
      }
    });
    for (const entry of entries) {
      if (seen.has(entry.path)) continue;
      seen.add(entry.path);
      files.push({ ...entry, root });
    }
  }
  return files;
}

async function buildEntriesForFile(ecosystemId, file, gatewayUrl) {
  const relativePath = path.relative(file.root, file.path).replace(/\\/g, '/');
  const artifactType = artifactTypeFromPath(relativePath);
  const raw = file.path.endsWith('.json') ? await readJson(file.path, null) : await readText(file.path);
  const text = typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
  const chunks = splitChunksForFile(text, artifactType);
  const entries = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const chunkText = chunks[index];
    entries.push({
      entryId: `rag:${ecosystemId}:${relativePath}:${index}`,
      ecosystemId,
      artifactId: relativePath,
      chunkIndex: index,
      chunkText,
      artifactType,
      phase: artifactPhaseFromPath(relativePath),
      project: artifactProjectFromPath(relativePath),
      vectorRef: `vec:${ecosystemId}:${relativePath}:${index}`,
      tokenCount: estimateTokenCount(chunkText),
      provenance: {
        sourcePath: file.path,
        sourceArtifactType: artifactType,
        retrievedAt: nowIso(),
        sourceAgent: 'embedding-pipeline',
        sessionId: null
      },
      vector: await embedText(chunkText, gatewayUrl),
      createdAt: nowIso()
    });
  }
  return entries;
}

export async function indexArtifact(ecosystemId, artifactPath, artifactType = null, options = {}) {
  const gatewayUrl = options.gatewayUrl ?? process.env.FLAGSHIP_MODEL_GATEWAY_URL ?? 'http://localhost:4011';
  const index = await loadIndex(ecosystemId);
  const file = { path: artifactPath, root: options.root ?? path.dirname(artifactPath) };
  const entries = await buildEntriesForFile(ecosystemId, file, gatewayUrl);
  const filtered = artifactType ? entries.filter((entry) => entry.artifactType === artifactType) : entries;
  const nextEntries = [...index.entries.filter((entry) => entry.artifactId !== path.relative(file.root, artifactPath).replace(/\\/g, '/')), ...filtered];
  const payload = {
    ...index,
    entries: nextEntries,
    stats: {
      artifactCount: new Set(nextEntries.map((entry) => entry.artifactId)).size,
      chunkCount: nextEntries.length
    }
  };
  return saveIndex(ecosystemId, payload);
}

export async function indexEcosystem(ecosystemId, options = {}) {
  const gatewayUrl = options.gatewayUrl ?? process.env.FLAGSHIP_MODEL_GATEWAY_URL ?? 'http://localhost:4011';
  const files = await scanArtifactFiles(ecosystemId, options.roots ?? []);
  const entries = [];
  for (const file of files) {
    const built = await buildEntriesForFile(ecosystemId, file, gatewayUrl);
    entries.push(...built);
  }
  const payload = {
    ecosystemId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    entries,
    stats: {
      artifactCount: new Set(entries.map((entry) => entry.artifactId)).size,
      chunkCount: entries.length
    }
  };
  return saveIndex(ecosystemId, payload);
}

export async function loadRagIndex(ecosystemId) {
  return loadIndex(ecosystemId);
}
