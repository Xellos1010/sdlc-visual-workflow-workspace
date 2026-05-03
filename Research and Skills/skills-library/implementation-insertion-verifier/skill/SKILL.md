---
name: implementation-insertion-verifier
description: verify that implementation diffs obey approved insertion points, file ownership, dependency direction, layering rules, codegen contracts, and scope boundaries in cloud-agent sdlc workflows. use after code-from-pseudocode-generator or human-code-delta-ingestor when implementation_diff must be checked against insertion_point_map.json and codegen_contract.json before generated-code-reviewer, test execution, adr drafting, parity sync, or continuity updates.
---

# Implementation Insertion Verifier

Confirm that the implementation landed only where it was approved to land and did not violate architecture or scope boundaries.

## Core rule

Scope and boundary violations are blockers even when code appears functionally correct. Verify placement before general review.

## Required inputs

- `implementation_diff` and changed files
- `insertion_point_map.json`
- `codegen_contract.json`
- `architecture_snapshot.json`, `dependency_inversion_plan.json`, and `adapter_boundary_contract.json` when available
- Work order, non-goals, lock state, and branch/PR context when available

## Workflow

1. Compare every changed file against allowed files, owned files, forbidden files, and lock boundaries.
2. Check imports, dependency direction, adapter boundaries, domain boundaries, public API exposure, and persistence or event surfaces.
3. Detect scope creep: extra behavior, opportunistic refactors, unrelated formatting, hidden migrations, or broad dependency changes.
4. Validate that tests were added or modified only in approved targets unless justified by the contract.
5. Record each violation with severity, file, evidence, contract clause, and required remediation.
6. Decide `approved`: true only when no blocking scope or layering violation remains.
7. Produce `insertion_verification_report.json` using `references/insertion-verification-report.schema.json` as a structural guide.
8. Handoff to `generated-code-reviewer`.

## Output contract

Always return this structure:

```markdown
# Implementation Insertion Verification

## Decision
- approved: true|false
- confidence: high|medium|low|mixed

## File boundary check
| Changed path | Contract status | Evidence | Notes |
|---|---|---|---|

## Scope violations
| Severity | Location | Evidence | Required fix |
|---|---|---|---|

## Layering violations
| Severity | Import/dependency | Rule violated | Required fix |
|---|---|---|---|

## insertion_verification_report.json
```json
{}
```

## next_skill_handoff
Send `insertion_verification_report.json`, `implementation_diff`, and changed files to `generated-code-reviewer`.
```

## Guardrails

- Do not approve changes outside the contract because they are convenient.
- Do not treat formatting-only churn as harmless if it touches protected files.
- Do not allow new runtime dependencies or cross-layer imports without explicit approval.
