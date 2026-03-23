import path from 'node:path';
import { exists } from './io.mjs';

const CANDIDATES = [
  { id: 'cursor', paths: ['.cursor/rules', '.cursor/environment.json'] },
  { id: 'codex', paths: ['.codex'] },
  { id: 'claude', paths: ['.claude', 'CLAUDE.md', '.mcp.json'] },
  { id: 'agents', paths: ['AGENTS.md'] }
];

/**
 * Lists which agent-environment artifacts already exist under targetDir (non-destructive).
 *
 * @param {string} targetDir
 * @returns {Promise<object>}
 */
export async function detectEnvironmentArtifacts(targetDir) {
  const absolute = path.resolve(targetDir);
  const found = [];
  const missing = [];

  for (const group of CANDIDATES) {
    for (const rel of group.paths) {
      const full = path.join(absolute, rel);
      if (await exists(full)) {
        found.push({ group: group.id, relativePath: rel });
      } else {
        missing.push({ group: group.id, relativePath: rel });
      }
    }
  }

  return {
    targetDir: absolute,
    found,
    missing,
    summary: `${found.length} paths present, ${missing.length} checked paths absent`
  };
}
