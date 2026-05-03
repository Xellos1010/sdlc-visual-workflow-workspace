# Decision Materiality Rules

Use these rules to decide whether a ledger entry also needs an ADR.

## ADR required

Require or recommend an ADR when the decision changes or constrains:

- architecture boundaries or layering
- abstractions, interfaces, base classes, adapters, or dependency inversion
- request/response schemas or event contracts
- persistence strategy or data migration behavior
- performance budgets, algorithmic complexity, or resource ceilings
- external integrations, vendors, libraries, or tools
- security, authority, approvals, or workflow policy
- long-lived code generation strategy

## Ledger-only

A ledger-only decision is acceptable when the decision is operationally useful but not architecturally durable, such as:

- choosing the next verification command
- selecting a temporary branch or work-order sequence
- recording a non-material human instruction
- documenting why a small local implementation choice was made

## Defer

Use `defer` when materiality cannot be resolved because key context, evidence, or human intent is missing. Emit unresolved questions and do not claim the decision is final.
