---
name: pseudocode-to-language-plan-compiler
description: compile approved pseudocode, tests, schemas, insertion maps, and language or framework context into a concrete language-specific implementation plan for cloud-agent sdlc workflows. use after pseudocode-review-verifier and test-from-pseudocode-generator when pseudocode_contract.json, pseudocode_review_report.json, test_specification.json, insertion_point_map.json, and language_context are available, before codegen-contract-builder, code-from-pseudocode-generator, type-safety enforcement, generated-code review, validation, adr drafting, parity sync, or continuity updates.
---

# Pseudocode To Language Plan Compiler

Translate implementation-neutral pseudocode into a language- and repository-specific plan without editing code yet.

## Core rule

Plan implementation in the target language while preserving the approved pseudocode, contracts, tests, and insertion boundaries. Do not generate production code in this skill.

## Required inputs

- `pseudocode_review_report.json`
- `pseudocode_contract.json`
- `test_specification.json`
- `io_contract.schema.json`
- `type_system_plan.json`
- `insertion_point_map.json`
- Language, framework, package, repository, and style context
- Existing sibling patterns and validation commands when known

## Workflow

1. Confirm pseudocode is approved for code generation.
2. Resolve target language/framework rules, import conventions, typing conventions, validation patterns, test frameworks, and file naming conventions.
3. Map each pseudocode unit to existing or new files, symbols, functions, classes, methods, handlers, or tests.
4. Sequence edits in dependency order: types/contracts first, pure logic next, adapters/effects next, tests and wiring as appropriate.
5. List exact files to create or edit, the reason for each edit, and the relevant pseudocode/test references.
6. Define language-specific safety rules such as nullability, ownership, async handling, transaction boundaries, dependency injection, error types, and serialization.
7. Identify blocked edits and ambiguity rather than choosing unsafe defaults.
8. Produce `codegen_plan.json` using `references/codegen-plan.schema.json` as a structural guide.
9. Handoff to `codegen-contract-builder`.

## Output contract

Always return this structure:

```markdown
# Codegen Plan

## Implementation summary
- Target language/framework:
- Entry points:
- Main sequence:

## File edit plan
| Path | Action | Symbols | Pseudocode refs | Test refs | Notes |
|---|---|---|---|---|---|

## Language rules
- Types:
- Errors:
- Async/concurrency:
- Imports/dependency direction:
- Formatting/linting:

## Implementation sequence
1. <edit step, dependency, validation checkpoint>

## Blockers
- <blocker and owner>

## codegen_plan.json
```json
{}
```

## next_skill_handoff
Send `codegen_plan.json` to `codegen-contract-builder`.
```

## Guardrails

- Do not edit code or emit final code patches.
- Do not add files outside `insertion_point_map.json` without marking a scope issue.
- Do not plan around failed tests by weakening coverage.
