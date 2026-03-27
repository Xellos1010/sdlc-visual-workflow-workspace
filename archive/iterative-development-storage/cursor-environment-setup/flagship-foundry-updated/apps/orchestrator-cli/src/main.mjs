import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { importWorkspace, defaultImportConfigForSample } from '../../../packages/core/src/import-pipeline.mjs';
import { createPlan, loadPlan } from '../../../packages/core/src/plans.mjs';
import { analyzeBlastRadius } from '../../../packages/core/src/blast-radius.mjs';
import { loadGraph } from '../../../packages/core/src/graph-store.mjs';
import { createRunForPlan, transitionRun } from '../../../packages/core/src/runs.mjs';
import { readJson, writeJson, repoRoot } from '../../../packages/core/src/io.mjs';

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

async function bootstrap(importConfigPath, changeRequestPath) {
  const importConfig = await readRequest(importConfigPath, defaultImportConfigForSample());
  const imported = await importWorkspace(importConfig);
  const changeRequest = await readRequest(changeRequestPath, null);
  if (!changeRequest) {
    return imported;
  }
  const plan = await createPlan({ ...changeRequest, ecosystemId: imported.ecosystem.id });
  return { imported, plan };
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
        plan: 'plan <changeRequestPath>',
        bootstrap: 'bootstrap <importConfigPath> <changeRequestPath>',
        run: 'run <planId>'
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

  if (command === 'plan') {
    const request = await readRequest(args[0], null);
    printJson(await createPlan(request));
    return;
  }

  if (command === 'bootstrap') {
    printJson(await bootstrap(args[0], args[1]));
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

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
