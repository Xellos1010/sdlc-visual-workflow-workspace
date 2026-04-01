import path from 'node:path';
import { access, readFile } from 'node:fs/promises';

export interface ConflictCandidate {
  targetPath: string;
  incomingPath: string;
}

export interface ConflictFieldDiff {
  fieldPath: string;
  existingValue: unknown;
  incomingValue: unknown;
}

export interface ConflictRecord {
  targetPath: string;
  incomingPath: string;
  kind: 'file' | 'continuity';
  diff: string;
  fieldDiffs: ConflictFieldDiff[];
}

async function readIfExists(filePath: string): Promise<string | null> {
  try {
    await access(filePath);
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

function parseJson(text: string): unknown | null {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function flattenJson(value: unknown, prefix = ''): Map<string, unknown> {
  const result = new Map<string, unknown>();
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      for (const [nestedPath, nestedValue] of flattenJson(entry, `${prefix}/${index}`)) {
        result.set(nestedPath, nestedValue);
      }
    });
    return result;
  }
  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      for (const [nestedPath, nestedValue] of flattenJson(nested, `${prefix}/${key}`)) {
        result.set(nestedPath, nestedValue);
      }
    }
    return result;
  }
  result.set(prefix || '/', value);
  return result;
}

function createFieldDiffs(existingContent: string, incomingContent: string): ConflictFieldDiff[] {
  const existing = parseJson(existingContent);
  const incoming = parseJson(incomingContent);
  if (!existing || !incoming) return [];
  const existingMap = flattenJson(existing);
  const incomingMap = flattenJson(incoming);
  const keys = new Set([...existingMap.keys(), ...incomingMap.keys()]);

  return [...keys]
    .filter((key) => JSON.stringify(existingMap.get(key)) !== JSON.stringify(incomingMap.get(key)))
    .sort()
    .map((fieldPath) => ({
      fieldPath,
      existingValue: existingMap.get(fieldPath),
      incomingValue: incomingMap.get(fieldPath)
    }));
}

export function createUnifiedDiff(targetPath: string, existingContent: string, incomingContent: string): string {
  const existingLines = existingContent.split('\n');
  const incomingLines = incomingContent.split('\n');
  const maxLines = Math.max(existingLines.length, incomingLines.length);
  const diffLines = [`--- existing/${path.basename(targetPath)}`, `+++ incoming/${path.basename(targetPath)}`, '@@'];

  for (let index = 0; index < maxLines; index += 1) {
    const existingLine = existingLines[index];
    const incomingLine = incomingLines[index];
    if (existingLine === incomingLine) {
      if (existingLine !== undefined) diffLines.push(` ${existingLine}`);
      continue;
    }
    if (existingLine !== undefined) diffLines.push(`-${existingLine}`);
    if (incomingLine !== undefined) diffLines.push(`+${incomingLine}`);
  }

  return diffLines.join('\n');
}

export async function detectConflicts(candidates: ConflictCandidate[]): Promise<ConflictRecord[]> {
  const conflicts: ConflictRecord[] = [];

  for (const candidate of candidates) {
    const existingContent = await readIfExists(candidate.targetPath);
    if (existingContent === null) continue;
    const incomingContent = await readFile(candidate.incomingPath, 'utf8');
    if (existingContent === incomingContent) continue;

    const isContinuityConflict = candidate.targetPath.endsWith('current-task.json');
    conflicts.push({
      targetPath: candidate.targetPath,
      incomingPath: candidate.incomingPath,
      kind: isContinuityConflict ? 'continuity' : 'file',
      diff: createUnifiedDiff(candidate.targetPath, existingContent, incomingContent),
      fieldDiffs: isContinuityConflict ? createFieldDiffs(existingContent, incomingContent) : []
    });
  }

  return conflicts;
}
