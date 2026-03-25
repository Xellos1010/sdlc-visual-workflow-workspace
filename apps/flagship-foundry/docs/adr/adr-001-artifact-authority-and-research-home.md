# ADR-001: Establish Artifact Authority and Research Home

## Status
accepted

## Date
2026-03-23

## Context
The initiative spans two planes with different roles:
- `flagship-foundry-work/` is the canonical runnable application root.
- The parent workspace contains rules, skills, plans, and research artifacts that are valuable inputs but not consistently authoritative.

`WO-FF-001` requires an explicit authority model before source-of-truth mapping and sync-direction policy can be executed safely.

## Options Considered

### Option A: Keep root-level research as a co-equal canonical source
**Description**: Treat root research and `flagship-foundry-work/docs/` as peers.  
**Pros**: Minimal migration effort.  
**Cons**: Ongoing ambiguity and drift.

### Option B: Move all research immediately under `flagship-foundry-work/docs/`
**Description**: Force immediate migration before implementation begins.  
**Pros**: Single clear home quickly.  
**Cons**: High blast radius and broken references.

### Option C: Dual-plane with curated promotion into canonical docs
**Description**: Keep `flagship-foundry-work/` authoritative. Root-level research remains reference-only until curated and promoted into canonical docs.  
**Pros**: Clear authority, low migration risk, supports phased transition.  
**Cons**: Temporary dual locations remain.

## Decision
Choose **Option C**.

- Canonical behavior-defining documentation lives under `flagship-foundry-work/docs/`.
- Root-level research artifacts are supporting references unless explicitly promoted.
- Sync direction is canonical -> projections only.

## Consequences

### Positive
- Unblocks `WO-FF-001` with explicit authority boundaries.
- Reduces accidental writes to non-canonical areas.
- Preserves historical material without immediate destructive moves.

### Negative
- Temporary dual-document locations persist.
- Promotion workflow must be enforced.

### Risks
- Teams may continue using root artifacts as authority unless documentation is prominent.
- Promotion backlog could delay consolidation.

## References
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/.cursor/plans/foundry-gap-analysis-intent_d20ed327.plan.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/README.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/README.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/docs/REPOSITORY_LAYOUT.md`
