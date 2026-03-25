import path from 'node:path';
import { ensureDir, exists, nowIso, readJson, repoRoot, writeJson, writeText } from './io.mjs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_PHASES = [
  'discover',
  'define',
  'visualize',
  'architect',
  'plan',
  'implement',
  'verify',
  'release',
  'operate',
  'diagnose',
  'improve'
];

const CONTRACT_AUTHORITY_PATH = 'flagship-foundry-work/schemas/continuity-state.schema.json';

// Maps 11-phase lifecycle stages to the legacy sdlcPhase enum required by the
// task-state schema.
const PHASE_TO_SDLC_PHASE = {
  discover: 'plan',
  define: 'plan',
  visualize: 'design',
  architect: 'design',
  plan: 'plan',
  implement: 'implement',
  verify: 'verify',
  release: 'release',
  operate: 'operate',
  diagnose: 'operate',
  improve: 'document'
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns the absolute path to the project directory under .foundry/projects/.
 * Uses process.cwd() as the workspace root so commands executed from the
 * workspace root resolve correctly (ADR-011).
 */
function projectDir(projectName) {
  return path.join(process.cwd(), '.foundry', 'projects', projectName);
}

/**
 * Returns the absolute path to the current-task.json for a project.
 */
function stateFilePath(projectName) {
  return path.join(projectDir(projectName), 'current-task.json');
}

/**
 * Returns the absolute path to the SDLC_CHARTER.md for a project.
 */
function charterFilePath(projectName) {
  return path.join(projectDir(projectName), 'SDLC_CHARTER.md');
}

/**
 * Build authority metadata for ADR-002 split:
 * - contract authority stays in flagship-foundry-work schema
 * - runtime instance authority is the active .foundry project state file (ADR-011)
 */
function authorityFor(projectName) {
  return {
    contractAuthority: CONTRACT_AUTHORITY_PATH,
    runtimeInstanceAuthority: `.foundry/projects/${projectName}/current-task.json`,
    derivedMirrors: []
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialize a new project with continuity state.
 *
 * Creates:
 *   .foundry/projects/<projectName>/current-task.json
 *   .foundry/projects/<projectName>/SDLC_CHARTER.md
 *
 * @param {string} projectName - Short identifier for the project.
 * @param {string} objective   - One-sentence description of the project goal.
 * @returns {Promise<object>}   The created task state object.
 */
export async function initProject(projectName, objective) {
  const dir = projectDir(projectName);
  await ensureDir(dir);

  const statePath = stateFilePath(projectName);
  const charterPath = charterFilePath(projectName);

  const relativePath = `.foundry/projects/${projectName}`;

  const state = {
    authority: authorityFor(projectName),
    project: {
      name: projectName,
      path: relativePath,
      worktree: relativePath,
      baseBranch: 'main',
      technicalBaseBranch: 'main',
      ruleReferences: []
    },
    objective,
    sdlcPhase: 'plan',
    lifecycleStage: 'discover',
    currentPhase: {
      id: 'discover',
      title: 'discover',
      status: 'pending',
      branch: 'main',
      notes: [objective],
      updatedAt: nowIso()
    },
    activeBranch: 'main',
    nextCommit: {
      branch: 'main',
      message: '',
      scope: []
    },
    nextCommandSet: [],
    blockedBy: [],
    artifacts: {},
    doneCriteria: []
  };

  await writeJson(statePath, state);

  const charterContent = [
    `# ${projectName} SDLC Charter`,
    '',
    `Inherits from: [Root Charter](../../../.claude/CHARTER.md)`,
    '',
    '## Objective',
    objective,
    '',
    '## Phase: discover (pending)',
    '',
    '## Constraints',
    '- (none yet)',
    '',
    '## Risks',
    '- (none yet)',
    ''
  ].join('\n');

  await writeText(charterPath, charterContent);

  return state;
}

/**
 * Read and return the current task state for a project.
 *
 * @param {string} projectName
 * @returns {Promise<object>}
 * @throws {Error} if the project state file does not exist.
 */
export async function readState(projectName) {
  const statePath = stateFilePath(projectName);

  if (!(await exists(statePath))) {
    throw new Error(
      `Project "${projectName}" not found. ` +
      `Expected state file at: ${statePath}. ` +
      `Run initProject("${projectName}", objective) to create it.`
    );
  }

  return readJson(statePath);
}

/**
 * Transition to a new lifecycle phase.
 *
 * Validates the phase name, updates currentPhase, sdlcPhase, and
 * lifecycleStage, then persists the result.
 *
 * @param {string} projectName
 * @param {string} newPhase    - Must be one of the 11 valid phase names.
 * @param {string} [notes]     - Optional note to record with the transition.
 * @returns {Promise<object>}  Updated state.
 */
export async function transitionPhase(projectName, newPhase, notes = '') {
  if (!VALID_PHASES.includes(newPhase)) {
    throw new Error(
      `Invalid phase "${newPhase}". Valid phases: ${VALID_PHASES.join(', ')}.`
    );
  }

  const state = await readState(projectName);

  state.currentPhase = {
    ...state.currentPhase,
    id: newPhase,
    title: newPhase,
    status: 'pending',
    notes: notes ? [notes] : [],
    updatedAt: nowIso()
  };
  state.sdlcPhase = PHASE_TO_SDLC_PHASE[newPhase];
  state.lifecycleStage = newPhase;

  await writeJson(stateFilePath(projectName), state);
  return state;
}

/**
 * Add a blocker to the current phase.
 *
 * Sets currentPhase.status to 'blocked' and appends the blocker description
 * to the blockedBy array.
 *
 * @param {string} projectName
 * @param {string} blocker     - Human-readable description of the blocking issue.
 * @returns {Promise<object>}  Updated state.
 */
export async function addBlocker(projectName, blocker) {
  const state = await readState(projectName);

  state.blockedBy = [...(state.blockedBy ?? []), blocker];
  state.currentPhase = {
    ...state.currentPhase,
    status: 'blocked',
    updatedAt: nowIso()
  };

  await writeJson(stateFilePath(projectName), state);
  return state;
}

/**
 * Resolve (remove) a blocker by its zero-based index in the blockedBy array.
 *
 * If no blockers remain after removal, currentPhase.status is set back to
 * 'in_progress'.
 *
 * @param {string} projectName
 * @param {number} blockerIndex - Zero-based index of the blocker to remove.
 * @returns {Promise<object>}   Updated state.
 */
export async function resolveBlocker(projectName, blockerIndex) {
  const state = await readState(projectName);

  const blockers = state.blockedBy ?? [];

  if (blockerIndex < 0 || blockerIndex >= blockers.length) {
    throw new Error(
      `Blocker index ${blockerIndex} is out of range. ` +
      `There are ${blockers.length} blocker(s) (indices 0–${blockers.length - 1}).`
    );
  }

  state.blockedBy = blockers.filter((_, index) => index !== blockerIndex);

  if (state.blockedBy.length === 0) {
    state.currentPhase = {
      ...state.currentPhase,
      status: 'in_progress',
      updatedAt: nowIso()
    };
  } else {
    state.currentPhase = {
      ...state.currentPhase,
      updatedAt: nowIso()
    };
  }

  await writeJson(stateFilePath(projectName), state);
  return state;
}

/**
 * Update done criteria.
 *
 * The schema stores doneCriteria as an array of strings. This function merges
 * incoming updates (which carry a `met` boolean) by storing each criterion as
 * either "[x] <criterion>" (met) or "[ ] <criterion>" (unmet), replacing any
 * existing entry for the same criterion text.
 *
 * @param {string} projectName
 * @param {Array<{criterion: string, met: boolean}>} criteriaUpdates
 * @returns {Promise<object>} Updated state.
 */
export async function updateDoneCriteria(projectName, criteriaUpdates) {
  const state = await readState(projectName);

  // Parse existing entries so we can do a keyed merge.
  const existing = new Map();
  for (const entry of state.doneCriteria ?? []) {
    const matched = entry.match(/^\[(.)\] (.+)$/);
    if (matched) {
      existing.set(matched[2], matched[1] === 'x');
    } else {
      // Plain string stored by earlier code — treat as unmet.
      existing.set(entry, false);
    }
  }

  for (const { criterion, met } of criteriaUpdates) {
    existing.set(criterion, Boolean(met));
  }

  state.doneCriteria = [...existing.entries()].map(
    ([criterion, met]) => `[${met ? 'x' : ' '}] ${criterion}`
  );

  await writeJson(stateFilePath(projectName), state);
  return state;
}

/**
 * Replace the nextCommandSet with a new array of shell command strings.
 *
 * @param {string}   projectName
 * @param {string[]} commands
 * @returns {Promise<object>} Updated state.
 */
export async function updateNextCommands(projectName, commands) {
  const state = await readState(projectName);

  state.nextCommandSet = Array.isArray(commands) ? commands : [];

  await writeJson(stateFilePath(projectName), state);
  return state;
}

/**
 * Returns the absolute path to the phase-lifecycle.json ontology file.
 */
function phaseLifecyclePath() {
  return path.join(repoRoot, 'ontology', 'phase-lifecycle.json');
}

/**
 * Get the policy for the current phase of a project.
 *
 * Reads the phase lifecycle ontology and returns the applicable principles,
 * agents, DoR/DoD, and artifacts for the current phase.
 *
 * @param {string} projectName
 * @returns {Promise<object>} Phase policy object.
 */
export async function getPhasePolicy(projectName) {
  const state = await readState(projectName);
  const currentPhaseId = state.currentPhase?.id ?? 'discover';

  const lifecycle = await readJson(phaseLifecyclePath());
  const phaseEntry = (lifecycle.phases ?? []).find((p) => p.id === currentPhaseId);

  if (!phaseEntry) {
    throw new Error(
      `Phase "${currentPhaseId}" not found in phase-lifecycle.json.`
    );
  }

  return {
    phase: phaseEntry.id,
    name: phaseEntry.name,
    objective: phaseEntry.objective,
    primaryAgent: phaseEntry.primaryAgent,
    supportingAgents: phaseEntry.supportingAgents ?? [],
    principles: phaseEntry.principles ?? [],
    guardrailPacks: phaseEntry.guardrailPacks ?? [],
    definitionOfReady: phaseEntry.definitionOfReady ?? [],
    definitionOfDone: phaseEntry.definitionOfDone ?? [],
    requiredArtifacts: phaseEntry.requiredArtifacts ?? [],
    skills: phaseEntry.skills ?? []
  };
}

/**
 * Check compliance of a project against its current phase requirements.
 *
 * Compares the current state against the phase's DoR/DoD criteria and
 * required artifacts.
 *
 * @param {string} projectName
 * @returns {Promise<object>} Compliance report.
 */
export async function checkCompliance(projectName) {
  const state = await readState(projectName);
  const policy = await getPhasePolicy(projectName);

  const phaseStatus = state.currentPhase?.status ?? 'unknown';
  const blockers = state.blockedBy ?? [];

  // Parse doneCriteria from state: "[x] criterion" or "[ ] criterion" or plain string.
  const stateCriteriaMap = new Map();
  for (const entry of state.doneCriteria ?? []) {
    const matched = entry.match(/^\[(.)\] (.+)$/);
    if (matched) {
      stateCriteriaMap.set(matched[2], matched[1] === 'x');
    } else {
      stateCriteriaMap.set(entry, false);
    }
  }

  // DoR check — compare phase definitionOfReady against state doneCriteria.
  const dorCriteria = policy.definitionOfReady.map((criterion) => ({
    criterion,
    met: stateCriteriaMap.get(criterion) === true
  }));
  const dorMet = dorCriteria.filter((c) => c.met).length;

  // DoD check — compare phase definitionOfDone against state doneCriteria.
  const dodCriteria = policy.definitionOfDone.map((criterion) => ({
    criterion,
    met: stateCriteriaMap.get(criterion) === true
  }));
  const dodMet = dodCriteria.filter((c) => c.met).length;

  // Artifact check — compare requiredArtifacts against state artifacts keys.
  const stateArtifactKeys = Object.keys(state.artifacts ?? {});
  const missing = policy.requiredArtifacts.filter(
    (required) => !stateArtifactKeys.includes(required)
  );
  const present = policy.requiredArtifacts.filter(
    (required) => stateArtifactKeys.includes(required)
  );

  // Overall status.
  const hasBlockers = blockers.length > 0;
  const allDodMet = dodMet === policy.definitionOfDone.length;
  const noMissingArtifacts = missing.length === 0;

  let overallStatus;
  if (!hasBlockers && allDodMet && noMissingArtifacts) {
    overallStatus = 'compliant';
  } else if (dodMet === 0 && present.length === 0) {
    overallStatus = 'non-compliant';
  } else {
    overallStatus = 'partial';
  }

  return {
    project: state.project?.name ?? projectName,
    phase: policy.phase,
    phaseStatus,
    dorStatus: {
      total: dorCriteria.length,
      met: dorMet,
      criteria: dorCriteria
    },
    dodStatus: {
      total: dodCriteria.length,
      met: dodMet,
      criteria: dodCriteria
    },
    artifactStatus: {
      required: policy.requiredArtifacts,
      present,
      missing
    },
    blockers,
    overallStatus
  };
}

/**
 * Build a structured resume checklist for a project that was interrupted.
 *
 * @param {string} projectName
 * @returns {Promise<object>} Resume checklist object.
 */
export async function getResumeChecklist(projectName) {
  const state = await readState(projectName);

  const phase = state.currentPhase?.id ?? 'unknown';
  const phaseStatus = state.currentPhase?.status ?? 'unknown';
  const branch = state.activeBranch ?? 'main';
  const blockers = state.blockedBy ?? [];
  const nextCommands = state.nextCommandSet ?? [];
  const doneCriteria = state.doneCriteria ?? [];

  const resumeSteps = [
    `1. Verify you are on branch: ${branch}`,
    `2. Current phase: ${phase} (${phaseStatus})`
  ];

  if (nextCommands.length > 0) {
    resumeSteps.push(
      `3. Run verification commands:\n${nextCommands.map((cmd) => `   - ${cmd}`).join('\n')}`
    );
  } else {
    resumeSteps.push('3. Run verification commands: (none recorded)');
  }

  if (blockers.length > 0) {
    resumeSteps.push(
      `4. Address blockers:\n${blockers.map((b, i) => `   [${i}] ${b}`).join('\n')}`
    );
  } else {
    resumeSteps.push('4. Address blockers: (none)');
  }

  if (doneCriteria.length > 0) {
    resumeSteps.push(
      `5. Complete done criteria:\n${doneCriteria.map((c) => `   ${c}`).join('\n')}`
    );
  } else {
    resumeSteps.push('5. Complete done criteria: (none defined)');
  }

  return {
    project: state.project?.name ?? projectName,
    currentPhase: phase,
    phaseStatus,
    activeBranch: branch,
    blockers,
    nextCommands,
    doneCriteria,
    resumeSteps
  };
}
