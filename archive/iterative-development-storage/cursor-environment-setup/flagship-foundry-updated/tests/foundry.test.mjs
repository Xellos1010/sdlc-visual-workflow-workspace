import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { importWorkspace } from '../packages/core/src/import-pipeline.mjs';
import { createPlan } from '../packages/core/src/plans.mjs';
import { createRunForPlan, transitionRun } from '../packages/core/src/runs.mjs';
import { repoRoot, readJson } from '../packages/core/src/io.mjs';

const sampleImportConfig = JSON.parse(await fs.readFile(path.join(repoRoot, 'examples/current-workspace/import-config.json'), 'utf8'));
const sampleChangeRequest = JSON.parse(await fs.readFile(path.join(repoRoot, 'examples/current-workspace/requests/initialize-sdlc-pipeline.json'), 'utf8'));

async function cleanup() {
  await fs.rm(path.join(repoRoot, 'state/ecosystems/web-automation-workspace'), { recursive: true, force: true });
}

test('import pipeline builds current workspace ecosystem graph', async () => {
  await cleanup();
  const result = await importWorkspace(sampleImportConfig);
  assert.equal(result.ecosystem.topology.kind, 'nx-monorepo');
  assert.ok(result.ecosystem.projects.length >= 40);
  assert.ok(result.ecosystem.frameworks.some((framework) => framework.id === 'framework:nx'));
  assert.ok(result.ecosystem.platforms.some((platform) => platform.id === 'platform:chrome-extension-mv3'));
  assert.ok(result.profiles.some((profile) => profile.domain === 'chrome-extension-mv3'));
  assert.ok(result.visualizations.length >= 4);
});

test('plan creation defaults to pending approval and expands blast radius', async () => {
  await importWorkspace(sampleImportConfig);
  const plan = await createPlan(sampleChangeRequest);
  assert.equal(plan.status, 'pending-approval');
  assert.ok(plan.blastRadius.summary.totalImpacted >= 1);
  assert.ok(plan.projectPlans.length >= 1);
  assert.ok(plan.projectPlans.every((projectPlan) => projectPlan.tasks.length >= 5));
});

test('runs can start pause resume and stop', async () => {
  await importWorkspace(sampleImportConfig);
  const autoPlan = await createPlan({
    ...sampleChangeRequest,
    title: `${sampleChangeRequest.title} auto approved`,
    approval: { mode: 'auto', autoApprove: true, autoStartOnApproval: true }
  });
  const run = await createRunForPlan(autoPlan.id, { mode: 'simulate' });
  const started = await transitionRun(run.id, 'start');
  assert.equal(started.status, 'running');
  const paused = await transitionRun(run.id, 'pause');
  assert.equal(paused.status, 'paused');
  const resumed = await transitionRun(run.id, 'resume');
  assert.equal(resumed.status, 'running');
  const stopped = await transitionRun(run.id, 'stop');
  assert.equal(stopped.status, 'stopped');
});
