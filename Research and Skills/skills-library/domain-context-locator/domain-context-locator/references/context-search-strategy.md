# Context Search Strategy

## Repository search order

1. Exact identifiers from the request, route plan, and constraints.
2. Package manifests, workspace config, app/service directories, and public entrypoints.
3. Imports, exports, dependency edges, routes, schemas, migrations, and generated files.
4. Tests, fixtures, snapshots, mocks, and benchmark files.
5. Sibling patterns implementing similar behavior.
6. Owners, CODEOWNERS, runbooks, ADRs, diagrams, and release notes.

## Relevance classes

- `direct`: likely changed or directly read by the requested work.
- `contract`: public interface, schema, type, API, event, or persistence boundary.
- `test`: tests or evidence required for validation.
- `sibling_pattern`: similar implementation that should guide consistency.
- `authority`: ADR, runbook, policy, or work-order constraint.
- `historical`: prior PR, issue, or decision useful for context.
- `noise`: searched but not selected.

## Missing context flags

- missing repository access
- missing dependency graph
- stale or absent docs
- missing tests
- ambiguous ownership
- conflicting ADR/code reality
- generated file source missing
- runtime configuration unavailable
