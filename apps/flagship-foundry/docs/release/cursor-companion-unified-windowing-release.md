# Cursor Companion Unified Windowing Release Evidence

**Date**: 2026-04-10  
**Scope**: Cursor Companion unified windowing, state sync, and browser styling  
**Status**: release evidence recorded and continuity updated

## Delivered Slice

- Browser pop-out contract now includes a `state-update` message type for server-initiated state broadcasts.
- Browser relay server accepts and emits `state-update`, serves token-gated `/theme.css`, and exposes authenticated state broadcast behavior.
- Browser operator panel renders from authoritative state JSON and loads a standalone browser theme instead of relying on VS Code CSS variables.
- Windowing behavior uses the browser pop-out path for the free-floating surface, with bidirectional sync between the editor tab and browser client.
- Continuity state now records the unified-windowing slice as implemented, verified, and documented for release.

## Verification Evidence

- `/usr/local/bin/node --test apps/flagship-foundry/tests/browser-popout-contracts.test.mjs apps/flagship-foundry/tests/cursor-companion-browser-popout.test.mjs apps/flagship-foundry/tests/cursor-companion-windowing.test.mjs apps/flagship-foundry/tests/cursor-companion-observability.test.mjs`
- Result: `16/16` tests passed

## Release Notes

- The browser pop-out remains loopback-only and token gated.
- The release slice is additive; no unrelated continuity state was changed in this documentation pass.
- The completed slice is ready for downstream packaging, sign-off, or archival as needed by the broader release process.

## Rollback Notes

1. Revert the release-note update if the unified-windowing slice is not being retained in continuity.
2. Keep the existing implementation artifacts and verification evidence intact for auditability.
3. Preserve unrelated project state unless a separate release action requires broader rollback.
