# ADR-014: Use a Local File-Based Vector Index for RAG Retrieval

## Status
proposed

## Date
2026-04-07

## Context
Cursor Companion needs retrieval over Foundry artifacts so the operator can assemble context, evaluate Definition of Ready, and surface prior decisions, fix-memory, and schemas without manually hunting through files. The retrieval layer must stay local-first, rebuildable, and derived from canonical artifacts rather than becoming a second source of truth.

The current architecture already has a control plane, a model gateway, and graph storage primitives. The unresolved question is where vector search state should live and how much operational complexity it should add.

Constraints that matter here:
- the index is advisory context, not authoritative state
- local-first operation is the default
- embeddings may fall back from local models to cloud providers when quality or coverage requires it
- the vector store must be cheap to rebuild from the filesystem

## Options Considered

### Option A: File-Based Local Index
**Description**: Store indexed chunks and embeddings in a local file-backed structure under the Foundry state root.
**Pros**:
- Keeps retrieval state local and disposable
- Rebuilds cleanly from canonical artifact files
- Fits the current control-plane authority model
- Avoids introducing a database migration surface for a derived projection
**Cons**:
- Fewer built-in query features than a dedicated vector database
- Requires explicit maintenance for compaction and cache invalidation

### Option B: Embedded SQLite Vector Extension
**Description**: Use SQLite with vector support as the persistent retrieval backend.
**Pros**:
- Familiar persistence model
- Can support richer query patterns than plain files
- Easier to inspect than an external service
**Cons**:
- Couples retrieval to a more opinionated local database dependency
- Adds operational weight relative to a derived file index
- Still needs a rebuild strategy from canonical state

### Option C: External Vector Service
**Description**: Send chunks to a separate retrieval service and query it remotely.
**Pros**:
- Stronger out-of-the-box retrieval capabilities
- Potentially easier to scale for large corpora
**Cons**:
- Violates the local-first posture
- Increases latency, cost, and secret management burden
- Makes the retrieval layer harder to reason about as a derived projection

## Decision
Use a **local file-based vector index** for the first implementation.

This choice preserves artifact authority, keeps the retrieval layer disposable, and matches the operator-surface design where the control plane owns typed projections over canonical files. If retrieval quality proves inadequate, the fallback is provider selection and chunking strategy, not a move to an external vector service by default.

## Consequences

### Positive
- Retrieval stays local, inspectable, and easy to rebuild.
- The vector store remains clearly derived from canonical artifacts.
- The control plane can own the full index lifecycle without a new service boundary.

### Negative
- Search quality and performance will be more limited than a dedicated retrieval service.
- Index maintenance and compaction must be handled explicitly.

### Risks
- Poor chunking or embedding quality could produce low-value retrieval results; mitigate with per-artifact chunking rules and provider fallback.
- Stale index state could drift from the filesystem if control-plane writes are bypassed; mitigate by rebuilding from canonical artifacts on demand.

## References
- `apps/flagship-foundry/docs/adr/adr-013-cursor-companion-operator-surface.md`
- `docs/intent/intent-cursor-companion-rag-graph-pipelines-2026-04-03.md`
- `apps/flagship-foundry/packages/core/src/knowledge-retrieval.mjs`
- `apps/flagship-foundry/packages/model-gateway/src/gateway.mjs`

