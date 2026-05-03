---
name: human-code-delta-ingestor
description: ingest approved human engineer code changes from commits, pull requests, local diffs, patches, or review notes and convert them into reverse-sync artifacts for the cloud-agent sdlc control plane. use when code was changed outside the autonomous codegen chain, when implementation reality is ahead of pseudocode or architecture docs, when human edits must be reconciled into work orders, schemas, adrs, tests, diagrams, or memory, or when a diff must be routed to downstream reconciliation and decision-capture skills.
---

# Human Code Delta Ingestor

Convert approved human engineer edits into a durable reverse-sync record. This skill lets code lead temporarily, then routes the change back into pseudocode, schemas, ADRs, tests, diagrams, evidence, and memory.

## Core rule

Ingest only accepted or explicitly reviewable human changes. Do not treat speculative, rejected, uncommitted, or unrelated diffs as source of truth. If approval state is unclear, mark the record `review_required` and route only candidate updates downstream.

## Required inputs

Normalize available context into:

- `git_diff`: unified diff, patch, changed files, PR diff, or commit range.
- `commits`: commit hashes, messages, PR references, author, timestamps, and branch names when available.
- `human_notes`: PR comments, review notes, implementation rationale, or chat notes.
- `active_work_order`: current work order, task state, issue, or feature scope.

If a field is missing, preserve that fact in `human_delta_record.json` rather than inventing it.

## Workflow

1. Establish provenance: identify author, source branch, target branch, PR or commit ids, and approval state.
2. Bound the scope: map changed files to the active work order and flag out-of-scope edits.
3. Classify each changed area using `references/reverse-sync-classification.md`.
4. Summarize semantic intent from evidence only: behavior change, API change, schema change, test change, config change, dependency change, architecture change, documentation change, or cleanup.
5. Compare changed code against known upstream artifacts when provided: pseudocode contract, schema, architecture snapshot, ADR index, tests, and continuity state.
6. Identify stale or missing planning artifacts.
7. Build `human_delta_record.json` using `references/human-delta-record-schema.json`.
8. Produce a reverse-sync plan with ordered downstream work.
9. Route handoffs:
   - always prepare `next_skill_handoff` for `code-to-pseudocode-reconciler` when code behavior, contracts, schemas, diagrams, or tests changed.
   - prepare a handoff for `software-engineer-decision-capture` when the diff implies a design choice, tradeoff, dependency change, public contract change, data model change, or architecture deviation.
   - prepare a handoff for `semantic-diff-explainer` when reviewers need a human-readable meaning of the diff.

## Output contract

Always return this structure:

```markdown
# Human Code Delta Ingestion

## Verdict
accepted_delta | review_required | blocked

## human_delta_record.json
```json
{}
```

## Reverse-sync plan
| Order | Artifact | Required action | Owner skill | Blocking? |
|---:|---|---|---|---|

## Missing docs
- <artifact or none>

## Required ADR updates
- <candidate or none>

## Out-of-scope changes
- <file or none>

## Review questions
- <question or none>

## next_skill_handoff
<handoff for code-to-pseudocode-reconciler and, when needed, software-engineer-decision-capture>
```

## Reverse-sync policy

- Code may temporarily outrank stale pseudocode only after approval or explicit review acceptance.
- Pseudocode, schemas, diagrams, tests, ADRs, and memory must be updated as follow-on artifacts, not silently assumed current.
- Treat generated code and human edits differently in provenance fields.
- Preserve uncertainty. Use `unknown`, `unverified`, or `review_required` instead of filling gaps.
- If the diff touches public interfaces, persistence, auth, security, data migration, billing, performance, or workflow orchestration, flag an ADR candidate.
- If no active work order is supplied, create a work-order linkage gap instead of assigning the change to a guessed scope.

## Quality checklist

Before finalizing, verify:

- Every changed file is classified or explicitly marked unclassified.
- The approval state is represented.
- Stale upstream artifacts are listed separately from missing artifacts.
- Required ADR updates distinguish known decisions from questions.
- The handoff gives downstream skills enough inputs to act without rereading the full diff when possible.
