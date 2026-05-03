---
name: architecture-drift-detector
description: detect architecture drift between intended design, architecture snapshots, adrs, schemas, diagrams, tests, and actual code in a cloud-agent sdlc workflow. use when code reality appears to diverge from documented boundaries, layering, contracts, dependencies, persistence, adapters, performance assumptions, or prior decisions, or before insertion planning when architecture gaps may require repair, adr updates, or human review.
---

# Architecture Drift Detector

Identify divergences between intended architecture and implementation reality before the SDLC chain proceeds.

## Core rule

Detect and classify drift; do not silently redesign the system. Recommend repairs, ADR updates, or routing only when supported by concrete evidence.

## Required inputs

Normalize available context into:

- `architecture_snapshot.json`: intended boundaries, patterns, extension points, known tradeoffs, and gaps.
- `adr_index`: active, superseded, and proposed ADRs relevant to the affected area.
- `schemas`: API, event, persistence, config, or type contracts.
- `code_reality`: changed files, dependency graph, implementation files, tests, module boundaries, runtime wiring, or repository inspection notes.

If any input is missing, mark confidence lower and identify what must be inspected.

## Drift taxonomy

Use `references/drift-taxonomy.md` to classify drift. Common categories:

- boundary drift
- layering drift
- dependency direction drift
- contract drift
- data model drift
- adapter or integration drift
- persistence drift
- observability drift
- security or authorization drift
- performance assumption drift
- test coverage drift
- documentation-only drift

## Workflow

1. Establish the intended architecture from snapshots, ADRs, schemas, and diagrams.
2. Establish code reality from implementation evidence, not assumptions.
3. Compare intended boundaries against actual files, imports, dependencies, ownership, runtime paths, and tests.
4. Classify each drift item by category, severity, confidence, and evidence.
5. Decide whether drift is acceptable evolution, undocumented design change, accidental violation, or stale documentation.
6. Identify repair candidates:
   - update code to match architecture
   - update pseudocode or schema
   - draft or update ADR
   - update diagram or docs
   - block insertion until human review
7. Produce `architecture_drift_report.json` and a downstream handoff.

## Output contract

Always return this structure:

```markdown
# Architecture Drift Report

## Verdict
no_material_drift | acceptable_drift | repair_required | adr_required | blocked

## architecture_drift_report.json
```json
{}
```

## Drift findings
| Severity | Category | Intended state | Code reality | Evidence | Repair candidate |
|---|---|---|---|---|---|

## ADR update needs
- <ADR candidate or none>

## Repair candidates
- <repair or none>

## Confidence and missing evidence
- <missing input or none>

## next_skill_handoff
<handoff for insertion-point-locator, adr-draft-writer, or parity-sync-manager>
```

## Routing rules

- Route to `insertion-point-locator` when drift is absent or acceptable and implementation can proceed.
- Route to `adr-draft-writer` when the drift represents a material architecture decision.
- Route to `parity-sync-manager` when documentation, schemas, tests, or pseudocode must be synchronized.
- Route to human review when severity is high and intended authority conflicts with code reality.
