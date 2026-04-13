import path from 'node:path';
import { makeId, nowIso, readJson, stateRoot, writeJson } from './io.mjs';

function artifactDir(ecosystemId) {
  return path.join(stateRoot, 'ecosystems', ecosystemId, 'operator', 'visual-artifacts');
}

function artifactPath(ecosystemId, artifactId) {
  return path.join(artifactDir(ecosystemId), `${artifactId.replace(/[:/]+/g, '-')}.json`);
}

function inferRepresentation(kind) {
  if (kind.startsWith('c4-') || kind === 'flow-control' || kind === 'component-uml' || kind === 'sequence' || kind === 'blast-radius' || kind === 'focus-view') {
    return 'mermaid';
  }
  if (kind === 'schema-view' || kind === 'data-contract') {
    return 'json';
  }
  return 'markdown';
}

function inferMimeType(representation) {
  if (representation === 'mermaid') return 'text/x-mermaid';
  if (representation === 'json') return 'application/json';
  if (representation === 'text') return 'text/plain';
  return 'text/markdown';
}

export function buildVisualArtifact(input = {}) {
  const representation = input.representation ?? inferRepresentation(input.kind ?? 'pseudocode');
  const body = input.content?.body ?? input.body ?? '';
  return {
    artifactId: input.artifactId ?? makeId('artifact', `${input.kind ?? 'visual'}-${input.title ?? nowIso()}`),
    workspaceTargetId: input.workspaceTargetId,
    kind: input.kind ?? 'pseudocode',
    title: input.title ?? 'Operator artifact',
    representation,
    summary: input.summary ?? null,
    content: {
      body,
      mimeType: input.content?.mimeType ?? inferMimeType(representation)
    },
    sourceRefs: Array.isArray(input.sourceRefs) ? input.sourceRefs : [],
    interactiveBinds: Array.isArray(input.interactiveBinds) ? input.interactiveBinds : [],
    rendererHint: input.rendererHint ?? (representation === 'text' ? 'plaintext' : representation),
    filePath: input.filePath ?? null,
    createdAt: input.createdAt ?? nowIso(),
    status: input.status ?? 'generated'
  };
}

export async function saveVisualArtifact(ecosystemId, artifact) {
  await writeJson(artifactPath(ecosystemId, artifact.artifactId), artifact);
  return artifact;
}

export async function loadVisualArtifact(ecosystemId, artifactId) {
  return readJson(artifactPath(ecosystemId, artifactId), null);
}

export async function listVisualArtifacts(ecosystemId) {
  const directory = artifactDir(ecosystemId);
  const fs = await import('node:fs/promises');
  try {
    const entries = await fs.readdir(directory);
    const artifacts = await Promise.all(entries.filter((entry) => entry.endsWith('.json')).map((entry) => readJson(path.join(directory, entry))));
    return artifacts.sort((left, right) => (right.createdAt ?? '').localeCompare(left.createdAt ?? ''));
  } catch {
    return [];
  }
}
