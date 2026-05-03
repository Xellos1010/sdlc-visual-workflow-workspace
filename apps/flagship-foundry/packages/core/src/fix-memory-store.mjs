import path from 'node:path';
import { appendFile } from 'node:fs/promises';
import { ensureDir, stateRoot, nowIso } from './io.mjs';

/**
 * Appends a fix-memory style record to state/fix-memory/records.jsonl.
 *
 * @param {object} record - Fields aligned with fix-memory.schema.json (problem, environment, solution, designParadigm, ...).
 * @returns {Promise<void>}
 */
export async function appendFixMemoryRecord(record) {
  const dir = path.join(stateRoot, 'fix-memory');
  await ensureDir(dir);
  const line = `${JSON.stringify({ ...record, recordedAt: nowIso() })}\n`;
  await appendFile(path.join(dir, 'records.jsonl'), line, 'utf8');
}
