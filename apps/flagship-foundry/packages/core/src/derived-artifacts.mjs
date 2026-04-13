import path from 'node:path';
import crypto from 'node:crypto';
import { listFilesRecursive, readJson, readText, repoRoot, stateRoot } from './io.mjs';

const TEXT_EXTENSIONS = new Set(['.json', '.md', '.mmd', '.mdc', '.yaml', '.yml', '.txt']);

export function artifactTypeFromPath(relativePath, fallback = 'unknown') {
  const normalized = String(relativePath).replace(/\\/g, '/');
  const ecosystemPath = normalized.replace(/^.*?(?:state\/)?ecosystems\//i, 'ecosystems/');
  if (/docs\/adr\/.*\.md$/i.test(normalized)) return 'adr';
  if (/schemas\/.*\.schema\.json$/i.test(normalized)) return 'schema';
  if (/docs\/intent\/.*\.md$/i.test(normalized)) return 'intent-packet';
  if (/docs\/plan\/.*\.md$/i.test(normalized)) return 'plan-doc';
  if (/docs\/handoff\/.*\.md$/i.test(normalized)) return 'handoff-doc';
  if (/docs\/diagrams\/.*\.mmd$/i.test(normalized)) return 'diagram';
  if (/\.foundry\/projects\/[^/]+\/current-task\.json$/i.test(normalized)) return 'continuity-state';
  if (/operator\/context-carts\/.*\.json$/i.test(normalized)) return 'context-cart';
  if (/operator\/context-cart\.json$/i.test(normalized)) return 'context-cart';
  if (/operator\/refinement-sessions\/.*\.json$/i.test(normalized)) return 'requirement-refinement-session';
  if (/operator\/visual-artifacts\/.*\.json$/i.test(normalized)) return 'visual-artifact';
  if (/operator\/workspace-target\.json$/i.test(normalized)) return 'workspace-target';
  if (/operator\/planning-board\/.*\.json$/i.test(normalized)) return 'plan';
  if (/operator\/session-board\/.*\.json$/i.test(normalized)) return 'run';
  if (/operator\/budget-snapshot\.json$/i.test(normalized)) return 'execution-budget-snapshot';
  if (/ecosystems\/[^/]+\/manifest\.json$/i.test(ecosystemPath)) return 'ecosystem-manifest';
  if (/ecosystems\/[^/]+\/graph\.json$/i.test(ecosystemPath)) return 'artifact-graph';
  if (/ecosystems\/[^/]+\/analysis\/gap-report\.json$/i.test(ecosystemPath)) return 'gap-report';
  if (/ecosystems\/[^/]+\/import-report\.md$/i.test(ecosystemPath)) return 'knowledge-document';
  if (/ecosystems\/[^/]+\/operator\/context-carts\/.*\.json$/i.test(ecosystemPath)) return 'context-cart';
  if (/ecosystems\/[^/]+\/operator\/context-cart\.json$/i.test(ecosystemPath)) return 'context-cart';
  if (/ecosystems\/[^/]+\/operator\/refinement-sessions\/.*\.json$/i.test(ecosystemPath)) return 'requirement-refinement-session';
  if (/ecosystems\/[^/]+\/operator\/visual-artifacts\/.*\.json$/i.test(ecosystemPath)) return 'visual-artifact';
  if (/ecosystems\/[^/]+\/operator\/workspace-target\.json$/i.test(ecosystemPath)) return 'workspace-target';
  if (/ecosystems\/[^/]+\/operator\/planning-board\/.*\.json$/i.test(ecosystemPath)) return 'plan';
  if (/ecosystems\/[^/]+\/operator\/session-board\/.*\.json$/i.test(ecosystemPath)) return 'run';
  if (/ecosystems\/[^/]+\/operator\/budget-snapshot\.json$/i.test(ecosystemPath)) return 'execution-budget-snapshot';
  if (/ecosystems\/[^/]+\/live\/plans\/.*\.json$/i.test(ecosystemPath) || /ecosystems\/[^/]+\/completed\/plans\/.*\.json$/i.test(ecosystemPath)) return 'plan';
  if (/ecosystems\/[^/]+\/live\/runs\/.*\.json$/i.test(ecosystemPath) || /ecosystems\/[^/]+\/completed\/runs\/.*\.json$/i.test(ecosystemPath)) return 'run';
  if (/docs\/release\/.*\.md$/i.test(normalized)) return 'knowledge-document';
  return fallback;
}

export function artifactPhaseFromPath(relativePath) {
  const normalized = String(relativePath).replace(/\\/g, '/');
  if (normalized.includes('/docs/adr/')) return 'architect';
  if (normalized.includes('/schemas/')) return 'architect';
  if (normalized.includes('/docs/intent/')) return 'discover';
  if (normalized.includes('/docs/plan/')) return 'plan';
  if (normalized.includes('/docs/handoff/')) return 'release';
  if (normalized.includes('/state/ecosystems/')) return 'implement';
  if (normalized.includes('/.foundry/projects/')) return 'plan';
  return 'unknown';
}

export function artifactProjectFromPath(relativePath) {
  const normalized = String(relativePath).replace(/\\/g, '/');
  const segments = normalized.split('/');
  if (segments[0] === 'apps' && segments[1] === 'flagship-foundry') {
    if (segments[2] === 'apps' || segments[2] === 'packages') {
      return segments[3] ?? segments[2];
    }
    return segments[2] ?? 'apps';
  }
  if (segments[0] === 'docs') return 'docs';
  if (segments[0] === '.foundry') return 'foundry';
  if (segments[0] === 'state') return 'state';
  return segments[0] || 'unknown';
}

export function estimateTokenCount(text) {
  return Math.max(1, String(text ?? '').trim().split(/\s+/).filter(Boolean).length);
}

export function splitTextIntoChunks(text, maxWords = 350) {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const chunks = [];
  for (let index = 0; index < words.length; index += maxWords) {
    chunks.push(words.slice(index, index + maxWords).join(' '));
  }
  return chunks;
}

export function hashVector(text, dimensions = 16) {
  const hash = crypto.createHash('sha256').update(String(text ?? '')).digest();
  const vector = [];
  for (let index = 0; index < dimensions; index += 1) {
    const byte = hash[index % hash.length];
    vector.push(Number((byte / 255).toFixed(6)));
  }
  return vector;
}

export function trunc(text, maxChars = 240) {
  const value = String(text ?? '');
  return value.length <= maxChars ? value : `${value.slice(0, maxChars - 3)}...`;
}

export async function listArtifactFiles(rootDir, options = {}) {
  return listFilesRecursive(rootDir, {
    ...options,
    includeMatcher: (fullPath) => {
      const relative = path.relative(rootDir, fullPath).replace(/\\/g, '/');
      if (!TEXT_EXTENSIONS.has(path.extname(relative).toLowerCase())) {
        return false;
      }
      if (relative.includes('/node_modules/') || relative.includes('/dist/') || relative.includes('/coverage/')) {
        return false;
      }
      return options.includeMatcher ? options.includeMatcher(fullPath, relative) : true;
    }
  });
}

export async function readArtifactSource(filePath) {
  if (filePath.endsWith('.json')) {
    return readJson(filePath, null);
  }
  return readText(filePath);
}

export function defaultArtifactRoots(ecosystemId) {
  return [
    path.join(stateRoot, 'ecosystems', ecosystemId),
    repoRoot
  ];
}
