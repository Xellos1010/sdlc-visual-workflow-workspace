import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { createVerificationExportManifest } from './transforms/verification-bundle.transform.mjs';

export interface ExportPackagerInput {
  projectName: string;
  phaseId: string;
  targetDir: string;
}

const REQUIRED_EXPORT_FILES = [
  'verification-report.md',
  'evidence-bundle.md',
  'release-notes.md',
  'handoff.md',
  'learning-record.md',
  'artifact-manifest.json',
  'foundry-import-manifest.json'
] as const;

export async function createExportBundle(input: ExportPackagerInput): Promise<string[]> {
  await mkdir(input.targetDir, { recursive: true });
  const writtenPaths: string[] = [];

  for (const fileName of REQUIRED_EXPORT_FILES) {
    const outputPath = path.join(input.targetDir, fileName);
    const contents = fileName === 'foundry-import-manifest.json'
      ? JSON.stringify(createVerificationExportManifest({
          projectName: input.projectName,
          phaseId: input.phaseId,
          artifactPaths: REQUIRED_EXPORT_FILES.filter((item) => item !== 'foundry-import-manifest.json')
        }), null, 2)
      : `# ${fileName}\n`;
    await writeFile(outputPath, contents);
    writtenPaths.push(outputPath);
  }

  return writtenPaths;
}
