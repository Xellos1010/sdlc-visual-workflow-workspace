import fs from 'node:fs/promises';
import path from 'node:path';
import { repoRoot, tryJson } from './io.mjs';

async function listJsonFiles(relativeDir) {
  const directory = path.join(repoRoot, relativeDir);
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => path.join(directory, entry.name))
      .sort((left, right) => left.localeCompare(right));
  } catch {
    return [];
  }
}

async function listContentFiles(relativeDir) {
  const directory = path.join(repoRoot, relativeDir);
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && /\.(json|md|mdc|txt)$/i.test(entry.name))
      .map((entry) => path.join(directory, entry.name))
      .sort((left, right) => left.localeCompare(right));
  } catch {
    return [];
  }
}

async function loadJsonArrayFile(relativePath, fallback = []) {
  const absolutePath = path.join(repoRoot, relativePath);
  try {
    const content = await fs.readFile(absolutePath, 'utf8');
    return tryJson(content, fallback);
  } catch {
    return fallback;
  }
}

async function loadDirectoryJson(relativeDir) {
  const files = await listJsonFiles(relativeDir);
  const values = [];
  for (const fullPath of files) {
    const content = await fs.readFile(fullPath, 'utf8');
    const json = tryJson(content, null);
    if (json) {
      values.push(json);
    }
  }
  return values;
}

async function loadDirectoryMixed(relativeDir) {
  const files = await listContentFiles(relativeDir);
  const values = [];
  for (const fullPath of files) {
    const content = await fs.readFile(fullPath, 'utf8');
    const json = fullPath.endsWith('.json') ? tryJson(content, null) : null;
    values.push(
      json ?? {
        id: `${relativeDir}/${path.basename(fullPath)}`,
        title: path.basename(fullPath),
        content
      }
    );
  }
  return values;
}

export async function loadCatalogs() {
  const [
    runbooks,
    personas,
    guardrails,
    adapters,
    providers,
    knowledgePacks,
    sourcePresets,
    frameworkRegistry,
    reviewPolicies,
    approvalPolicies,
    modelRouting,
    visualizationPresets,
    agentBlueprints,
    skillBlueprints
  ] = await Promise.all([
    loadDirectoryJson('runbooks'),
    loadDirectoryJson('../.foundry/personas'),
    loadDirectoryJson('guardrails'),
    loadDirectoryJson('configs/terminal-adapters'),
    loadDirectoryJson('configs/provider-manifests'),
    loadJsonArrayFile('knowledge/catalogs/domain-packs.json'),
    loadJsonArrayFile('knowledge/catalogs/source-presets.json'),
    loadJsonArrayFile('knowledge/catalogs/framework-registry.json'),
    loadDirectoryJson('configs/review-policies'),
    loadDirectoryJson('configs/approval-policies'),
    loadDirectoryJson('configs/model-routing'),
    loadDirectoryJson('configs/visualization-presets'),
    loadDirectoryMixed('knowledge/templates/agent-blueprints'),
    loadDirectoryMixed('knowledge/templates/skill-blueprints')
  ]);

  return {
    runbooks,
    personas,
    guardrails,
    adapters,
    providers,
    knowledgePacks,
    sourcePresets,
    frameworkRegistry,
    reviewPolicies,
    approvalPolicies,
    modelRouting,
    visualizationPresets,
    agentBlueprints,
    skillBlueprints
  };
}
