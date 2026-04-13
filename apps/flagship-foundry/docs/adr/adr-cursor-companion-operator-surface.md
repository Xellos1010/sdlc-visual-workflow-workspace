# ADR: Cursor Companion as the Contract-First SDLC Operator Surface

## Status
proposed

## Date
2026-04-02

## Context
`apps/flagship-foundry/apps/cursor-companion/extension.js` already provides a working extension entrypoint with commands for:
- control-plane startup,
- workspace import,
- seed knowledge ingestion,
- gap analysis,
- focus-graph generation,
- basic plan creation and run control.

That is enough to prove the extension is a viable operator surface, but not enough to make it the primary SDLC cockpit for the repository currently open in Cursor or a VS Code compatible host. The missing gap is not only UX. The system still lacks explicit contracts for:
- the workspace currently bound to the companion,
- the curated context set handed to AI for refinement,
- the refinement session that decides whether work is ready for plan generation,
- generated visual artifacts and explainers,
- advisory provider/adapter budget posture.

Without those contracts, the extension would either accumulate hidden panel-local state or start leaking orchestration rules into ad hoc UI code. Both outcomes would violate Foundry doctrine that artifacts outrank prompts, approval remains authoritative, and runtime observations are not the same thing as declared state.

## Options Considered

### Option A: Expand the current extension incrementally without new contracts
**Description**: Keep adding buttons, webview sections, and fetch calls to the current extension as needs emerge.  
**Pros**: Fastest path to visible UI changes.  
**Cons**: Hidden state, message drift, and weak separation between declared planning state and observed telemetry.

### Option B: Delay extension work until the future Theia shell exists
**Description**: Keep the current companion minimal and wait for the dedicated IDE shell to absorb operator workflows later.  
**Pros**: Avoids near-term extension complexity.  
**Cons**: Delays operator value, leaves the existing extension underpowered, and forces users back into fragmented CLI/doc/state flows.

### Option C: Treat the Cursor companion as the extension-first operator surface and define new typed contracts before expanding behavior
**Description**: Keep the extension as the near-term cockpit, but require explicit schemas and ADR-level guardrails for workspace targeting, context carts, refinement sessions, visual artifacts, and advisory budget snapshots.  
**Pros**: Preserves control-plane authority, supports iterative UI growth, and keeps the path open for a later Theia shell.  
**Cons**: Adds up-front contract work before UI expansion.

## Decision
Choose **Option C**.

The Cursor companion remains the near-term write-capable operator surface, but it must stay contract-first and control-plane-centered.

Design rules:
- The extension is a **thin operator shell** over control-plane and artifact authority, not a second orchestration authority.
- Every operator action that matters beyond the current click path must resolve to a typed artifact or a typed projection.
- The current workspace target must be explicit and persisted. Multi-root ambiguity cannot be inferred silently.
- AI context curation must flow through a saved context cart, not only transient editor selection.
- Requirement refinement must produce an explicit Definition of Ready posture before plan/work-order generation.
- Generated diagrams and explainers are saved artifacts, not only rendered panel output.
- Provider and adapter budget posture is modeled as an **advisory** snapshot of observed state. It must not be treated as invoice-grade truth.
- Observed runtime state such as provider health, usage, run status, and logs pointers remains separate from declared plans, work orders, and contracts.
- “Pop-out” support for v1 uses documented host-window behavior or a second editor window; the design must not rely on undocumented Cursor internals.

## Consequences

### Positive
- Creates a stable contract layer for the next extension slices instead of letting UI behavior define the model accidentally.
- Preserves a clean split between declared authority and observed telemetry.
- Makes the extension portable across Cursor and other VS Code compatible hosts.
- Keeps the path open for a future Theia shell because the contracts are editor-agnostic.

### Negative
- Adds initial schema and ADR work before the visible cockpit expands.
- Some near-term UX ideas will be deferred until the contracts exist.

### Risks
- If the contracts are too narrow, later operator workflows may need revision and migration.
- If the budget snapshot is over-trusted, operators may mistake advisory telemetry for hard vendor limits.
- If helper modules are not introduced quickly after the contracts land, `extension.js` could continue to accumulate complexity.

## DoD Indicators
- [ ] Schemas exist for `workspace-target`, `context-cart`, `requirement-refinement-session`, `visual-artifact`, and `execution-budget-snapshot`.
- [ ] The new contracts separate declared artifacts from observed telemetry and session state.
- [ ] ADR guidance explicitly preserves control-plane authority and host-supported windowing assumptions.
- [ ] Targeted schema tests compile the new contracts under draft 2020-12.

## References
- `docs/intent/intent-cursor-companion-sdlc-operator-2026-04-02.md`
- `docs/plan/work-orders-cursor-companion-sdlc-operator-2026-04-02.md`
- `apps/flagship-foundry/apps/cursor-companion/extension.js`
- `apps/flagship-foundry/docs/IDE_ENVIRONMENT_SPEC.md`
- `apps/flagship-foundry/configs/model-routing/default.json`
- `apps/flagship-foundry/configs/providers/providers.json`
- `apps/flagship-foundry/configs/terminal-adapters/codex-cli.json`
- `apps/flagship-foundry/configs/terminal-adapters/claude-code.json`
- `apps/flagship-foundry/configs/terminal-adapters/cursor-agent.json`
- `apps/flagship-foundry/configs/terminal-adapters/gemini-cli.json`

