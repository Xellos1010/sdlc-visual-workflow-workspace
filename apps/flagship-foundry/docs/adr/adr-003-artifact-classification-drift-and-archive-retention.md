# ADR-003: Classify Artifacts, Drift Rules, and Archive Retention

## Status
accepted

## Date
2026-03-23

## Context
The repo includes active code, duplicated artifacts, generated outputs, packaged research, and iterative copies.

`WO-FF-003` requires explicit classification and retention rules before drift automation or cleanup can run.

## Options Considered

### Option A: Retain all copies indefinitely; informational drift only
**Description**: Keep all duplicates and archives without lifecycle rules.  
**Pros**: No immediate cleanup risk.  
**Cons**: Persistent ambiguity and search noise.

### Option B: Aggressive duplicate deletion after canonical selection
**Description**: Remove duplicates immediately.  
**Pros**: Fast simplification.  
**Cons**: High rollback risk.

### Option C: Three classes with explicit drift and retention rules
**Description**: Canonical, generated, archive with class-specific handling.  
**Pros**: Safe automation, reversible migration, objective drift checks.  
**Cons**: Requires inventory and policy discipline.

## Decision
Choose **Option C**.

Artifact classes:
- **Canonical**: authoritative human-maintained sources.
- **Generated**: reproducible outputs; manual edits are non-authoritative.
- **Archive**: historical snapshots and iterative copies retained for rollback/audit.

Retention policy:
- Keep archive snapshots for at least 30 days and one successful release cycle after replacement, whichever is longer.
- No destructive cleanup until parity checks are green and approval is recorded.

## Consequences

### Positive
- Unblocks safe drift policy implementation.
- Preserves rollback while enabling cleanup later.
- Clarifies handling of packaged research and iterative copies.

### Negative
- Some duplicates remain in short term.
- Inventory maintenance becomes ongoing work.

### Risks
- Misclassification can hide real drift.
- Archive volume can grow if cleanup discipline slips.

## References
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/.cursor/plans/foundry-gap-analysis-intent_d20ed327.plan.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/docs/REPOSITORY_LAYOUT.md`
