import path from 'node:path';
import { parseManifest } from '../manifest-parser.mjs';
import { routeArtifacts } from '../artifact-router.mjs';

export async function runDryRunCommand(args: string[]): Promise<Record<string, unknown>> {
  const sourceDir = args[0];
  if (!sourceDir) throw new Error('Usage: dry-run <source-dir>');
  const manifest = await parseManifest(path.join(sourceDir, 'foundry-import-manifest.json'));
  const routes = routeArtifacts(sourceDir, manifest);
  return {
    command: 'dry-run',
    importStage: manifest.importStage,
    routes
  };
}
