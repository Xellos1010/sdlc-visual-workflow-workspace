import fs from 'node:fs/promises';
import path from 'node:path';

const MACHINE_OWNED_MARKERS = [
  'Foundry AGENTS instructions',
  'Foundry project instructions',
  'foundry orchestration overlay'
];

function normalizeText(value) {
  return value.replace(/\r\n/g, '\n');
}

function classifyOwnership(content) {
  if (content.trim().length === 0) {
    return { owner: 'empty', reasons: ['target-empty'] };
  }
  const hasMarker = MACHINE_OWNED_MARKERS.some((marker) => content.includes(marker));
  if (hasMarker) {
    return { owner: 'machine-owned', reasons: ['foundry-marker-detected'] };
  }
  return { owner: 'user-owned', reasons: ['missing-foundry-marker'] };
}

async function collectSourceFiles(sourceDir, currentDir = sourceDir, files = []) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const relativePath = path.relative(sourceDir, absolutePath);
    if (entry.isDirectory()) {
      files.push({ kind: 'directory', relativePath, sourcePath: absolutePath });
      await collectSourceFiles(sourceDir, absolutePath, files);
      continue;
    }
    files.push({ kind: 'file', relativePath, sourcePath: absolutePath });
  }
  return files;
}

/**
 * Applies ADR-004 option C projection behavior.
 * Detect existing state, generate candidate content, compute diff,
 * auto-apply only machine-owned or empty targets, and require explicit approval
 * for user-owned conflicts.
 */
export async function projectWithParityPolicy({
  sourceDir,
  targetDir,
  dryRun = false,
  approveUserOwnedConflicts = false
}) {
  const sourceEntries = await collectSourceFiles(sourceDir);
  const planned = [];
  const conflicts = [];
  let filesChanged = 0;

  for (const entry of sourceEntries) {
    const targetPath = path.join(targetDir, entry.relativePath);
    if (entry.kind === 'directory') {
      planned.push({
        type: 'directory',
        path: targetPath,
        status: 'generated',
        action: dryRun ? 'would-ensure-directory' : 'ensured-directory'
      });
      if (!dryRun) {
        await fs.mkdir(targetPath, { recursive: true });
      }
      continue;
    }

    const generatedRaw = await fs.readFile(entry.sourcePath, 'utf8');
    const generatedContent = normalizeText(generatedRaw);

    let currentContent = '';
    let exists = true;
    try {
      currentContent = normalizeText(await fs.readFile(targetPath, 'utf8'));
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        exists = false;
      } else {
        throw error;
      }
    }

    const ownership = exists ? classifyOwnership(currentContent) : { owner: 'empty', reasons: ['target-missing'] };
    const differs = !exists || currentContent !== generatedContent;

    let action = 'no-change';
    let status = 'in-sync';
    let approvalRequired = false;

    if (differs) {
      if (ownership.owner === 'user-owned' && !approveUserOwnedConflicts) {
        action = 'requires-approval';
        status = 'conflict';
        approvalRequired = true;
        conflicts.push({
          path: targetPath,
          owner: ownership.owner,
          reason: ownership.reasons.join(','),
          decision: 'manual-approval-required'
        });
      } else {
        action = dryRun ? 'would-apply' : 'applied';
        status = 'updated';
        if (!dryRun) {
          await fs.mkdir(path.dirname(targetPath), { recursive: true });
          await fs.writeFile(targetPath, generatedRaw, 'utf8');
        }
        filesChanged += 1;
      }
    }

    planned.push({
      type: 'file',
      path: targetPath,
      sourcePath: entry.sourcePath,
      owner: ownership.owner,
      ownershipReasons: ownership.reasons,
      differs,
      status,
      action,
      approvalRequired
    });
  }

  return {
    targetDir,
    dryRun,
    approveUserOwnedConflicts,
    filesChanged,
    approvalRequired: conflicts.length > 0,
    conflicts,
    planned
  };
}
