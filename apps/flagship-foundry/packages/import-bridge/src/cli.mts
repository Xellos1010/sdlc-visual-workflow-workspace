import { runImportCommand } from './commands/import.mjs';
import { runExportCommand } from './commands/export.mjs';
import { runValidateCommand } from './commands/validate.mjs';
import { runDryRunCommand } from './commands/dry-run.mjs';

export async function runCli(argv: string[]): Promise<unknown> {
  const [command, ...args] = argv;
  if (command === 'import') return runImportCommand(args);
  if (command === 'export') return runExportCommand(args);
  if (command === 'validate') return runValidateCommand(args);
  if (command === 'dry-run') return runDryRunCommand(args);
  throw new Error(`Unknown command: ${command ?? '<none>'}`);
}
