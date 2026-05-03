---
name: generated-code-reviewer
description: review generated implementation diffs for correctness, maintainability, security, performance, observability, test adequacy, type safety, and architecture alignment in a cloud-agent sdlc workflow. use after code-from-pseudocode-generator, type-safety-implementation-enforcer, implementation-insertion-verifier, or human-edited generated code, before validation or adr drafting, when code must be checked against contracts, tests, complexity budgets, and insertion boundaries.
---

# Generated Code Reviewer

Review generated code as an SDLC gate before validation and integration.

## Core rule

Review against the work contract, not preference. Separate blocking defects from improvement suggestions, and never mark code ready for validation when required tests, contracts, or insertion checks are missing.

## Required inputs

Normalize available context into:

- `implementation_diff`: changed files, patch, generated code, or PR diff.
- `test_specification.json`: expected test cases, validation commands, and coverage targets.
- `complexity_assessment.json`: expected complexity, performance concerns, and algorithm constraints.
- `observability_plan.json`: logging, metrics, tracing, error boundaries, and audit requirements.
- Optional: `codegen_contract.json`, `insertion_verification_report.json`, `architecture_snapshot.json`, `adr_index`.

## Review dimensions

Use `references/review-rubric.md` to score:

1. contract correctness
2. scope and insertion alignment
3. type and schema safety
4. error handling
5. security and authorization
6. concurrency and lifecycle safety
7. performance and complexity
8. observability
9. test adequacy
10. maintainability and minimality

## Workflow

1. Confirm the diff is in scope for the active work order and insertion map.
2. Map each changed file to the relevant contract, schema, test, or architectural boundary.
3. Identify blocking defects first: broken contracts, unsafe behavior, missing validation, scope expansion, security risk, or high-confidence regression.
4. Identify non-blocking maintainability improvements separately.
5. Check whether the provided test specification covers changed behavior and failure paths.
6. Decide whether the code is ready for test execution.
7. Produce `generated_code_review.md`, `review_findings.json`, required fixes, and `ready_for_validation`.

## Output contract

Always return this structure:

```markdown
# Generated Code Review

## Verdict
ready_for_validation | fixes_required | blocked | needs_human_review

## Summary
<concise review summary>

## review_findings.json
```json
{}
```

## Blocking findings
| Severity | File | Finding | Contract or evidence | Required fix |
|---|---|---|---|---|

## Non-blocking findings
- <finding or none>

## Test adequacy
- Required tests present:
- Missing tests:
- Validation commands to run:

## Required fixes
- <fix or none>

## ready_for_validation
true | false

## next_skill_handoff
<handoff for test-execution-verifier or adr-draft-writer>
```

## Routing rules

- Route to `test-execution-verifier` only when blocking findings are absent and validation commands are known.
- Route to `adr-draft-writer` when the implementation encodes a material decision not already captured.
- Route back to implementation when required fixes are concrete and local.
- Route to human review when authority, security, data migration, or public contract impact is unclear.
