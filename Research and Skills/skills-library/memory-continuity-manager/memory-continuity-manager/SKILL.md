---
name: memory-continuity-manager
description: manage durable working memory, continuity state, work orders, locks, active branches, pull requests, decision ledgers, evidence bundles, fix memories, and next-agent handoffs in a cloud-agent sdlc workflow. use when chatgpt must read, update, summarize, reconcile, or repair .foundry project state, current-task.json, continuity files, agent run state, stale memory, blockers, verification evidence, or resume context before starting, pausing, handing off, or closing work.
---

# Memory Continuity Manager

Maintain durable state so any replacement cloud agent can resume accurately without relying on private chat context.

## Core rule

Continuity state is patched, not rewritten. Preserve existing fields unless evidence proves they are stale, obsolete, superseded, or unsafe. If state conflicts with repository, PR, issue, ADR, or evidence reality, report the conflict and propose a minimal repair patch.

## Required inputs

Normalize available context into:

- `continuity_state`: current task file, work order memory, lock records, agent run notes, or project state.
- `work_order`: current requested task, issue, branch, PR, objective, and done criteria.
- `artifact_state`: changed files, pseudocode, schemas, ADRs, tests, diagrams, reports, evidence, and parity status.
- `execution_state`: current agent status, blockers, commands run, failed commands, pending approvals, active branch, and PR.
- `handoff_context`: next skill handoff, next agent role, or scheduler resume event.

Use `unknown` for unavailable fields. Do not infer state from intent alone.

## Workflow

1. Read current continuity and identify the canonical state object, usually `.foundry/projects/<slug>/current-task.json` or equivalent.
2. Compare continuity against evidence: branch, PR, changed files, validation reports, ADR index, decision ledger, parity report, and human notes.
3. Classify each state area as `current`, `stale`, `missing`, `conflicting`, `blocked`, `complete`, or `unknown`.
4. Preserve locks unless a lock is explicitly released, expired by policy, or superseded by evidence.
5. Preserve incomplete work explicitly. Do not drop failed attempts, blockers, skipped tests, manual review needs, or partial artifacts.
6. Create a minimal JSON merge patch or equivalent patch instructions. Never output a wholesale replacement unless the existing state is absent.
7. Build a next-agent handoff containing current objective, source-of-truth order, exact next action, required evidence, and stop conditions.
8. End with a consistency verdict and the safest next transition.

## Output contract

Always return this structure:

```markdown
# Memory Continuity Update

## Verdict
consistent | patch_required | blocked | needs_human_review

## Memory read plan
- <state source checked>
- <evidence source checked>

## Stale or missing state report
| Area | Status | Evidence | Required repair |
|---|---|---|---|

## memory_patch.json
```json
{}
```

## Next-agent handoff
- Current objective:
- Current phase:
- Canonical branch or PR:
- Source-of-truth order:
- Completed artifacts:
- Pending artifacts:
- Required next action:
- Blockers:
- Stop conditions:

## State consistency verdict
<one paragraph>
```

## Safety rules

- Do not mark work complete without validation evidence or an explicit human override.
- Do not remove blockers without evidence that they were resolved.
- Do not treat generated summaries as stronger than source artifacts.
- Prefer precise patch paths over broad prose when updating machine-readable state.
- If multiple agents touched the same state, preserve all non-obsolete evidence and identify conflicts.
- Route to `parity-sync-manager` if artifacts are out of sync.
- Route to `decision-tradeoff-ledger` if a state repair encodes a material decision or human override.
