import fs from 'node:fs/promises';
import path from 'node:path';
import { repoRoot, tryJson } from './io.mjs';

async function loadDirectoryJson(relativeDir) {
  const directory = path.join(repoRoot, relativeDir);
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const values = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.json') && !entry.name.endsWith('.md') && !entry.name.endsWith('.mdc')) continue;
    const fullPath = path.join(directory, entry.name);
    const content = await fs.readFile(fullPath, 'utf8');
    const maybeJson = entry.name.endsWith('.json') ? tryJson(content, null) : null;
    values.push(
      maybeJson ?? {
        id: `${relativeDir}/${entry.name}`,
        title: entry.name,
        content
      }
    );
  }
  return values;
}

export async function loadCatalogs() {
  const [runbooks, personas, guardrails, adapters, providers] = await Promise.all([
    loadDirectoryJson('runbooks'),
    loadDirectoryJson('personas'),
    loadDirectoryJson('guardrails'),
    loadDirectoryJson('configs/terminal-adapters'),
    loadDirectoryJson('configs/provider-manifests')
  ]);

  return {
    runbooks,
    personas,
    guardrails,
    adapters,
    providers
  };
}
