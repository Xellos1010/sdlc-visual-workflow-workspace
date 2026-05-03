# Principles Alignment

## Why this matters

Domain experts often understand the governing principles of their field better than the exact implementation details of a new stack. The ecosystem should turn those principles into reusable visual and machine-readable artifacts.

## Principle cards

A principle card is a structured statement such as:
- acceptable complexity budgets,
- search/indexing tradeoffs,
- consistency models,
- safety invariants,
- accessibility heuristics,
- latency budgets,
- privacy or compliance rules.

## How principle cards are used

- attached to systems, components, and work orders through the graph
- rendered as overlays in diagrams
- referenced by personas during questioning and implementation
- linked to fix-memory records when principle violations cause bugs

## Example

A data-design principle card may state that interactive search paths should not rely on repeated O(n) scans over large collections. Once that principle is attached to a component, future planning and bug analysis should ask whether the current design violates it.
