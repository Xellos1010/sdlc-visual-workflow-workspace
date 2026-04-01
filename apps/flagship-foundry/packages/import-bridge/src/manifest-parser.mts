import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { normalizeManifest } from './transforms/import-manifest.transform.mjs';
import type { NormalizedManifest } from './types.mjs';

export class ManifestParserError extends Error {
  readonly fieldPath: string;

  constructor(message: string, fieldPath: string) {
    super(message);
    this.name = 'ManifestParserError';
    this.fieldPath = fieldPath;
  }
}

function assertImportOrder(manifest: NormalizedManifest): void {
  const artifactPaths = new Set(manifest.artifacts.map((artifact) => artifact.path));
  for (const [index, orderedPath] of manifest.importOrder.entries()) {
    if (!artifactPaths.has(orderedPath)) {
      throw new ManifestParserError(
        `Import order entry '${orderedPath}' does not reference a declared artifact.`,
        `/importOrder/${index}`
      );
    }
  }
}

function assertRequiredFields(manifest: NormalizedManifest): void {
  if (!manifest.projectName) {
    throw new ManifestParserError('Manifest is missing projectName.', '/projectName');
  }
  if (!manifest.phaseId) {
    throw new ManifestParserError('Manifest is missing phaseId.', '/phaseId');
  }
  if (manifest.artifacts.length === 0) {
    throw new ManifestParserError('Manifest must declare at least one artifact.', '/artifacts');
  }
}

export async function parseManifest(manifestPath: string): Promise<NormalizedManifest> {
  const rawText = await readFile(manifestPath, 'utf8');
  const parsed = JSON.parse(rawText) as Record<string, unknown>;
  const normalized = normalizeManifest(parsed, manifestPath);
  assertRequiredFields(normalized);
  assertImportOrder(normalized);
  return normalized;
}

export function resolveArtifactPaths(workspaceRoot: string, manifest: NormalizedManifest): string[] {
  return manifest.importOrder.map((artifactPath) => path.join(workspaceRoot, artifactPath));
}
