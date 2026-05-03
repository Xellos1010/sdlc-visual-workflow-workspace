---
name: pr-integration-governor
description: enforce one active integration pull request per repository, project/client, and feature lane; consolidate branches and work orders into the canonical pr; and block duplicate pr sprawl. use when checking open prs, creating or updating the active pr, reconciling branches, integrating generated or human-edited work, preparing merge readiness, resolving duplicate prs, validating release gates, or updating pr body evidence before merge, release, parity sync, or continuity updates.
---

# PR Integration Governor

Govern the PR lane so agent work converges into one reviewable integration path instead of spreading across sibling PRs.

## Core rule

For each repo + project/client + feature set, there is zero or one active integration PR unless an explicit charter or human decision approves a split.

## Required inputs

- Repository, project/client, feature set, active branch, target branch, and work-order IDs
- Continuity state including active PR and branch
- Open PR inventory, branch inventory, commit summary, lock plan, verification evidence, and blocker list
- Release/rollback/handoff artifacts when relevant

## Workflow

1. Identify the canonical PR lane from continuity state, branch naming, work-order IDs, and open PR metadata.
2. Classify PR state: none, canonical_exists, duplicate_exists, ambiguous, stale, merge_ready, or blocked.
3. If no PR exists and verified changes exist, prepare a PR creation plan and body. If changes are incomplete, prepare draft/incomplete state only.
4. If duplicate PRs exist, choose canonical only when evidence is clear; otherwise block and request human selection.
5. Build consolidation plan for branches, commits, work orders, evidence, and PR body sections.
6. Check merge readiness: tests, blast radius, performance budgets, acceptance criteria, ADRs, decision ledger, continuity patch, locks released, rollback/release notes, unresolved blockers.
7. Produce `pr_integration_verdict.json` using `references/pr-integration-verdict.schema.json` as a structural guide.
8. Handoff to `continuity-writer`, `parity-sync-manager`, `memory-continuity-manager`, or release skills.

## Output contract

Always return this structure:

```markdown
# PR Integration Verdict

## Active PR verdict
- status: none|canonical_exists|duplicate_exists|ambiguous|stale|merge_ready|blocked
- canonical_pr:
- confidence:

## Duplicate PR handling
| PR/branch | Classification | Action | Evidence |
|---|---|---|---|

## Consolidation plan
- Branches/commits:
- Work orders:
- Evidence:
- PR body updates:

## Merge-readiness blockers
- <blocker, required fix, owner>

## Next PR action
- <create|update|consolidate|block|ready_for_review|request_human_decision>

## pr_integration_verdict.json
```json
{}
```

## next_skill_handoff
Send the verdict to `continuity-writer`, `parity-sync-manager`, or `memory-continuity-manager`.
```

## Guardrails

- Do not create a new sibling PR when a canonical PR exists.
- Do not mark merge-ready with unresolved blockers, missing evidence, active write locks, or stale continuity.
- Do not delete or close PRs without explicit authority or conservative stale-branch policy.
