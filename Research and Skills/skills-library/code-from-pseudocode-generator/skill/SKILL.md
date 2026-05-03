---
name: code-from-pseudocode-generator
description: generate bounded implementation diffs from approved pseudocode, tests, and codegen contracts in cloud-agent sdlc workflows. use after codegen-contract-builder when codegen_contract.json, codegen_plan.json, pseudocode_contract.json, test_specification.json, repository files, and allowed file boundaries are available, before type-safety-implementation-enforcer, implementation-insertion-verifier, generated-code-reviewer, test-execution-verifier, adr drafting, parity sync, or continuity updates.
---

# Code From Pseudocode Generator

Implement the approved pseudocode within the exact codegen contract. Produce a clear diff, changed-file inventory, notes, and unresolved questions.

## Core rule

Only edit what the `codegen_contract.json` allows. Implementation must trace back to approved pseudocode and tests. Do not expand scope, weaken tests, or silently alter contracts.

## Required inputs

- `codegen_contract.json`
- `codegen_plan.json`
- `pseudocode_contract.json`
- `test_specification.json`
- Repository files or relevant snippets
- IO schema, type plan, event contracts, adapter contracts, and validation commands when available

## Workflow

1. Verify the codegen contract is ready and all target files are allowed.
2. Inspect existing sibling code style, imports, errors, tests, naming, formatting, and typing patterns.
3. Implement in the planned order: contracts/types, pure logic, effects/adapters, wiring, tests, and fixtures as authorized.
4. Keep changes minimal and trace each changed symbol to pseudocode and test references.
5. Preserve public compatibility unless the contract explicitly approves breaking changes.
6. Record changed files, rationale, validation commands to run, and open questions.
7. Produce `implementation_diff` and `implementation_notes`; include exact file paths and scope evidence.
8. Handoff to `type-safety-implementation-enforcer` and `implementation-insertion-verifier`, then `generated-code-reviewer`.

## Output contract

Always return this structure:

```markdown
# Implementation Diff Summary

## Changed files
| Path | Action | Pseudocode refs | Test refs | Notes |
|---|---|---|---|---|

## Implementation notes
- <important decisions, compatibility notes, edge cases>

## Validation commands to run
- <command and reason>

## Open questions
- <question, impact, owner>

## implementation_diff
```diff
<diff or patch summary>
```

## next_skill_handoff
Send `implementation_diff`, `changed_files`, `codegen_contract.json`, and `type_system_plan.json` to `type-safety-implementation-enforcer` and `implementation-insertion-verifier`.
```

## Guardrails

- Do not modify forbidden files or unowned surfaces.
- Do not make broad formatting-only changes unless explicitly allowed.
- Do not skip tests required by `test_specification.json`.
- Do not mask uncertainty; list open questions and blockers.
