---
name: scheduler-cadence-runner
description: convert recurring cloud-agent schedules such as hourly, four-hour, daily, weekly, and local 24x7 runs into safe idempotent lifecycle behavior. use when an agent is invoked by a scheduled task or automation and must decide whether to continue work, validate, reconcile branches or prs, update memory, pause for locks or blockers, prevent overlap, set runtime limits, or produce an operator digest before orchestration, implementation, integration, release, or continuity updates.
---

# Scheduler Cadence Runner

Translate a recurring schedule into allowed work for this invocation. The output must prevent overlap, repeated mutation, stale-lock damage, and accidental broad implementation.

## Core rule

Scheduled runs primarily reconcile, validate, and safely continue authorized work. They must not start broad new implementation unless continuity state explicitly authorizes it.

## Required inputs

- Schedule expression or cadence label
- Trigger timestamp and run ID
- Repository, project, active task, current status, and lifecycle stage
- Active branch, canonical PR, locks, blockers, previous run evidence, and next command set
- Operator policy for max runtime and allowed mutation when available

## Workflow

1. Classify cadence as `hourly`, `four_hour`, `daily`, `weekly`, `local_24x7`, `manual_scheduled`, or `unknown`.
2. Create an idempotency key from repository, project, task, cadence window, branch, and run ID.
3. Detect overlapping runs, stale locks, dirty worktrees, duplicate PR lanes, repeated failures, and missing connector authority.
4. Determine allowed mutations for this cadence.
5. For hourly runs, prefer active work improvement on the canonical PR; never merge or delete branches.
6. For four-hour runs, prioritize validation, integration checks, one-PR enforcement, stale lock detection, and evidence refresh.
7. For daily or weekly runs, prioritize reconciliation, roadmap governance, fix-memory, operator digest, and conservative cleanup proposals.
8. For local 24x7 runners, require queue visibility, per-run worktree, lock files, bounded runtime, crash recovery, and concurrency limits.
9. Produce `cadence_decision.json` using `references/cadence-decision.schema.json` as a structural guide.

## Output contract

Always return this structure:

```markdown
# Cadence Decision

## Cadence classification
- cadence_class:
- window:
- idempotency_key:
- max_runtime_policy:

## Allowed mutations
- <safe action>

## Blocked mutations
- <forbidden action and reason>

## Overlap and lock handling
- active runs:
- stale locks:
- collision risk:
- action:

## Required state updates
- memory:
- continuity:
- PR body:
- digest:

## cadence_decision.json
```json
{}
```

## next_skill_handoff
Return to `cloud-agent-sdlc-orchestrator` with allowed actions and blocked actions.
```

## Guardrails

- Do not merge, publish, deploy, delete, or force-push from a scheduled run without explicit policy and evidence.
- Do not run implementation against a dirty repository or active conflicting lock.
- Do not repeat a previously failed mutation without recording the failure and changing the plan.
