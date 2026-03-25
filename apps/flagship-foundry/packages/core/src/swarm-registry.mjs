import path from 'node:path';
import { readJson, repoRoot } from './io.mjs';

const CONFIG_PATH = path.join(repoRoot, 'configs', 'swarm', 'role-routing.json');

let cache = null;

/**
 * Loads swarm role routing config (cached).
 *
 * @returns {Promise<object>}
 */
export async function loadSwarmRegistry() {
  if (cache) {
    return cache;
  }
  cache = await readJson(CONFIG_PATH);
  return cache;
}

/**
 * Returns ordered role names for a consensus pass (structured convergence, not voting).
 *
 * @returns {Promise<string[]>}
 */
export async function getDefaultSwarmSequence() {
  return [
    'specifier',
    'architect',
    'blastRadiusAnalyst',
    'adversary',
    'verifier',
    'builder'
  ];
}

/**
 * Orchestration stub: produces a structured artifact list for graph attachment.
 *
 * @param {object} input
 * @param {string} input.planId
 * @param {string} input.ecosystemId
 * @returns {Promise<object>}
 */
export async function buildSwarmOrchestrationStub(input) {
  const registry = await loadSwarmRegistry();
  const sequence = await getDefaultSwarmSequence();
  return {
    planId: input.planId,
    ecosystemId: input.ecosystemId,
    registryVersion: registry.version,
    sequence,
    status: 'pending',
    artifacts: sequence.map((role) => ({
      role,
      lane: registry.roles[role]?.defaultProviderLane ?? 'upstream-spec',
      emitted: false
    }))
  };
}
