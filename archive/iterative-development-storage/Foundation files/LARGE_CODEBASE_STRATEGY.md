# Large Codebase Strategy

## Problem

The ultimate product must operate over codebases too large to fit inside a context window.

## Core response

The system should reason over a **graph + registry + evidence model**, not over raw file dumps.

## Required layers

### 1. Repository registration
Know which repositories, modules, runtimes, owners, and contracts exist.

### 2. Structural index
Track symbols, files, APIs, events, data stores, deployments, and dependencies.

### 3. Contract registry
Keep schemas, APIs, events, and interface boundaries first-class.

### 4. Work-order narrowing
Each task sees only:
- the relevant graph neighborhood,
- the relevant contracts,
- the relevant runbook,
- the relevant guardrail pack,
- the relevant file slice.

### 5. Evidence and continuity
Completed work updates:
- graph edges and properties,
- evidence bundles,
- continuity state,
- fix memory,
- evolution events.

## Versioning strategy

### Public history
Keep a clean, reviewable Git history for externally visible engineering work.

### Internal evolution ledger
Also track a more granular event stream for:
- work-order execution
- evidence outcomes
- graph mutations
- handoffs
- learning captures

Git remains the default source for code history, but the evolution ledger can be backed by another store later. The key is that the orchestration model is not Git-only even if Git is the first backend.
