# ADR-016: Use Per-Stage Failure Policies with a Pipeline-Level Default

## Status
proposed

## Date
2026-04-07

## Context
Cursor Companion is being extended from plan/run projection into multi-agent pipeline orchestration. A pipeline can include context-curation, architecture, builder, and verifier stages, each potentially bound to a different adapter and work-order slice.

The system needs to decide where failure policy lives:
- inside each stage
- at the pipeline level
- or in a hybrid model

The critical constraint is that execution remains gated by approved work orders and continuity must be resumable if a pipeline stops mid-flight.

## Options Considered

### Option A: Pipeline-Level Failure Policy Only
**Description**: One global rule controls whether the entire pipeline halts, retries, or skips on failure.
**Pros**:
- Simple to configure
- Easy to explain
**Cons**:
- Too coarse for mixed-stage pipelines
- Treats verification and build steps the same even when their risk profiles differ

### Option B: Per-Stage Failure Policies with a Pipeline Default
**Description**: Each stage can declare halt, skip, or retry behavior, while the pipeline provides a default when a stage omits one.
**Pros**:
- Matches real pipeline heterogeneity
- Lets high-risk stages fail closed while low-risk stages can retry or skip
- Aligns with continuity/resume semantics
**Cons**:
- Slightly more complex validation
- Requires the composer to resolve defaults before dispatch

### Option C: External Orchestrator Decides Failure Policy at Runtime
**Description**: Let a supervising agent or service determine failure behavior dynamically during execution.
**Pros**:
- Flexible for unusual workflows
**Cons**:
- Harder to reason about
- Weakens determinism and resumability
- Makes verification of orchestration behavior much harder

## Decision
Use **per-stage failure policies with a pipeline-level default**.

That model is the best fit for Foundry because it preserves deterministic orchestration while allowing each stage to reflect its actual risk. It also composes with the existing approval boundary: a pipeline can only dispatch approved work orders, and each stage can decide whether a failure halts the chain or allows the next stage to proceed.

## Consequences

### Positive
- Stage behavior can reflect the actual adapter and task risk.
- The composer can validate execution rules before dispatch.
- Continuity can record exactly where a pipeline stopped and why.

### Negative
- The schema and validation logic are more involved.
- Operators must understand both stage-level and pipeline-level policy.

### Risks
- Misconfigured defaults could mask unsafe stage behavior; mitigate by requiring explicit policy resolution in the composer.
- Retry loops could waste time or resources; mitigate with bounded retry counts and recorded failure details.

## References
- `docs/intent/intent-cursor-companion-rag-graph-pipelines-2026-04-03.md`
- `docs/plan/work-orders-cursor-companion-rag-graph-pipelines-2026-04-03.md`
- `apps/flagship-foundry/schemas/agent-work-order.schema.json`
- `apps/flagship-foundry/schemas/continuity-state.schema.json`

