---
name: file-lock-coordinator
description: create, validate, expire, reconcile, and release file, directory, symbol, route, schema, migration, work-order, and pr-lane locks for safe parallel cloud-agent work. use before implementation, branch edits, worktree creation, generated file changes, schema changes, migrations, or parallel work assignment, and when detecting stale locks, conflicting agents, sibling work orders, dirty worktrees, or lock release requirements before code generation, verification, integration, parity sync, or continuity updates.
---

# File Lock Coordinator

Prevent parallel agent collisions by deciding which files and work orders can be edited safely now, which must wait, and how locks should be released.

## Core rule

No agent may mutate files, schemas, migrations, generated artifacts, or PR lane state until compatible locks are active or the operator explicitly allows a single-agent bypass.

## Required inputs

- Proposed work order, insertion map, file edit plan, codegen contract, or PR consolidation plan
- Current lock registry or continuity lock section
- Active runs, branches, PRs, worktrees, and dirty files when available
- Changed file list, generated artifact ownership, test targets, migrations, and shared config paths

## Workflow

1. Inventory requested lock units: file paths, directories, symbols, routes, schemas, migrations, generated artifacts, tests, and PR lane.
2. Normalize lock granularity to the smallest safe unit.
3. Compare requested locks to active, stale, expired, and conflicting locks.
4. Classify each request as `grant`, `grant_read_only`, `block`, `queue`, `split`, or `requires_human`.
5. Identify compatible parallel work and unsafe overlap.
6. Define lock expiry, heartbeat expectation, stale lock handling, and release instructions.
7. Produce `file_lock_plan.json` using `references/file-lock-plan.schema.json` as a structural guide.
8. Handoff granted locks to `codegen-contract-builder`, `implementation-insertion-verifier`, or `pr-integration-governor`.

## Output contract

Always return this structure:

```markdown
# File Lock Plan

## Verdict
- lock_status: granted|partial|blocked|requires_human
- confidence:

## Lock requests
| Unit | Scope | Mode | Verdict | Owner/run | Expiry | Notes |
|---|---|---|---|---|---|---|

## Blocked files or units
- <unit, conflicting owner, safe next action>

## Compatible parallel work
- <work order or path, why compatible>

## Stale lock handling
- <lock, evidence, release or escalation plan>

## Release instructions
- <when and how to release>

## file_lock_plan.json
```json
{}
```

## next_skill_handoff
Pass granted locks and blocked units to the next implementation, verification, or integration skill.
```

## Guardrails

- Do not grant overlapping write locks on the same path, schema, migration, generated artifact, or PR lane.
- Do not delete or release another run's lock without stale evidence and policy permission.
- Do not treat a read-only inspection as a write lock.
