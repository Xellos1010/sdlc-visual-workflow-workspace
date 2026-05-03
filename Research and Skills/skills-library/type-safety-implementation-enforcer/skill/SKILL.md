---
name: type-safety-implementation-enforcer
description: enforce type safety for generated or human-edited implementation diffs in cloud-agent sdlc workflows. use after code-from-pseudocode-generator or human-code-delta-ingestor when implementation_diff, io_contract.schema.json, type_system_plan.json, language_context, schemas, validators, nullability rules, generics, serialization, and typecheck commands must be checked before generated-code-reviewer, test-execution-verifier, adr drafting, parity sync, or continuity updates.
---

# Type Safety Implementation Enforcer

Review implementation diffs against approved IO contracts and the type-system plan before general code review.

## Core rule

Treat type safety violations as implementation defects. Find schema drift, unsafe casts, untyped boundaries, nullability gaps, serialization mismatches, and validator omissions before validation runs.

## Required inputs

- `implementation_diff` and changed files
- `io_contract.schema.json`
- `type_system_plan.json`
- Language and framework context
- Existing validators, model definitions, generated types, and typecheck commands when available

## Workflow

1. Map changed types, validators, serializers, handlers, adapters, and tests to the approved type plan.
2. Check input validation, output serialization, nullability, enum and discriminated union handling, generics, optional fields, ownership or immutability, and error schemas.
3. Identify unsafe casts, any-typed holes, stringly typed fields, implicit coercion, unvalidated external data, and mismatched defaults.
4. Verify tests assert type-critical behavior and schema compatibility.
5. Propose a concrete fix plan for each violation and specify typecheck commands to run.
6. Produce `type_safety_report.json` using `references/type-safety-report.schema.json` as a structural guide.
7. Handoff to `generated-code-reviewer` with pass/fail and required fixes.

## Output contract

Always return this structure:

```markdown
# Type Safety Report

## Decision
- type_safety_passed: true|false
- confidence: high|medium|low|mixed

## Violations
| Severity | Location | Contract/type rule | Evidence | Required fix |
|---|---|---|---|---|

## Fix plan
1. <ordered fix>

## Typecheck commands
- <command and expected evidence>

## type_safety_report.json
```json
{}
```

## next_skill_handoff
Send `type_safety_report.json` and required fixes to `generated-code-reviewer`.
```

## Guardrails

- Do not approve implementation with unvalidated external inputs or schema-incompatible outputs.
- Do not ignore type holes just because tests are green.
- Do not invent language rules; use the provided language context and repository patterns.
