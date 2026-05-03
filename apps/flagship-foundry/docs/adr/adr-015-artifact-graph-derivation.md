# ADR-015: Derive the Artifact Graph from Canonical Files with Incremental Patching

## Status
proposed

## Date
2026-04-07

## Context
Cursor Companion needs a navigable system overview: plans, runs, evidence, ADRs, schemas, diagrams, continuity state, knowledge docs, and work orders must be traversable as a connected graph. That graph is not the authority itself; it is a projection over canonical filesystem artifacts.

The implementation has to answer two competing needs:
- fast enough to keep graph queries useful in the operator surface
- simple enough that the graph never becomes a second source of truth

The repo already has `apps/flagship-foundry/packages/core/src/graph-store.mjs`, which provides node and edge primitives plus read/write helpers for a graph projection. The decision here is how to derive and maintain that projection.

## Options Considered

### Option A: Full Rebuild on Demand
**Description**: Recompute the entire artifact graph from the filesystem each time the operator requests it or after each write.
**Pros**:
- Simple correctness story
- Easy recovery from drift
- Minimal cache invalidation logic
**Cons**:
- Can become expensive as artifact counts grow
- Slower operator feedback for traversal-heavy workflows

### Option B: Incremental Patch on Control-Plane Writes
**Description**: Update graph nodes and edges when the control plane writes or imports artifacts, with full rebuild as a recovery path.
**Pros**:
- Keeps the graph responsive for interactive traversal
- Leverages the existing authority boundary, since control-plane writes are the canonical trigger
- Still allows full rebuild when integrity is uncertain
**Cons**:
- Requires more bookkeeping around changed artifacts
- Drift is possible if files are changed outside the control plane

### Option C: Event-Driven Graph Service
**Description**: Maintain the graph in a dedicated event-sourced service that subscribes to filesystem or lifecycle events.
**Pros**:
- Stronger decoupling from write paths
- Can support richer historical tracing
**Cons**:
- Adds a second durable system
- Increases coordination and recovery complexity
- Makes the graph harder to justify as a derived projection

## Decision
Use **incremental patching triggered by control-plane write operations**, with **full rebuild as fallback**.

This gives the operator a graph that stays responsive without giving the projection authority over the underlying artifacts. The canonical filesystem remains the source of truth, and the graph can always be rebuilt if the projection is suspected to be stale.

## Consequences

### Positive
- Graph queries can stay interactive.
- The projection remains tightly coupled to authoritative writes.
- Recovery remains straightforward because the rebuild path exists.

### Negative
- The graph pipeline needs change detection and patch bookkeeping.
- External file edits can still bypass the projection until a rebuild occurs.

### Risks
- If patch logic misses an artifact change, the graph can go stale; mitigate by scheduling rebuilds and validating projection checksums.
- If traversal consumers assume the graph is authoritative, they may over-trust derived relationships; mitigate by labeling graph data as projected state.

## References
- `apps/flagship-foundry/packages/core/src/graph-store.mjs`
- `docs/intent/intent-cursor-companion-rag-graph-pipelines-2026-04-03.md`
- `docs/plan/work-orders-cursor-companion-rag-graph-pipelines-2026-04-03.md`
- `apps/flagship-foundry/docs/adr/adr-013-cursor-companion-operator-surface.md`

