import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { importWorkspace, defaultImportConfigForSample } from '../../../packages/core/src/import-pipeline.mjs';
import { createPlan, loadPlan } from '../../../packages/core/src/plans.mjs';
import { analyzeBlastRadius } from '../../../packages/core/src/blast-radius.mjs';
import { loadGraph } from '../../../packages/core/src/graph-store.mjs';
import { createRunForPlan, transitionRun } from '../../../packages/core/src/runs.mjs';
import { readJson, repoRoot } from '../../../packages/core/src/io.mjs';
import { ingestKnowledgeSources } from '../../../packages/core/src/knowledge-base.mjs';
import { analyzeKnowledgeGaps, writeGapReport } from '../../../packages/core/src/gap-analysis.mjs';
import { writeFocusView } from '../../../packages/core/src/focus-views.mjs';
import { scaffoldEnvironment } from '../../../packages/core/src/environment-scaffold.mjs';

const cliRoot = path.dirname(fileURLToPath(import.meta.url));

function resolveMaybe(relativeOrAbsolutePath) {
  return path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.resolve(repoRoot, relativeOrAbsolutePath);
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function readRequest(filePath, fallback = null) {
  if (!filePath) return fallback;
  return readJson(resolveMaybe(filePath), fallback);
}

async function bootstrap(importConfigPath, changeRequestPath, knowledgeManifestPath) {
  const importConfig = await readRequest(importConfigPath, defaultImportConfigForSample());
  const imported = await importWorkspace(importConfig);
  const knowledgeManifest = knowledgeManifestPath ? await readRequest(knowledgeManifestPath, null) : null;
  const knowledge = knowledgeManifest ? await ingestKnowledgeSources(knowledgeManifest) : null;
  const changeRequest = await readRequest(changeRequestPath, null);
  const plan = changeRequest ? await createPlan({ ...changeRequest, ecosystemId: imported.ecosystem.id }) : null;
  const gap = knowledge ? await analyzeKnowledgeGaps(imported.ecosystem, knowledge.knowledgeBase.id) : null;
  if (gap) {
    await writeGapReport(gap);
  }
  return { imported, knowledge, gap, plan };
}

async function main() {
  const [, , command, ...args] = process.argv;

  if (!command || ['help', '--help', '-h'].includes(command)) {
    printJson({
      usage: 'node apps/orchestrator-cli/src/main.mjs <command> [args]',
      commands: {
        import: 'import <importConfigPath>',
        visualize: 'visualize <importConfigPath>',
        profiles: 'profiles <importConfigPath>',
        blast: 'blast <blastRequestPath>',
        knowledge: 'knowledge <knowledgeManifestPath>',
        gap: 'gap <gapRequestPath>',
        focus: 'focus <focusRequestPath>',
        plan: 'plan <changeRequestPath>',
        bootstrap: 'bootstrap <importConfigPath> [changeRequestPath] [knowledgeManifestPath]',
        run: 'run <planId>',
        'show-plan': 'show-plan <planId>',
        'scaffold-env': 'scaffold-env <preset> <targetDir> [--dry-run]'
      },
      cliRoot
    });
    return;
  }

  if (command === 'import') {
    const request = await readRequest(args[0], defaultImportConfigForSample());
    printJson(await importWorkspace(request));
    return;
  }

  if (command === 'visualize') {
    const request = await readRequest(args[0], defaultImportConfigForSample());
    const imported = await importWorkspace(request);
    printJson(imported.visualizations);
    return;
  }

  if (command === 'profiles') {
    const request = await readRequest(args[0], defaultImportConfigForSample());
    const imported = await importWorkspace(request);
    printJson(imported.profiles);
    return;
  }

  if (command === 'blast') {
    const request = await readRequest(args[0], null);
    const graph = await loadGraph(request.ecosystemId, request.ecosystemId);
    printJson(analyzeBlastRadius(graph, request.query));
    return;
  }

  if (command === 'knowledge') {
    const manifest = await readRequest(args[0], null);
    printJson(await ingestKnowledgeSources(manifest));
    return;
  }

  if (command === 'gap') {
    const request = await readRequest(args[0], null);
    const ecosystem = await readJson(path.join(repoRoot, 'state', 'ecosystems', request.ecosystemId, 'manifest.json'));
    const report = await analyzeKnowledgeGaps(ecosystem, request.knowledgeBaseId ?? null);
    await writeGapReport(report);
    printJson(report);
    return;
  }

  if (command === 'focus') {
    const request = await readRequest(args[0], null);
    const graph = await loadGraph(request.ecosystemId, request.ecosystemId);
    printJson(await writeFocusView(graph, request.query));
    return;
  }

  if (command === 'plan') {
    const request = await readRequest(args[0], null);
    printJson(await createPlan(request));
    return;
  }

  if (command === 'bootstrap') {
    printJson(await bootstrap(args[0], args[1], args[2]));
    return;
  }

  if (command === 'run') {
    const planId = args[0];
    const run = await createRunForPlan(planId, { mode: 'simulate' });
    printJson(await transitionRun(run.id, 'start'));
    return;
  }

  if (command === 'show-plan') {
    printJson(await loadPlan(args[0]));
    return;
  }

  if (command === 'scaffold-env') {
    const preset = args[0];
    const targetDir = args[1];
    const dryRun = args.includes('--dry-run');
    printJson(await scaffoldEnvironment({ preset, targetDir: resolveMaybe(targetDir), dryRun }));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
