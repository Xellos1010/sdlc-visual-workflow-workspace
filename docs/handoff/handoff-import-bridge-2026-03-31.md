# Import Bridge Handoff

**Date**: 2026-03-31
**Scope**: ChatGPT Workspace ↔ Foundry import bridge
**Status**: release-ready pending operator sign-off

## What Was Built

- `apps/flagship-foundry/packages/import-bridge/` now contains schema transforms, manifest parsing, validation, staging, routing, continuity writing, work-order activation, provenance tracking, export packaging, CLI entry points, conflict detection, and merge planning.
- Real SDLC fixture coverage exists for intake import, architecture import, work-order activation, export bundle generation, and round-trip flow.
- Conflict resolution now detects overwrites, emits unified diffs, surfaces field-level continuity diffs, and supports `accept-incoming`, `keep-existing`, and `manual-merge` decisions.

## Module Relationships

- `manifest-parser` normalizes schema and legacy manifests into one internal format.
- `validator` enforces ChatGPT-kit and Foundry-side contracts.
- `artifact-router` + `staging` place source artifacts into reviewable targets.
- `conflict-detector` + `diff-merge` gate overwrite scenarios before commit.
- `continuity-writer` registers imported artifacts in `.foundry/projects/<slug>/current-task.json`.
- `wo-activator` converts imported work-order batches into Foundry-native queued/pending work orders.
- `export-packager` creates outbound ChatGPT-compatible bundles for post-verification handoff.

## How To Use

- Release verification gates:
  - `source ~/.zshrc >/dev/null 2>&1 && pnpm exec nx run import-bridge:typecheck`
  - `source ~/.zshrc >/dev/null 2>&1 && pnpm exec nx run import-bridge:build`
  - `source ~/.zshrc >/dev/null 2>&1 && pnpm exec nx run import-bridge:test`
- Validate only:
  - `pnpm exec nx run import-bridge:test`
  - `node apps/flagship-foundry/packages/import-bridge/bin/foundry-bridge.mjs validate chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-intake-ai-orchestration-pipeline-2026-03-28`
- Dry-run import:
  - `node apps/flagship-foundry/packages/import-bridge/bin/foundry-bridge.mjs dry-run chatgpt-workspace-orders/SDLC-Building-Blocks/foundry-orchestration-architecture-packet-2026-03-28`
- Import with overwrite:
  - `node apps/flagship-foundry/packages/import-bridge/bin/foundry-bridge.mjs import <source-dir> --force`
- Import with explicit conflict decisions:
  - `node apps/flagship-foundry/packages/import-bridge/bin/foundry-bridge.mjs import <source-dir> --decision docs/imported/sample/intent-packet.md=keep-existing`

## Known Limitations

- Manual merge is non-interactive in Codex mode: the bridge writes a `.manual-merge` preview file and returns an editor command instead of opening the editor automatically.
- `ajv-formats` is not wired yet, so schema tests tolerate `date-time` format warnings.
- CLI conflict decisions are path-based flags, not an interactive TUI.

## Release Evidence

- `import-bridge:typecheck`: pass
- `import-bridge:build`: pass
- `import-bridge:test`: pass, including integration coverage against real `SDLC-Building-Blocks` fixtures
- Continuity updated at `.foundry/projects/flagship-foundry/current-task.json`

## Next Steps

- Add `ajv-formats` to remove `date-time` warnings.
- Add a richer interactive operator surface for per-artifact conflict choice.
- Promote import-bridge commands into a root-level package script once operator workflow stabilizes.
