import fs from 'node:fs';
import path from 'node:path';
import { planChangeRequest } from '../../../packages/core/src/planner.mjs';
import { telemetryToChangeRequest } from '../../../services/telemetry-intake/src/index.mjs';
import { loadGraph, summarizeGraph } from '../../../packages/core/src/graph-store.mjs';
import { repoRoot } from '../../../packages/core/src/paths.mjs';

function readJsonArgument(fileArg) {
  const target = path.isAbsolute(fileArg) ? fileArg : path.join(repoRoot, fileArg);
  return JSON.parse(fs.readFileSync(target, 'utf8'));
}

function print(value) {
  process.stdout.write(JSON.stringify(value, null, 2) + '\n');
}

const [command, fileArg] = process.argv.slice(2);

if (!command) {
  console.error('Usage: node apps/orchestrator-cli/src/index.mjs <plan|incident|graph> <file>');
  process.exit(1);
}

if (command === 'plan') {
  print(planChangeRequest(readJsonArgument(fileArg)));
  process.exit(0);
}

if (command === 'incident') {
  const incident = readJsonArgument(fileArg);
  const changeRequest = telemetryToChangeRequest(incident);
  print({ changeRequest, plan: planChangeRequest(changeRequest) });
  process.exit(0);
}

if (command === 'graph') {
  const graph = fileArg ? readJsonArgument(fileArg) : loadGraph();
  print({ summary: summarizeGraph(graph), graph });
  process.exit(0);
}

console.error(`Unknown command: ${command}`);
process.exit(1);
