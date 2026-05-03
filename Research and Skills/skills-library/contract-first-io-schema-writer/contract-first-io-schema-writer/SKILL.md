---
name: contract-first-io-schema-writer
description: define contract-first input, output, validation, defaults, examples, error schemas, serialization rules, compatibility rules, and versioning before pseudocode or implementation in cloud-agent sdlc work. use after insertion-point-locator and any interface, adapter, dependency inversion, or request-contract planning when io_contract.schema.json is required before data model design, event contract modeling, pseudocode, code generation, review, validation, adr drafting, parity sync, or continuity updates.
---

# Contract First IO Schema Writer

Define behavior-facing inputs and outputs before pseudocode or code.

## Core rule

No pseudocode or implementation should proceed until the input, output, validation, error, compatibility, and example contracts are explicit. Schemas should represent stable behavior, not incidental implementation objects.

## Required inputs

- Request contract, acceptance criteria, and constraints
- `insertion_point_map.json`
- `interface_plan.json`, `adapter_boundary_contract.json`, and `dependency_inversion_plan.json` when available
- Existing schemas, API specs, type definitions, generated contracts, fixtures, examples, migrations, and tests

## Schema coverage

Always address:

- Required and optional fields
- Nullability and empty-value behavior
- Defaults and derived values
- Enum and discriminated union rules
- Numeric/string/date/time constraints
- Serialization format and wire compatibility
- Input validation and output guarantees
- Error shape, codes, retryability, and user/developer messages
- Versioning, deprecation, and backwards compatibility
- Example valid input, valid output, validation error, and edge case

## Workflow

1. Locate existing contracts and prefer extension over replacement when compatibility matters.
2. Define the behavioral contract boundary independently of implementation classes.
3. Write input, output, and error schemas.
4. Add examples that cover happy path, edge cases, and representative failures.
5. Define compatibility rules and migration strategy for existing consumers.
6. Identify tests and fixtures that should be added or updated.
7. Produce `io_contract.schema.json` using `references/io-contract.schema.json` as the outer contract shape.
8. Handoff to `data-model-type-system-designer` and `event-contract-modeler` when event behavior exists.

## Output contract

Always return this structure:

```markdown
# IO Contract

## Contract summary
- Contract name:
- Version:
- Boundary:
- Existing consumers:
- Compatibility posture:

## Input schema
```json
{}
```

## Output schema
```json
{}
```

## Error schema
```json
{}
```

## Examples
### Valid input
```json
{}
```

### Valid output
```json
{}
```

### Error example
```json
{}
```

## Compatibility rules
- <rule>

## io_contract.schema.json
```json
{}
```

## next_skill_handoff
Send `io_contract.schema.json` to `data-model-type-system-designer`; send to `event-contract-modeler` if producers, consumers, async handlers, webhooks, queues, or lifecycle events are involved.
```

## Guardrails

- Do not use internal class names as public contract names unless that is already the contract convention.
- Do not omit error contracts or examples.
- Do not break existing consumers without explicit migration and versioning notes.
- Do not generate pseudocode, implementation code, or final types in this skill; define the contract only.
- Preserve uncertainty as contract gaps when existing behavior cannot be proven.
