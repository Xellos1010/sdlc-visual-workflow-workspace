---
name: insertion-point-locator
description: select exact approved insertion points, owned files, forbidden files, integration seams, test targets, and scope boundaries for cloud-agent sdlc work. use after architecture-snapshot-reader when architecture_snapshot.json and blast_radius_report.json exist and before abstraction planning, pseudocode, implementation, generated-code review, validation, adr drafting, parity sync, or continuity updates.
---

# Insertion Point Locator

Turn architecture understanding into a bounded insertion map for the requested work.

## Core rule

Approve the smallest safe insertion surface. Separate files the agent may own from files it must not change, and explain every boundary crossing.

## Required inputs

- `architecture_snapshot.json`
- `blast_radius_report.json`
- `request_envelope.json`, `route_plan.json`, `constraint_contract.json`, and work order or acceptance criteria when available
- Code search results, file tree, tests, schemas, route maps, package manifests, generated-file markers, and ownership metadata

## Insertion point types

Use the most specific type possible:

- file, symbol, class, function, method, component, hook, command, route, block, adapter, interface, schema, migration, fixture, test, config, generated source, documentation, or build/deploy integration

## Workflow

1. Read architecture snapshot and blast-radius gates.
2. Identify candidate insertion points that satisfy the requested behavior and preserve existing boundaries.
3. Mark owned files and symbols the agent may edit.
4. Mark forbidden files and symbols, including generated files, protected ownership areas, public contracts, migration files, broad shared abstractions, and unrelated cleanup areas.
5. Define integration points and their required contracts.
6. Define required tests and validation commands for each insertion point.
7. Mark ambiguity, blocked insertion paths, and required human review.
8. Produce `insertion_point_map.json` using `references/insertion-point-map.schema.json`.
9. Handoff to `abstraction-opportunity-finder`.

## Output contract

Always return this structure:

```markdown
# Insertion Point Map

## Approved insertion points
| Type | Path or symbol | Purpose | Evidence |
|---|---|---|---|

## Owned files
- <path and allowed edit scope>

## Forbidden files
- <path and reason>

## Integration points
- <integration seam and contract>

## Test targets
- <test target and required evidence>

## insertion_point_map.json
```json
{}
```

## next_skill_handoff
Send `insertion_point_map.json` to `abstraction-opportunity-finder`; preserve owned/forbidden boundaries and validation requirements.
```

## Guardrails

- Do not approve opportunistic cleanup outside the requested scope.
- Do not edit generated files unless the generator source and regeneration command are also owned.
- Do not cross owner, package, public-contract, migration, or deployment boundaries without explicit approval or review gate.
- If no safe insertion point exists, return blocked status with the missing context or decision needed.
