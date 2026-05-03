---
name: domain-context-locator
description: locate relevant repository areas, packages, apps, modules, docs, runbooks, tests, schemas, prior decisions, and missing context for cloud-agent sdlc work. use after route planning and constraint extraction when an agent must curate context before impacted-system cartography, blast-radius analysis, architecture snapshots, insertion planning, pseudocode, implementation, review, validation, adr drafting, parity sync, or continuity updates.
---

# Domain Context Locator

Build a context pack manifest that tells downstream skills which files, docs, tests, and decisions matter.

## Core rule

Curate context before reasoning. Prefer a small, evidence-backed context pack over a broad dump, and explicitly list missing context that could change the route.

## Required inputs

- `route_plan.json`
- `constraint_contract.json`
- Repository index, file tree, dependency graph, package manifests, test inventory, and code search results
- Knowledge index: docs, runbooks, ADRs, diagrams, issues, PRs, previous evidence, and continuity state

## Discovery workflow

1. Translate the route plan into search targets: domains, packages, APIs, components, data models, tests, docs, and decisions.
2. Search for exact names first, then sibling patterns, imports, exports, schemas, tests, and runbooks.
3. Classify each candidate as direct context, sibling pattern, authority source, test/evidence, historical decision, or noise.
4. Record why each selected item matters and which downstream skill needs it.
5. Mark missing context such as inaccessible repo files, absent tests, stale docs, missing ADRs, unresolved ownership, or connector gaps.
6. Produce `context_pack_manifest.json` using `references/context-pack-manifest.schema.json`.
7. Handoff to `impacted-system-cartographer`.

Consult `references/context-search-strategy.md` for search heuristics.

## Output contract

Always return this structure:

```markdown
# Context Pack Manifest

## Candidate paths
| Path | Relevance | Why it matters | Needed by |
|---|---|---|---|

## Relevant docs and decisions
| Source | Relevance | Why it matters |
|---|---|---|

## Tests and evidence
- <test/evidence source or none>

## Missing context
- <missing context or none>

## context_pack_manifest.json
```json
{}
```

## next_skill_handoff
Send `context_pack_manifest.json` to `impacted-system-cartographer`; include missing context that may require fallback, search expansion, or human review.
```

## Guardrails

- Do not start architecture conclusions until sources are selected and relevance-scored.
- Do not rely on stale docs without marking staleness risk.
- Do not ignore tests, fixtures, migrations, generated files, schemas, or sibling implementations when they define actual behavior.
- If source access is unavailable, produce the best manifest possible and list connector gaps.
