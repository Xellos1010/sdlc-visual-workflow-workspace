# ADR: Import Bridge Schema Transform Codegen

**Status**: accepted
**Date**: 2026-03-31
**Work order**: WO-IB-002

## Context

The bridge must transform artifacts between ChatGPT workspace schemas and Foundry-native schemas without drifting into ad-hoc field mapping. The intent packet explicitly locked schema-diff-derived transforms as the implementation direction.

## Options

1. Hand-author each transform.
2. Generate transform stubs from schema diffs, then fill specific business mappings.
3. Store raw source artifacts only and defer transformation until runtime use.

## Decision

Use schema-diff-derived transform stubs as the baseline. The bridge ships `src/codegen/schema-diff.mts` to compute required-field deltas and keeps the concrete transforms in `src/transforms/`.

The codegen utility is intentionally narrow: it produces reviewable diff metadata and transform scaffolding, but leaves semantic mapping decisions in explicit modules such as `work-order-batch.transform.mts` and `import-manifest.transform.mts`.

## Consequences

- Transform intent stays contract-first and reviewable.
- Regeneration is possible when upstream schemas change.
- Some semantic mappings still require explicit logic, especially work-order activation and legacy manifest normalization.
- Release review should treat generated diff output as advisory input, not as an authority that can bypass architecture or schema approval.
