---
name: abstraction-opportunity-finder
description: decide whether implementation should be direct, extracted into a base abstraction, interface, adapter, composition seam, reusable module, or deferred for cloud-agent sdlc work. use after insertion-point-locator when insertion_point_map.json exists and before base-interface-class planning, contract-first io schema writing, pseudocode, implementation, generated-code review, validation, adr drafting, parity sync, or continuity updates.
---

# Abstraction Opportunity Finder

Choose the right implementation shape before pseudocode or code generation.

## Core rule

Avoid both over-abstraction and copy-paste drift. Create an abstraction only when there is concrete variation, repetition, contract pressure, or boundary pressure that justifies it.

## Required inputs

- `insertion_point_map.json`
- `architecture_snapshot.json`
- `blast_radius_report.json`, `constraint_contract.json`, sibling patterns, repetition evidence, variation evidence, and roadmap signals when available

## Decision options

Choose one primary implementation shape:

- `direct_implementation`: local change is safest and no durable abstraction is justified
- `extend_existing_abstraction`: existing base/interface/adapter/module already owns the variation
- `new_interface_or_port`: boundary requires a stable contract or dependency inversion seam
- `new_base_class_or_trait`: multiple implementations share durable lifecycle or behavior and language conventions support it
- `adapter_or_facade`: external integration, legacy surface, or unstable dependency needs isolation
- `composition_helper`: shared behavior is real but should stay lightweight and local
- `defer_abstraction`: likely future reuse exists but current evidence is insufficient
- `blocked`: abstraction decision needs missing authority, architecture repair, or human review

## Evidence thresholds

Require at least one strong signal before creating a new abstraction:

- three or more similar call sites, or two similar call sites with clear future variation
- public contract or plugin/extension boundary pressure
- testability, dependency inversion, or side-effect isolation requirement
- migration path requiring compatibility shim or adapter
- repeated lifecycle, error handling, observability, permission, or serialization pattern

## Workflow

1. Read insertion points and current architecture.
2. Compare candidate changes against sibling patterns and existing extension points.
3. Identify repetition, variation, and boundary pressure.
4. Decide the smallest durable shape that satisfies current requirements.
5. Record anti-abstraction warnings for speculative, generic, or premature designs.
6. Mark whether `base-interface-class-planner`, `contract-first-io-schema-writer`, or direct pseudocode should run next.
7. Produce `abstraction_decision.json` using `references/abstraction-decision.schema.json`.

## Output contract

Always return this structure:

```markdown
# Abstraction Decision

## Primary implementation shape
<decision option>

## Rationale
- <evidence-backed reason>

## Abstraction candidates
| Candidate | Type | Evidence | Decision |
|---|---|---|---|

## Do-not-abstract notes
- <warning or none>

## abstraction_decision.json
```json
{}
```

## next_skill_handoff
Send `abstraction_decision.json` to `base-interface-class-planner` when a base/interface is justified, to `contract-first-io-schema-writer` when IO contracts are central, or to the next pseudocode/planning skill when direct implementation is safest.
```

## Guardrails

- Do not create new abstractions from naming similarity alone.
- Do not generalize beyond current evidence and accepted roadmap signals.
- Do not bypass existing extension points without explaining why they are insufficient.
- Do not hide speculative design behind vague words such as flexible, reusable, scalable, or clean.
