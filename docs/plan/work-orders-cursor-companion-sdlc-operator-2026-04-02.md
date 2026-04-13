# Scope Chunk: Cursor Companion SDLC Operator Surface

**Source Intent Packet**: `docs/intent/intent-cursor-companion-sdlc-operator-2026-04-02.md`  
**Date**: 2026-04-02  
**Primary Surface**: `apps/flagship-foundry/apps/cursor-companion/`

---

## Planning Assumptions

- The existing imported composer work remains relevant, but `WO-004A` and `WO-006B` should be treated as **sub-slices** inside a broader extension refactor instead of being implemented in isolation.
- The first delivery target is a **single-workspace SDLC cockpit** for Cursor/VS Code, not a multi-tenant or full custom IDE shell.
- Usage-limit visibility is **projection-first** in v1: adapter-reported usage, health, and configured thresholds are in scope; invoice-grade reconciliation is deferred.
- “Pop-out mode” uses **host-supported** new-window behavior or a second workspace window; do not depend on undocumented Cursor internals.

---

## Impacted Node Inventory

| Node ID | Node Type | Change Type | Contracts | Guardrail Packs |
|---------|-----------|-------------|-----------|-----------------|
| `cursor-companion` | app | modify | webview messages, workspace target, operator surface state | `guardrail:chrome-extension-mv3`, `guardrail:web-frontend` |
| `cursor-companion/extension-host` | component | split/modify | command registration, panel routing, workspace targeting | `guardrail:chrome-extension-mv3`, `guardrail:typescript-core` |
| `control-plane` | app | modify | operator routes for context carts, visual artifacts, budget snapshots, session projections | `guardrail:typescript-core`, `guardrail:workspace-governance` |
| `packages/core` | package | modify | planning context, refinement, visual artifact, usage snapshot, run/session projections | `guardrail:typescript-core` |
| `packages/model-gateway` | package | modify | provider route usage and health projection | `guardrail:typescript-core`, `guardrail:terminal-agent-adapters` |
| `configs/model-routing` | config | modify | routing and budget defaults | `guardrail:workspace-governance` |
| `configs/terminal-adapters` | config | modify | adapter capability and limit metadata | `guardrail:terminal-agent-adapters` |
| `configs/providers` | config | modify | provider capability and risk-fit metadata | `guardrail:workspace-governance` |
| `schemas/operator-surface` | contract pack | new | workspace target, context cart, refinement session, visual artifact, execution budget snapshot | `guardrail:typescript-core` |
| `state/analysis + continuity` | state | modify | saved context bundles, visual artifacts, session projections, continuity links | `guardrail:workspace-governance` |
| `docs/intent + docs/diagrams + docs/guides` | docs | new/modify | operator workflow, rollout, handoff | `guardrail:workspace-governance` |

---

## Work Order Sequence Summary

- **Total Work Orders**: 11
- **Milestones**:
  - `M1` contract pack and shell refactor
  - `M2` workspace targeting and refinement flow
  - `M3` visual artifacts and plan board
  - `M4` budget posture, execution sessions, and windowing
  - `M5` verification, docs, and rollout
- **Critical Path**: `WO-CC-001 -> WO-CC-002 -> WO-CC-003 -> WO-CC-004 -> WO-CC-005 -> WO-CC-006 -> WO-CC-008 -> WO-CC-010 -> WO-CC-011`
- **Parallelizable**: `WO-CC-005` and `WO-CC-006` after `WO-CC-004`; `WO-CC-007` and `WO-CC-009` after `WO-CC-003`
- **Approval Gates**: `WO-CC-001` (contract/ADR review), `WO-CC-007` (provider budget posture review), `WO-CC-010` (verification gate), `WO-CC-011` (rollout handoff)

---

## Work Order Sequence

1. **WO-CC-001**: operator-surface-contract-pack → `@systems-architect` (`strategic_reasoning`) [depends on: none]
2. **WO-CC-002**: cursor-companion-shell-refactor → `@builder` (`deterministic_transformation`) [depends on: WO-CC-001]
3. **WO-CC-003**: workspace-target-resolution-and-persistence → `@builder` (`deterministic_transformation`) [depends on: WO-CC-001, WO-CC-002]
4. **WO-CC-004**: context-cart-and-requirement-refinement → `@builder` (`deterministic_transformation`) [depends on: WO-CC-001, WO-CC-003]
5. **WO-CC-005**: visual-artifact-generation-and-viewer → `@builder` (`deterministic_transformation`) [depends on: WO-CC-004]
6. **WO-CC-006**: plan-and-work-order-board → `@builder` (`deterministic_transformation`) [depends on: WO-CC-004]
7. **WO-CC-007**: provider-adapter-budget-surface → `@builder` (`deterministic_transformation`) [depends on: WO-CC-003]
8. **WO-CC-008**: approved-execution-session-board → `@builder` (`deterministic_transformation`) [depends on: WO-CC-006, WO-CC-007]
9. **WO-CC-009**: secondary-window-and-pop-out-flow → `@builder` (`deterministic_transformation`) [depends on: WO-CC-003]
10. **WO-CC-010**: verification-and-hardening → `@verifier` (`verification`) [depends on: WO-CC-005, WO-CC-006, WO-CC-008, WO-CC-009]
11. **WO-CC-011**: release-handoff-and-operator-docs → `@docs-release-agent` (`learning`) [depends on: WO-CC-010]

---

## Work Orders

### WO-CC-001: operator-surface-contract-pack

- **Lifecycle Stage**: `architect`
- **Phase ID**: `cursor-companion-operator-contract-pack`
- **Task Class**: `strategic_reasoning`
- **Agent Role**: `systems-architect`
- **Model Tier**: `frontier_reasoner`
- **File Scope**:
  - `apps/flagship-foundry/schemas/workspace-target.schema.json`
  - `apps/flagship-foundry/schemas/context-cart.schema.json`
  - `apps/flagship-foundry/schemas/requirement-refinement-session.schema.json`
  - `apps/flagship-foundry/schemas/visual-artifact.schema.json`
  - `apps/flagship-foundry/schemas/execution-budget-snapshot.schema.json`
  - `apps/flagship-foundry/docs/adr/adr-013-cursor-companion-operator-surface.md`
  - `apps/flagship-foundry/tests/operator-surface-contracts.test.mjs`
- **Source Artifacts**:
  - `docs/intent/intent-cursor-companion-sdlc-operator-2026-04-02.md`
  - `docs/imported/work-order-summary.md`
  - `apps/flagship-foundry/docs/IDE_ENVIRONMENT_SPEC.md`
  - `apps/flagship-foundry/configs/model-routing/default.json`
  - `apps/flagship-foundry/configs/terminal-adapters/*.json`
- **Constraints**:
  - Keep declared state separate from observed runtime telemetry.
  - Keep v1 scoped to one workspace target per active companion session.
  - Treat provider budget data as advisory projection, not invoice truth.
  - Do not require undocumented Cursor APIs for windowing.
- **Acceptance Criteria**:
  - [ ] The five new schemas validate and clearly separate declared artifacts from observed telemetry/session state.
  - [ ] The ADR locks the extension-first posture, host-window pop-out assumption, and local-first authority model.
  - [ ] `workspace-target` includes an explicit root path and stable identifier for the bound workspace.
  - [ ] `context-cart` and `requirement-refinement-session` can express gaps, unresolved assumptions, and DoR state.
  - [ ] `visual-artifact` supports C4, flow, UML, pseudocode, schema, and contract views without coupling to one renderer.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && pnpm exec node --test tests/operator-surface-contracts.test.mjs`
- **Rollback Notes**: Revert the new schemas, ADR, and test file only.
- **Approval Required**: yes

### WO-CC-002: cursor-companion-shell-refactor

- **Lifecycle Stage**: `implement`
- **Phase ID**: `cursor-companion-shell-refactor`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/apps/cursor-companion/extension.js`
  - `apps/flagship-foundry/apps/cursor-companion/control-plane-client.js`
  - `apps/flagship-foundry/apps/cursor-companion/operator-panel.js`
  - `apps/flagship-foundry/apps/cursor-companion/panel-state.js`
  - `apps/flagship-foundry/tests/cursor-companion-shell.test.mjs`
- **Source Artifacts**: `WO-CC-001` outputs
- **Constraints**: preserve current commands; keep `extension.js` as entrypoint; move orchestration logic into helpers instead of expanding the monolith further.
- **Acceptance Criteria**:
  - [ ] Existing commands still work.
  - [ ] Webview rendering and message handling are delegated to helper modules.
  - [ ] Control-plane fetch logic is centralized.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test tests/cursor-companion-shell.test.mjs`
- **Rollback Notes**: Revert helper modules and restore prior `extension.js`.

### WO-CC-003: workspace-target-resolution-and-persistence

- **Lifecycle Stage**: `implement`
- **Phase ID**: `workspace-target-resolution-and-persistence`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/packages/core/src/workspace-targets.mjs`
  - `apps/flagship-foundry/apps/control-plane/src/server.mjs`
  - `apps/flagship-foundry/apps/cursor-companion/workspace-target.js`
  - `apps/flagship-foundry/tests/workspace-targets.test.mjs`
- **Source Artifacts**: `WO-CC-001`, `WO-CC-002`
- **Constraints**: require explicit target selection when ambiguous; persist target as typed artifact; no hidden editor-only target state.
- **Acceptance Criteria**:
  - [ ] Companion displays the bound workspace target before plan/run actions.
  - [ ] Multi-root ambiguity requires explicit operator choice.
  - [ ] Retargeting updates the saved workspace-target artifact and panel state consistently.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test tests/workspace-targets.test.mjs`
- **Rollback Notes**: Revert workspace-target module, route additions, and panel wiring.

### WO-CC-004: context-cart-and-requirement-refinement

- **Lifecycle Stage**: `implement`
- **Phase ID**: `context-cart-and-requirement-refinement`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/packages/core/src/context-cart.mjs`
  - `apps/flagship-foundry/packages/core/src/requirement-refinement.mjs`
  - `apps/flagship-foundry/apps/control-plane/src/server.mjs`
  - `apps/flagship-foundry/apps/cursor-companion/context-cart.js`
  - `apps/flagship-foundry/apps/cursor-companion/requirement-panel.js`
  - `apps/flagship-foundry/tests/context-cart.test.mjs`
- **Constraints**: generated work orders must be blocked until DoR minimum fields are present; selected context must remain traceable to files/artifacts.
- **Acceptance Criteria**:
  - [ ] Operator can add files, nodes, packets, and notes into a saved context cart.
  - [ ] Gap analysis and refinement results map into a typed refinement session artifact.
  - [ ] DoR status is visible and can block plan generation when required fields are missing.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test tests/context-cart.test.mjs`
- **Rollback Notes**: Revert refinement modules and saved-artifact routes.

### WO-CC-005: visual-artifact-generation-and-viewer

- **Lifecycle Stage**: `implement`
- **Phase ID**: `visual-artifact-generation-and-viewer`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/packages/core/src/visual-artifacts.mjs`
  - `apps/flagship-foundry/apps/control-plane/src/server.mjs`
  - `apps/flagship-foundry/apps/cursor-companion/diagram-panel.js`
  - `apps/flagship-foundry/tests/visual-artifacts.test.mjs`
- **Constraints**: save generated artifacts as typed outputs; support C4, flow, UML, pseudocode, schema, and contract views; link back to source when possible.
- **Acceptance Criteria**:
  - [ ] Generated artifacts can be rendered in the companion and reopened from stored state.
  - [ ] Mermaid/C4 output works for system and container diagrams.
  - [ ] Non-diagram explainers still persist as typed visual artifacts.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test tests/visual-artifacts.test.mjs`
- **Rollback Notes**: Revert visual-artifact pipeline and diagram panel wiring.

### WO-CC-006: plan-and-work-order-board

- **Lifecycle Stage**: `implement`
- **Phase ID**: `plan-and-work-order-board`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/packages/core/src/plans.mjs`
  - `apps/flagship-foundry/apps/control-plane/src/server.mjs`
  - `apps/flagship-foundry/apps/cursor-companion/planning-board.js`
  - `apps/flagship-foundry/tests/planning-board.test.mjs`
- **Constraints**: approval remains authoritative; show dependencies and file scope before launch; integrate existing plan/create/approve routes rather than forking logic.
- **Acceptance Criteria**:
  - [ ] Companion can create plans from a refinement session or explicit objective.
  - [ ] Work-order dependency and file-scope views are visible in-panel.
  - [ ] Approval actions route through existing control-plane approval flows.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test tests/planning-board.test.mjs`
- **Rollback Notes**: Revert planning-board UI and related route/plan projections.

### WO-CC-007: provider-adapter-budget-surface

- **Lifecycle Stage**: `implement`
- **Phase ID**: `provider-adapter-budget-surface`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/packages/model-gateway/src/gateway.mjs`
  - `apps/flagship-foundry/configs/model-routing/default.json`
  - `apps/flagship-foundry/configs/providers/providers.json`
  - `apps/flagship-foundry/configs/terminal-adapters/*.json`
  - `apps/flagship-foundry/apps/control-plane/src/server.mjs`
  - `apps/flagship-foundry/apps/cursor-companion/provider-dashboard.js`
  - `apps/flagship-foundry/tests/provider-budget-surface.test.mjs`
- **Constraints**: budget view is advisory; do not turn routing metadata into hard billing truth; keep adapter metadata thin and declarative.
- **Acceptance Criteria**:
  - [ ] Companion shows configured providers/adapters, route fit, and health.
  - [ ] Usage snapshot is sourced from model-gateway or adapter telemetry, not hand-entered panel state.
  - [ ] Codex, Claude Code, Cursor, Gemini, and local runtimes are visible when configured.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test tests/provider-budget-surface.test.mjs`
- **Rollback Notes**: Revert dashboard, telemetry projection, and config-field additions.

### WO-CC-008: approved-execution-session-board

- **Lifecycle Stage**: `implement`
- **Phase ID**: `approved-execution-session-board`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/packages/core/src/runs.mjs`
  - `apps/flagship-foundry/packages/core/src/session-projection.mjs`
  - `apps/flagship-foundry/apps/control-plane/src/server.mjs`
  - `apps/flagship-foundry/apps/cursor-companion/session-board.js`
  - `apps/flagship-foundry/tests/session-board.test.mjs`
- **Constraints**: launch only approved plans/work orders; surface continuity/evidence/logs as projections, not local side effects.
- **Acceptance Criteria**:
  - [ ] Session board can start, pause, resume, and stop approved runs.
  - [ ] Session state includes adapter ID, mode, evidence references, continuity links, and logs pointer.
  - [ ] Rollback posture is visible for execute-mode runs.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test tests/session-board.test.mjs`
- **Rollback Notes**: Revert session-board UI and related projection routes.

### WO-CC-009: secondary-window-and-pop-out-flow

- **Lifecycle Stage**: `implement`
- **Phase ID**: `secondary-window-and-pop-out-flow`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/apps/cursor-companion/extension.js`
  - `apps/flagship-foundry/apps/cursor-companion/window-launcher.js`
  - `apps/flagship-foundry/apps/cursor-companion/README.md`
  - `apps/flagship-foundry/tests/cursor-companion-windowing.test.mjs`
- **Constraints**: use documented host-window behavior only; preserve workspace target across windows; do not invent a private second state store.
- **Acceptance Criteria**:
  - [ ] Operator can open the companion in a second host-supported window flow.
  - [ ] The reopened surface keeps or restores the same workspace target.
  - [ ] Fallback behavior is explicit when the host cannot detach the panel.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test tests/cursor-companion-windowing.test.mjs`
- **Rollback Notes**: Revert window-launcher logic and README guidance.

### WO-CC-010: verification-and-hardening

- **Lifecycle Stage**: `verify`
- **Phase ID**: `cursor-companion-operator-verification`
- **Task Class**: `verification`
- **Agent Role**: `verifier`
- **Model Tier**: `balanced_reasoner`
- **File Scope**:
  - `apps/flagship-foundry/tests/cursor-companion-shell.test.mjs`
  - `apps/flagship-foundry/tests/workspace-targets.test.mjs`
  - `apps/flagship-foundry/tests/context-cart.test.mjs`
  - `apps/flagship-foundry/tests/visual-artifacts.test.mjs`
  - `apps/flagship-foundry/tests/planning-board.test.mjs`
  - `apps/flagship-foundry/tests/provider-budget-surface.test.mjs`
  - `apps/flagship-foundry/tests/session-board.test.mjs`
  - `apps/flagship-foundry/tests/cursor-companion-windowing.test.mjs`
- **Constraints**: cover regression of existing overlay commands; include smoke for extension routing and control-plane gating.
- **Acceptance Criteria**:
  - [ ] New operator surfaces pass targeted tests.
  - [ ] Existing import/knowledge/gap/focus/plan/run controls remain functional.
  - [ ] Approval gating and state-authority rules still hold under execute-mode and simulate-mode flows.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && node --test`
- **Rollback Notes**: Disable feature flag and revert only operator-surface additions if regressions are found.
- **Approval Required**: yes

### WO-CC-011: release-handoff-and-operator-docs

- **Lifecycle Stage**: `release`
- **Phase ID**: `cursor-companion-operator-release-handoff`
- **Task Class**: `learning`
- **Agent Role**: `docs-release-agent`
- **Model Tier**: `balanced_reasoner`
- **File Scope**:
  - `apps/flagship-foundry/apps/cursor-companion/README.md`
  - `apps/flagship-foundry/docs/guides/cursor-extension-foundry-init.md`
  - `docs/handoff/handoff-cursor-companion-sdlc-operator-2026-04-02.md`
  - `apps/flagship-foundry/docs/release/cursor-companion-operator-rollout.md`
- **Constraints**: docs must explain host-window limitations, workspace-target authority, rollback, and provider-budget semantics clearly.
- **Acceptance Criteria**:
  - [ ] Operator docs describe the new cockpit flow from context selection through approved execution.
  - [ ] Rollout and rollback steps are explicit.
  - [ ] Handoff references the verification evidence and next improvement opportunities.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - Manual doc review against the intent and verification evidence
- **Rollback Notes**: Revert docs and handoff artifacts only.
- **Approval Required**: yes

---

## First Work Order (Ready to Execute)

### WO-CC-001: operator-surface-contract-pack

- **Lifecycle Stage**: `architect`
- **Phase ID**: `cursor-companion-operator-contract-pack`
- **Task Class**: `strategic_reasoning`
- **Agent Role**: `systems-architect`
- **Model Tier**: `frontier_reasoner`
- **File Scope**:
  - `apps/flagship-foundry/schemas/workspace-target.schema.json`
  - `apps/flagship-foundry/schemas/context-cart.schema.json`
  - `apps/flagship-foundry/schemas/requirement-refinement-session.schema.json`
  - `apps/flagship-foundry/schemas/visual-artifact.schema.json`
  - `apps/flagship-foundry/schemas/execution-budget-snapshot.schema.json`
  - `apps/flagship-foundry/docs/adr/adr-013-cursor-companion-operator-surface.md`
  - `apps/flagship-foundry/tests/operator-surface-contracts.test.mjs`
- **Source Artifacts**:
  - `docs/intent/intent-cursor-companion-sdlc-operator-2026-04-02.md`
  - `docs/imported/work-order-summary.md`
  - `apps/flagship-foundry/docs/IDE_ENVIRONMENT_SPEC.md`
  - `apps/flagship-foundry/configs/model-routing/default.json`
  - `apps/flagship-foundry/configs/terminal-adapters/*.json`
- **Constraints**:
  - Keep declared state separate from observed runtime telemetry.
  - Keep v1 scoped to one workspace target per active companion session.
  - Treat provider budget data as advisory projection, not invoice truth.
  - Do not require undocumented Cursor APIs for windowing.
- **Acceptance Criteria**:
  - [ ] The five new schemas validate and clearly separate declared artifacts from observed telemetry/session state.
  - [ ] The ADR locks the extension-first posture, host-window pop-out assumption, and local-first authority model.
  - [ ] `workspace-target` includes an explicit root path and stable identifier for the bound workspace.
  - [ ] `context-cart` and `requirement-refinement-session` can express gaps, unresolved assumptions, and DoR state.
  - [ ] `visual-artifact` supports C4, flow, UML, pseudocode, schema, and contract views without coupling to one renderer.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
  - `cd apps/flagship-foundry && pnpm exec node --test tests/operator-surface-contracts.test.mjs`
- **Rollback Notes**: Revert the new schemas, ADR, and test file only.
- **Approval Required**: yes
