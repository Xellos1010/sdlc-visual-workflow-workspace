---
name: data-model-type-system-designer
description: map io contracts into target language and framework data models, static types, runtime validators, nullability rules, enums, discriminated unions, generics, ownership expectations, serialization rules, and type-safety gates for cloud-agent sdlc work. use after contract-first-io-schema-writer when io_contract.schema.json exists and before pseudocode, algorithm planning, implementation, generated-code review, validation, adr drafting, parity sync, or continuity updates.
---

# Data Model Type System Designer

Translate behavior-level IO contracts into safe language and framework types without losing validation semantics.

## Core rule

Types must preserve the contract, not merely mirror a JSON shape. Represent nullability, optionality, defaults, errors, discriminants, ownership, mutability, serialization, and runtime validation explicitly.

## Required inputs

- `io_contract.schema.json`
- Language, framework, package, runtime, and generated-code context
- Existing types, validators, serializers, migrations, schemas, tests, fixtures, and naming conventions
- `dependency_inversion_plan.json`, `interface_plan.json`, and `adapter_boundary_contract.json` when relevant

## Type design decisions

Always decide:

- Create new type, reuse existing type, extend existing type, or generate type
- Static-only, runtime-validated, or both
- Optional versus nullable semantics
- Exact enum versus open string union compatibility
- Discriminated union strategy for variants and errors
- Date/time, numeric precision, identifier, and serialization handling
- Ownership/mutability/lifetime expectations where relevant
- Generated-code ownership and manual-edit boundaries

## Workflow

1. Read the IO contract and list every contract field and variant.
2. Locate existing compatible types and validators before proposing new ones.
3. Map input, output, and error schemas to target-language types.
4. Define runtime validation, parse, serialize, and downgrade/compatibility behavior.
5. Specify type-safety gates: compiler checks, schema tests, exhaustive matching, fixtures, or generated artifact checks.
6. Identify migration requirements for existing call sites and generated types.
7. Produce `type_system_plan.json` using `references/type-system-plan.schema.json`.
8. Handoff to `pseudocode-spec-writer`; include type names and validation gates.

## Output contract

Always return this structure:

```markdown
# Type System Plan

## Type strategy
- Language/framework:
- Create/reuse/generate posture:
- Runtime validation posture:
- Serialization posture:

## Types to create
| Type | Kind | Source schema | Fields or variants | Validation | Owner |
|---|---|---|---|---|---|

## Types to reuse
| Existing type | Location | Reuse reason | Compatibility gaps |
|---|---|---|---|

## Type-safety gates
- <gate and command/test/check if known>

## type_system_plan.json
```json
{}
```

## next_skill_handoff
Send `type_system_plan.json` and `io_contract.schema.json` to `pseudocode-spec-writer`; preserve unresolved type gaps and required safety gates.
```

## Guardrails

- Do not collapse optional and nullable into the same concept.
- Do not reuse a type whose semantics differ just because fields are similar.
- Do not ignore runtime validation when untrusted input crosses a boundary.
- Do not create generated and hand-written types with overlapping ownership without naming the owner and update path.
- Do not erase error variants into untyped strings when downstream handling needs typed behavior.
