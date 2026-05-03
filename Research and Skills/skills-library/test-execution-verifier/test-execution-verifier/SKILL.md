---
name: test-execution-verifier
description: run, request, or interpret validation commands and produce evidence-backed pass/fail reports for changed code in a cloud-agent sdlc workflow. use after code review, implementation, generated tests, nx or repository validation, ci results, or manual command output when chatgpt must verify tests, type checks, lint, builds, migrations, snapshots, or benchmarks before closure, adr logging, parity sync, or continuity updates.
---

# Test Execution Verifier

Convert validation commands and results into a reliable evidence-backed verdict.

## Core rule

Do not claim validation passed unless commands were executed in the current environment or credible command output/CI evidence was provided. If validation cannot run, return `not_run` with the blocker and exact command plan.

## Required inputs

Normalize available context into:

- `validation_commands`: commands to run or verify, including working directory and environment assumptions.
- `changed_files`: files, packages, modules, schemas, migrations, tests, and generated artifacts affected.
- `test_specification.json`: expected tests, coverage targets, edge cases, and acceptance criteria.
- Optional: CI output, command logs, screenshots, prior evidence bundle, code review findings.

## Workflow

1. Build a validation matrix from changed files and test specification.
2. Confirm commands are relevant, minimal, and ordered from cheapest to most comprehensive where practical.
3. Run available commands when execution tools and repository files are available. If not, request or define the exact command plan.
4. Capture command, cwd, start/end time if available, exit code, stdout/stderr summary, and evidence handles.
5. Interpret results against acceptance criteria. Passing commands do not prove untested behavior.
6. Classify each command as `passed`, `failed`, `not_run`, `skipped`, or `inconclusive`.
7. Produce `validation_report.json`, an evidence bundle, pass/fail verdict, and corrective work order when needed.

## Output contract

Always return this structure:

```markdown
# Validation Report

## Verdict
pass | fail | not_run | inconclusive | blocked

## validation_report.json
```json
{}
```

## Validation matrix
| Command | Purpose | Status | Evidence | Notes |
|---|---|---|---|---|

## Evidence bundle
- <command output, CI link, log path, or none>

## Failed or missing validation
- <failure or none>

## Corrective work order
<next_fix_work_order or none>

## pass_fail
pass | fail | not_run | inconclusive | blocked

## next_skill_handoff
<handoff for decision-tradeoff-ledger, parity-sync-manager, performance-budget-enforcer, or memory-continuity-manager>
```

## Routing rules

- Route to `decision-tradeoff-ledger` if validation outcome depends on a waiver, tradeoff, or human override.
- Route to `performance-budget-enforcer` when benchmarks, complexity, runtime, or regression budget is relevant.
- Route to `parity-sync-manager` when validation changes required tests, schemas, pseudocode, ADRs, or docs.
- Route to `memory-continuity-manager` when the run should update continuity, blockers, or completion status.
