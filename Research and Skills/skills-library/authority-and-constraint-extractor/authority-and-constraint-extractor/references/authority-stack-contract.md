# Authority Stack Contract

## Source record fields

- `source_id`: stable reference or path
- `source_type`: system, operator, work_order, adr, runbook, schema, test, code, prior_memory, inferred
- `authority_level`: integer where lower is stronger
- `statement`: exact or summarized directive
- `applies_to`: files, packages, runtime surfaces, people, environments, or workflows
- `status`: active, superseded, conflicting, ambiguous, or missing

## Conflict handling

1. Prefer the highest-authority active source.
2. If two same-level sources conflict, mark human-review-required.
3. If code reality conflicts with ADRs or docs, route to architecture-drift-detector or parity-sync-manager.
4. If acceptance criteria conflict with security or platform constraints, block unsafe work.
5. Preserve all conflicts in the output contract; do not hide them in prose only.
