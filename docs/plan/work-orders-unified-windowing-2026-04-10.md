# Work Orders: Cursor Companion Unified Windowing & State Sync

**Date**: 2026-04-10
**Intent Packet**: `docs/intent/intent-cursor-companion-unified-windowing-2026-04-10.md`
**Slug**: `unified-windowing`

---

## Impacted Node Inventory

| Node ID | Node Type | Change Type | Contracts | Guardrail Packs |
|---------|-----------|-------------|-----------|-----------------|
| browser-popout-message.schema.json | contract | modify | Adds `state-update` message type | contract-first |
| browser-popout-server.js | component | modify | Exposes `broadcastState()`, serves `/theme.css` | web-frontend |
| browser-popout-server.js (validator) | component | modify | Validates new `state-update` message type | contract-first |
| operator-panel.js | component | modify | `overlayHtml` adds `<link>` for browser theme, client-side JSON renderer | web-frontend |
| browser-theme.css | component | new | Static stylesheet for browser environment | web-frontend |
| window-session.js | component | modify | `pop-out-window` handler uses browser pop-out instead of `vscode.openFolder` | — |
| window-launcher.js | component | modify | UI shows both buttons, updates status for connected browser | web-frontend |
| extension.js | component | modify | `dispatchOverlayAction` broadcasts state after completion; browser→tab refresh | — |
| panel-state.js | component | minor | No schema change; may add browser connection tracking | — |
| package.json | config | modify | Adds `flagshipFoundry.customThemeUrl` setting | — |

---

## Work Order: WO-UW-001

**Title**: Contract — Add `state-update` message type to browser-popout-message schema

- **Lifecycle Stage**: implement
- **Phase ID**: `uw-schema-state-update`
- **Task Class**: `structured_generation`
- **Agent Role**: @builder
- **Model Tier**: low_cost_executor
- **File Scope**:
  - `apps/flagship-foundry/schemas/browser-popout-message.schema.json` (modify)
  - `apps/flagship-foundry/apps/cursor-companion/browser-popout-server.js` (modify — validator)
  - `apps/flagship-foundry/tests/browser-popout-contracts.test.mjs` (modify — add contract tests)
- **Source Artifacts**:
  - `docs/intent/intent-cursor-companion-unified-windowing-2026-04-10.md`
- **Constraints**:
  - `principle:contract-first` — schema defined before any code consumes it
  - `principle:complexity-budgets` — single new message type, no nested structures
  - Additive change only — existing `handshake`, `command`, `response` types unchanged
- **Description**:
  Add a fourth `oneOf` variant to the browser-popout-message schema:
  ```json
  {
    "type": { "const": "state-update" },
    "timestamp": { "type": "string", "format": "date-time" },
    "state": { "type": "object", "description": "Serialized overlay state JSON" }
  }
  ```
  Update `validateBrowserPopoutMessage` in `browser-popout-server.js` to accept `state-update` messages (server→client only, no requestId needed). Add contract tests validating the new type accepts valid payloads and rejects malformed ones.
- **Acceptance Criteria**:
  - [ ] Schema has a `state-update` variant with `type`, `timestamp`, and `state` fields
  - [ ] `validateBrowserPopoutMessage` accepts valid `state-update` messages
  - [ ] `validateBrowserPopoutMessage` rejects `state-update` messages missing required fields
  - [ ] Existing handshake/command/response contract tests still pass
- **Verification Plan**:
  - `/usr/local/bin/node --test apps/flagship-foundry/tests/browser-popout-contracts.test.mjs`
- **Rollback Notes**: Remove the `state-update` variant from schema and validator; revert is additive-only
- **Approval Required**: no

---

## Work Order: WO-UW-002

**Title**: Server — Add `broadcastState()` and `/theme.css` endpoint to browser-popout-server

- **Lifecycle Stage**: implement
- **Phase ID**: `uw-server-broadcast-theme`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: @builder
- **Model Tier**: low_cost_executor
- **File Scope**:
  - `apps/flagship-foundry/apps/cursor-companion/browser-popout-server.js` (modify)
  - `apps/flagship-foundry/apps/cursor-companion/browser-theme.css` (new)
  - `apps/flagship-foundry/tests/cursor-companion-browser-popout.test.mjs` (modify)
- **Source Artifacts**:
  - `docs/intent/intent-cursor-companion-unified-windowing-2026-04-10.md`
  - WO-UW-001 (depends on `state-update` schema)
- **Constraints**:
  - Node built-ins only (no npm dependencies)
  - Loopback-only security model preserved
  - Token-gated: `/theme.css?token=...` requires valid token
- **Description**:
  1. **`broadcastState(stateJson)`**: New method on the server API object. Iterates `connections`, sends a `state-update` message (validated via `validateBrowserPopoutMessage`) as a WebSocket text frame to every authenticated connection (those with a `clientId`).
  2. **`/theme.css` endpoint**: Serve `browser-theme.css` as `text/css` at `/theme.css?token=...`. Token-gated like the page endpoint.
  3. **`browser-theme.css`**: A standalone dark-theme stylesheet providing concrete fallbacks for all `--vscode-*` CSS custom properties used in `overlayHtml`. Includes:
     - Base dark palette (background `#1e1e2e`, foreground `#cdd6f4`, accent `#89b4fa`)
     - Card, button, input, panel-border, sidebar, mermaid container styles
     - Responsive layout adjustments for standalone browser viewport
     - An `@import` placeholder comment for the advanced custom theme URL
- **Acceptance Criteria**:
  - [ ] `broadcastState` sends a valid `state-update` message to all authenticated WebSocket clients
  - [ ] `broadcastState` skips connections without a `clientId` (not yet handshaked)
  - [ ] `/theme.css?token=validToken` returns 200 with `text/css` content type
  - [ ] `/theme.css` without token returns 401
  - [ ] `browser-theme.css` renders the operator panel layout correctly in a browser without VS Code CSS variables
- **Verification Plan**:
  - `/usr/local/bin/node --test apps/flagship-foundry/tests/cursor-companion-browser-popout.test.mjs`
- **Rollback Notes**: Remove `broadcastState` method and `/theme.css` route; delete `browser-theme.css`
- **Approval Required**: no

---

## Work Order: WO-UW-003

**Title**: Renderer — Client-side JSON state renderer and browser theme integration in operator-panel

- **Lifecycle Stage**: implement
- **Phase ID**: `uw-client-renderer`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: @builder
- **Model Tier**: low_cost_executor
- **File Scope**:
  - `apps/flagship-foundry/apps/cursor-companion/operator-panel.js` (modify)
- **Source Artifacts**:
  - `docs/intent/intent-cursor-companion-unified-windowing-2026-04-10.md`
  - WO-UW-001 (depends on `state-update` message type)
  - WO-UW-002 (depends on `browser-theme.css` existing)
- **Constraints**:
  - `principle:observed-vs-declared-truth` — browser client must re-render from authoritative state JSON, not cache local copies
  - No external JS dependencies in browser page
- **Description**:
  1. **Theme link injection**: When `bridgeConfig.mode === 'browser'`, inject `<link rel="stylesheet" href="/theme.css?token=...">` in the `<head>`. If `bridgeConfig.customThemeUrl` is set, inject a second `<link>` after the base theme.
  2. **Client-side JSON renderer**: Add an inline `renderState(stateJson)` function in the browser `<script>` block that:
     - Updates the sidebar cards (ecosystem info, observability, plans, runs, graph stats, windowing status, etc.) by targeting elements with `data-bind` attributes
     - Updates the mermaid container if `focusContent` changed
     - Updates `action-status` from the state
  3. **WebSocket `state-update` handler**: In the browser bridge's `message` event listener, detect `type === 'state-update'` and call `renderState(msg.state)` instead of reloading the page.
  4. **Add `data-bind` attributes**: Add `data-bind="ecosystemId"`, `data-bind="actionLogSize"`, etc. to the HTML template elements so the renderer can target them.
- **Acceptance Criteria**:
  - [ ] Browser pop-out loads `/theme.css` and renders with dark theme
  - [ ] `state-update` messages trigger client-side DOM updates without page reload
  - [ ] Mermaid diagrams re-render when `focusContent` changes in state
  - [ ] Action status updates appear in both webview tab and browser pop-out
- **Verification Plan**:
  - Manual: open browser pop-out, execute action in tab, verify browser updates without reload
  - `/usr/local/bin/node --test apps/flagship-foundry/tests/cursor-companion-observability.test.mjs`
- **Rollback Notes**: Remove `data-bind` attributes and `renderState` function; revert to page-reload on response
- **Approval Required**: no

---

## Work Order: WO-UW-004

**Title**: Windowing — Fix pop-out-window to use browser pop-out, wire bidirectional sync in extension.js

- **Lifecycle Stage**: implement
- **Phase ID**: `uw-windowing-sync`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: @builder
- **Model Tier**: low_cost_executor
- **File Scope**:
  - `apps/flagship-foundry/apps/cursor-companion/extension.js` (modify)
  - `apps/flagship-foundry/apps/cursor-companion/window-session.js` (modify)
  - `apps/flagship-foundry/apps/cursor-companion/window-launcher.js` (modify)
  - `apps/flagship-foundry/apps/cursor-companion/package.json` (modify — add `customThemeUrl` setting)
- **Source Artifacts**:
  - `docs/intent/intent-cursor-companion-unified-windowing-2026-04-10.md`
  - WO-UW-002 (depends on `broadcastState`)
  - WO-UW-003 (depends on client-side renderer)
- **Constraints**:
  - Keep both "Open In New Window" and "Open In Browser" buttons
  - `principle:observed-vs-declared-truth` — both surfaces observe from `collectOverlayState`
- **Description**:
  1. **Fix `pop-out-window` action**: Change `createPopOutWindowHandler` to launch the browser pop-out (call `openInBrowser`) instead of `vscode.openFolder`. The handler persists state, starts the browser-popout-server if not running, and opens the default browser. Remove the `vscode.openFolder` + pending-overlay queue pattern.
  2. **Tab → Browser sync**: After `dispatchOverlayAction` completes (in the `try` block after `actionLog.run`), check if the browser-popout-server is running with connections. If so, call `server.broadcastState(await collectOverlayState(context))`.
  3. **Browser → Tab sync**: In the `onCommand` handler of `ensureBrowserPopoutServer`, after dispatching the action, call `refreshOverlay(context, panel)` to update the webview tab.
  4. **Window launcher UI update**: Update `windowLauncherSection` to show connection status when browser clients are connected (e.g., "1 browser client connected").
  5. **Custom theme setting**: Add `flagshipFoundry.customThemeUrl` to `package.json` contributes.configuration. Pass it through `bridgeConfig` when rendering the browser page.
- **Acceptance Criteria**:
  - [ ] "Open In New Window" opens the browser pop-out, does NOT call `vscode.openFolder`
  - [ ] Action in webview tab → browser pop-out updates within 500ms (no manual reload)
  - [ ] Action in browser pop-out → webview tab updates within 500ms
  - [ ] Both surfaces show consistent error status on action failure
  - [ ] "Open In New Window" works when no browser clients are connected (starts server, opens browser)
  - [ ] Browser pop-out shows "disconnected" gracefully when extension deactivates
  - [ ] Window launcher card shows browser connection count
- **Verification Plan**:
  - `/usr/local/bin/node --test apps/flagship-foundry/tests/cursor-companion-windowing.test.mjs`
  - `/usr/local/bin/node --test apps/flagship-foundry/tests/cursor-companion-observability.test.mjs`
- **Rollback Notes**: Revert `pop-out-window` to `vscode.openFolder`; remove broadcast calls from dispatch
- **Approval Required**: no

---

## Work Order: WO-UW-005

**Title**: Verify — End-to-end windowing, sync, and styling validation

- **Lifecycle Stage**: verify
- **Phase ID**: `uw-verify`
- **Task Class**: `verification`
- **Agent Role**: @verifier
- **Model Tier**: balanced_reasoner
- **File Scope**:
  - `apps/flagship-foundry/tests/cursor-companion-windowing.test.mjs` (modify)
  - `apps/flagship-foundry/tests/cursor-companion-browser-popout.test.mjs` (modify)
  - `apps/flagship-foundry/tests/cursor-companion-observability.test.mjs` (modify)
  - `apps/flagship-foundry/tests/browser-popout-contracts.test.mjs` (modify)
- **Source Artifacts**:
  - `docs/intent/intent-cursor-companion-unified-windowing-2026-04-10.md` (acceptance criteria)
  - WO-UW-001 through WO-UW-004
- **Constraints**:
  - Independent verification — verifier does not trust builder claims
  - All 7 acceptance criteria from the intent packet must have evidence
- **Description**:
  Add or extend test cases to cover:
  1. **Contract tests**: `state-update` message validation (valid, missing fields, extra fields)
  2. **Broadcast tests**: `broadcastState` delivers to authenticated clients, skips unauthenticated
  3. **Theme endpoint tests**: `/theme.css` returns CSS with valid token, 401 without
  4. **Windowing tests**: `pop-out-window` action no longer calls `vscode.openFolder`, instead opens browser
  5. **Sync tests**: After action dispatch, verify `broadcastState` was called; after browser command, verify `refreshOverlay` was called
  6. **Styling smoke test**: Verify `browser-theme.css` exists and contains expected selectors (`.card`, `body`, `button`, `.sidebar`)
- **Acceptance Criteria**:
  - [ ] All 7 intent acceptance criteria have corresponding test evidence
  - [ ] All existing tests continue to pass (no regressions)
  - [ ] Test suite runs cleanly with `/usr/local/bin/node --test`
- **Verification Plan**:
  - `/usr/local/bin/node --test apps/flagship-foundry/tests/browser-popout-contracts.test.mjs apps/flagship-foundry/tests/cursor-companion-browser-popout.test.mjs apps/flagship-foundry/tests/cursor-companion-windowing.test.mjs apps/flagship-foundry/tests/cursor-companion-observability.test.mjs`
- **Rollback Notes**: Tests are additive; remove new test cases to revert
- **Approval Required**: no

---

## Principle Cards

### `principle:contract-first`
**Applies to**: WO-UW-001
- **Rule**: Define the `state-update` schema variant before any code sends or receives it
- **Anti-pattern**: Implementing `broadcastState` before the schema defines the message shape
- **Enforcement**: WO-UW-002 and WO-UW-003 depend on WO-UW-001; builder must not skip ahead

### `principle:complexity-budgets`
**Applies to**: WO-UW-001, WO-UW-003
- **Rule**: The `state-update` message carries a flat `state` object — no deeply nested schemas
- **Anti-pattern**: Creating a complex diff/patch protocol for partial state updates in v1
- **Enforcement**: The JSON renderer receives the full state object; partial optimization is a future concern

### `principle:observed-vs-declared-truth`
**Applies to**: WO-UW-003, WO-UW-004
- **Rule**: Both surfaces must render from `collectOverlayState()` output, not from locally cached or stale state
- **Anti-pattern**: Browser client caching state and only applying diffs without re-querying
- **Enforcement**: `broadcastState` always sends a fresh `collectOverlayState()` result; client `renderState` replaces all bound values

---

# Scope Chunk Summary

- **Total Work Orders**: 5
- **Estimated Phases**: implement (WO-UW-001 → WO-UW-004), verify (WO-UW-005)
- **Critical Path**: WO-UW-001 → WO-UW-002 → WO-UW-003 → WO-UW-004 → WO-UW-005
- **Parallelizable**: WO-UW-002 and WO-UW-003 can partially overlap (server and client are independent once schema lands)
- **Approval Gates**: none (all low-risk, additive changes within existing extension)

## Work Order Sequence

1. **WO-UW-001**: Schema — `state-update` message type → @builder (structured_generation) [depends on: none]
2. **WO-UW-002**: Server — `broadcastState()` + `/theme.css` + `browser-theme.css` → @builder (deterministic_transformation) [depends on: WO-UW-001]
3. **WO-UW-003**: Renderer — client-side JSON renderer + theme integration → @builder (deterministic_transformation) [depends on: WO-UW-001, WO-UW-002]
4. **WO-UW-004**: Windowing — fix pop-out, wire bidirectional sync → @builder (deterministic_transformation) [depends on: WO-UW-002, WO-UW-003]
5. **WO-UW-005**: Verify — end-to-end test suite → @verifier (verification) [depends on: WO-UW-001–004]

## First Work Order (Ready to Execute)

**WO-UW-001** is ready for immediate execution. It has no dependencies and unblocks all downstream work.
