---
name: base-interface-class-planner
description: plan base classes, abstract classes, interfaces, traits, ports, generics, dependency inversion seams, extension points, migration steps, and compatibility notes for cloud-agent sdlc design work. use after abstraction-opportunity-finder when abstraction_decision.json indicates a reusable contract, base type, interface, or composition seam is justified, and before adapter-boundary planning, dependency inversion planning, contract-first io schema writing, pseudocode, implementation, review, validation, adr drafting, parity sync, or continuity updates.
---

# Base Interface Class Planner

Plan the smallest justified reusable contract or base type before implementation.

## Core rule

Do not create an abstraction because one could exist. Create an interface, base class, trait, protocol, port, generic, or extension seam only when `abstraction_decision.json` provides evidence that the change needs variation support, replacement safety, test seams, dependency inversion, or compatibility-preserving migration.

## Required inputs

- `abstraction_decision.json` from `abstraction-opportunity-finder`
- `insertion_point_map.json` and `architecture_snapshot.json` when available
- Language and framework context, runtime constraints, existing sibling patterns, and compatibility requirements
- Current types, exports, public APIs, generated artifacts, and tests when available

## Planning choices

Choose exactly one primary strategy unless evidence requires a hybrid:

- `no_new_abstraction`: proceed directly, record why no base contract is needed
- `interface_or_protocol`: define a structural contract with implementation freedom
- `abstract_base_class`: share behavior and enforce required overrides
- `base_class`: share common behavior without forcing polymorphism
- `generic_type_or_template`: parameterize reusable type or operation behavior
- `port_contract`: create a hexagonal or dependency-inversion boundary
- `composition_seam`: inject behavior without inheritance
- `adapter_surface`: prepare a vendor/runtime boundary for `adapter-boundary-planner`

## Workflow

1. Read the abstraction decision and preserve its anti-abstraction warnings.
2. Inspect sibling implementation patterns and existing contracts before proposing new names.
3. Decide whether the base construct is public, internal, test-only, or migration-only.
4. Define each base type, required method/property, lifecycle hook, generic parameter, error contract, and extension point.
5. Identify backwards compatibility constraints, call-site migration order, and safe incremental rollout steps.
6. Define tests that prove substitutability, compatibility, and extension behavior.
7. Produce `interface_plan.json` using `references/interface-plan.schema.json`.
8. Handoff to `adapter-boundary-planner` when external integrations or runtime adapters are involved; otherwise handoff to `contract-first-io-schema-writer`.

## Output contract

Always return this structure:

```markdown
# Base Interface Plan

## Decision
- Strategy:
- Why this abstraction is justified:
- Why larger abstractions were rejected:

## Base types and contracts
| Name | Kind | Responsibility | Required members | Visibility | Evidence |
|---|---|---|---|---|---|

## Extension points
- <extension point, invariant, and caller responsibility>

## Compatibility and migration
- Current behavior preserved:
- Migration steps:
- Call sites to update:
- Tests to add or update:

## interface_plan.json
```json
{}
```

## next_skill_handoff
Send `interface_plan.json` to `adapter-boundary-planner` if adapters are needed, to `dependency-inversion-planner` if import direction must change, and to `contract-first-io-schema-writer` for IO schema design.
```

## Guardrails

- Do not introduce inheritance when composition or an interface is enough.
- Do not expose a public contract without versioning or compatibility notes.
- Do not define method signatures without error behavior, lifecycle expectations, and test implications.
- Preserve framework idioms; do not force object-oriented patterns into functional or data-oriented codebases.
- Mark unresolved type, runtime, or ownership questions as explicit gaps.
