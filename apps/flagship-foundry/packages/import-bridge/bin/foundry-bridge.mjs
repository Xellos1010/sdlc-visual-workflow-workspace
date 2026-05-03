#!/usr/bin/env node
import { runCli } from '../dist/cli.mjs';

const result = await runCli(process.argv.slice(2));
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
