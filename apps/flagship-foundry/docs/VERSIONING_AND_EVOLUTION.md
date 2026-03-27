# Versioning and Evolution

## Goal

Support both a clean public-facing history and a richer internal execution history.

## Public-facing history

Use Git for:
- source code
- documentation
- contracts
- diagrams
- user-visible changes

This history should stay reviewable and phase-scoped.

## Internal evolution history

Track a more granular evolution ledger for:
- work-order start and completion
- graph patch application
- evidence bundle creation
- handoff publication
- fix-memory creation
- provider/adapter decisions

## Why both are needed

Git is excellent for code review and release history, but it is not a complete representation of orchestration behavior. The evolution ledger makes it possible to understand how the system itself changed task by task even when those changes should not all appear as separate public commits.

## Interchangeability rule

Git is the first backend, not the only possible backend. The architecture should allow other versioning or event-storage backends later without changing the work-order model.
