import path from 'node:path';
import { parseManifest } from '../manifest-parser.mjs';
import { validateNormalizedManifest } from '../validator.mjs';

export async function runValidateCommand(args: string[]): Promise<Record<string, unknown>> {
  const sourceDir = args[0];
  if (!sourceDir) throw new Error('Usage: validate <source-dir>');
  const manifest = await parseManifest(path.join(sourceDir, 'foundry-import-manifest.json'));
  await validateNormalizedManifest(
    manifest,
    path.join(process.cwd(), 'chatgpt-workspace-setup/foundry-phone-projects-kit/schemas')
  );
  return { command: 'validate', status: 'ok', artifacts: manifest.importOrder };
}
