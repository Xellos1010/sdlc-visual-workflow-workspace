---
name: architecture-snapshot-reader
description: summarize current architecture boundaries, patterns, extension points, known tradeoffs, code reality, documentation status, and architecture gaps for cloud-agent sdlc work. use after impacted-system cartography and blast-radius preflight when architecture_snapshot.json is needed before insertion-point selection, abstraction planning, pseudocode, implementation, review, validation, adr drafting, parity sync, or continuity updates.
---

# Architecture Snapshot Reader

Create a compact, source-backed snapshot of how the affected system currently works.

## Core rule

Describe current architecture before proposing a target architecture. Reconcile docs, ADRs, tests, and code reality; when they disagree, preserve the disagreement as an architecture gap.

## Required inputs

- `context_pack_manifest.json`
- `impacted_systems.json`
- `blast_radius_report.json`, `constraint_contract.json`, ADR index, diagrams, schemas, tests, and runbooks when available
- Relevant code, package manifests, runtime entry points, generated artifacts, and sibling implementations

## Snapshot dimensions

Capture the affected system across these dimensions when relevant:

- ownership and module/package/service boundaries
- runtime entry points, lifecycle, state ownership, side effects, and data flow
- public contracts, schemas, generated artifacts, API routes, CLI commands, UI blocks, or plugin seams
- current extension points, adapters, interfaces, base classes, hooks, events, and composition patterns
- persistence, migrations, cache, background jobs, queues, file IO, external APIs, auth, and config
- test strategy, fixtures, mocks, integration coverage, validation commands, and known evidence gaps
- ADRs, diagrams, docs, and known tradeoffs that constrain design

## Workflow

1. Read selected context and impacted-system graph.
2. Summarize actual code structure and runtime flow first.
3. Cross-check docs, diagrams, ADRs, and tests against code reality.
4. Identify stable boundaries, extension points, dependencies, ownership seams, and forbidden assumptions.
5. Record architecture gaps, stale docs, drift suspicions, and missing evidence.
6. Produce `architecture_snapshot.json` using `references/architecture-snapshot.schema.json`.
7. Handoff to `insertion-point-locator`.

## Output contract

Always return this structure:

```markdown
# Architecture Snapshot

## Current architecture
- Boundary:
- Runtime flow:
- State/data ownership:
- Public contracts:

## Existing patterns and extension points
- <pattern or extension point>

## Known tradeoffs and constraints
- <tradeoff or constraint>

## Architecture gaps
- <gap or none>

## architecture_snapshot.json
```json
{}
```

## next_skill_handoff
Send `architecture_snapshot.json` to `insertion-point-locator`; include gaps, drift suspicions, and constraints that may block insertion approval.
```

## Guardrails

- Do not invent architecture from naming conventions alone.
- Do not resolve doc/code disagreements silently; mark them as architecture gaps or drift candidates.
- Do not include broad repository summaries that are irrelevant to the affected system.
- Do not select insertion points in this skill; defer that to `insertion-point-locator`.
