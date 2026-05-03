---
name: decision-tradeoff-ledger
description: record durable decision ledger entries, tradeoffs, assumptions, reversal conditions, human overrides, and inspection summaries across a cloud-agent sdlc workflow. use when an agent makes, reviews, indexes, supersedes, or detects a material decision; after adr-indexer, test-execution-verifier, generated-code-reviewer, semantic-diff-explainer, human-code-delta-ingestor, or architecture-drift-detector; or before parity-sync-manager and memory-continuity-manager close a work order.
---

# Decision Tradeoff Ledger

Create durable, machine-readable decision ledger entries for cloud-agent SDLC work. The ledger captures what was decided, why, what alternatives were rejected, what evidence supports the decision, how the decision can be inspected later, and which signals should reopen it.

## Core rule

Record decisions without expanding them into speculative history. Do not invent hidden human intent, validation results, approvals, performance data, or file paths. If a decision is inferred from code or an ADR candidate, mark the confidence and unresolved questions explicitly.

## Required inputs

Normalize the available context into:

- `decision_context`: problem, constraints, affected systems, risk, authority source, and evidence.
- `adr_metadata.json`: ADR metadata if an ADR exists.
- `adr_index_patch.json`: index patch if `adr-indexer` ran.
- `agent_reasoning_summary`: concise explanation of why the agent chose or recommended the decision.
- `human_overrides`: explicit human direction, approvals, corrections, or objections.
- `validation_evidence`: generated review, test execution report, benchmark, or manual verification evidence.

A ledger entry can be created even without an ADR, but it must mark whether an ADR is required, recommended, or not needed.

## Workflow

1. Classify the decision:
   - `architecture`, `abstraction`, `schema`, `performance`, `persistence`, `integration`, `tool`, `workflow`, `codegen`, `human_override`, or `other`.
2. Determine materiality:
   - `adr_required` if the decision constrains architecture, contracts, persistence, integrations, performance budgets, tooling, or long-lived implementation direction.
   - `ledger_only` if the decision affects execution but does not require a full ADR.
   - `defer` if evidence is insufficient.
3. Extract options considered and rejected alternatives.
4. Record tradeoffs as explicit accepted costs, not generic pros/cons.
5. Identify assumptions and confidence level.
6. Define reversal conditions using observable signals.
7. Attach inspection handles: ADR ids, work-order ids, PRs, commits, file paths, evidence bundle ids, validation commands, and reviewer notes.
8. Build `decision_ledger_entry.json` using `references/decision-ledger-entry-schema.json`.
9. Produce a human-readable inspection summary.
10. Produce `next_skill_handoff` for `parity-sync-manager` and, if needed, `memory-continuity-manager`.

## Output contract

Always return this structure:

```markdown
# Decision Ledger Entry

## Verdict
recorded | recorded_with_gaps | blocked

## Materiality
adr_required | ledger_only | defer

## decision_ledger_entry.json
```json
{}
```

## Inspection summary
<concise human-readable summary>

## Reversal conditions
- <observable condition>

## Unresolved questions
- <question or none>

## Follow-up actions
- <action or none>

## next_skill_handoff
<handoff for parity-sync-manager>
```

If editing a repository directly, append exactly one JSON object per line to `.foundry/projects/<slug>/decision-ledger.jsonl` unless the project defines a different ledger path.

## Ledger policy

- Append-only by default. Correct prior mistakes by adding a superseding entry unless the user explicitly asks to edit an uncommitted draft.
- Prefer stable ids: `decision-YYYYMMDD-short-slug`.
- Include `source_confidence`: `explicit`, `high_inference`, `low_inference`, or `unknown`.
- Include `human_override` when a human choice overrode the agent-recommended path.
- Record accepted negative consequences. A ledger entry that only lists benefits is incomplete.
- Mark missing validation as a risk; do not imply verification passed.
- If no ADR exists but the decision is material, hand off to `adr-draft-writer` or flag the missing ADR in follow-up actions.

## Quality checklist

Before finalizing, verify:

- The decision is stated in one sentence.
- At least one rejected alternative or reason for no alternative is captured.
- Accepted costs are explicit.
- Reversal conditions are observable.
- Inspection handles are sufficient for a future agent to trace the decision.
- The parity handoff names artifacts that may need synchronization.
