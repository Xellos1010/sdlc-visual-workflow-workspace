# Import Bridge Operator Guide

## Release Gates

Run these from the repo root before relying on the bridge in operator workflow:

- `source ~/.zshrc >/dev/null 2>&1 && pnpm exec nx run import-bridge:typecheck`
- `source ~/.zshrc >/dev/null 2>&1 && pnpm exec nx run import-bridge:build`
- `source ~/.zshrc >/dev/null 2>&1 && pnpm exec nx run import-bridge:test`

## Import Workflow

1. Validate the source deliverable:
   - `node apps/flagship-foundry/packages/import-bridge/bin/foundry-bridge.mjs validate chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-intake-ai-orchestration-pipeline-2026-03-28`
2. Inspect the dry-run:
   - `node apps/flagship-foundry/packages/import-bridge/bin/foundry-bridge.mjs dry-run chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-orchestration-architecture-packet-2026-03-28`
3. Execute the import:
   - `node apps/flagship-foundry/packages/import-bridge/bin/foundry-bridge.mjs import <source-dir> --force`

## Conflict Resolution

- If the import returns `status: "conflict"`, review the returned `diff` payloads first.
- To keep the existing target file:
  - `--decision <target-path>=keep-existing`
- To accept the incoming staged artifact:
  - `--decision <target-path>=accept-incoming`
- To prepare a manual merge:
  - `--decision <target-path>=manual-merge`

Manual merge writes a `.manual-merge` preview file and returns an editor command using `$EDITOR` or `vi`.

Example:

- `node apps/flagship-foundry/packages/import-bridge/bin/foundry-bridge.mjs import chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-intake-ai-orchestration-pipeline-2026-03-28 --decision docs/imported/foundry-intake-ai-orchestration-pipeline-2026-03-28/intent-packet.md=keep-existing`

## Export Workflow

- Export a verification bundle:
  - `node apps/flagship-foundry/packages/import-bridge/bin/foundry-bridge.mjs export flagship-foundry /tmp/foundry-export`

The export bundle contains:
- `verification-report.md`
- `evidence-bundle.md`
- `release-notes.md`
- `handoff.md`
- `learning-record.md`
- `artifact-manifest.json`
- `foundry-import-manifest.json`

## Troubleshooting

- `ENOENT` on source files:
  - Verify the command is being run from the repo root.
- Conflict loop on repeated imports:
  - Use `dry-run` first, then pass explicit `--decision` flags. Use `--force` only when overwrite is intentional across the full target set.
- Continuity mismatch:
  - Inspect `.foundry/projects/<slug>/current-task.json` and use the continuity field diff in the conflict report.
- Schema validation failure:
  - Check the reported `artifact`, `schema`, and `fieldPath` from the structured validator error.
- Date-time warnings during schema tests:
  - Current tests pass without `ajv-formats`; treat these as known warnings unless validation behavior changes.
