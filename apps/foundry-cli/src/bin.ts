#!/usr/bin/env node
/**
 * foundry — CLI the Night_Agent (and Evan) drive against tracks.
 *
 * Commands (Phase 2 fleshes these out):
 *   foundry status                      — aggregate phase + last-activity across all tracks
 *   foundry status <track>              — single track
 *   foundry next [<track>]              — propose next action
 *   foundry review-queue                — print items awaiting human review
 *   foundry loop <track>                — Ralph-pattern background run
 *   foundry receiver-check <track>      — fail if no receiver
 *   foundry wiki ingest <path>          — ingest a raw source into the KB
 *   foundry wiki query "<question>"     — query the KB
 *   foundry wiki lint                   — health-check the wiki
 */
const commands = [
  "status",
  "next",
  "review-queue",
  "loop",
  "receiver-check",
  "wiki",
] as const;

type Command = (typeof commands)[number];

function usage(): void {
  console.log(`foundry — Flagship Foundry CLI\n`);
  console.log(`Usage: foundry <command> [args]\n`);
  console.log(`Commands:`);
  for (const c of commands) console.log(`  ${c}`);
  console.log(`\nRun 'foundry <command> --help' for details (Phase 2).`);
}

async function main(): Promise<void> {
  const cmd = process.argv[2];
  if (!cmd || cmd === "--help" || cmd === "-h") {
    usage();
    return;
  }
  if (!commands.includes(cmd as Command)) {
    console.error(`unknown command: ${cmd}`);
    usage();
    process.exit(2);
  }
  console.log(
    JSON.stringify({ command: cmd, status: "stub", phase: "0", note: "implemented in Phase 2" }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
