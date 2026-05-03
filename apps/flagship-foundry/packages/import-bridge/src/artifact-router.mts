import path from 'node:path';
import type { NormalizedManifest } from './types.mts';

export interface RoutedArtifact {
  sourcePath: string;
  relativeTargetPath: string;
  artifactType: 'adr' | 'contract' | 'diagram' | 'document' | 'work-order-batch' | 'manifest';
}

function mapTargetPath(relativeSourcePath: string): RoutedArtifact['relativeTargetPath'] {
  if (/(^|\/)adr-.*\.md$/i.test(relativeSourcePath)) {
    return path.posix.join('docs/adr', path.posix.basename(relativeSourcePath));
  }
  if ((relativeSourcePath.includes('/contracts/') || relativeSourcePath.startsWith('contracts/')) && relativeSourcePath.endsWith('.json')) {
    return path.posix.join('apps/flagship-foundry/schemas', path.posix.basename(relativeSourcePath));
  }
  if (relativeSourcePath.endsWith('.mmd')) {
    return path.posix.join('docs/diagrams', path.posix.basename(relativeSourcePath));
  }
  if (relativeSourcePath.endsWith('work-order-batch.json')) {
    return path.posix.join('docs/imported', path.posix.basename(path.posix.dirname(relativeSourcePath)), 'work-order-batch.json');
  }
  if (relativeSourcePath.endsWith('foundry-import-manifest.json')) {
    return path.posix.join('docs/imported', path.posix.basename(path.posix.dirname(relativeSourcePath)), 'foundry-import-manifest.json');
  }
  return path.posix.join('docs/imported', path.posix.basename(path.posix.dirname(relativeSourcePath)), path.posix.basename(relativeSourcePath));
}

function classifyArtifact(relativeSourcePath: string): RoutedArtifact['artifactType'] {
  if (/(^|\/)adr-.*\.md$/i.test(relativeSourcePath)) return 'adr';
  if ((relativeSourcePath.includes('/contracts/') || relativeSourcePath.startsWith('contracts/')) && relativeSourcePath.endsWith('.json')) return 'contract';
  if (relativeSourcePath.endsWith('.mmd')) return 'diagram';
  if (relativeSourcePath.endsWith('work-order-batch.json')) return 'work-order-batch';
  if (relativeSourcePath.endsWith('foundry-import-manifest.json')) return 'manifest';
  return 'document';
}

export function routeArtifacts(workspaceRoot: string, manifest: NormalizedManifest): RoutedArtifact[] {
  return manifest.importOrder.map((artifactPath) => ({
    sourcePath: path.join(workspaceRoot, artifactPath),
    relativeTargetPath: mapTargetPath(artifactPath),
    artifactType: classifyArtifact(artifactPath)
  }));
}
