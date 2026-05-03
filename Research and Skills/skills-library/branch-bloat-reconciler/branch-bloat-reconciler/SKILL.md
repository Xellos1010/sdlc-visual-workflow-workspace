---
name: branch-bloat-reconciler
description: detect, analyze, and reconcile branch bloat, duplicate pull requests, stale branches, overlapping feature lanes, abandoned worktrees, divergent agent branches, and fragmented cloud-agent work. use during integration, scheduled operations, repository hygiene, pr governance, continuity refresh, or when multiple branches or prs appear to represent the same feature, bug, work order, or release lane.
---

# Branch Bloat Reconciler

## Overview

Identify duplicate or stale branch and PR lanes and propose a safe consolidation path.

## Core rule

Never delete branches, close PRs, force-push, or merge unless a current explicit human instruction authorizes that exact mutation.

## Required inputs

- Branch list, PR list, commits, worktrees, work orders, locks, issues, and continuity records
- Current authority constraints and active integration lane when available

## Workflow

1. Inventory relevant branches, PRs, worktrees, work orders, locks, commits, and continuity records.
2. Group branches and PRs by project, feature lane, issue, work order, touched files, and ancestry when available.
3. Classify each lane as canonical, duplicate, stale, experimental, blocked, abandoned, or needs_human_review.
4. Detect conflicts: multiple active PRs for one lane, overlapping locks, divergent generated artifacts, and unsynced continuity.
5. Recommend consolidation, closure, archive, rebase, merge-into-canonical, or escalation.
6. Preserve evidence and rollback notes for destructive or irreversible proposals.
7. Hand off to PR governance, file locks, authority resolution, or human escalation.

## Output artifacts

- `branch_bloat_reconciliation.md`
- `branch_bloat_reconciliation.json`

Use `references/branch_bloat_reconciliation.schema.json` and `references/operations-control-contract.md`.

## Output template

```markdown
# Branch Bloat Reconciliation

## Lane inventory
| Branch or PR | Classification | Evidence | Recommended action |
|---|---|---|---|

## Canonical lane
-

## Conflicts
-

## Proposed reconciliation plan
-

## next_skill_handoff
- next_skill:
- reason:
- required_inputs:
- safe_actions:
- blocked_actions:
```

## Guardrails

This skill plans reconciliation; it does not execute destructive git or PR actions by default.
