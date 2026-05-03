---
name: impacted-system-cartographer
description: map direct and indirect impacted systems, dependency paths, runtime surfaces, sibling patterns, owner boundaries, and blast-radius seeds for cloud-agent sdlc work. use after domain-context-locator when context_pack_manifest.json exists and before blast-radius analysis, architecture snapshots, insertion-point selection, abstraction planning, pseudocode, implementation, review, validation, adr drafting, parity sync, or continuity updates.
---

# Impacted System Cartographer

Create an evidence-backed map of the systems that may be affected by the requested change.

## Core rule

Map impact before judging implementation shape. Do not propose code changes, abstractions, or insertion points until direct and indirect system relationships are visible.

## Required inputs

- `context_pack_manifest.json` from `domain-context-locator`
- Dependency graph, import graph, package manifests, route maps, schemas, migrations, generated artifacts, test inventory, and ownership metadata when available
- Target or changed paths, issue/PR scope, route plan, and constraint contract when available

## Impact categories

Classify every relevant item into one or more categories:

- `direct_target`: explicitly requested file, package, API, component, module, route, command, schema, migration, block, or workflow
- `upstream_dependency`: code or contract the target depends on
- `downstream_dependent`: consumers, routes, tests, generated artifacts, jobs, integrations, or docs that depend on the target
- `runtime_surface`: entry point that can execute or expose the target, such as API route, CLI command, job, UI page, hook, event handler, or external integration
- `contract_surface`: public API, schema, type, env variable, storage shape, protocol, or generated output
- `sibling_pattern`: nearby implementation that should guide conventions but is not directly changed
- `owner_boundary`: team, module, package, service, plugin, third-party, or protected area boundary
- `evidence_gap`: missing graph, missing owner, stale doc, inaccessible source, or ambiguous dependency

## Workflow

1. Start from candidate paths and docs in `context_pack_manifest.json`.
2. Expand one hop upstream and downstream using imports, exports, routes, schemas, generated files, tests, docs, and runtime entry points.
3. Identify cross-package, cross-service, data, auth, persistence, concurrency, build, deployment, and third-party boundaries.
4. Separate high-confidence links from inferred links. Preserve uncertainty instead of inventing graph edges.
5. Select sibling patterns that constrain style, naming, lifecycle, error handling, observability, testing, or rollback.
6. Produce `impacted_systems.json` using `references/impacted-systems.schema.json`.
7. Handoff the graph seed to `blast-radius-preflight-analyzer` and `architecture-snapshot-reader`.

## Output contract

Always return this structure:

```markdown
# Impacted Systems Map

## Impact summary
- Direct targets:
- Highest-risk surfaces:
- Owner or boundary crossings:
- Evidence gaps:

## Impact graph
| Item | Category | Relationship | Evidence | Confidence |
|---|---|---|---|---|

## Runtime and contract surfaces
- <surface or none>

## Sibling patterns
- <path or pattern and why it matters>

## impacted_systems.json
```json
{}
```

## next_skill_handoff
Send `impacted_systems.json` to `blast-radius-preflight-analyzer` and `architecture-snapshot-reader`; preserve confidence levels and evidence gaps.
```

## Guardrails

- Do not treat a directory name match as impact without supporting evidence.
- Do not omit tests, generated files, migrations, fixtures, config, or docs when they define behavior.
- Do not collapse direct targets and downstream dependents into one bucket.
- If dependency information is incomplete, produce the best bounded map and mark `evidence_gap` entries for downstream review.
