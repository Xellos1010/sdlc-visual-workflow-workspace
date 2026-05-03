---
name: performance-budget-enforcer
description: compare expected and actual performance against complexity assessments, benchmark results, runtime metrics, and project performance budgets in a cloud-agent sdlc workflow. use when implementation changes affect algorithmic complexity, query count, bundle size, latency, memory, throughput, startup time, database load, api calls, rendering, background jobs, or other runtime budgets before closing validation or updating continuity.
---

# Performance Budget Enforcer

Check whether an implementation stays within the agreed performance envelope and produce mitigation work orders when it does not.

## Core rule

Separate measured regressions from theoretical risk. If benchmarks or metrics are missing, report an evidence gap and specify what must be measured before approval.

## Required inputs

Normalize available context into:

- `complexity_assessment.json`: expected big-O behavior, hot paths, data sizes, and algorithmic risks.
- `benchmark_results`: before/after measurements, CI perf output, profiling notes, or local command output.
- `runtime_metrics`: latency, throughput, memory, CPU, query counts, bundle size, render cost, job duration, or observability data.
- `code_diff`: implementation changes affecting performance-sensitive paths.
- Optional: performance budget, SLOs, baseline commit, prior incidents, ADRs.

## Budget dimensions

Use `references/performance-budget-taxonomy.md` to classify:

- algorithmic complexity
- latency
- throughput
- memory
- CPU
- I/O and database queries
- network calls
- bundle or asset size
- render cost
- startup or cold path
- background job duration
- cache behavior

## Workflow

1. Identify performance-sensitive changed paths.
2. Extract the expected budget or infer the relevant budget dimension from the complexity assessment and existing constraints.
3. Compare measured results to baseline when available.
4. If measurements are missing, define exact benchmark or profiling commands and mark verdict `measurement_required`.
5. Classify each issue as `within_budget`, `at_risk`, `violation`, or `unknown`.
6. Propose mitigation work orders with smallest safe changes first.
7. Decide whether closure is allowed, blocked, or requires human waiver.
8. Route continuity updates and ledger entries when budgets are accepted, waived, or violated.

## Output contract

Always return this structure:

```markdown
# Performance Budget Report

## Verdict
within_budget | at_risk | violation | measurement_required | blocked

## performance_budget_report.json
```json
{}
```

## Budget findings
| Dimension | Budget | Actual or expected | Status | Evidence | Mitigation |
|---|---|---|---|---|---|

## Violations
- <violation or none>

## Required measurements
- <benchmark or metric needed, or none>

## Mitigation work orders
- <work order or none>

## next_skill_handoff
<handoff for memory-continuity-manager, decision-tradeoff-ledger, or test-execution-verifier>
```

## Routing rules

- Route to `test-execution-verifier` when measurements require commands to run.
- Route to `decision-tradeoff-ledger` when a budget violation is accepted, waived, deferred, or traded off.
- Route to `memory-continuity-manager` for continuity updates, blockers, or follow-up performance work.
- Route back to implementation when a violation has a concrete local mitigation.
