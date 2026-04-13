# Scope Chunk: Observable Cursor Companion Dev Environment

**Source Intent Packet**: `apps/flagship-foundry/apps/cursor-companion/docs/intent/intent-observable-dev-environment-2026-04-10.md`  
**Date**: 2026-04-10  
**Primary Surface**: `apps/flagship-foundry/apps/cursor-companion/`

---

## Planning Assumptions

- The current extension already has a basic Output Channel logger and host-window pop-out flow, so the main gaps are structured action logging, export, startup/reload feedback, and the browser-based pop-out path.
- The browser pop-out is treated as an opt-in local development tool only; the default host-supported pop-out remains the baseline path.
- New observability state must stay additive and must not become a second source of truth for plans, runs, or workspace targeting.

## Impacted Node Inventory

| Node ID | Node Type | Change Type | Contracts | Guardrail Packs |
|---------|-----------|-------------|-----------|-----------------|
| `cursor-companion/extension-host` | component | modify | webview messages, startup/reload banners, action handler wrappers | `guardrail:extension-api-only`, `guardrail:typescript-core` |
| `cursor-companion/action-log` | component | new | action log entry schema, ring buffer, export payloads | `guardrail:extension-api-only`, `guardrail:typescript-core` |
| `cursor-companion/browser-popout-server` | component | new | localhost HTTP/WS handshake, token-gated command relay | `guardrail:extension-api-only`, `guardrail:localhost-binding`, `guardrail:security-boundary` |
| `cursor-companion/window-session` | component | modify | persisted panel snapshot, pop-out replay state | `guardrail:extension-api-only` |
| `cursor-companion/window-launcher` | component | modify | host-window pop-out entry point and labels | `guardrail:extension-api-only` |
| `cursor-companion/operator-panel` | component | modify | inline working feedback and action affordances | `guardrail:extension-api-only` |
| `cursor-companion/logger` | component | modify | Output Channel formatting and error surfacing | `guardrail:extension-api-only` |
| `cursor-companion/README` | docs | modify | developer-facing observability and pop-out guidance | `guardrail:workspace-governance` |
| `action-log-entry` | contract | new | structured JSON action entry payload | `guardrail:contract-first` |
| `browser-popout-message` | contract | new | WS relay messages and handshake payloads | `guardrail:contract-first` |
| `cursor-companion-observability-tests` | test suite | new | action log, export, banner, and error behavior | `guardrail:independent-verification` |
| `cursor-companion-windowing-tests` | test suite | modify | host pop-out and snapshot replay behavior | `guardrail:independent-verification` |

## Work Order Sequence Summary

- **Total Work Orders**: 5
- **Milestones**:
  - `M1` contracts and approval-gated architecture
  - `M2` action-log core
  - `M3` browser pop-out server
  - `M4` extension wiring and developer feedback
  - `M5` verification and hardening
- **Critical Path**: `WO-OV-001 -> WO-OV-004 -> WO-OV-005`
- **Parallelizable**: `WO-OV-002` and `WO-OV-003` after `WO-OV-001`
- **Approval Gates**: `WO-OV-001`, `WO-OV-003`

## Work Order Sequence

1. **WO-OV-001**: observable-dev-environment-contract-pack → `@systems-architect` (`strategic_reasoning`) [depends on: none]
2. **WO-OV-002**: action-log-module-and-buffer → `@builder` (`structured_generation`) [depends on: WO-OV-001]
3. **WO-OV-003**: browser-popout-server-and-protocol → `@builder` (`structured_generation`) [depends on: WO-OV-001]
4. **WO-OV-004**: extension-integration-and-dev-loop-feedback → `@builder` (`deterministic_transformation`) [depends on: WO-OV-002, WO-OV-003]
5. **WO-OV-005**: verification-and-hardening → `@verifier` (`verification`) [depends on: WO-OV-004]

## Work Orders

### WO-OV-001: observable-dev-environment-contract-pack

- **Lifecycle Stage**: `architect`
- **Phase ID**: `observable-dev-environment-contract-pack`
- **Task Class**: `strategic_reasoning`
- **Agent Role**: `systems-architect`
- **Model Tier**: `frontier_reasoner`
- **File Scope**:
  - `apps/flagship-foundry/schemas/action-log-entry.schema.json`
  - `apps/flagship-foundry/schemas/browser-popout-message.schema.json`
  - `apps/flagship-foundry/docs/adr/adr-014-observable-dev-environment.md`
  - `apps/flagship-foundry/tests/action-log-contracts.test.mjs`
  - `apps/flagship-foundry/tests/browser-popout-contracts.test.mjs`
- **Source Artifacts**:
  - `apps/flagship-foundry/apps/cursor-companion/docs/intent/intent-observable-dev-environment-2026-04-10.md`
  - `apps/flagship-foundry/docs/adr/adr-013-cursor-companion-operator-surface.md`
  - `apps/flagship-foundry/apps/cursor-companion/extension.js`
  - `apps/flagship-foundry/apps/cursor-companion/window-session.js`
  - `apps/flagship-foundry/configs/model-routing/default.json`
  - `apps/flagship-foundry/ontology/principle-catalog.json`
- **Constraints**:
  - Keep declared log entries separate from observed runtime events.
  - Define the browser relay contract before implementation.
  - Keep the browser pop-out local-only and token-gated.
  - Preserve the existing control-plane authority model.
- **Acceptance Criteria**:
  - [ ] Action-log entry schema captures `id`, `action`, `timestamp`, `status`, `result/error`, and `durationMs`.
  - [ ] Browser pop-out message schema captures the handshake and relay payload shape.
  - [ ] The ADR records the chosen default pop-out posture and the localhost trust boundary.
  - [ ] Contract tests cover the new schemas or payload shapes.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test tests/action-log-contracts.test.mjs tests/browser-popout-contracts.test.mjs`
- **Rollback Notes**: Remove the new schemas, ADR, and contract tests.
- **Approval Required**: yes

### WO-OV-002: action-log-module-and-buffer

- **Lifecycle Stage**: `implement`
- **Phase ID**: `action-log-module-and-buffer`
- **Task Class**: `structured_generation`
- **Agent Role**: `builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/apps/cursor-companion/action-log.js`
  - `apps/flagship-foundry/tests/cursor-companion-action-log.test.mjs`
- **Source Artifacts**: `WO-OV-001`
- **Constraints**:
  - Use Node.js built-ins only.
  - Keep the ring buffer bounded at 500 entries.
  - Preserve error propagation while always recording the terminal action entry.
  - Summaries must remain concise and export-safe.
- **Acceptance Criteria**:
  - [ ] `withActionLog()` wraps async handlers and records the required entry shape.
  - [ ] The buffer drops the oldest entries once it reaches 500 items.
  - [ ] Export helpers can emit the latest entry or the full array as JSON.
  - [ ] Errors are recorded without swallowing the thrown exception.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test tests/cursor-companion-action-log.test.mjs`
- **Rollback Notes**: Delete the new module and tests.

### WO-OV-003: browser-popout-server-and-protocol

- **Lifecycle Stage**: `implement`
- **Phase ID**: `browser-popout-server-and-protocol`
- **Task Class**: `structured_generation`
- **Agent Role**: `builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/apps/cursor-companion/browser-popout-server.js`
  - `apps/flagship-foundry/tests/cursor-companion-browser-popout.test.mjs`
- **Source Artifacts**: `WO-OV-001`
- **Constraints**:
  - Bind `127.0.0.1` only and use a random ephemeral port.
  - Require a one-time token for the browser handshake.
  - Avoid external dependencies; use Node.js built-ins only.
  - Keep the protocol minimal and explicit.
- **Acceptance Criteria**:
  - [ ] The server starts and stops cleanly.
  - [ ] Invalid or missing tokens are rejected.
  - [ ] Browser relay messages can be validated and routed.
  - [ ] The server state remains local-only.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test tests/cursor-companion-browser-popout.test.mjs`
- **Rollback Notes**: Remove the server module and protocol tests.
- **Approval Required**: yes

### WO-OV-004: extension-integration-and-dev-loop-feedback

- **Lifecycle Stage**: `implement`
- **Phase ID**: `extension-integration-and-dev-loop-feedback`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/apps/cursor-companion/extension.js`
  - `apps/flagship-foundry/apps/cursor-companion/logger.js`
  - `apps/flagship-foundry/apps/cursor-companion/operator-panel.js`
  - `apps/flagship-foundry/apps/cursor-companion/window-session.js`
  - `apps/flagship-foundry/apps/cursor-companion/window-launcher.js`
  - `apps/flagship-foundry/apps/cursor-companion/README.md`
  - `apps/flagship-foundry/tests/cursor-companion-observability.test.mjs`
  - `apps/flagship-foundry/tests/cursor-companion-windowing.test.mjs`
- **Source Artifacts**: `WO-OV-001`, `WO-OV-002`, `WO-OV-003`
- **Constraints**:
  - Keep control-plane routing unchanged.
  - Surface working/error state in-panel without masking failures.
  - Add startup and reload banners with timestamp and host kind.
  - Preserve the current host-window pop-out behavior while wiring the browser option.
- **Acceptance Criteria**:
  - [ ] Every user-triggered action produces a structured log entry.
  - [ ] Export log actions write JSON to the chosen path.
  - [ ] Startup and reload banners appear in the Output Channel.
  - [ ] Error toasts are shown when action handlers fail.
  - [ ] Existing host-window pop-out state replay continues to work.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test tests/cursor-companion-observability.test.mjs tests/cursor-companion-windowing.test.mjs`
- **Rollback Notes**: Revert the integration wiring, README edits, and observability tests.

### WO-OV-005: verification-and-hardening

- **Lifecycle Stage**: `verify`
- **Phase ID**: `observable-dev-environment-verification`
- **Task Class**: `verification`
- **Agent Role**: `verifier`
- **Model Tier**: `balanced_reasoner`
- **File Scope**:
  - `apps/flagship-foundry/tests/action-log-contracts.test.mjs`
  - `apps/flagship-foundry/tests/browser-popout-contracts.test.mjs`
  - `apps/flagship-foundry/tests/cursor-companion-action-log.test.mjs`
  - `apps/flagship-foundry/tests/cursor-companion-browser-popout.test.mjs`
  - `apps/flagship-foundry/tests/cursor-companion-observability.test.mjs`
  - `apps/flagship-foundry/tests/cursor-companion-windowing.test.mjs`
  - `apps/flagship-foundry/docs/adr/adr-014-observable-dev-environment.md`
  - `apps/flagship-foundry/apps/cursor-companion/README.md`
- **Source Artifacts**: `WO-OV-001` through `WO-OV-004`
- **Constraints**:
  - Verify negative cases as well as the happy path.
  - Check that the browser pop-out remains local-only and token-protected.
  - Confirm that existing control-plane commands still function.
- **Acceptance Criteria**:
  - [ ] Structured action logging passes targeted tests.
  - [ ] Browser pop-out protocol passes targeted tests.
  - [ ] Host-window pop-out replay still passes.
  - [ ] Developer feedback banners and error surfacing are covered.
  - [ ] No regressions are introduced to existing overlay commands.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test`
- **Rollback Notes**: Disable the observable-environment additions and revert the touched files if regressions appear.
- **Approval Required**: no

## First Work Order (Ready to Execute)

### WO-OV-001: observable-dev-environment-contract-pack

- **Lifecycle Stage**: `architect`
- **Phase ID**: `observable-dev-environment-contract-pack`
- **Task Class**: `strategic_reasoning`
- **Agent Role**: `systems-architect`
- **Model Tier**: `frontier_reasoner`
- **File Scope**:
  - `apps/flagship-foundry/schemas/action-log-entry.schema.json`
  - `apps/flagship-foundry/schemas/browser-popout-message.schema.json`
  - `apps/flagship-foundry/docs/adr/adr-014-observable-dev-environment.md`
  - `apps/flagship-foundry/tests/action-log-contracts.test.mjs`
  - `apps/flagship-foundry/tests/browser-popout-contracts.test.mjs`
- **Source Artifacts**:
  - `apps/flagship-foundry/apps/cursor-companion/docs/intent/intent-observable-dev-environment-2026-04-10.md`
  - `apps/flagship-foundry/docs/adr/adr-013-cursor-companion-operator-surface.md`
  - `apps/flagship-foundry/apps/cursor-companion/extension.js`
  - `apps/flagship-foundry/apps/cursor-companion/window-session.js`
  - `apps/flagship-foundry/configs/model-routing/default.json`
  - `apps/flagship-foundry/ontology/principle-catalog.json`
- **Constraints**:
  - Keep declared log entries separate from observed runtime events.
  - Define the browser relay contract before implementation.
  - Keep the browser pop-out local-only and token-gated.
  - Preserve the existing control-plane authority model.
- **Acceptance Criteria**:
  - [ ] Action-log entry schema captures `id`, `action`, `timestamp`, `status`, `result/error`, and `durationMs`.
  - [ ] Browser pop-out message schema captures the handshake and relay payload shape.
  - [ ] The ADR records the chosen default pop-out posture and the localhost trust boundary.
  - [ ] Contract tests cover the new schemas or payload shapes.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test tests/action-log-contracts.test.mjs tests/browser-popout-contracts.test.mjs`
- **Rollback Notes**: Remove the new schemas, ADR, and contract tests.
- **Approval Required**: yes
