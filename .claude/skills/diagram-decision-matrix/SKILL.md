---
name: diagram-decision-matrix
description: Selects the right diagram set for a system analysis or migration initiative. Trigger on "which diagrams should we generate", "pick the right views", "what diagrams do we need", or at the start of a visualize phase. Produces a diagram selection with rationale. Use before spawning diagram-generating agents.
---

# Diagram Decision Matrix

Smallest diagram set that answers the operator's question. Notation maximalism is waste.

## Decision rules

| Situation | Mandatory diagrams | Conditional |
|---|---|---|
| Any non-trivial system | C4 context, C4 container | — |
| Container with meaningful internals | + Component diagram | — |
| Runtime interactions matter | + Sequence diagram | per key flow |
| Stateful or async lifecycle | + State machine | per stateful component |
| Persistence model exists | + ERD | per schema |
| Data movement over control flow | + DFD | — |
| Operator-facing UI surface | + Screen flow / wireframe | per user journey |
| TS→Rust migration in scope | + Pseudocode ledger, IO contracts, dependency gap matrix, target map | always |

## Output format

Produce a markdown table + rationale block:

```markdown
## Diagram Selection: <initiative-name>

| Diagram | Include | Rationale |
|---|---|---|
| C4 context | yes | system has external actors (operators, APIs) |
| C4 container | yes | multiple deployable units (TUI, server, agent) |
| Component diagram | yes for tui-repl, runtime-core | complex internal structure |
| Sequence diagram | yes — 3 key flows | agent dispatch, compaction, MCP call |
| State machine | yes — session lifecycle | async, resumable, crash-recoverable |
| ERD | no | no durable persistence layer |
| DFD | no | control flow > data movement here |
| Wireframe | yes — TUI screens | operator-facing surface |
| Pseudocode ledger | yes | migration prerequisite |
| IO contracts | yes | migration prerequisite |
| Dependency gap matrix | yes | migration prerequisite |
| Target mapping ledger | yes | migration prerequisite |

### Diagram generation order
1. C4 context + container (architecture anchors)
2. Pseudocode ledger + IO contracts (behavior and boundary facts)
3. Dependency gap matrix (migration risk)
4. Component diagrams (per complex container)
5. Sequence diagrams (per key runtime flow)
6. State machines (per stateful component)
7. Target mapping ledger (migration plan)
```

## Agent routing

After selection, route diagram generation to:
- C4 → `/c4-synthesizer`
- Sequences → `/runtime-sequence-synthesizer`
- State machines → `/state-machine-synthesizer`
- Pseudocode → `/pseudocode-ledger-writer`
- IO contracts → `/contract-inventory-builder`
- Gap matrix → `/dependency-gap-researcher`
- Target map → `/migration-map-builder`
