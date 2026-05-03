---
name: pseudocode-spec-writer
description: write structured language-neutral pseudocode from requirements, architecture, io schemas, type-system plans, insertion points, event contracts, adapter contracts, and acceptance criteria for cloud-agent sdlc design work. use when io_contract.schema.json, type_system_plan.json, insertion_point_map.json, or equivalent design artifacts exist and the pipeline needs a code-generation-neutral pseudocode_contract.md and pseudocode_contract.json before algorithm decomposition, memory lifecycle analysis, complexity review, test generation, implementation planning, validation, adr drafting, parity sync, or continuity updates.
---

# Pseudocode Spec Writer

Create implementation-ready pseudocode without choosing final source code syntax. The output must be precise enough for downstream decomposition, test generation, and code generation while remaining language-neutral.

## Core rule

Do not write production code. Write deterministic pseudocode with explicit inputs, outputs, preconditions, postconditions, ordered steps, reads, writes, calls, errors, side effects, observability, and implied tests. Preserve architecture and insertion boundaries exactly.

## Required inputs

- `io_contract.schema.json`
- `type_system_plan.json`
- `insertion_point_map.json`
- Acceptance criteria, work order, user story, or issue summary
- `event_contract.json`, `adapter_boundary_contract.json`, or `dependency_inversion_plan.json` when available
- Architecture constraints, risk gates, non-goals, and validation requirements

## Workflow

1. Restate the purpose in one sentence and bind it to the work order or requested change.
2. Enumerate inputs and outputs using schema or type references, not invented shapes.
3. Capture preconditions, postconditions, invariants, and compatibility constraints.
4. Write ordered pseudocode steps with stable IDs. Each step must identify reads, writes, calls, and possible errors.
5. Separate pure computation from side effects such as persistence, network calls, file IO, queues, logging, metrics, and UI mutations.
6. Map control flow, data flow, and error flow explicitly enough for review.
7. List observability points and tests implied by the pseudocode.
8. Mark any blocked or uncertain item as a gap instead of filling it with assumptions.
9. Produce both `pseudocode_contract.md` and `pseudocode_contract.json` using `references/pseudocode-contract.schema.json` as the structural guide.
10. Handoff to `algorithm-decomposition-planner` and `memory-lifecycle-analyzer`.

## Output contract

Always return this structure:

```markdown
# Pseudocode Contract

## Purpose
<one sentence>

## Inputs and outputs
| Name | Direction | Schema/type ref | Required | Notes |
|---|---|---|---|---|

## Preconditions, postconditions, and invariants
- Preconditions:
- Postconditions:
- Invariants:

## Control flow
1. `step-001`: <language-neutral operation>
   - reads:
   - writes:
   - calls:
   - errors:

## Data flow
- <source data -> transform -> destination/output>

## Side effects
| Step | Effect | Boundary | Idempotency rule | Rollback/cleanup |
|---|---|---|---|---|

## Observability
- Logs:
- Metrics:
- Traces:
- Audit fields:

## Tests implied
- <test name, scenario, expected result>

## pseudocode_contract.json
```json
{}
```

## next_skill_handoff
Send `pseudocode_contract.json` to `algorithm-decomposition-planner` and `memory-lifecycle-analyzer`.
```

## Guardrails

- Do not expand scope beyond approved insertion points.
- Do not introduce new APIs, persistence, events, or external calls without a matching contract or explicit gap.
- Do not hide side effects inside generic words such as handle, process, sync, update, or validate.
- Do not skip failure paths, retries, cancellation, cleanup, or observability when the design involves IO or state.
