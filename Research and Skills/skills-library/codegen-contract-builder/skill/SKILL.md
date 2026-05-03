---
name: codegen-contract-builder
description: build a bounded code generation contract for cloud-agent sdlc implementation work. use after pseudocode-to-language-plan-compiler when codegen_plan.json, file locks, active branch or pr context, work order, insertion point map, validation commands, and rollback expectations must be converted into allowed files, forbidden files, edit limits, validation gates, and rollback plan before code-from-pseudocode-generator, type-safety implementation enforcement, generated-code review, validation, adr drafting, parity sync, or continuity updates.
---

# Codegen Contract Builder

Create the enforceable contract that tells the implementation agent exactly what it may edit and how the result must be validated.

## Core rule

A codegen contract is a safety boundary, not a suggestion. It must be strict enough for another agent to implement without expanding scope.

## Required inputs

- `codegen_plan.json`
- `insertion_point_map.json`
- Work order, active branch, active PR, file locks, and current task state
- Validation command candidates from repository conventions or prior evidence
- Rollback, review, and escalation requirements

## Workflow

1. Reconcile the codegen plan with owned files, forbidden files, active locks, and branch/PR constraints.
2. Define exact allowed files, allowed symbols, allowed operation types, and maximum scope for each edit.
3. Define forbidden files, forbidden imports, forbidden behavior changes, and protected artifacts.
4. Define validation commands in the order they should run, including fast checks and full checks when relevant.
5. Define rollback plan, partial failure behavior, evidence capture, and human escalation triggers.
6. Identify conflicts with locks, active PRs, missing authority, or unowned files as blockers.
7. Produce `codegen_contract.json` using `references/codegen-contract.schema.json` as a structural guide.
8. Handoff to `code-from-pseudocode-generator` only when no blocking contract gaps remain.

## Output contract

Always return this structure:

```markdown
# Codegen Contract

## Contract decision
- ready_for_codegen: true|false
- branch/pr context:
- lock status:

## Allowed files
| Path | Allowed actions | Symbols/sections | Reason |
|---|---|---|---|

## Forbidden files and actions
| Path/pattern | Forbidden action | Reason |
|---|---|---|

## Validation commands
| Order | Command | Purpose | Required evidence |
|---|---|---|---|

## Rollback plan
- <file/action rollback instruction>

## Blockers and escalation triggers
- <blocker>

## codegen_contract.json
```json
{}
```

## next_skill_handoff
Send `codegen_contract.json`, `codegen_plan.json`, `pseudocode_contract.json`, and `test_specification.json` to `code-from-pseudocode-generator`.
```

## Guardrails

- Do not approve implementation when lock ownership or active PR ownership is unclear.
- Do not allow wildcard edits unless the work order explicitly authorizes them.
- Do not omit rollback, validation, or evidence requirements.
