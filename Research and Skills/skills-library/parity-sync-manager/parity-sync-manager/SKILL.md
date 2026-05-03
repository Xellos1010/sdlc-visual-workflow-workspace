---
name: parity-sync-manager
description: maintain two-way parity between requirements, schemas, pseudocode, code, tests, diagrams, adrs, evidence, and durable memory in a cloud-agent sdlc workflow. use after implementation, validation, adr or decision-ledger updates, human engineer code changes, architecture drift detection, code-to-pseudocode reconciliation, or before closing a work order when artifacts may be out of sync and need a parity report, sync patches, or human review flag.
---

# Parity Sync Manager

Verify and restore two-way parity across the artifacts that define a cloud-agent SDLC task: requirements, work orders, schemas, pseudocode, implementation, tests, diagrams, ADRs, evidence, decision ledger, and memory state.

## Core rule

Do not treat code as the only source of truth. Determine the current authority order from the work order and project conventions. When artifacts disagree, report the conflict and propose the smallest safe synchronization patch. Do not silently rewrite upstream planning artifacts to match unapproved code.

## Required inputs

Normalize available context into:

- `artifact_diffs`: changed requirements, work orders, schemas, pseudocode, diagrams, ADRs, tests, memory, or docs.
- `implementation_diff`: code changes from the agent or a human engineer.
- `validation_report`: test execution, generated code review, type checks, benchmarks, or manual verification.
- `adr_index`: ADR index patch or existing ADR index.
- `decision_ledger_entry.json`: recent decision ledger entry, if available.
- `current_memory_state`: `.foundry/projects/<slug>/current-task.json` or equivalent continuity state.

If a required artifact is unavailable, mark it missing and continue with a partial parity report instead of guessing.

## Workflow

1. Build the artifact inventory using `references/artifact-authority-map.md`.
2. Determine the authority order for this change:
   - Human-approved direct code change may temporarily make implementation authoritative, but must trigger reverse synchronization.
   - Agent-generated implementation must conform to approved requirements, schemas, pseudocode, tests, and ADRs.
   - ADRs and decision ledger entries govern long-lived architectural intent.
3. Compare artifacts across these parity axes:
   - requirement to work order
   - work order to schema
   - schema to pseudocode
   - pseudocode to implementation
   - implementation to tests
   - tests to validation evidence
   - ADRs and decision ledger to all affected artifacts
   - diagrams and memory to current implementation state
4. Classify each mismatch:
   - `missing_artifact`
   - `stale_artifact`
   - `contradiction`
   - `unverified_change`
   - `authority_conflict`
   - `acceptable_divergence`
5. Decide the safe action for each mismatch:
   - `patch_upstream_artifact`
   - `patch_downstream_artifact`
   - `create_followup_work_order`
   - `request_human_review`
   - `accept_with_rationale`
6. Generate `parity_report.json` using `references/parity-report-schema.json`.
7. Produce sync patches or patch candidates. Never claim a patch was applied unless it was actually written.
8. Set `human_review_needed` when authority is ambiguous, evidence is missing, or an irreversible artifact would be changed.
9. Produce `next_skill_handoff` for `memory-continuity-manager`.

## Output contract

Always return this structure:

```markdown
# Parity Sync Report

## Verdict
in_sync | sync_needed | blocked | human_review_needed

## parity_report.json
```json
{}
```

## Out-of-sync artifacts
| Artifact | Mismatch | Authority | Recommended action |
|---|---|---|---|

## Sync patches
```json
[]
```

## Human review needed
yes | no

## Follow-up work orders
- <work order or none>

## next_skill_handoff
<handoff for memory-continuity-manager>
```

If editing a repository directly, apply only low-risk sync patches that the active task authorizes. Otherwise return patch candidates and mark `human_review_needed`.

## Parity policy

- Agent-generated code cannot override approved pseudocode, schemas, tests, or ADRs without a new decision record.
- Approved human code may lead temporarily, but must create reverse-sync tasks for pseudocode, schemas, tests, ADRs, diagrams, and memory.
- Missing validation prevents `in_sync` unless the task explicitly has no executable validation path.
- Diagrams are default-off artifacts. Flag stale diagrams only when they already exist, are referenced by the work order, or the user requested diagram parity.
- Memory updates belong downstream. Do not directly rewrite continuity state unless the user explicitly asks; hand off the required patch to `memory-continuity-manager`.

## Quality checklist

Before finalizing, verify:

- Every changed artifact was considered or explicitly marked unavailable.
- Each mismatch names an authority source.
- Sync patches are scoped and reversible.
- Human review is required for ambiguous authority or missing evidence.
- The memory handoff includes enough detail to update `.foundry/projects/<slug>/current-task.json`.
