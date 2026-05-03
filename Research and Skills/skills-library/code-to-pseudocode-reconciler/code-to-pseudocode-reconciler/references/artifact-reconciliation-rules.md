# Artifact reconciliation rules

## Authority checks

1. Accepted ADR beats code unless human approval explicitly supersedes it.
2. Accepted code beats stale pseudocode only for the behavior represented by the approved diff.
3. Schemas and public contracts require explicit patch candidates, not implicit pseudocode edits.
4. Tests are evidence only when they were run or supplied as validation artifacts.
5. Memory summarizes artifacts; memory must never override artifacts.

## Mismatch types

| Mismatch | Patch target | Notes |
|---|---|---|
| behavior_added | pseudocode, tests | New branch, state, command, endpoint, or flow |
| behavior_removed | pseudocode, tests | Verify this is intended before removing design text |
| contract_changed | schema, pseudocode, docs | Usually ADR candidate |
| data_shape_changed | schema, migration notes, tests | High risk if persistence is affected |
| dependency_changed | ADR or ledger, runbook | Material dependency change needs decision capture |
| boundary_changed | diagrams, ADR, pseudocode | Architecture change; do not hide in code notes |
| validation_changed | test specification, evidence | Ensure parity manager sees it |
| doc_only | memory or docs | Usually low risk unless it contradicts code |
| contradiction | parity gap, decision capture | Do not auto-resolve conflict |
