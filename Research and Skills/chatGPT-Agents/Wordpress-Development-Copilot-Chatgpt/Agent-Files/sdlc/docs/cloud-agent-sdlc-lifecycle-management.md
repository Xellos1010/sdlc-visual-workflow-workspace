# Cloud Agent SDLC Lifecycle Management

## Purpose

This document defines how a Cloud Agent should start, track, stop, resume, and consolidate SDLC work while interacting with durable memories and producing one canonical pull request per active task.

## Operating doctrine

Human intent, risk tolerance, priorities, and approval boundaries remain authoritative. Agents transform approved intent into bounded, reviewable artifacts. Every meaningful decision should leave an artifact. Every phase must have entry criteria, exit criteria, and verification evidence.

## Universal lifecycle

```text
discover -> define -> visualize -> architect -> plan -> implement -> verify -> release -> operate -> diagnose -> improve
```

Group the phases into three loops:

1. Intent to Architecture: `discover`, `define`, `visualize`, `architect`
2. Architecture to Implementation: `plan`, `implement`, `verify`, `release`
3. Operate to Improve: `operate`, `diagnose`, `improve`

## State files and memory authorities

Read order for a Cloud Agent run:

1. `.foundry/projects/<project>/current-task.json`
2. `.codex/projects/<project>/current-task.json` only as a legacy fallback
3. project `SDLC_CHARTER.md`
4. project-local handoff documents, especially `docs/handoffs/`
5. open PR body and branch state
6. Cloud Agent durable memories
7. current conversation or run transcript

Authority order:

1. doctrine and charter
2. machine-readable task state
3. ADRs, diagrams, contracts, schemas
4. work orders and implementation plan
5. code/config/infrastructure
6. verification evidence
7. release notes, runbooks, operations evidence
8. memories and summaries

Memories summarize artifacts; they do not outrank artifacts.

## Required task status model

Use this normalized lifecycle status set across Cloud Agents:

| Status | Meaning | Can start work? | Can mark complete? |
|---|---|---:|---:|
| `not_started` | task exists but no agent has begun | yes | no |
| `starting` | preflight checks and state read are happening | no | no |
| `in_progress` | agent is actively working inside approved scope | yes | no |
| `blocked` | external condition or decision prevents progress | no | no |
| `interrupted` | agent stopped before task was complete but left resumable state | yes, after resume checks | no |
| `verify_ready` | implementation claims are done but independent verification is pending | verifier only | no |
| `verified` | independent evidence supports done criteria | release agent only | no |
| `complete` | task is verified, documented, and PR/continuity are current | no | yes |
| `incomplete` | work ended without meeting done criteria | yes, after triage | no |
| `abandoned` | intentionally stopped by human or superseded decision | no | no |

If repository schema has a smaller enum, map to the nearest schema-safe value and record the richer status in `currentPhase.notes`.

## Start-of-task protocol

1. Read task state and charter.
2. Confirm branch and PR authority.
3. Confirm lifecycle stage and done criteria.
4. Read latest handoff and relevant memories.
5. Run or inspect `nextCommandSet` if the task is being resumed.
6. Write a start ledger entry:

```json
{
  "runId": "cloud-agent-<timestamp>",
  "trigger": "manual|scheduled|resume|webhook",
  "taskStatus": "starting",
  "project": "<project>",
  "activeBranch": "<branch>",
  "targetPr": "<url-or-id>",
  "lifecycleStage": "<stage>",
  "knownBlockers": [],
  "startedAt": "<iso-8601>"
}
```

7. Move to `in_progress` only after DoR and scope are known.

## In-progress heartbeat protocol

At each meaningful change, append a heartbeat:

```markdown
## Agent Run Heartbeat
- Run ID:
- Timestamp:
- Trigger:
- Lifecycle stage:
- Task status:
- Branch:
- PR:
- Files touched:
- Artifacts created:
- Evidence created:
- Claims verified:
- Claims unverified:
- Blockers:
- Next command set:
- Next safe action:
```

Heartbeat rules:

- Prefer short factual entries.
- Never erase blockers unless the resolving evidence is named.
- Never mark complete from memory alone.
- If the next action requires human approval, state that directly.

## Ending a task or run

Before a Cloud Agent stops, it must write one of four terminal run outcomes:

| Outcome | Use when | Required artifact |
|---|---|---|
| `complete` | done criteria passed and release/PR state is current | PR summary, evidence, continuity patch |
| `verify_ready` | implementation is done but verifier has not passed it | verification plan and handoff |
| `blocked` | external input is needed | blocker note with owner/request |
| `incomplete` | work started but cannot be claimed done | handoff with remaining work |

Stop protocol:

1. Update task memory.
2. Update continuity state or propose exact patch.
3. Generate handoff if any work is interrupted, delegated, or complete.
4. Update canonical PR body or produce PR body text.
5. List next safe action.

## Scheduled cron consolidation lifecycle

A scheduled cron run should follow this strict loop:

```text
wake -> read state -> read memories -> read pr/branch -> classify work -> verify evidence -> consolidate into canonical pr -> update memory -> update continuity -> stop
```

### Scheduled run rules

- Do not begin new implementation unless the task state explicitly authorizes it.
- Prefer reconciliation and cleanup over new scope.
- Keep one canonical PR per active task.
- If multiple branches or PRs exist, choose the one matching task state; otherwise block and report ambiguity.
- If work is implemented but unverified, keep it marked `verify_ready` or `incomplete`.
- If work is verified, update PR body with evidence and mark the item ready for review.

## Single canonical PR policy

Each active project task should have one canonical PR unless a charter or approved work-order tree intentionally splits the work.

Canonical PR body:

```markdown
## SDLC State
- Project:
- Lifecycle stage:
- Task status:
- Active branch:
- Run IDs included:

## Consolidated Work
- [ ] Work item 1
- [ ] Work item 2

## Verification Evidence
| Check | Command | Result | Evidence Path |
|---|---|---|---|

## Incomplete or Deferred Work
- [ ] Item — reason

## Blockers
- none

## Memory and Continuity Updates
- Task state updated:
- Handoff updated:
- Learned-memory candidates:

## Merge Readiness
- [ ] Definition of Ready satisfied
- [ ] Definition of Done satisfied
- [ ] Independent verification complete
- [ ] Rollback path documented
- [ ] Continuity updated
```

## Completion truth table

| Work changed? | Verification passed? | Docs/continuity updated? | Blockers? | Verdict |
|---:|---:|---:|---:|---|
| no | n/a | yes | no | `complete` only for documentation/reconciliation tasks |
| yes | yes | yes | no | `complete` or `verified` before merge |
| yes | no | yes | no | `verify_ready` or `incomplete` |
| yes | failed | yes | no | `incomplete` |
| any | any | any | yes | `blocked` |
| unclear | unclear | no | unknown | `blocked` due to missing source of truth |

## Required Cloud Agent skills

Minimum bundle:

- `cloud-agent-lifecycle-manager`
- `continuity-writer`
- `handoff-generator`
- `task-state-auditor`
- `agent-memory-consolidator`
- `cron-pr-consolidator`
- `release-pr-packager`

Full SDLC bundle:

- `sdlc-phase-router`
- `define-intent`
- `c4-diagram-generator`
- `adr-writer`
- `scope-chunker`
- `model-router`
- `continuity-writer`
- `handoff-generator`
- `evidence-collector`
- `nx-verification`
- `cloud-agent-lifecycle-manager`
- `agent-memory-consolidator`
- `cron-pr-consolidator`
- `task-state-auditor`
- `release-pr-packager`

## Recommended scheduled prompt

```text
Run the Cloud Agent SDLC scheduled consolidation cycle for <project>. Read continuity state, durable memories, handoffs, branch state, and the canonical PR. Classify all prior work as merged, included, uncommitted, documented-only, implemented-unverified, blocked, or obsolete. Consolidate eligible work into the single canonical PR, update task memory and continuity, preserve incomplete work explicitly, and end with complete, verify_ready, incomplete, or blocked plus the next safe action. Do not start new implementation unless current-task.json explicitly authorizes it.
```
