---
name: complexity-notation-assessor
description: estimate big-o time complexity, space complexity, data-size assumptions, performance budgets, hotspots, query counts, memory growth, batching needs, and benchmark suggestions for cloud-agent sdlc design verification. use after algorithm-decomposition-planner and memory-lifecycle-analyzer when algorithm_decomposition.json and memory_lifecycle_report.json exist and before observability planning, pseudocode review verification, test generation, implementation planning, generated-code review, validation, adr drafting, parity sync, or continuity updates.
---

# Complexity Notation Assessor

Estimate expected runtime and space behavior before code generation and record performance assumptions as reviewable design evidence.

## Core rule

Every complexity claim must name the input variables it depends on, the operation that dominates cost, and the data-size assumption. Use ranges or multiple cases when the behavior is conditional.

## Required inputs

- `algorithm_decomposition.json`
- `memory_lifecycle_report.json`
- Data-size assumptions, workload assumptions, latency budgets, resource budgets, and acceptance criteria
- IO schema, query patterns, event volume, persistence model, and runtime context when available

## Workflow

1. Define symbolic variables for input sizes, collection sizes, event counts, query counts, payload sizes, and concurrency levels.
2. Estimate time and space complexity for each function or step with non-trivial cost.
3. Identify dominant operations, nested loops, repeated queries, serialization, sorting, hashing, graph traversal, recursion, streaming, caching, and batching points.
4. Record best, typical, worst, and amortized cases when they differ.
5. Define performance budget and measurement strategy.
6. Identify hotspots requiring observability, benchmarks, load tests, or ADR-level tradeoff capture.
7. Produce `complexity_assessment.json` using `references/complexity-assessment.schema.json`.
8. Handoff to `observability-instrumentation-planner` and `pseudocode-review-verifier`.

## Output contract

Always return this structure:

```markdown
# Complexity Assessment

## Variables and assumptions
| Symbol | Meaning | Expected range | Source/evidence |
|---|---|---|---|

## Time complexity
| Unit/step | Complexity | Dominant operation | Case | Notes |
|---|---|---|---|---|

## Space complexity
| Unit/step | Complexity | Memory driver | Retention risk | Notes |
|---|---|---|---|---|

## Performance budget
- Latency budget:
- Query/API budget:
- Memory budget:
- Throughput budget:
- Bundle/startup budget, if relevant:

## Hotspots and benchmarks
- <hotspot, risk, metric, benchmark/load-test suggestion>

## complexity_assessment.json
```json
{}
```

## next_skill_handoff
Send `complexity_assessment.json` to `observability-instrumentation-planner` and `pseudocode-review-verifier`.
```

## Guardrails

- Do not write unsupported complexity claims.
- Do not ignore IO, serialization, query count, retries, or network round trips.
- Do not hide performance concerns behind words such as simple, small, or negligible unless data-size evidence supports it.
