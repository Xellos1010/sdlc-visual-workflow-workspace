# Cursor Companion Operator Rollout

**Date**: 2026-04-02  
**Scope**: Cursor Companion SDLC operator surface  
**Status**: release-candidate pending operator sign-off

## Delivered Surface

- Explicit workspace target resolution and persistence for the currently bound repository.
- Saved context carts and requirement refinement sessions with Definition of Ready gating.
- Persisted visual artifacts for C4 context, C4 container, and non-diagram explainers.
- In-panel planning board, provider/adapter posture, execution session board, and host-window pop-out action.
- Advisory provider budget projection for Codex, Claude, Cursor, Gemini, and local/runtime adapters when configured.

## Rollout Steps

1. Start the control plane from the extension or run the existing control-plane server locally.
2. Open the Cursor Companion overlay and import the current workspace.
3. Resolve the workspace target. In multi-root sessions, bind the intended repository explicitly.
4. Capture files and notes into the context cart, then run requirement refinement until DoR is `ready`.
5. Generate plan artifacts and visual artifacts from the refined requirement.
6. Approve the plan through the existing control-plane approval route before starting any run.
7. Use the execution session board only after approval and readiness both indicate launch is allowed.

## Rollback Steps

1. Stop using the new operator workflow and continue through the existing `flagshipFoundry.openOverlay` path with manual plan creation only.
2. Revert the Cursor Companion operator modules, control-plane operator routes, and provider/adapter metadata additions together.
3. Preserve `state/ecosystems/*/operator/` artifacts for audit unless they are explicitly marked as disposable test data.
4. Keep continuity notes and release evidence even if the UI slice is reverted.

## Release Evidence

- Targeted operator-surface test suite: pass
  - `node --test apps/flagship-foundry/tests/workspace-targets.test.mjs apps/flagship-foundry/tests/context-cart.test.mjs apps/flagship-foundry/tests/visual-artifacts.test.mjs apps/flagship-foundry/tests/planning-board.test.mjs apps/flagship-foundry/tests/provider-budget-surface.test.mjs apps/flagship-foundry/tests/session-board.test.mjs apps/flagship-foundry/tests/cursor-companion-shell.test.mjs apps/flagship-foundry/tests/operator-surface-contracts.test.mjs`
- Repo-wide `pnpm exec nx run flagship-foundry:test`: fail, blocked by pre-existing issues outside this slice
  - `packages/import-bridge/src/__tests__/*` import missing `.mjs` modules
  - `tests/run-isolation-rollback.test.mjs` still fails in existing rollback/executor paths

## Known Limits

- The budget dashboard is advisory. It is not invoice-grade billing truth.
- Pop-out uses host-supported new-window behavior and rebinds to the opened workspace.
- AJV still emits `date-time` format warnings because `ajv-formats` is not wired in this repo.

## Operator Approval Gate

- Confirm the provider posture language is acceptable for advisory usage-limit reporting.
- Confirm the host-window pop-out assumption is acceptable for Cursor and VS Code compatible hosts.
- Confirm the repo-wide failures above remain out of scope for this release candidate.
