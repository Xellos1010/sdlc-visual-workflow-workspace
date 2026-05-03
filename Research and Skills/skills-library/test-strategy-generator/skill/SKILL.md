---
name: test-strategy-generator
description: generate test strategy, validation commands, coverage matrices, fixture plans, regression cases, manual verification steps, evidence expectations, and test-risk gates for cloud-agent sdlc work. use during planning, before implementation, after scope chunking, after risk analysis, or before verification when an agent must decide what tests and checks are required for a feature, bug fix, refactor, contract change, migration, or pull request.
---

# Test Strategy Generator

Create a practical validation plan that tells implementers and verifiers exactly what evidence is needed to prove the work.

## Core rule

A test strategy must match the work order and risk profile. Do not ask for every possible test; ask for the minimum credible evidence that covers behavior, contracts, regressions, and high-risk paths.

## Required inputs

- Work order plan or feature/bug description
- Risk blast-radius report when available
- Repository intake audit with known validation commands
- Existing tests, CI, package scripts, and acceptance criteria
- IO contracts, pseudocode, implementation diff, or PR context when available

## Workflow

1. Identify behavior under test, non-goals, and acceptance criteria.
2. Map each acceptance criterion and risk signal to one or more validation methods.
3. Select test layers: unit, integration, contract, e2e, migration, smoke, performance, security, or manual verification.
4. Define fixtures, mocks, seed data, golden inputs, and expected results.
5. Identify existing tests to extend and new test targets to create.
6. List validation commands and evidence to capture.
7. Produce `test_strategy.md` and `test_strategy.json`.

## Output format

```markdown
# Test Strategy

## Scope
- work_order_or_feature:
- behavior_under_test:
- non_goals:
- risk_level:

## Coverage matrix
| Requirement or risk | Test layer | Test target | Fixture/data | Expected evidence |
|---|---|---|---|---|

## Validation commands
| Command | Purpose | Blocking? | Evidence to capture |
|---|---|---|---|

## Fixture plan
- fixtures:
- mocks_or_stubs:
- seed_data:
- edge_cases:

## Manual verification if needed
- steps:
- expected_result:
- evidence:

## test_strategy.json
```json
{}
```

## next_skill_handoff
Pass to `test-from-pseudocode-generator`, `pseudocode-review-verifier`, `codegen-contract-builder`, `generated-code-reviewer`, or `test-execution-verifier` depending on stage.
```

## Guardrails

- Do not invent commands unsupported by repo evidence; mark inferred commands separately.
- Do not rely only on manual verification when automated tests are feasible.
- Do not mark test strategy complete if acceptance criteria or risk profile are missing.
