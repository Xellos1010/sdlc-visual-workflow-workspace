---
name: sdlc-phase-router
description: classify cloud-agent software requests, scheduled runs, issue events, pr events, repository events, work orders, and resume prompts into the correct sdlc lifecycle stage and phase gates. use when starting, resuming, triaging, delegating, or re-routing agentic software work and before orchestration, context discovery, implementation, verification, integration, release, operation, continuity patching, or human escalation.
---

# SDLC Phase Router

Map the current request and repository state to a single lifecycle stage and list the gates that must be satisfied before proceeding.

## Core rule

Route based on evidence from the request and continuity state. If the stage is ambiguous, choose the earliest safe stage that can resolve missing context; do not skip ahead.

## Required inputs

- User request, scheduled run objective, issue, PR, repo event, or work order
- Current continuity state when available
- Current branch, PR, blocker, evidence, and work-order status when relevant
- Prior orchestration decision when resuming

## Workflow

1. Read `lifecycleStage`, `sdlcPhase`, `taskStatus`, active branch, active PR, blockers, done criteria, and next actions from continuity state when available.
2. Classify the request intent: new idea, inspect, define, design, plan, implement, verify, integrate, release, operate, diagnose, improve, resume, or interrupt.
3. Map legacy phases to lifecycle stages without deleting the legacy value.
4. Check whether prerequisite artifacts exist for the requested stage.
5. If prerequisites are missing, route to the earliest prerequisite stage and list blocked prerequisites.
6. Identify required skills and next allowed action.
7. Produce `phase_route.json` using `references/phase-route.schema.json` as a structural guide.

## Intent mapping

| Intent signal | Target stage |
|---|---|
| idea, new feature, unclear scope | intake or define |
| inspect repo, locate context, audit state | discover |
| requirements, acceptance criteria, unknowns | define |
| ADR, architecture, contracts, schema, interface | design |
| break down, work orders, file scope, locks | plan |
| build, implement, code edit | implement only if plan gate is satisfied |
| test, verify, review claims | verify |
| PR, conflict, consolidate, merge readiness | integrate |
| release notes, rollback, handoff | release |
| scheduled audit, cleanup, monitoring | operate |
| failure, incident, broken CI | diagnose |
| retrospective, learned memory, guardrail update | improve |

## Output contract

Always return this structure:

```markdown
# Phase Route

## Decision
- lifecycle_stage:
- task_status:
- confidence:
- route_reason:

## Phase gates
| Gate | Status | Evidence | Required action |
|---|---|---|---|

## Required skills
- <skill and why>

## Blocked prerequisites
- <missing artifact, owner, next safe step>

## phase_route.json
```json
{}
```

## next_skill_handoff
Send the route to `cloud-agent-sdlc-orchestrator` or the next stage skill.
```

## Guardrails

- Do not route to implement when approved scope, tests, insertion points, and locks are missing.
- Do not route to complete; completion is a status after verification, integration, continuity, and lock release.
- Do not treat a recent file timestamp as current truth without reading the relevant section.
