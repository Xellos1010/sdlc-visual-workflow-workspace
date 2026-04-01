import path from 'node:path';
import { parseManifest } from '../manifest-parser.mjs';
import { routeArtifacts } from '../artifact-router.mjs';
import { createStagePlan, stageArtifacts, commitStage } from '../staging.mjs';
import { writeContinuityState } from '../continuity-writer.mjs';
import { detectConflicts } from '../conflict-detector.mjs';
import { applyMergeResolutions, parseDecisionArgs, planMergeResolutions } from '../diff-merge.mjs';

function readFlag(args: string[], name: string): boolean {
  return args.includes(name);
}

function readSlug(args: string[]): string | undefined {
  const index = args.indexOf('--slug');
  return index >= 0 ? args[index + 1] : undefined;
}

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function runImportCommand(args: string[]): Promise<Record<string, unknown>> {
  const sourceDir = args[0];
  if (!sourceDir) throw new Error('Missing source directory.');
  const workspaceRoot = process.cwd();
  const manifest = await parseManifest(path.join(sourceDir, 'foundry-import-manifest.json'));
  const slug = readSlug(args) ?? slugify(manifest.projectName);
  const routed = routeArtifacts(sourceDir, manifest);
  const plan = await createStagePlan(path.join(workspaceRoot, '.foundry/staging'), slug, routed);
  const staged = await stageArtifacts(plan);
  const conflicts = await detectConflicts(
    routed.map((artifact) => ({
      targetPath: path.join(workspaceRoot, artifact.relativeTargetPath),
      incomingPath: path.join(plan.stageDir, artifact.relativeTargetPath)
    }))
  );
  const explicitDecisions = parseDecisionArgs(args);
  const resolutions = conflicts.length > 0
    ? await applyMergeResolutions(planMergeResolutions(conflicts, explicitDecisions, readFlag(args, '--force')))
    : [];
  const requiresManualReview = resolutions.some((item) => item.decision === 'manual-merge');

  if (conflicts.length > 0 && !readFlag(args, '--force') && explicitDecisions.size === 0) {
    return {
      command: 'import',
      slug,
      status: 'conflict',
      staged,
      conflicts
    };
  }

  const committed = readFlag(args, '--stage-only') || requiresManualReview
    ? []
    : await commitStage(plan, workspaceRoot, true);
  const continuityPath = readFlag(args, '--stage-only')
    ? null
    : await writeContinuityState({
        projectSlug: slug,
        importedArtifacts: committed.map((item) => path.relative(workspaceRoot, item)),
        manifest,
        workspaceRoot,
        force: readFlag(args, '--force')
      });

  return {
    command: 'import',
    slug,
    staged,
    conflicts,
    resolutions,
    committed,
    continuityPath,
    requiresManualReview
  };
}
