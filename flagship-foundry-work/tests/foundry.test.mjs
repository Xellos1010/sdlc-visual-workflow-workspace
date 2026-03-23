import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { importWorkspace } from '../packages/core/src/import-pipeline.mjs';
import { createPlan } from '../packages/core/src/plans.mjs';
import { createRunForPlan, transitionRun } from '../packages/core/src/runs.mjs';
import { ingestKnowledgeSources } from '../packages/core/src/knowledge-base.mjs';
import { analyzeKnowledgeGaps } from '../packages/core/src/gap-analysis.mjs';
import { loadGraph } from '../packages/core/src/graph-store.mjs';
import { buildFocusView } from '../packages/core/src/focus-views.mjs';
import { repoRoot } from '../packages/core/src/io.mjs';

const sampleImportConfig = JSON.parse(await fs.readFile(path.join(repoRoot, 'examples/current-workspace/import-config.json'), 'utf8'));
const sampleChangeRequest = JSON.parse(await fs.readFile(path.join(repoRoot, 'examples/current-workspace/requests/initialize-sdlc-pipeline.json'), 'utf8'));
const adversarialChangeRequest = JSON.parse(await fs.readFile(path.join(repoRoot, 'examples/current-workspace/requests/adversarial-change-request.json'), 'utf8'));
const knowledgeManifest = JSON.parse(await fs.readFile(path.join(repoRoot, 'examples/knowledge-sources/input/foundry-foundational-docs.manifest.json'), 'utf8'));

async function cleanup() {
  const targets = [
    path.join(repoRoot, 'state/ecosystems/web-automation-workspace'),
    path.join(repoRoot, 'state/knowledge/foundry-foundational-docs')
  ];
  for (const target of targets) {
    await rmWithRetry(target);
  }
}

async function rmWithRetry(targetPath, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await fs.rm(targetPath, { recursive: true, force: true });
      return;
    } catch (error) {
      const code = error?.code;
      const isTransient = code === 'ENOTEMPTY' || code === 'EBUSY' || code === 'EPERM';
      if (!isTransient || attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 20));
    }
  }
}

test('import pipeline builds current workspace ecosystem graph', async () => {
  await cleanup();
  const result = await importWorkspace(sampleImportConfig);
  assert.equal(result.ecosystem.topology.kind, 'nx-monorepo');
  assert.ok(result.ecosystem.projects.length >= 40);
  assert.ok(result.ecosystem.frameworks.some((framework) => framework.id === 'framework:nx'));
  assert.ok(result.ecosystem.platforms.some((platform) => platform.id === 'platform:chrome-extension-mv3'));
  assert.ok(result.profiles.some((profile) => profile.domain === 'chrome-extension-mv3'));
  assert.ok(result.profiles.some((profile) => profile.domain === 'knowledge-ingestion-and-rag'));
  assert.ok(result.visualizations.length >= 5);
});

test('knowledge ingestion creates a reusable foundational knowledge base', async () => {
  await cleanup();
  const result = await ingestKnowledgeSources(knowledgeManifest);
  assert.equal(result.knowledgeBase.id, 'foundry-foundational-docs');
  assert.ok(result.documents.length >= 20);
  assert.ok(result.knowledgeBase.packCoverage.length >= 3);
  assert.ok(result.documents.some((document) => document.sourceId === 'source:cursor-learning-path'));
});

test('gap analysis identifies required packs and recommendations', async () => {
  await cleanup();
  const imported = await importWorkspace(sampleImportConfig);
  await ingestKnowledgeSources(knowledgeManifest);
  const report = await analyzeKnowledgeGaps(imported.ecosystem, 'foundry-foundational-docs');
  assert.equal(report.ecosystemId, imported.ecosystem.id);
  assert.ok(report.requiredPacks.length >= 5);
  assert.ok(report.coverage.length >= 5);
  assert.ok(typeof report.summary.incompletePackCount === 'number');
});

test('plan creation defaults to pending approval and expands blast radius', async () => {
  await importWorkspace(sampleImportConfig);
  const plan = await createPlan(sampleChangeRequest);
  assert.equal(plan.status, 'pending-approval');
  assert.ok(plan.blastRadius.summary.totalImpacted >= 1);
  assert.ok(plan.projectPlans.length >= 1);
  assert.ok(plan.projectPlans.every((projectPlan) => projectPlan.tasks.length >= 5));
});

test('high-risk adversarial plan adds debate and reconciliation tasks', async () => {
  await importWorkspace(sampleImportConfig);
  const plan = await createPlan(adversarialChangeRequest);
  assert.equal(plan.reviewPolicy.debateRounds, 2);
  assert.ok(plan.projectPlans.length >= 1);
  const phaseTokens = plan.projectPlans.flatMap((projectPlan) => projectPlan.tasks.map((task) => task.phaseToken));
  assert.ok(phaseTokens.includes('challenge:1'));
  assert.ok(phaseTokens.includes('reconcile:1'));
  assert.ok(phaseTokens.includes('challenge:2'));
});

test('focus view builds a drilldown mermaid for impacted surfaces', async () => {
  await importWorkspace(sampleImportConfig);
  const graph = await loadGraph('web-automation-workspace', 'web-automation-workspace');
  const view = buildFocusView(graph, 'service worker messaging storage sidepanel');
  assert.equal(view.ecosystemId, 'web-automation-workspace');
  assert.ok(view.impactedNodes.length >= 1);
  assert.match(view.mermaid, /flowchart LR/);
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
