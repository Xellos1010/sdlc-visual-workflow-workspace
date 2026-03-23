import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  initProject,
  readState,
  transitionPhase,
  addBlocker,
  resolveBlocker,
  getResumeChecklist,
} from '../packages/core/src/continuity.mjs';

// ---------------------------------------------------------------------------
// Test isolation helpers
// ---------------------------------------------------------------------------

let tmpDir;
let originalCwd;

async function setupTmpCwd() {
  originalCwd = process.cwd();
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'continuity-test-'));
  // continuity.mjs resolves .codex/projects/ from process.cwd()
  process.chdir(tmpDir);
}

async function teardownTmpCwd() {
  process.chdir(originalCwd);
  await fs.rm(tmpDir, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('initProject creates a project directory and valid current-task.json', async () => {
  await setupTmpCwd();
  try {
    const state = await initProject('test-project', 'Build something great');

    // Verify returned state shape
    assert.equal(state.project.name, 'test-project');
    assert.equal(state.authority.contractAuthority, 'flagship-foundry-work/schemas/continuity-state.schema.json');
    assert.equal(
      state.authority.runtimeInstanceAuthority,
      '.codex/projects/test-project/current-task.json'
    );
    assert.ok(Array.isArray(state.authority.derivedMirrors));
    assert.equal(state.objective, 'Build something great');
    assert.equal(state.lifecycleStage, 'discover');
    assert.equal(state.sdlcPhase, 'plan');
    assert.equal(state.currentPhase.id, 'discover');
    assert.equal(state.currentPhase.status, 'pending');
    assert.equal(state.activeBranch, 'main');
    assert.ok(Array.isArray(state.blockedBy));
    assert.ok(Array.isArray(state.nextCommandSet));

    // Verify the file exists on disk
    const statePath = path.join(tmpDir, '.codex', 'projects', 'test-project', 'current-task.json');
    const raw = await fs.readFile(statePath, 'utf8');
    const parsed = JSON.parse(raw);
    assert.equal(parsed.project.name, 'test-project');
    assert.equal(parsed.authority.contractAuthority, 'flagship-foundry-work/schemas/continuity-state.schema.json');

    // Verify the charter was created
    const charterPath = path.join(tmpDir, '.codex', 'projects', 'test-project', 'SDLC_CHARTER.md');
    const charter = await fs.readFile(charterPath, 'utf8');
    assert.ok(charter.includes('test-project SDLC Charter'));
    assert.ok(charter.includes('Build something great'));
  } finally {
    await teardownTmpCwd();
  }
});

test('readState returns the created state', async () => {
  await setupTmpCwd();
  try {
    await initProject('read-test', 'Test readState');
    const state = await readState('read-test');

    assert.equal(state.project.name, 'read-test');
    assert.equal(state.objective, 'Test readState');
    assert.equal(state.lifecycleStage, 'discover');
  } finally {
    await teardownTmpCwd();
  }
});

test('readState throws for non-existent project', async () => {
  await setupTmpCwd();
  try {
    await assert.rejects(
      () => readState('does-not-exist'),
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes('does-not-exist'));
        return true;
      }
    );
  } finally {
    await teardownTmpCwd();
  }
});

test('transitionPhase updates the phase correctly', async () => {
  await setupTmpCwd();
  try {
    await initProject('phase-test', 'Test phase transitions');
    const updated = await transitionPhase('phase-test', 'implement', 'Moving to implementation');

    assert.equal(updated.lifecycleStage, 'implement');
    assert.equal(updated.currentPhase.id, 'implement');
    assert.equal(updated.currentPhase.status, 'pending');
    assert.equal(updated.sdlcPhase, 'implement');
    assert.ok(updated.currentPhase.notes.includes('Moving to implementation'));

    // Verify persisted to disk
    const fromDisk = await readState('phase-test');
    assert.equal(fromDisk.lifecycleStage, 'implement');
  } finally {
    await teardownTmpCwd();
  }
});

test('transitionPhase rejects invalid phase names', async () => {
  await setupTmpCwd();
  try {
    await initProject('invalid-phase-test', 'Test invalid phase');
    await assert.rejects(
      () => transitionPhase('invalid-phase-test', 'not-a-real-phase'),
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes('not-a-real-phase'));
        assert.ok(err.message.toLowerCase().includes('invalid'));
        return true;
      }
    );
  } finally {
    await teardownTmpCwd();
  }
});

test('addBlocker adds to blockedBy and sets status to blocked', async () => {
  await setupTmpCwd();
  try {
    await initProject('blocker-test', 'Test blockers');
    const updated = await addBlocker('blocker-test', 'Waiting for API credentials');

    assert.equal(updated.blockedBy.length, 1);
    assert.equal(updated.blockedBy[0], 'Waiting for API credentials');
    assert.equal(updated.currentPhase.status, 'blocked');

    // Adding a second blocker accumulates them
    const updated2 = await addBlocker('blocker-test', 'Waiting for design review');
    assert.equal(updated2.blockedBy.length, 2);
    assert.equal(updated2.currentPhase.status, 'blocked');
  } finally {
    await teardownTmpCwd();
  }
});

test('resolveBlocker removes blocker and restores status to in_progress', async () => {
  await setupTmpCwd();
  try {
    await initProject('resolve-test', 'Test resolving blockers');
    await addBlocker('resolve-test', 'First blocker');
    await addBlocker('resolve-test', 'Second blocker');

    // Resolve the first blocker (index 0)
    const afterFirst = await resolveBlocker('resolve-test', 0);
    assert.equal(afterFirst.blockedBy.length, 1);
    assert.equal(afterFirst.blockedBy[0], 'Second blocker');
    // Still blocked because one remains
    assert.equal(afterFirst.currentPhase.status, 'blocked');

    // Resolve the remaining blocker
    const afterSecond = await resolveBlocker('resolve-test', 0);
    assert.equal(afterSecond.blockedBy.length, 0);
    assert.equal(afterSecond.currentPhase.status, 'in_progress');
  } finally {
    await teardownTmpCwd();
  }
});

test('getResumeChecklist returns structured checklist with all fields', async () => {
  await setupTmpCwd();
  try {
    await initProject('checklist-test', 'Test resume checklist');
    await transitionPhase('checklist-test', 'architect', 'Architecture phase');
    await addBlocker('checklist-test', 'Need ADR approval');

    const checklist = await getResumeChecklist('checklist-test');

    assert.equal(checklist.project, 'checklist-test');
    assert.equal(checklist.currentPhase, 'architect');
    assert.equal(checklist.phaseStatus, 'blocked');
    assert.equal(checklist.activeBranch, 'main');
    assert.ok(Array.isArray(checklist.blockers));
    assert.equal(checklist.blockers.length, 1);
    assert.equal(checklist.blockers[0], 'Need ADR approval');
    assert.ok(Array.isArray(checklist.nextCommands));
    assert.ok(Array.isArray(checklist.doneCriteria));
    assert.ok(Array.isArray(checklist.resumeSteps));
    assert.ok(checklist.resumeSteps.length >= 4);
    assert.ok(checklist.resumeSteps.some((step) => step.includes('architect')));
    assert.ok(checklist.resumeSteps.some((step) => step.includes('main')));
  } finally {
    await teardownTmpCwd();
  }
});
