---
name: problem-type-router
description: choose the canonical cloud-agent sdlc route and skill chain from an objective classification, repo memory, cadence, operator mode, and available skill registry. use when objective_classification.json exists and the pipeline must decide required skills, optional default-off skills, blocked paths, model tier, and handoffs before authority extraction, context discovery, architecture mapping, pseudocode, code generation, review, or reverse sync.
---

# Problem Type Router

Choose the SDLC route and downstream skill chain for a classified request.

## Core rule

Route conservatively. Prefer explicit intermediate artifacts over direct implementation when risk, authority, context, or architecture is incomplete.

## Required inputs

- `objective_classification.json`
- `request_envelope.json`, if available
- Current repo memory, active work order, branch/PR state, and locks
- Available skill registry
- Cadence or operator mode: autonomous, supervised, review-only, scheduled, emergency, or exploratory

## Routing workflow

1. Identify the route family from objective classification.
2. Select required skills from `references/route-families.md`.
3. Add mandatory controls from the risk precheck.
4. Mark optional visual/diagramming skills default-off unless ambiguity, high blast radius, or human request requires them.
5. Identify blocked paths caused by missing authority, missing repo context, active locks, ambiguous objective, unsafe scope, or unavailable connectors.
6. Recommend model tier: standard, reasoning, code-review, or human-review-required.
7. Produce `route_plan.json` using `references/route-plan.schema.json`.
8. Handoff to both `authority-and-constraint-extractor` and `domain-context-locator` when safe; otherwise list blockers first.

## Output contract

Always return this structure:

```markdown
# Route Plan

## Selected route family
<route family>

## Required skills
1. <skill>

## Optional default-off skills
- <skill and trigger or none>

## Blocked paths
- <blocked path or none>

## route_plan.json
```json
{}
```

## next_skill_handoff
Send `route_plan.json` to `authority-and-constraint-extractor` and `domain-context-locator`; include any blockers or required human review.
```

## Guardrails

- Do not omit `authority-and-constraint-extractor` for implementation, migration, release, operations, or reverse-sync work.
- Do not omit `domain-context-locator` unless the task is purely conversational and requires no project context.
- Route human-edited code through reverse-sync before ADR/parity/continuity closure.
- Keep optional diagram skills off unless a diagram artifact materially reduces risk or the operator asks for one.
