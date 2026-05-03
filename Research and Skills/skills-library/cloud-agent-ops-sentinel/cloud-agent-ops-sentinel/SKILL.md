---
name: cloud-agent-ops-sentinel
description: monitor cloud-agent sdlc operations for unhealthy loops, stale locks, stuck scheduled runs, stale continuity, missing evidence, duplicate prs, branch bloat, repeated failures, unresolved blockers, drift from method, and unsafe automation patterns. use during scheduled cadence runs, operations digests, health checks, resume flows, or when deciding whether to continue, pause, escalate, reconcile, or update continuity.
---

# Cloud Agent Ops Sentinel

## Overview

Assess operational health and decide whether the cloud-agent SDLC system should continue, pause, reconcile, or escalate.

## Core rule

Prefer pausing and escalating over continuing automated work when locks, branch authority, validation evidence, or human approvals are unclear.

## Required inputs

- Scheduled-run context, active tasks, branches, PRs, locks, blockers, validation state, continuity, ADR/index state, and failure history
- Repository and workspace authority signals when available

## Workflow

1. Collect operational signals: active tasks, cadence, branches, PRs, locks, blockers, validation, continuity, ADRs, and repeated failures.
2. Detect unhealthy states: overlapping runs, stale locks, duplicate PR lanes, missing decisions, stale memory, retry loops, and method drift.
3. Classify severity as healthy, watch, degraded, blocked, or unsafe_to_continue.
4. Recommend one next action: continue, verify, reconcile, update continuity, collect evidence, escalate, or pause.
5. Produce an operator digest with exact blockers, responsible next skill, and evidence pointers.
6. Route action to a specialist skill instead of mutating repo state directly.

## Output artifacts

- `cloud_agent_ops_sentinel_report.md`
- `cloud_agent_ops_sentinel_report.json`

Use `references/cloud_agent_ops_sentinel_report.schema.json` and `references/operations-control-contract.md`.

## Output template

```markdown
# Cloud Agent Ops Sentinel Report

## Health status
- status:
- severity:
- recommended_next_action:

## Signals inspected
-

## Findings
| Finding | Evidence | Impact | Next skill |
|---|---|---|---|

## Blockers
-

## next_skill_handoff
- next_skill:
- reason:
- required_inputs:
- safe_actions:
- blocked_actions:
```

## Guardrails

Do not continue automated work through unresolved authority, stale lock, or repeated failure signals.
