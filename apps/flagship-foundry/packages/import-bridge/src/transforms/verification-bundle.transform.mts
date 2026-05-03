import type { NormalizedManifest } from '../types.mjs';

export interface VerificationBundleManifestInput {
  projectName: string;
  phaseId: string;
  artifactPaths: string[];
}

export function createVerificationExportManifest(input: VerificationBundleManifestInput): NormalizedManifest {
  return {
    projectName: input.projectName,
    phaseId: input.phaseId,
    importStage: 'post_verification',
    targetWorkspace: 'chatgpt-verification-relay',
    artifacts: input.artifactPaths.map((artifactPath) => ({
      path: artifactPath,
      purpose: `Exported ${artifactPath}`,
      requiredBeforeExecution: false
    })),
    importOrder: [...input.artifactPaths],
    postImportActions: ['Review exported verification bundle in ChatGPT pipeline'],
    sourceFormat: 'schema-v1'
  };
}
