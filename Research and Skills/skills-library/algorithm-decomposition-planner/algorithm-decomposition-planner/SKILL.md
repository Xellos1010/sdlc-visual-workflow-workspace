---
name: algorithm-decomposition-planner
description: decompose pseudocode contracts into functions, methods, modules, tasks, handlers, call graphs, state transitions, reusable operations, and complexity-relevant hotspots for cloud-agent sdlc design work. use after pseudocode-spec-writer when pseudocode_contract.json exists and before complexity-notation assessment, concurrency-state safety analysis, observability planning, pseudocode review verification, test generation, language-specific implementation planning, code generation, review, validation, adr drafting, parity sync, or continuity updates.
---

# Algorithm Decomposition Planner

Convert approved pseudocode into an implementation-neutral algorithm plan that identifies callable units, module boundaries, state transitions, and call relationships.

## Core rule

Decompose behavior without changing behavior. Function boundaries must be justified by cohesion, testability, reuse, side-effect isolation, or architecture boundaries from the insertion map.

## Required inputs

- `pseudocode_contract.json` and/or `pseudocode_contract.md`
- `architecture_snapshot.json` and `insertion_point_map.json` when available
- IO schema, type plan, event contract, adapter boundary contract, and acceptance criteria when available
- Existing module conventions and sibling implementations when known

## Workflow

1. Read the pseudocode steps and group them by responsibility, not by convenience.
2. Identify pure functions, command handlers, query handlers, validators, transformers, adapters, effectful operations, and orchestration steps.
3. Map each planned function or method to its inputs, outputs, side effects, error behavior, and tests.
4. Define module boundaries and ensure they do not violate approved insertion points or dependency direction.
5. Build a call graph with entrypoints, internal calls, external boundaries, and cycles or recursion if any.
6. Identify algorithmic hotspots, loops, data structure choices, batching points, cache points, and streaming opportunities.
7. Mark unresolved decomposition choices and any boundary that needs human review.
8. Produce `algorithm_decomposition.json` using `references/algorithm-decomposition.schema.json`.
9. Handoff to `complexity-notation-assessor`; also handoff to `concurrency-state-safety-analyzer` when async, event-driven, transactional, or shared-state behavior exists.

## Output contract

Always return this structure:

```markdown
# Algorithm Decomposition

## Decomposition summary
- Entry point:
- Primary orchestration unit:
- Pure computation units:
- Effectful units:

## Function inventory
| Unit | Kind | Responsibility | Inputs | Outputs | Side effects | Tests |
|---|---|---|---|---|---|---|

## Module boundaries
| Module/file target | Owns | Must not own | Depends on | Evidence |
|---|---|---|---|---|

## Call graph
```text
entrypoint
  -> unit_a
  -> unit_b
```

## Hotspots and data-structure notes
- <hotspot, data size assumption, risk, suggested mitigation>

## algorithm_decomposition.json
```json
{}
```

## next_skill_handoff
Send `algorithm_decomposition.json` to `complexity-notation-assessor` and, when relevant, to `concurrency-state-safety-analyzer`.
```

## Guardrails

- Do not move behavior into files outside the approved insertion map.
- Do not combine unrelated side effects into a single helper.
- Do not create generic utility modules without evidence of reuse or ownership.
- Do not omit negative paths, retries, cancellation, or cleanup functions.
