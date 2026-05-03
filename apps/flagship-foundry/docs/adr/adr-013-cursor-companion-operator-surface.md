# ADR-013: Define Cursor Companion as the Extension-First SDLC Operator Surface

## Status
proposed

## Date
2026-04-02

## Context
The current `apps/cursor-companion/` extension already starts the control plane, imports the open workspace, ingests seed knowledge, runs gap analysis, generates focus graphs, and exposes basic plan/run controls. It is useful, but it is still a thin overlay over scattered workflow primitives rather than the primary operator surface for a repository opened in Cursor.

The requested product direction is broader:
- curate explicit AI context from the active repository
- refine requirements until work orders are Definition-of-Ready complete
- generate and view diagrams, contracts, and explainers
- inspect plan/work-order scope and approvals
- understand provider, adapter, and usage posture
- launch and monitor approved execution for the targeted workspace

Three risks appear immediately if this is implemented without a governing decision:

1. The extension could become a second, editor-local source of truth for lifecycle state.
2. Workspace targeting could remain implicit, causing plans or runs to bind to the wrong repo in multi-root or restored sessions.
3. Provider budget and session status could be mixed into declared artifacts without separating observed runtime facts from operator-authored intent.

## Options Considered

### Option A: Keep the extension as a convenience overlay and push most operator work back to CLI/docs
**Description**: Preserve the current extension shape and continue using docs, raw state files, and CLI commands as the main operator workflow.  
**Pros**: Lowest immediate engineering cost.  
**Cons**: Keeps the SDLC workflow fragmented and undermines the stated goal of using the extension as the main operating surface.

### Option B: Make Cursor Companion the extension-first operator surface over a control-plane authority
**Description**: Treat the extension as the canonical editor-side cockpit, but keep plans, runs, continuity, evidence, diagrams, and provider posture grounded in typed Foundry artifacts owned by the control plane.  
**Pros**: Matches the product direction, keeps the extension useful today, and preserves control-plane independence.  
**Cons**: Requires explicit contracts, helper-module refactors, and clear modeling of declared versus observed state.

### Option C: Let the extension own local workflow state first and reconcile later
**Description**: Optimize for rapid UI iteration by storing lifecycle state directly in panel/session state and backfilling contracts later.  
**Pros**: Fastest initial UI iteration.  
**Cons**: Violates artifact authority, increases drift risk, and makes later migration into Foundry contracts more expensive.

## Decision
Choose **Option B**.

Normative rules:
- Cursor Companion is the **extension-first operator surface** for the current product phase.
- The extension is a **projection and control surface**, not the authority for plans, runs, continuity, evidence, or provider state.
- Every major interaction must resolve to typed artifacts or typed control-plane projections.
- Workspace targeting is explicit and modeled as a first-class contract rather than inferred from whichever file happened to be active.
- Requirement refinement and context selection must produce reusable artifacts that can be reopened, reviewed, and handed off.
- Visual outputs such as C4, flow, UML, pseudocode, schema, and contract views must be stored as typed artifacts instead of transient webview-only strings.
- Provider budget and runtime health are **observed advisory state**; they must not be confused with declared planning authority.
- “Pop-out mode” is implemented through host-supported new-window behavior or second-window flows only. The design must not depend on undocumented Cursor internals.
- Approved execution remains mediated by the existing control-plane approval boundary; the extension must not launch arbitrary nodes or prompts outside approved plan/work-order contracts.

## Consequences

### Positive
- Gives the extension a clear product role without weakening the control plane.
- Establishes explicit contracts before the UI surface grows further.
- Makes workspace scoping, context reuse, and handoff reproducible.
- Leaves room for a future Theia shell without discarding extension work.

### Negative
- Adds upfront schema and projection work before richer UI behavior ships.
- Requires the current monolithic extension host to be split into helper modules.
- Some “pop-out” expectations remain bounded by the host editor’s documented window model.

### Risks
- If the extension bypasses typed artifacts for speed, lifecycle drift will return quickly.
- If workspace targeting is not explicit in every workflow, multi-root mistakes will be hard to diagnose.
- If budget posture is treated as authoritative billing truth too early, operator decisions may be based on incomplete telemetry.

## DoD Indicators
- [ ] Contracts exist for workspace target, context cart, requirement refinement session, visual artifact, and execution budget snapshot.
- [ ] The extension can identify the bound workspace target before creating plans or runs.
- [ ] Visual and refinement outputs persist as typed artifacts rather than only in transient webview state.
- [ ] Budget posture is modeled as observed advisory data, separate from declared planning artifacts.
- [ ] Approved execution still routes through the control plane and existing approval model.

## References
- `docs/intent/intent-cursor-companion-sdlc-operator-2026-04-02.md`
- `docs/plan/work-orders-cursor-companion-sdlc-operator-2026-04-02.md`
- `apps/flagship-foundry/apps/cursor-companion/extension.js`
- `apps/flagship-foundry/docs/IDE_ENVIRONMENT_SPEC.md`
- `docs/imported/work-order-summary.md`
