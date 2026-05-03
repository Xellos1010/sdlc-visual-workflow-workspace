---
name: scope-chunker
description: split roadmap features, bugs, refactors, architecture changes, and repo tasks into bounded work orders with dependencies, allowed files, forbidden files, locks, acceptance criteria, validation commands, rollback notes, and next-skill handoffs. use during planning before file-lock coordination, pseudocode writing, code generation, implementation, verification, or pr creation when work must be made small, reviewable, dependency-aware, and safe for cloud-agent execution.
---

# Scope Chunker

Transform feature roadmap items or requested changes into bounded work orders that can safely feed file locks, design, pseudocode, implementation, and verification.

## Core rule

A work order must be small enough to execute, review, validate, and roll back independently. If that is not true, split it.

## Required inputs

- Feature roadmap, issue, bug report, ADR, or requested change
- Repository intake audit and architecture/context artifacts when available
- Authority resolution and allowed/blocked actions
- Known validation commands, tests, and target files

## Workflow

1. Identify the requested outcome and non-goals.
2. Decompose the outcome into dependency-ordered units.
3. For each unit, define allowed file scope, forbidden file scope, lock requirements, acceptance criteria, validation commands, and rollback notes.
4. Mark prerequisite design or discovery work separately from implementation work.
5. Flag units that are too large, cross-cutting, risky, or under-specified.
6. Produce `work_order_plan.md` and `work_order_plan.json` using `references/work-order.schema.json` as a structural guide.

## Output format

```markdown
# Work Order Plan

## Scope summary
- source_feature_or_request:
- non_goals:
- split_strategy:

## Work orders
| ID | Title | Type | Depends on | Allowed files | Forbidden files | Validation | Status |
|---|---|---|---|---|---|---|---|

## Work order detail
### <id>: <title>
- objective:
- acceptance_criteria:
- allowed_files:
- forbidden_files:
- required_locks:
- validation_commands:
- rollback_notes:
- next_skill:

## work_order_plan.json
```json
{}
```

## next_skill_handoff
Pass implementation-ready work orders to `file-lock-coordinator`, `domain-context-locator`, `pseudocode-spec-writer`, or `codegen-contract-builder` depending on stage.
```

## Guardrails

- Do not create implementation work orders without acceptance criteria and validation expectations.
- Do not allow broad file globs when a narrower file set is known.
- Do not combine risky migration, contract, UI, and cleanup work into one order.
