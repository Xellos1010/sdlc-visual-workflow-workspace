---
name: cloud-agent-sdlc-orchestrator
description: route repository work through a strict cloud-agent sdlc lifecycle across manual prompts, scheduled runs, repo events, issue or pr events, blockers, and resume flows. use when an agent must decide the active lifecycle stage, required skills, memory reads and writes, branch or pr lane, lock needs, allowed actions, blocked actions, human escalation, output contracts, and next work order before discovery, planning, implementation, verification, integration, release, operation, parity sync, or continuity updates.
---

# Cloud Agent SDLC Orchestrator

Coordinate a cloud-agent run without doing the downstream specialist work directly. The output is an orchestration decision that names the correct stage, skill sequence, constraints, state actions, and next handoff.

## Core invariant

A future agent must be able to resume from durable state and cited artifacts, not from chat memory. Do not authorize implementation, merge, deletion, publication, or completion from private context alone.

## Required inputs

- Human prompt, scheduled trigger, repo event, issue, PR, or resume request
- Repository and project/client identity
- Current task or continuity state, usually `.foundry/projects/<project>/current-task.json`; legacy fallback: `.codex/projects/<project>/current-task.json`
- Active branch, PR, issue, locks, work-order DAG, evidence, and decision ledger when available
- Available skills and connector/tool availability
- Cadence and operator mode when scheduled

## Workflow

1. Establish authority: identify human instruction, repo state, active work order, charter, and non-goals.
2. Read or request the current continuity state. If it is missing, route to intake/discovery and block mutation until enough state exists.
3. Determine trigger type: `manual`, `scheduled`, `resume`, `webhook`, `pr`, `issue`, or `validation`.
4. Route the active stage with `sdlc-phase-router` unless the current state already names a valid stage and the request clearly continues it.
5. For scheduled triggers, invoke `scheduler-cadence-runner` before authorizing mutation.
6. Check branch, PR, and lock doctrine: one active PR per lane, no sibling PR, no file edits before compatible locks.
7. Select the minimal skill chain for the stage. Prefer granular skills for codegen; use lifecycle skills for state, locks, PRs, and cadence.
8. Define allowed actions, blocked actions, memory reads/writes, and required output contracts.
9. Escalate to a human when authority, destructive action, merge, publication, credential access, or ambiguous branch/PR ownership is unresolved.
10. Produce `orchestration_decision.json` using `references/orchestration-decision.schema.json` as a structural guide.

## Skill routing defaults

- Intake/routing: `request-intake-normalizer`, `objective-classifier`, `problem-type-router`, `authority-and-constraint-extractor`
- Discovery/preflight: `domain-context-locator`, `impacted-system-cartographer`, `blast-radius-preflight-analyzer`, `architecture-snapshot-reader`
- Design/contracts: `insertion-point-locator`, `abstraction-opportunity-finder`, `base-interface-class-planner`, `adapter-boundary-planner`, `dependency-inversion-planner`, `contract-first-io-schema-writer`, `data-model-type-system-designer`, `event-contract-modeler`
- Pseudocode/verification design: `pseudocode-spec-writer`, `algorithm-decomposition-planner`, `memory-lifecycle-analyzer`, `complexity-notation-assessor`, `concurrency-state-safety-analyzer`, `observability-instrumentation-planner`, `pseudocode-review-verifier`
- Implementation bridge: `test-from-pseudocode-generator`, `pseudocode-to-language-plan-compiler`, `codegen-contract-builder`, `code-from-pseudocode-generator`, `type-safety-implementation-enforcer`, `implementation-insertion-verifier`
- Review/close: `generated-code-reviewer`, `test-execution-verifier`, `performance-budget-enforcer`, `adr-draft-writer`, `adr-indexer`, `decision-tradeoff-ledger`, `parity-sync-manager`, `memory-continuity-manager`, `continuity-writer`

## Output contract

Always return this structure:

```markdown
# Orchestration Decision

## Selected route
- trigger_type:
- lifecycle_stage:
- task_status:
- confidence:

## Required skills
| Order | Skill | Purpose | Required input | Output contract |
|---|---|---|---|---|

## Allowed actions
- <actions authorized now>

## Blocked actions
- <action, blocker, needed evidence or approval>

## State and memory plan
- Read:
- Patch later:
- Do not modify:

## Branch, PR, and lock plan
- Active branch:
- Canonical PR:
- Required locks:
- Conflicts or ambiguity:

## orchestration_decision.json
```json
{}
```

## next_skill_handoff
Name the next skill and pass only the artifacts it needs.
```

## Guardrails

- Do not start implementation before file scope, tests, insertion points, and locks exist.
- Do not mark done without independent verification evidence, continuity update, PR readiness, and released locks.
- Do not merge, delete branches, publish externally, or overwrite continuity without explicit authority.
