---
name: repository-cartographer
description: Exhaustive structural mapping of a repository. Trigger on "map this repo", "reverse engineer codebase", "show module/dependency graph", "show architecture", or before any migration gate. Produces symbol graph, module graph, dependency graph, and subsystem classification. Read-only — never mutates source. Always runs before pseudocode-ledger-writer or contract-inventory-builder.
---

# Repository Cartographer

Map before you move. Produce structural facts — not narratives.

## Mindset

Exhaustive over narrative. Flag uncertain edges rather than guessing. Coverage is the primary goal.

## Output artifacts

| Artifact | Path | Format |
|---|---|---|
| Module graph | `code/module-graph.json` | JSON |
| Dependency graph | `code/dependency-graph.json` | JSON |
| Subsystem classification | `code/subsystem-map.json` | JSON |
| File inventory | `code/file-inventory.json` | JSON |

## Module graph schema

```json
{
  "nodes": [
    { "id": "relative/path/to/file.ts", "subsystem": "<subsystem>", "type": "module|component|service|util|type|test" }
  ],
  "edges": [
    { "from": "a.ts", "to": "b.ts", "kind": "import|reexport|dynamic-import" }
  ]
}
```

## Dependency graph schema

```json
{
  "nodes": [
    { "id": "<package-name>", "version": "<semver>", "type": "runtime|dev|peer", "rustEquivalent": "<crate or null>", "migrationRisk": "low|medium|high|blocker" }
  ],
  "edges": [
    { "from": "<consumer>", "to": "<dep>", "usedIn": ["<file>", ...] }
  ]
}
```

## Subsystem classification schema

```json
{
  "subsystems": {
    "<subsystem-name>": {
      "paths": ["<glob>", ...],
      "fileCount": N,
      "primaryLanguage": "TypeScript|TSX|...",
      "rustTarget": "<crate-name>"
    }
  }
}
```

## Procedure

1. Walk all source files (skip `node_modules`, `dist`, `build`, `.git`)
2. For each file: classify subsystem, extract imports, record export surface
3. Build module graph from import edges
4. Read `package.json` (and any workspace manifests) → build dependency graph
5. For each dependency: determine if a Rust equivalent exists; flag migration risk
6. Write all four artifacts
7. Produce a summary: total files, total deps, high-risk deps list

## Uncertainty rules

- If a file's subsystem is ambiguous, mark it `"subsystem": "unclassified"` — never guess
- If a dep has no known Rust equivalent, set `"rustEquivalent": null` and `"migrationRisk": "blocker"`
- If an import is dynamic or conditional, mark `"kind": "dynamic-import"` and flag in summary

## Quality gates

- [ ] Every .ts/.tsx file appears in module graph
- [ ] Every package.json dependency appears in dependency graph
- [ ] Zero unclassified files (resolve or escalate before completing)
- [ ] Summary counts match artifact counts
