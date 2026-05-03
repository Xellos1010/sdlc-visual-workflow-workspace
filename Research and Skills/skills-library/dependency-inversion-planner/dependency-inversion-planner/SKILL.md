---
name: dependency-inversion-planner
description: plan dependency inversion boundaries, allowed imports, disallowed imports, port ownership, implementation ownership, layering fixes, and incremental refactor steps for cloud-agent sdlc design work. use after architecture-snapshot-reader, base-interface-class-planner, or adapter-boundary-planner when high-level modules must depend on contracts instead of low-level details, before contract-first io schema writing, pseudocode, implementation, generated-code review, validation, adr drafting, parity sync, or continuity updates.
---

# Dependency Inversion Planner

Make import direction and ownership boundaries explicit before implementation.

## Core rule

High-level policy code must depend on stable contracts, not concrete implementations. If dependency inversion is not needed, say so and preserve current architecture. If it is needed, define the smallest import-direction change that prevents leakage while keeping migration safe.

## Required inputs

- `architecture_snapshot.json`
- `interface_plan.json` and `adapter_boundary_contract.json` when available
- Current dependency graph, imports, module/package boundaries, public exports, tests, and build constraints
- Runtime and ownership constraints from previous planning stages

## Workflow

1. Identify current dependency direction and intended ownership direction.
2. Classify each import as allowed, disallowed, tolerated temporarily, or unknown.
3. Define where contracts live and which module owns each concrete implementation.
4. Specify dependency injection, factory, registry, plugin, or composition mechanism when needed.
5. Create incremental refactor steps that avoid breaking call sites and keep tests runnable.
6. Define detection gates: lint rule, dependency-cruiser rule, import boundary test, type check, or review checklist.
7. Produce `dependency_inversion_plan.json` using `references/dependency-inversion-plan.schema.json`.
8. Handoff to `contract-first-io-schema-writer` and include import restrictions for downstream pseudocode and codegen.

## Output contract

Always return this structure:

```markdown
# Dependency Inversion Plan

## Dependency direction
- Current direction:
- Intended direction:
- Contract owner:
- Implementation owner:

## Import rules
| Module or path | Allowed imports | Disallowed imports | Temporary exceptions | Enforcement |
|---|---|---|---|---|

## Refactor plan
1. <smallest safe step>
2. <next step>

## Injection or composition mechanism
- Mechanism:
- Construction site:
- Test seam:

## dependency_inversion_plan.json
```json
{}
```

## next_skill_handoff
Send `dependency_inversion_plan.json` to `contract-first-io-schema-writer`, `pseudocode-spec-writer`, and `generated-code-reviewer`; downstream implementation must preserve allowed/disallowed import rules.
```

## Guardrails

- Do not move code solely to satisfy naming preferences; require architecture or testability evidence.
- Do not introduce a service locator or global registry unless the architecture already supports that pattern.
- Do not invert dependencies without specifying construction ownership and test seams.
- Do not leave disallowed imports unenforced when a repository-level rule can catch them.
- Preserve incremental rollback paths for refactors that cross package or runtime boundaries.
