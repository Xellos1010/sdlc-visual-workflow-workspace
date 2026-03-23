---
name: continuity-writer
description: >
  Updates machine-readable continuity state after phase transitions,
  branch changes, or verification completion. Ensures deterministic
  resumability. Used by orchestrator and docs-release-agent.
---

# Continuity Writer

Update `.codex/projects/<project>/current-task.json` to maintain deterministic resumability.

## When to Update
- Phase transition (entering or completing a phase)
- Branch switch
- Verification completion
- Blocker discovered or resolved
- Work interrupted (generate handoff before stopping)

## Update Protocol

### Step 1: Read Current State
```bash
cat .codex/projects/<project>/current-task.json
```

### Step 2: Fields to Update
| Field | When to Update |
|---|---|
| `currentPhase.status` | Phase status changed |
| `currentPhase.updatedAt` | Any phase update (ISO 8601) |
| `currentPhase.notes` | Add notes about what happened |
| `activeBranch` | Branch switched |
| `nextCommit.branch` | Next commit target changed |
| `nextCommit.message` | Next expected commit message |
| `nextCommandSet` | Verification commands changed |
| `blockedBy` | Blockers added or resolved |
| `artifacts` | New artifacts produced |
| `doneCriteria` | Criteria added, modified, or satisfied |
| `lifecycleStage` | (if using Flagship schema) 11-phase value |

### Step 3: Validate the Continuity Invariant
> An AI system must be able to determine from committed artifacts alone: current phase, active branch, next verification commands, blocked conditions, and done criteria.

If any of these cannot be determined from the updated state, the update is incomplete.

## Commit Convention
```
chore(codex): update <project> task state — <phase> <status>
```
