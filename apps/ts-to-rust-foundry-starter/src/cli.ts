import path from 'node:path';
import { runPipeline } from './pipeline.js';
import type { PipelineOptions } from './types.js';

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const options: PipelineOptions = {
    inputPath: path.resolve(parsed.input ?? ''),
    outputRoot: path.resolve(parsed.output ?? './artifacts'),
    tsconfigPath: parsed.tsconfig ? path.resolve(parsed.tsconfig) : undefined,
    useTsUml2: (parsed.useTsUml2 ?? parsed['use-tsuml2'] ?? 'auto') as PipelineOptions['useTsUml2'],
    command: (parsed.command ?? parsed._[0] ?? 'full') as PipelineOptions['command']
  };

  if (!options.inputPath) {
    throw new Error('Missing required --input argument.');
  }
  if (!['full', 'analyze', 'generate-rust'].includes(options.command)) {
    throw new Error(`Invalid command: ${options.command}`);
  }
  if (!['auto', 'always', 'never'].includes(options.useTsUml2)) {
    throw new Error(`Invalid --use-tsuml2 mode: ${options.useTsUml2}`);
  }

  await runPipeline(options);
  console.log(`Completed ${options.command} for ${options.inputPath}`);
  console.log(`Artifacts written to ${options.outputRoot}`);
}

function parseArgs(argv: string[]): Record<string, string | string[] | undefined> {
  const result: Record<string, string | string[] | undefined> = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (current.startsWith('--')) {
      const key = current.slice(2);
      const next = argv[index + 1];
      if (!next || next.startsWith('--')) {
        result[key] = 'true';
      } else {
        result[key] = next;
        index += 1;
      }
      continue;
    }
    (result._ as string[]).push(current);
  }
  return result;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
