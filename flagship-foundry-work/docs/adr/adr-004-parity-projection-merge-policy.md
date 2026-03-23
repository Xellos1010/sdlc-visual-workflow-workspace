# ADR-004: Set Parity Projection Merge and Regeneration Policy

## Status
accepted

## Date
2026-03-23

## Context
This initiative requires convergence across `.cursor`, `.codex`, and `.claude` without breaking user-owned local setups.

`WO-FF-004` needs explicit ownership and conflict policy for generated doctrine projections.

## Options Considered

### Option A: Blind overwrite from generated outputs
**Description**: Always regenerate and replace target files.  
**Pros**: Maximum parity consistency.  
**Cons**: High risk to user-owned configs.

### Option B: Advisory diffs only, no writes
**Description**: Detect drift but require full manual edits.  
**Pros**: Lowest overwrite risk.  
**Cons**: High toil and persistent divergence.

### Option C: Detect, diff, merge, and approval for conflicts
**Description**: Auto-apply only machine-owned changes; require approval for user-owned conflicts.  
**Pros**: Balanced safety and automation.  
**Cons**: Requires ownership metadata and conflict flow.

## Decision
Choose **Option C**.

Projection policy:
1. Detect existing artifacts.
2. Generate proposed outputs from canonical source.
3. Diff target vs generated.
4. Auto-apply only to machine-owned or empty targets.
5. Require manual approval for user-owned conflicts.
6. Never blind-overwrite local user configuration.

## Consequences

### Positive
- Unblocks parity pipeline with bounded blast radius.
- Preserves trust in local developer setups.
- Enables scalable parity with explicit conflict handling.

### Negative
- More implementation complexity than pure regenerate/overwrite.
- Conflict queue may require manual triage.

### Risks
- Ownership tagging errors can still cause accidental modifications.
- Weak reporting can slow approvals.

## References
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/.cursor/plans/foundry-gap-analysis-intent_d20ed327.plan.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/environments/README.md`
