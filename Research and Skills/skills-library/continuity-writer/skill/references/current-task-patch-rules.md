# Current task patch rules

Canonical path: `.foundry/projects/<project>/current-task.json`.
Legacy fallback: `.codex/projects/<project>/current-task.json`.

Patch only fields that changed. Preserve unknown fields. Never erase blockers, evidence, artifacts, locks, branch, or PR references unless resolving evidence is named.

Typical patch fields:

- `lifecycleStage` or `sdlcPhase`
- `taskStatus`
- `currentPhase.status`
- `currentPhase.updatedAt`
- `currentPhase.notes`
- `activeBranch`
- `activePr`
- `knownBlockers`
- `artifacts`
- `evidence`
- `locks`
- `nextCommandSet`
- `nextSafeAction`
