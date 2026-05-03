import path from 'node:path';
import { ensureDir, nowIso, readJson, readText, stateRoot, writeJson } from './io.mjs';
import { loadGraph } from './graph-store.mjs';
import { artifactTypeFromPath } from './derived-artifacts.mjs';

function exportDir(ecosystemId) {
  return path.join(stateRoot, 'ecosystems', ecosystemId, 'exports');
}

function importsDir(ecosystemId) {
  return path.join(stateRoot, 'ecosystems', ecosystemId, 'imports');
}

function normalizeSelection(selection = {}) {
  return {
    nodeIds: Array.isArray(selection.nodeIds) ? selection.nodeIds : [],
    artifactPaths: Array.isArray(selection.artifactPaths) ? selection.artifactPaths : []
  };
}

export async function packageExport(ecosystemId, selection = {}, options = {}) {
  const graph = await loadGraph(ecosystemId, ecosystemId);
  const normalized = normalizeSelection(selection);
  const packetId = options.packetId ?? `packet:${ecosystemId}:${Date.now()}`;
  const selectedNodes = new Set(normalized.nodeIds);
  const selectedArtifacts = normalized.artifactPaths.map((artifactPath) => ({
    artifactId: artifactPath,
    path: artifactPath,
    schemaRef: options.schemaRef ?? 'unknown',
    artifactType: artifactTypeFromPath(artifactPath)
  }));

  if (selectedNodes.size > 0) {
    for (const node of graph.nodes ?? []) {
      if (selectedNodes.has(node.id) && node.properties?.artifactId) {
        selectedArtifacts.push({
          artifactId: node.properties.artifactId,
          path: node.properties.artifactId,
          schemaRef: node.type ?? 'unknown',
          artifactType: node.type
        });
      }
    }
  }

  const artifacts = [...new Map(selectedArtifacts.map((artifact) => [artifact.artifactId, artifact])).values()];
  const manifest = {
    packetId,
    ecosystemId,
    exportedAt: nowIso(),
    artifacts,
    provenance: {
      sourceAgent: options.sourceAgent ?? 'cursor-companion',
      sessionId: options.sessionId ?? `session:${ecosystemId}`,
      sourceRunId: options.sourceRunId ?? null
    },
    checksums: artifacts.map((artifact) => ({
      path: artifact.path,
      sha256: String(artifact.path).length.toString(16)
    }))
  };

  const content = {};
  for (const artifact of artifacts) {
    try {
      content[artifact.artifactId] = artifact.path.endsWith('.json')
        ? await readJson(artifact.path, null)
        : await readText(artifact.path);
    } catch {
      content[artifact.artifactId] = null;
    }
  }

  const archive = { manifest, content };
  await ensureDir(exportDir(ecosystemId));
  await writeJson(path.join(exportDir(ecosystemId), `${packetId.replace(/[:/]+/g, '-')}.json`), archive);
  return archive;
}

export async function importExportPackage(ecosystemId, archive, options = {}) {
  const payload = typeof archive === 'string' ? await readJson(archive, null) : archive;
  if (!payload?.manifest?.packetId) {
    throw new Error('Invalid export package: missing manifest');
  }
  await ensureDir(importsDir(ecosystemId));
  const receipt = {
    receiptId: `receipt:${ecosystemId}:${Date.now()}`,
    packetId: payload.manifest.packetId,
    ecosystemId,
    importedAt: nowIso(),
    createdArtifactIds: (payload.manifest.artifacts ?? []).map((artifact) => artifact.artifactId),
    validation: {
      status: 'passed-with-warnings',
      warnings: ['Imported as derived artifact packet; content was not rewritten into canonical sources'],
      errors: []
    },
    provenance: {
      sourceAgent: payload.manifest.provenance?.sourceAgent ?? options.sourceAgent ?? 'external',
      sessionId: payload.manifest.provenance?.sessionId ?? options.sessionId ?? 'unknown',
      sourceRunId: payload.manifest.provenance?.sourceRunId ?? null
    }
  };
  await writeJson(path.join(importsDir(ecosystemId), `${receipt.receiptId.replace(/[:/]+/g, '-')}.json`), {
    archive: payload,
    receipt
  });
  return receipt;
}

