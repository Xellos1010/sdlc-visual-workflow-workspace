---
name: pseudocode-review-verifier
description: verify pseudocode contracts before code generation in cloud-agent sdlc workflows. use after pseudocode-spec-writer, algorithm-decomposition-planner, memory-lifecycle-analyzer, complexity-notation-assessor, concurrency-state-safety-analyzer, or observability-instrumentation-planner when pseudocode_contract.json must be checked against io schemas, type plans, complexity budgets, memory lifecycle, concurrency safety, acceptance criteria, and insertion boundaries before test generation, language planning, codegen contracts, implementation, validation, adr drafting, parity sync, or continuity updates.
---

# Pseudocode Review Verifier

Review design artifacts as a gate before implementation. The output must say whether the work is ready for code generation and must identify blocking gaps precisely.

## Core rule

Do not rewrite the implementation plan unless a specific gap requires a patch. Verify that the pseudocode is complete, testable, bounded, and compatible with the approved contracts.

## Required inputs

- `pseudocode_contract.json` and/or `pseudocode_contract.md`
- `io_contract.schema.json`
- `type_system_plan.json`
- `algorithm_decomposition.json`
- `memory_lifecycle_report.json`
- `complexity_assessment.json`
- `concurrency_safety_report.json` when applicable
- `observability_plan.json` when available
- Acceptance criteria, insertion map, risk gates, and non-goals

## Workflow

1. Confirm all required upstream artifacts are present or explicitly marked unavailable.
2. Check pseudocode coverage against IO schemas, type rules, acceptance criteria, errors, edge cases, side effects, and rollback/cleanup.
3. Verify that algorithm decomposition, memory lifecycle, complexity, concurrency, and observability are consistent with the pseudocode.
4. Confirm the work respects insertion points, forbidden files, dependency direction, and non-goals.
5. Mark each finding as `blocking`, `warning`, or `note`; include artifact, section, evidence, and required fix.
6. Decide `approved_for_codegen`: true only when no blocking findings remain.
7. Produce `pseudocode_review_report.json` using `references/pseudocode-review-report.schema.json` as a structural guide.
8. Handoff approved work to `test-from-pseudocode-generator` and `pseudocode-to-language-plan-compiler`; otherwise return a fix loop to the failing upstream skill.

## Output contract

Always return this structure:

```markdown
# Pseudocode Review Report

## Decision
- approved_for_codegen: true|false
- confidence: high|medium|low|mixed

## Definition of ready checklist
| Check | Status | Evidence | Notes |
|---|---|---|---|

## Findings
| Severity | Artifact | Evidence | Required action |
|---|---|---|---|

## Blocking gaps
- <gap and owning upstream skill>

## pseudocode_review_report.json
```json
{}
```

## next_skill_handoff
If approved, send `pseudocode_review_report.json`, `pseudocode_contract.json`, and related artifacts to `test-from-pseudocode-generator` and `pseudocode-to-language-plan-compiler`.
```

## Guardrails

- Do not approve pseudocode that hides IO, side effects, retries, state mutation, error handling, or validation behind vague verbs.
- Do not approve if schemas, type plans, pseudocode, and tests would conflict downstream.
- Do not invent missing authority; mark missing approvals or scope ambiguity as blockers.
