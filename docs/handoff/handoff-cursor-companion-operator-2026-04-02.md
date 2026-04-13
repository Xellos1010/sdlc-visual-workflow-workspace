# Cursor Companion Operator Handoff

**Date**: 2026-04-02
**Scope**: Cursor Companion SDLC operator surface
**Status**: implementation complete, release candidate pending operator sign-off

## What Was Built

- `cursor-companion` now persists workspace targets, context carts, refinement sessions, visual artifacts, planning-board projections, provider posture, and execution session posture through control-plane routes instead of panel-only state.
- `packages/core` now includes operator-surface persistence modules for workspace targeting, context carts, refinement, visual artifacts, and session projections.
- `packages/model-gateway` now exposes an advisory budget snapshot projection built from routing, provider, and adapter configuration.
- The extension UI now includes sections for workspace targeting, context capture, requirement refinement, diagrams, planning, providers, sessions, and host-window pop-out.

## Verification

- Targeted operator-surface tests: pass.
- Repo-wide `flagship-foundry:test`: fail because of pre-existing `import-bridge` missing-module tests and existing `run-isolation-rollback` failures.

## Files To Review First

- `apps/flagship-foundry/apps/control-plane/src/server.mjs`
- `apps/flagship-foundry/apps/cursor-companion/extension.js`
- `apps/flagship-foundry/apps/cursor-companion/operator-panel.js`
- `apps/flagship-foundry/packages/core/src/workspace-targets.mjs`
- `apps/flagship-foundry/packages/core/src/context-cart.mjs`
- `apps/flagship-foundry/packages/core/src/requirement-refinement.mjs`
- `apps/flagship-foundry/packages/core/src/visual-artifacts.mjs`
- `apps/flagship-foundry/packages/model-gateway/src/gateway.mjs`
- `apps/flagship-foundry/docs/release/cursor-companion-operator-rollout.md`

## Next Recommended Slice

- Harden the control-plane operator routes with dedicated route-level tests.
- Decide whether the unexpected untracked ADR `apps/flagship-foundry/docs/adr/adr-013-cursor-companion-operator-surface.md` should replace or be removed in favor of `adr-cursor-companion-operator-surface.md`.
- Triage the pre-existing repo-wide failures before calling this surface fully release-ready.
