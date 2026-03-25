import path from 'node:path';
import { ensureDir, nowIso, readJson, stateRoot, writeJson } from './io.mjs';

function debatePath(planId) {
  return path.join(stateRoot, 'debate', `${planId.replace(/[:/]+/g, '-')}.json`);
}

/**
 * @typedef {object} DebateRound
 * @property {string} role
 * @property {string} content
 * @property {string} [reconciliation]
 */

/**
 * Loads persisted debate rounds for a plan.
 *
 * @param {string} planId
 * @returns {Promise<{ planId: string, rounds: DebateRound[] }>}
 */
export async function loadDebate(planId) {
  const p = debatePath(planId);
  const data = await readJson(p, { planId, rounds: [] });
  return {
    planId,
    rounds: Array.isArray(data.rounds) ? data.rounds : []
  };
}

/**
 * Appends a debate round and persists.
 *
 * @param {string} planId
 * @param {DebateRound} round
 * @returns {Promise<object>}
 */
export async function appendDebateRound(planId, round) {
  await ensureDir(path.join(stateRoot, 'debate'));
  const current = await loadDebate(planId);
  current.rounds.push({
    ...round,
    at: nowIso()
  });
  await writeJson(debatePath(planId), current);
  return current;
}
