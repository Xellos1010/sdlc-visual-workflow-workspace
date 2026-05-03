---
name: test-from-pseudocode-generator
description: generate test specifications, fixture plans, expected results, coverage matrices, and test file targets from approved pseudocode in cloud-agent sdlc workflows. use after pseudocode-review-verifier when pseudocode_contract.json, acceptance criteria, io_contract.schema.json, risk gates, edge cases, and insertion targets are ready, and before pseudocode-to-language-plan-compiler, codegen-contract-builder, code generation, generated-code review, validation, adr drafting, parity sync, or continuity updates.
---

# Test From Pseudocode Generator

Convert approved pseudocode into a concrete, implementation-guiding test specification. The output must define what to test before code is written.

## Core rule

Generate tests from contracts and behavior, not from imagined implementation details. Tests must cover acceptance criteria, IO validation, errors, side effects, state transitions, concurrency risks, and regression risks.

## Required inputs

- `pseudocode_review_report.json` with `approved_for_codegen: true`
- `pseudocode_contract.json`
- `io_contract.schema.json`
- Acceptance criteria and risk gates
- `algorithm_decomposition.json`, `complexity_assessment.json`, `concurrency_safety_report.json`, and `observability_plan.json` when available
- Existing test conventions, test targets, and framework context when known

## Workflow

1. Build a coverage matrix mapping acceptance criteria, pseudocode steps, IO branches, errors, and risk gates to tests.
2. Identify unit, integration, contract, regression, property, fixture, migration, concurrency, performance, and observability tests as appropriate.
3. Specify test files to create or modify using insertion targets and repository conventions.
4. Define fixtures, mocks, factories, seed data, and golden outputs. Avoid embedding large fixture contents unless necessary.
5. Define expected results, assertions, setup, teardown, and failure evidence for each test.
6. Mark tests blocked by missing context separately from tests ready to implement.
7. Produce `test_specification.json` using `references/test-specification.schema.json` as a structural guide.
8. Handoff to `pseudocode-to-language-plan-compiler`.

## Output contract

Always return this structure:

```markdown
# Test Specification

## Coverage matrix
| Requirement / pseudocode step | Test name | Test type | Expected result | Risk covered |
|---|---|---|---|---|

## Test files to create or modify
| Path | Action | Test cases | Notes |
|---|---|---|---|

## Fixtures and mocks
| Fixture | Purpose | Shape/source | Cleanup |
|---|---|---|---|

## Expected results
- <test case>: <assertions and observable evidence>

## Blocked tests
- <test, missing input, owning artifact>

## test_specification.json
```json
{}
```

## next_skill_handoff
Send `test_specification.json` to `pseudocode-to-language-plan-compiler`.
```

## Guardrails

- Do not use tests to change scope or implement unapproved behavior.
- Do not skip negative cases, malformed inputs, boundary values, permission errors, idempotency, retries, or cleanup when they are relevant.
- Do not claim test coverage when assertions or expected results are undefined.
