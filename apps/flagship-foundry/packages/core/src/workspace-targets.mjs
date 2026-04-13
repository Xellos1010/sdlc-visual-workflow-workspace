import path from 'node:path';
import { makeId, nowIso, readJson, stateRoot, writeJson } from './io.mjs';

function operatorDir(ecosystemId) {
  return path.join(stateRoot, 'ecosystems', ecosystemId, 'operator');
}

function targetPath(ecosystemId) {
  return path.join(operatorDir(ecosystemId), 'workspace-target.json');
}

function folderToCandidate(folder, hostKind = 'vscode-compatible') {
  const workspaceRoot = folder.uri?.fsPath ?? folder.workspaceRoot ?? null;
  const displayName = folder.name ?? (workspaceRoot ? path.basename(workspaceRoot) : 'Workspace');
  return {
    targetId: makeId('target', workspaceRoot ?? displayName),
    workspaceRoot,
    displayName,
    workspaceFolderName: folder.name ?? null,
    ecosystemId: folder.ecosystemId ?? null,
    foundryRoot: folder.foundryRoot ?? null,
    hostKind,
    bindingMode: 'single-root',
    source: 'active-workspace',
    hostWindowId: folder.hostWindowId ?? null,
    selectionEvidence: folder.selectionEvidence ?? [],
    selectedBy: folder.selectedBy ?? 'cursor-companion',
    selectedAt: folder.selectedAt ?? nowIso(),
    status: folder.status ?? 'active',
    notes: folder.notes ?? []
  };
}

export function resolveWorkspaceCandidates(input = {}) {
  const folders = Array.isArray(input.workspaceFolders) ? input.workspaceFolders : [];
  const hostKind = input.hostKind ?? 'vscode-compatible';
  return folders
    .map((folder) => folderToCandidate(folder, hostKind))
    .filter((candidate) => candidate.workspaceRoot);
}

export function chooseWorkspaceTarget(input = {}) {
  const candidates = Array.isArray(input.candidates) ? input.candidates : [];
  if (candidates.length === 0) {
    throw new Error('No workspace candidates available');
  }

  if (candidates.length === 1 && !input.targetId) {
    const candidate = candidates[0];
    return {
      ...candidate,
      bindingMode: candidate.bindingMode ?? 'single-root',
      source: input.source ?? 'active-workspace',
      selectionEvidence: [...(candidate.selectionEvidence ?? []), 'single-candidate-auto-bind']
    };
  }

  const selected = candidates.find((candidate) => candidate.targetId === input.targetId);
  if (!selected) {
    throw new Error('Explicit workspace target selection required');
  }

  return {
    ...selected,
    bindingMode: 'multi-root-explicit',
    source: input.source ?? 'manual-selection',
    selectionEvidence: [...(selected.selectionEvidence ?? []), 'explicit-operator-selection']
  };
}

export async function saveWorkspaceTarget(ecosystemId, target) {
  const payload = {
    ...target,
    ecosystemId,
    selectedAt: target.selectedAt ?? nowIso(),
    status: target.status ?? 'active'
  };
  await writeJson(targetPath(ecosystemId), payload);
  return payload;
}

export async function loadWorkspaceTarget(ecosystemId) {
  return readJson(targetPath(ecosystemId), null);
}
