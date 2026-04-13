# ADR-017: Enforce Context Packet Budgets with Relevance-Ranked Pruning and Pinning

## Status
proposed

## Date
2026-04-07

## Context
The new context packet must combine RAG hits, context-cart selections, and graph-adjacent artifacts while staying within the token limits of the target agent pipeline stage. This is a hard constraint because the operator surface needs predictable handoff packets, not unbounded dumps of every related artifact.

The packet assembler also has to respect operator intent:
- some items are explicitly pinned
- some are manually selected
- some are retrieved advisory context

The system needs a policy for what happens when the packet would exceed the target budget.

## Options Considered

### Option A: Hard Truncation by Sort Order
**Description**: Include items until the token budget is exhausted, then drop the rest.
**Pros**:
- Simple to implement
- Deterministic
**Cons**:
- Can discard the most relevant supporting context
- Ignores operator intent and item importance

### Option B: Relevance-Ranked Pruning with Operator Pinning
**Description**: Rank items by relevance and importance, then prune low-value items while preserving pinned items even when the budget is tight.
**Pros**:
- Better matches the operator's actual goal
- Preserves deliberate curation decisions
- Fits a mixed advisory/manual/graph-derived packet
**Cons**:
- Requires scoring and tie-break rules
- Slightly more validation logic

### Option C: Operator Must Manually Trim Every Packet
**Description**: Always present an oversized packet and require the operator to reduce it by hand.
**Pros**:
- Maximum human control
**Cons**:
- Slow and error-prone
- Burdens the operator with repetitive curation
- Undercuts the automation value of the retrieval layer

## Decision
Use **relevance-ranked pruning with operator pinning**.

This preserves the operator's intentional selections while keeping packets within the fixed token budget of the target task class. The assembler should compute total token count, prune low-value items first, and leave pinned items intact unless the packet becomes invalid for some other contract reason.

## Consequences

### Positive
- Context packets stay within model limits without losing deliberate operator choices.
- Advisory retrieval can contribute useful context without overwhelming the packet.
- The policy works naturally with the existing `context-cart` and RAG projections.

### Negative
- Packet assembly requires ranking and pruning logic.
- The operator may need visibility into why some candidate items were dropped.

### Risks
- Poor relevance scoring could prune the wrong items; mitigate with provenance, scores, and operator review.
- Excessive pinning could still exceed the budget; mitigate by surfacing a budget overflow error with explicit offending items.

## References
- `docs/intent/intent-cursor-companion-rag-graph-pipelines-2026-04-03.md`
- `docs/plan/work-orders-cursor-companion-rag-graph-pipelines-2026-04-03.md`
- `apps/flagship-foundry/schemas/context-cart.schema.json`
- `apps/flagship-foundry/schemas/agent-work-order.schema.json`
- `apps/flagship-foundry/docs/adr/adr-013-cursor-companion-operator-surface.md`

