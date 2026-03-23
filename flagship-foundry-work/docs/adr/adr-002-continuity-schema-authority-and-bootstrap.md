# ADR-002: Define Continuity Schema Authority and Bootstrap Path

## Status
accepted

## Date
2026-03-23

## Context
The workflow depends on machine-readable continuity state for deterministic resume and lifecycle routing.

Current signals:
- `flagship-foundry-work/schemas/continuity-state.schema.json` exists.
- Operational continuity commonly uses `.codex/projects/<project>/current-task.json`.

`WO-FF-002` needs one contract authority and one runtime instance authority.

## Options Considered

### Option A: Keep continuity state only inside `flagship-foundry-work/state/`
**Description**: Use Foundry state as both schema and runtime authority.  
**Pros**: Single app-root boundary.  
**Cons**: Conflicts with existing resume workflows.

### Option B: Let each tool own separate continuity contracts
**Description**: Keep `.codex/.cursor/.claude` independent.  
**Pros**: Low immediate change.  
**Cons**: Guaranteed drift and non-deterministic behavior.

### Option C: Separate contract authority from runtime instance authority
**Description**: Foundry owns schema; active runtime instance lives at `.codex/projects/<project>/current-task.json`.  
**Pros**: Contract-first with practical compatibility.  
**Cons**: Requires migration and clear documentation.

## Decision
Choose **Option C**.

- Contract authority: `flagship-foundry-work/schemas/continuity-state.schema.json`.
- Runtime instance authority: `.codex/projects/<project>/current-task.json`.
- Any mirrors are derived, not authoritative.

## Consequences

### Positive
- Unblocks `WO-FF-002`.
- Preserves deterministic resume expectations.
- Supports parity projection without duplicated authority.

### Negative
- Requires schema migration and compatibility checks.
- Adds conceptual split (contract owner vs instance owner).

### Risks
- Legacy tooling may assume old phase semantics.
- Missing bootstrap files can cause routing failures.

## References
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/.cursor/plans/foundry-gap-analysis-intent_d20ed327.plan.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/schemas/continuity-state.schema.json`
