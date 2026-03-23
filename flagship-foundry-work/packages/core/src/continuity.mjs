import path from 'node:path';
import { ensureDir, exists, nowIso, readJson, writeJson, writeText } from './io.mjs';

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
 * Returns the absolute path to the project directory under .codex/projects/.
 * Uses process.cwd() as the workspace root so commands executed from the
 * workspace root resolve correctly.
 */
function projectDir(projectName) {
  return path.join(process.cwd(), '.codex', 'projects', projectName);
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

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialize a new project with continuity state.
 *
 * Creates:
 *   .codex/projects/<projectName>/current-task.json
 *   .codex/projects/<projectName>/SDLC_CHARTER.md
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

  const relativePath = `.codex/projects/${projectName}`;

  const state = {
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
