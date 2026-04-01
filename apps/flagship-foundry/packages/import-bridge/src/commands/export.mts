import { createExportBundle } from '../export-packager.mjs';

export async function runExportCommand(args: string[]): Promise<Record<string, unknown>> {
  const [projectName, targetDir] = args;
  if (!projectName || !targetDir) throw new Error('Usage: export <project-slug> <target-dir>');
  const files = await createExportBundle({
    projectName,
    phaseId: `${projectName}-export`,
    targetDir
  });
  return { command: 'export', files };
}
