---
name: code-to-pseudocode-reconciler
description: reverse-synchronize accepted code changes back into pseudocode contracts, schemas, diagrams, test specifications, work-order memory, and parity artifacts in a cloud-agent sdlc workflow. use when human code, generated implementation, or repository reality makes upstream planning artifacts stale, when a human_delta_record.json or implementation diff must become pseudocode_patch.json, schema patch candidates, diagram patch candidates, parity gaps, or a handoff to parity-sync-manager.
---

# Code To Pseudocode Reconciler

Translate accepted implementation reality back into upstream artifacts. This skill produces patch candidates that keep pseudocode, schemas, diagrams, tests, work orders, and memory aligned with code.

## Core rule

Do not rewrite the intended design merely because code changed. First decide whether the code is accepted source of truth, an implementation bug, a partial change, or a review candidate. Only accepted changes become authoritative patch candidates.

## Required inputs

Normalize available context into:

- `human_delta_record.json` or implementation diff.
- `current_pseudocode_contract`: existing pseudocode, generated plan, algorithm contract, or design notes.
- `current_schemas`: API schemas, data models, type contracts, block schemas, database schema, or event contracts.
- `architecture_snapshot`: C4/UML/dataflow notes, component ownership, boundaries, dependency direction, and ADR index when available.

## Workflow

1. Read the delta and determine acceptance state.
2. Identify code behavior now expressed by the implementation.
3. Compare implementation behavior against current pseudocode.
4. Classify mismatches using `references/artifact-reconciliation-rules.md`.
5. Generate a minimal `pseudocode_patch.json` using `references/pseudocode-patch-schema.json`.
6. Generate schema patch candidates only for contract or data-shape changes.
7. Generate diagram patch candidates only for architecture, dependency, boundary, or data-flow changes.
8. Record parity gaps that need validation, ADR updates, test updates, or human review.
9. Produce `next_skill_handoff` for `parity-sync-manager`. Include a handoff to `software-engineer-decision-capture` if the change implies a design decision not represented in ADRs.

## Output contract

Always return this structure:

```markdown
# Code To Pseudocode Reconciliation

## Verdict
reconciled | reconciled_with_review_needed | blocked

## pseudocode_patch.json
```json
{}
```

## Schema patch candidates
```json
[]
```

## Diagram patch candidates
```json
[]
```

## Parity gaps
| Artifact | Gap | Severity | Required owner |
|---|---|---|---|

## ADR or decision candidates
- <candidate or none>

## Review questions
- <question or none>

## next_skill_handoff
<handoff for parity-sync-manager and, when needed, software-engineer-decision-capture>
```

## Reconciliation policy

- Prefer minimal patches over wholesale artifact rewrites.
- Preserve old pseudocode history when the repository has a patch or diff convention.
- Keep generated patch candidates reviewable and traceable to files, lines, commits, or PRs where possible.
- Mark behavior as `observed_from_code` unless supported by human notes, tests, or ADRs.
- If the code contradicts an accepted ADR, do not silently update the ADR. Flag `adr_conflict` for decision capture and parity sync.
- If tests were not updated for behavior changes, add a parity gap.
- If schema changes lack migration or compatibility evidence, add a high-severity parity gap.

## Quality checklist

Before finalizing, verify:

- Each pseudocode patch maps to a changed behavior or explicit contract change.
- Schema candidates are separated from pseudocode patches.
- Diagram candidates are only proposed for structural or flow changes.
- Parity gaps include severity and owner skill.
- The handoff contains enough artifact paths and summaries for `parity-sync-manager`.
