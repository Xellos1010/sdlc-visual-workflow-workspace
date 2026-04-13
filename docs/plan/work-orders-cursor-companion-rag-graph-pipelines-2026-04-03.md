# Scope Chunk: Cursor Companion RAG Graph, Artifact Traversal, and Agent Pipelines

**Source Intent Packet**: `docs/intent/intent-cursor-companion-rag-graph-pipelines-2026-04-03.md`  
**Date**: 2026-04-03  
**Primary Surface**: `apps/flagship-foundry/apps/cursor-companion/`

---

## Planning Assumptions

- Stream order is `B -> A -> C`: graph first, then RAG on top of graph/state relationships, then pipeline orchestration that consumes both.
- The vector store and artifact graph remain derived projections over canonical filesystem artifacts.
- Execute-mode adapter dispatch stays behind explicit approval gates and does not expand freeform prompt execution.
- Existing `packages/core/src/graph-store.mjs`, `knowledge-base.mjs`, `knowledge-retrieval.mjs`, `import-pipeline.mjs`, and import-bridge artifacts are reuse candidates, not replacement targets unless a bounded migration is required.
- This scope chunk finalizes planning only; no ADR resolution or implementation is assumed complete.

---

## Impacted Node Inventory

| Node ID | Node Type | Change Type | Contracts | Guardrail Packs |
|---------|-----------|-------------|-----------|-----------------|
| `apps/flagship-foundry/schemas/` | contract pack | new | 11 new stream schemas | `guardrail:workspace-governance` |
| `packages/core/src/artifact-graph.mjs` | component | new | `artifact-graph-node`, `artifact-graph-edge` | `guardrail:workspace-governance` |
| `packages/core/src/graph-query.mjs` | component | new | `graph-traversal-query` | `guardrail:workspace-governance` |
| `packages/core/src/export-packager.mjs` | component | new | `export-manifest`, `import-receipt` | `guardrail:workspace-governance` |
| `packages/core/src/embedding-pipeline.mjs` | component | new | `embedding-index-entry` | `guardrail:workspace-governance`, `guardrail:telemetry-and-observability` |
| `packages/core/src/retrieval-engine.mjs` | component | new/extend | `rag-query`, `rag-result` | `guardrail:workspace-governance` |
| `packages/core/src/pipeline-composer.mjs` | component | new | `pipeline-definition` | `guardrail:terminal-agent-adapters` |
| `packages/core/src/context-assembler.mjs` | component | new | `context-packet` | `guardrail:workspace-governance` |
| `packages/core/src/stage-dispatcher.mjs` | component | new | `pipeline-stage-result` | `guardrail:terminal-agent-adapters`, `guardrail:telemetry-and-observability` |
| `packages/core/src/result-ingestor.mjs` | component | new | `pipeline-stage-result`, `import-receipt` | `guardrail:workspace-governance`, `guardrail:terminal-agent-adapters` |
| `apps/control-plane/src/server.mjs` | app | modify | RAG, graph, pipeline, export/import routes | `guardrail:nx-monorepo`, `guardrail:workspace-governance` |
| `packages/core/src/context-cart.mjs` | component | modify | `context-cart.schema.json`, `rag-result` | `guardrail:workspace-governance` |
| `packages/core/src/requirement-refinement.mjs` | component | modify | RAG-backed DoR evidence | `guardrail:workspace-governance` |
| `packages/core/src/run-executor.mjs` | component | modify | execute-mode dispatch and continuity updates | `guardrail:terminal-agent-adapters`, `guardrail:telemetry-and-observability` |
| `packages/core/src/session-projection.mjs` | component | modify | pipeline stage state | `guardrail:telemetry-and-observability` |
| `packages/runtime-adapters/src/registry.mjs` | component | modify | adapter dispatch envelope | `guardrail:terminal-agent-adapters` |
| `packages/model-gateway/src/gateway.mjs` | component | modify | embedding routing | `guardrail:nx-monorepo` |
| `apps/cursor-companion/extension.js` | extension host | modify | commands for RAG, graph, pipelines, export/import | `guardrail:chrome-extension-mv3` |
| `apps/cursor-companion/operator-panel.js` | UI surface | modify | system overview tab and pipeline launch affordances | `guardrail:react-vite-ui`, `guardrail:chrome-extension-mv3` |
| `apps/cursor-companion/context-cart.js` | UI surface | modify | RAG item projection and provenance display | `guardrail:react-vite-ui` |
| `apps/cursor-companion/requirement-panel.js` | UI surface | modify | DoR advisory evidence | `guardrail:react-vite-ui` |
| `apps/cursor-companion/session-board.js` | UI surface | modify | live pipeline state and evidence | `guardrail:react-vite-ui` |
| `apps/cursor-companion/control-plane-client.js` | extension helper | modify | client methods for graph, RAG, pipeline, export/import | `guardrail:chrome-extension-mv3` |

---

## Task Class and Model Routing

| Work Unit | Task Class | Model Tier | Route |
|-----------|------------|------------|-------|
| ADR-014 through ADR-017 | `strategic_reasoning` | `frontier_reasoner` | `anthropic/claude-opus-4-6` |
| Contract packs | `structured_generation` | `low_cost_executor` | `local-ollama` with Anthropic fallback |
| Graph, RAG, endpoint, and UI implementation | `deterministic_transformation` | `low_cost_executor` | `local-ollama` with Anthropic fallback |
| Pipeline composer and context assembly policy | `constraint_interpretation` | `frontier_reasoner` | `anthropic/claude-opus-4-6` |
| Stream verification and integration verification | `verification` | `balanced_reasoner` | `anthropic/claude-sonnet-4-6` |
| Release docs and handoff | `learning` | `balanced_reasoner` | `anthropic/claude-sonnet-4-6` |

---

## Work Order Sequence Summary

- **Total Work Orders**: 21
- **Milestones**:
  - `M0` architecture decisions and contract-first gate
  - `M1` artifact graph implementation
  - `M2` RAG indexing and retrieval
  - `M3` pipeline orchestration and execute mode
  - `M4` integration verification and release handoff
- **Critical Path**: `WO-RGP-001 -> WO-RGP-002 -> WO-RGP-005 -> WO-RGP-006 -> WO-RGP-007 -> WO-RGP-010 -> WO-RGP-011 -> WO-RGP-015 -> WO-RGP-016 -> WO-RGP-017 -> WO-RGP-018 -> WO-RGP-020 -> WO-RGP-021`
- **Parallelizable**:
  - `WO-RGP-002`, `WO-RGP-003`, `WO-RGP-004` after `WO-RGP-001`
  - `WO-RGP-008` after `WO-RGP-007` in parallel with `WO-RGP-010`
  - `WO-RGP-013` after `WO-RGP-012` in parallel with `WO-RGP-015`
- **Approval Gates**:
  - `WO-RGP-001` architectural decisions with downstream contract impact
  - `WO-RGP-017` execute-mode adapter activation

---

## Work Order Sequence

1. **WO-RGP-001**: Resolve ADR-014 through ADR-017 → `@systems-architect` (`strategic_reasoning`) [depends on: none]
2. **WO-RGP-002**: Define Stream B artifact graph schemas → `@systems-architect` (`structured_generation`) [depends on: WO-RGP-001]
3. **WO-RGP-003**: Define Stream A RAG schemas → `@systems-architect` (`structured_generation`) [depends on: WO-RGP-001]
4. **WO-RGP-004**: Define Stream C pipeline schemas → `@systems-architect` (`structured_generation`) [depends on: WO-RGP-001]
5. **WO-RGP-005**: Implement graph builder module → `@builder` (`deterministic_transformation`) [depends on: WO-RGP-002]
6. **WO-RGP-006**: Implement graph query engine → `@builder` (`deterministic_transformation`) [depends on: WO-RGP-005]
7. **WO-RGP-007**: Implement graph API and export/import routes → `@builder` (`deterministic_transformation`) [depends on: WO-RGP-005, WO-RGP-006]
8. **WO-RGP-008**: Implement companion system overview panel → `@builder` (`deterministic_transformation`) [depends on: WO-RGP-007]
9. **WO-RGP-009**: Verify Stream B artifact graph slice → `@verifier` (`verification`) [depends on: WO-RGP-005, WO-RGP-006, WO-RGP-007, WO-RGP-008]
10. **WO-RGP-010**: Implement embedding pipeline → `@builder` (`deterministic_transformation`) [depends on: WO-RGP-001, WO-RGP-003]
11. **WO-RGP-011**: Implement retrieval engine → `@builder` (`deterministic_transformation`) [depends on: WO-RGP-010]
12. **WO-RGP-012**: Implement RAG API and core integration → `@builder` (`deterministic_transformation`) [depends on: WO-RGP-010, WO-RGP-011]
13. **WO-RGP-013**: Implement companion RAG search and context-cart UI → `@builder` (`deterministic_transformation`) [depends on: WO-RGP-012]
14. **WO-RGP-014**: Verify Stream A RAG slice → `@verifier` (`verification`) [depends on: WO-RGP-010, WO-RGP-011, WO-RGP-012, WO-RGP-013]
15. **WO-RGP-015**: Implement pipeline composer and context assembler → `@builder` (`constraint_interpretation`) [depends on: WO-RGP-001, WO-RGP-004, WO-RGP-006, WO-RGP-011]
16. **WO-RGP-016**: Implement stage dispatcher and result ingestor → `@builder` (`deterministic_transformation`) [depends on: WO-RGP-015]
17. **WO-RGP-017**: Wire execute-mode adapter dispatch → `@builder` (`deterministic_transformation`) [depends on: WO-RGP-016]
18. **WO-RGP-018**: Implement pipeline API and session-board enhancement → `@builder` (`deterministic_transformation`) [depends on: WO-RGP-016, WO-RGP-017]
19. **WO-RGP-019**: Verify Stream C pipeline slice → `@verifier` (`verification`) [depends on: WO-RGP-015, WO-RGP-016, WO-RGP-017, WO-RGP-018]
20. **WO-RGP-020**: Verify cross-stream integration → `@verifier` (`verification`) [depends on: WO-RGP-009, WO-RGP-014, WO-RGP-019]
21. **WO-RGP-021**: Release documentation and handoff → `@docs-release-agent` (`learning`) [depends on: WO-RGP-020]

---

## Work Orders

### WO-RGP-001: Resolve ADR-014 through ADR-017

- **Work Order ID**: `WO-RGP-001`
- **Lifecycle Stage**: `architect`
- **Phase ID**: `cursor-companion-rgp-adr-resolution`
- **System ID**: `docs/adr`
- **Task Class**: `strategic_reasoning`
- **Agent Role**: `systems_architect`
- **Agent Persona**: `curious_architect`
- **Model Tier**: `frontier_reasoner`
- **File Scope**:
  - `docs/adr/adr-014-vector-store-technology.md` (new)
  - `docs/adr/adr-015-artifact-graph-derivation.md` (new)
  - `docs/adr/adr-016-pipeline-failure-propagation.md` (new)
  - `docs/adr/adr-017-context-packet-budget-enforcement.md` (new)
- **Source Artifacts**:
  - `docs/intent/intent-cursor-companion-rag-graph-pipelines-2026-04-03.md`
  - `docs/diagrams/cursor-companion-rag-graph-pipelines-context-2026-04-03.mmd`
  - `docs/diagrams/cursor-companion-rag-graph-pipelines-containers-2026-04-03.mmd`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
  - `rg`
- **Constraints**:
  - Follow ADR structure: context, options, decision, consequences.
  - Preserve local-first and artifact-authority posture.
  - Treat all four ADRs as approval-gated before downstream implementation.
- **Expected Outputs**:
  - Four approved ADR documents with explicit recommendations and deferred questions.
- **Acceptance Criteria**:
  - [ ] ADR-014 compares file-based index, SQLite-vec, and external service, and makes a recommendation.
  - [ ] ADR-015 compares full rebuild, incremental update, and event-driven graph derivation, and makes a recommendation.
  - [ ] ADR-016 compares halt, skip, retry policy placement and makes a recommendation.
  - [ ] ADR-017 defines token-budget pruning and operator override behavior.
- **Verification Plan**:
  - `rg -n "Decision|Consequences" docs/adr/adr-014-vector-store-technology.md docs/adr/adr-015-artifact-graph-derivation.md docs/adr/adr-016-pipeline-failure-propagation.md docs/adr/adr-017-context-packet-budget-enforcement.md`
- **Approval Required**: yes
- **Rollback Notes**: Delete the four ADR files.
- **Status**: ready

**Principle Cards**:
- `principle:blast-radius-before-build`
- `principle:contract-first`

### WO-RGP-002: Define Stream B Artifact Graph Schemas

- **Work Order ID**: `WO-RGP-002`
- **Lifecycle Stage**: `architect`
- **Phase ID**: `cursor-companion-rgp-stream-b-schemas`
- **System ID**: `apps/flagship-foundry/schemas`
- **Task Class**: `structured_generation`
- **Agent Role**: `systems_architect`
- **Agent Persona**: `curious_architect`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/schemas/artifact-graph-node.schema.json` (new)
  - `apps/flagship-foundry/schemas/artifact-graph-edge.schema.json` (new)
  - `apps/flagship-foundry/schemas/graph-traversal-query.schema.json` (new)
  - `apps/flagship-foundry/schemas/export-manifest.schema.json` (new)
  - `apps/flagship-foundry/schemas/import-receipt.schema.json` (new)
- **Source Artifacts**:
  - `WO-RGP-001`
  - `apps/flagship-foundry/schemas/ecosystem-manifest.schema.json`
  - `apps/flagship-foundry/schemas/evidence-bundle.schema.json`
  - `apps/flagship-foundry/schemas/continuity-state.schema.json`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
- **Constraints**:
  - Follow existing schema conventions with `$schema`, `$id`, `title`, and explicit required fields.
  - Keep graph relationships bounded and typed.
- **Expected Outputs**:
  - Five Stream B schema files.
- **Acceptance Criteria**:
  - [ ] Graph node schema covers artifact identity, type, lifecycle phase, project, timestamps, and summary.
  - [ ] Graph edge schema covers source, target, relationship label, and extraction method.
  - [ ] Traversal query schema covers start nodes, direction, max depth, and filters.
  - [ ] Export manifest and import receipt encode provenance and integrity metadata.
- **Verification Plan**:
  - `node -e "for (const f of ['apps/flagship-foundry/schemas/artifact-graph-node.schema.json','apps/flagship-foundry/schemas/artifact-graph-edge.schema.json','apps/flagship-foundry/schemas/graph-traversal-query.schema.json','apps/flagship-foundry/schemas/export-manifest.schema.json','apps/flagship-foundry/schemas/import-receipt.schema.json']) JSON.parse(require('fs').readFileSync(f,'utf8'))"`
- **Approval Required**: no
- **Rollback Notes**: Delete the five schema files.
- **Status**: blocked

**Principle Cards**:
- `principle:contract-first`
- `principle:complexity-budgets`

### WO-RGP-003: Define Stream A RAG Schemas

- **Work Order ID**: `WO-RGP-003`
- **Lifecycle Stage**: `architect`
- **Phase ID**: `cursor-companion-rgp-stream-a-schemas`
- **System ID**: `apps/flagship-foundry/schemas`
- **Task Class**: `structured_generation`
- **Agent Role**: `systems_architect`
- **Agent Persona**: `curious_architect`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/schemas/embedding-index-entry.schema.json` (new)
  - `apps/flagship-foundry/schemas/rag-query.schema.json` (new)
  - `apps/flagship-foundry/schemas/rag-result.schema.json` (new)
- **Source Artifacts**:
  - `WO-RGP-001`
  - `apps/flagship-foundry/schemas/knowledge-document.schema.json`
  - `apps/flagship-foundry/schemas/knowledge-pack.schema.json`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
- **Constraints**:
  - RAG outputs are observed state, not canonical truth.
  - Token and provenance metadata must be explicit.
- **Expected Outputs**:
  - Three Stream A schema files.
- **Acceptance Criteria**:
  - [ ] Embedding index entry encodes artifact ID, chunk index, content, vector reference, artifact type, phase, and provenance.
  - [ ] RAG query supports artifact type filters, phase filters, token budget, and max results.
  - [ ] RAG result supports ranked result items with similarity score, provenance, token count, and aggregate token count.
- **Verification Plan**:
  - `node -e "for (const f of ['apps/flagship-foundry/schemas/embedding-index-entry.schema.json','apps/flagship-foundry/schemas/rag-query.schema.json','apps/flagship-foundry/schemas/rag-result.schema.json']) JSON.parse(require('fs').readFileSync(f,'utf8'))"`
- **Approval Required**: no
- **Rollback Notes**: Delete the three schema files.
- **Status**: blocked

**Principle Cards**:
- `principle:contract-first`
- `principle:observed-vs-declared-truth`

### WO-RGP-004: Define Stream C Pipeline Schemas

- **Work Order ID**: `WO-RGP-004`
- **Lifecycle Stage**: `architect`
- **Phase ID**: `cursor-companion-rgp-stream-c-schemas`
- **System ID**: `apps/flagship-foundry/schemas`
- **Task Class**: `structured_generation`
- **Agent Role**: `systems_architect`
- **Agent Persona**: `curious_architect`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/schemas/pipeline-definition.schema.json` (new)
  - `apps/flagship-foundry/schemas/context-packet.schema.json` (new)
  - `apps/flagship-foundry/schemas/pipeline-stage-result.schema.json` (new)
- **Source Artifacts**:
  - `WO-RGP-001`
  - `apps/flagship-foundry/schemas/run.schema.json`
  - `apps/flagship-foundry/schemas/agent-work-order.schema.json`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
- **Constraints**:
  - Every pipeline stage must reference approved work.
  - Failure policy and context budget must be explicit contracts.
- **Expected Outputs**:
  - Three Stream C schema files.
- **Acceptance Criteria**:
  - [ ] Pipeline definition encodes stage order, adapter, role, work-order ref, budget, and failure policy.
  - [ ] Context packet encodes merged item set, manifest, provenance, and total token count.
  - [ ] Pipeline stage result encodes status, produced artifacts, evidence, telemetry refs, duration, and failure details.
- **Verification Plan**:
  - `node -e "for (const f of ['apps/flagship-foundry/schemas/pipeline-definition.schema.json','apps/flagship-foundry/schemas/context-packet.schema.json','apps/flagship-foundry/schemas/pipeline-stage-result.schema.json']) JSON.parse(require('fs').readFileSync(f,'utf8'))"`
- **Approval Required**: no
- **Rollback Notes**: Delete the three schema files.
- **Status**: blocked

**Principle Cards**:
- `principle:contract-first`
- `principle:approval-at-plan-boundary`

### WO-RGP-005: Implement Graph Builder Module

- **Work Order ID**: `WO-RGP-005`
- **Lifecycle Stage**: `implement`
- **Phase ID**: `cursor-companion-rgp-graph-builder`
- **System ID**: `apps/flagship-foundry/packages/core`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Agent Persona**: `conservative_builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/packages/core/src/artifact-graph.mjs` (new)
  - `apps/flagship-foundry/tests/artifact-graph.test.mjs` (new)
- **Source Artifacts**:
  - `WO-RGP-002`
  - `apps/flagship-foundry/packages/core/src/graph-store.mjs`
  - `apps/flagship-foundry/packages/core/src/io.mjs`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
  - `node`
- **Constraints**:
  - Graph is a derived projection only.
  - Support rebuild and incremental patch paths.
- **Expected Outputs**:
  - Graph builder module and focused tests.
- **Acceptance Criteria**:
  - [ ] Builder creates typed nodes for canonical artifact types in state directories.
  - [ ] Builder extracts directed edges from artifact references.
  - [ ] Cached graph projection can be serialized and restored.
  - [ ] Incremental update mode exists for changed artifact sets.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/artifact-graph.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: Delete the module and test.
- **Status**: blocked

**Principle Cards**:
- `principle:artifact-authority`
- `principle:observed-vs-declared-truth`

### WO-RGP-006: Implement Graph Query Engine

- **Work Order ID**: `WO-RGP-006`
- **Lifecycle Stage**: `implement`
- **Phase ID**: `cursor-companion-rgp-graph-query`
- **System ID**: `apps/flagship-foundry/packages/core`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Agent Persona**: `conservative_builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/packages/core/src/graph-query.mjs` (new)
  - `apps/flagship-foundry/tests/graph-query.test.mjs` (new)
- **Source Artifacts**:
  - `WO-RGP-005`
  - `WO-RGP-002`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
  - `node`
- **Constraints**:
  - Traversals must be depth-bounded and filterable.
  - Query results must include path metadata.
- **Expected Outputs**:
  - Query module and focused tests.
- **Acceptance Criteria**:
  - [ ] Connected traversal returns transitive relationships with path info.
  - [ ] Query supports filters for type, phase, date range, and project.
  - [ ] Lifecycle trace query exists for feature-oriented traversal.
  - [ ] Subgraph selection exists for export.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/graph-query.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: Delete the module and test.
- **Status**: blocked

**Principle Cards**:
- `principle:complexity-budgets`

### WO-RGP-007: Implement Graph API and Export/Import Routes

- **Work Order ID**: `WO-RGP-007`
- **Lifecycle Stage**: `implement`
- **Phase ID**: `cursor-companion-rgp-graph-api`
- **System ID**: `apps/flagship-foundry/apps/control-plane`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Agent Persona**: `conservative_builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/apps/control-plane/src/server.mjs`
  - `apps/flagship-foundry/packages/core/src/export-packager.mjs` (new)
  - `apps/flagship-foundry/tests/control-plane-graph.test.mjs` (new)
- **Source Artifacts**:
  - `WO-RGP-005`
  - `WO-RGP-006`
  - `WO-RGP-002`
  - `apps/flagship-foundry/packages/import-bridge/src/export-packager.mjs`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
  - `node`
- **Constraints**:
  - Import must validate schemas and bind provenance.
  - Server changes are a blast-radius parent and must stay additive.
- **Expected Outputs**:
  - New graph/export/import routes and focused tests.
- **Acceptance Criteria**:
  - [ ] Graph fetch, graph query, and graph rebuild routes exist.
  - [ ] Export route returns a manifest-backed packet with checksums.
  - [ ] Import route validates inbound artifacts and returns an import receipt.
  - [ ] All imported artifacts bind back into the active ecosystem with provenance.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/control-plane-graph.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: Revert server changes and delete new module/test files.
- **Status**: blocked

**Principle Cards**:
- `principle:blast-radius-before-build`
- `principle:contract-first`

### WO-RGP-008: Implement Companion System Overview Panel

- **Work Order ID**: `WO-RGP-008`
- **Lifecycle Stage**: `implement`
- **Phase ID**: `cursor-companion-rgp-system-overview`
- **System ID**: `apps/flagship-foundry/apps/cursor-companion`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Agent Persona**: `conservative_builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/apps/cursor-companion/extension.js`
  - `apps/flagship-foundry/apps/cursor-companion/operator-panel.js`
  - `apps/flagship-foundry/apps/cursor-companion/control-plane-client.js`
  - `apps/flagship-foundry/tests/cursor-companion-system-overview.test.mjs` (new)
- **Source Artifacts**:
  - `WO-RGP-007`
  - `docs/adr/adr-013-cursor-companion-operator-surface.md`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
  - `node`
- **Constraints**:
  - Keep graph state in control plane, not extension local state.
  - UI remains a projection over typed route responses.
- **Expected Outputs**:
  - System overview commands, panel updates, and focused tests.
- **Acceptance Criteria**:
  - [ ] Operator can open a system overview graph view.
  - [ ] Filters exist for phase, artifact type, date range, and project.
  - [ ] Node selection can navigate to artifact context and export a subgraph.
  - [ ] Import command shows a typed receipt.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/cursor-companion-system-overview.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: Revert extension/client/panel changes and delete the test.
- **Status**: blocked

**Principle Cards**:
- `principle:observed-vs-declared-truth`

### WO-RGP-009: Verify Stream B Artifact Graph Slice

- **Work Order ID**: `WO-RGP-009`
- **Lifecycle Stage**: `verify`
- **Phase ID**: `cursor-companion-rgp-verify-graph`
- **System ID**: `apps/flagship-foundry`
- **Task Class**: `verification`
- **Agent Role**: `verifier`
- **Agent Persona**: `skeptical_verifier`
- **Model Tier**: `balanced_reasoner`
- **File Scope**:
  - Read-only over Stream B files and tests.
- **Source Artifacts**:
  - `WO-RGP-005`
  - `WO-RGP-006`
  - `WO-RGP-007`
  - `WO-RGP-008`
- **Allowed Tools**:
  - `read`
  - `node`
  - `pnpm`
- **Constraints**:
  - Verification is independent from builder output.
  - Evidence bundle should include route checks and UI smoke checks.
- **Expected Outputs**:
  - Verification notes or evidence bundle references.
- **Acceptance Criteria**:
  - [ ] Graph builder and query tests pass for known relationships.
  - [ ] Export/import flow validates manifest, checksums, and provenance.
  - [ ] Companion system overview renders and filters correctly.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/artifact-graph.test.mjs apps/flagship-foundry/tests/graph-query.test.mjs apps/flagship-foundry/tests/control-plane-graph.test.mjs apps/flagship-foundry/tests/cursor-companion-system-overview.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: None, read-only verification.
- **Status**: blocked

**Principle Cards**:
- `principle:independent-verification`

### WO-RGP-010: Implement Embedding Pipeline

- **Work Order ID**: `WO-RGP-010`
- **Lifecycle Stage**: `implement`
- **Phase ID**: `cursor-companion-rgp-embedding-pipeline`
- **System ID**: `apps/flagship-foundry/packages/core`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Agent Persona**: `conservative_builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/packages/core/src/embedding-pipeline.mjs` (new)
  - `apps/flagship-foundry/tests/embedding-pipeline.test.mjs` (new)
- **Source Artifacts**:
  - `WO-RGP-001`
  - `WO-RGP-003`
  - `apps/flagship-foundry/packages/model-gateway/src/gateway.mjs`
  - `apps/flagship-foundry/packages/core/src/knowledge-base.mjs`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
  - `node`
- **Constraints**:
  - Index is rebuildable and non-authoritative.
  - Chunking policy must be explicit per artifact type.
- **Expected Outputs**:
  - Embedding pipeline module and focused tests.
- **Acceptance Criteria**:
  - [ ] Pipeline supports full ecosystem indexing and single-artifact indexing.
  - [ ] Index entries include artifact and provenance metadata.
  - [ ] Embedding requests route through model gateway with local-first behavior.
  - [ ] Vector store persistence matches ADR-014.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/embedding-pipeline.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: Delete the module, test, and derived vector-store data.
- **Status**: blocked

**Principle Cards**:
- `principle:artifact-authority`
- `principle:fix-memory-compounds`

### WO-RGP-011: Implement Retrieval Engine

- **Work Order ID**: `WO-RGP-011`
- **Lifecycle Stage**: `implement`
- **Phase ID**: `cursor-companion-rgp-retrieval-engine`
- **System ID**: `apps/flagship-foundry/packages/core`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Agent Persona**: `conservative_builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/packages/core/src/retrieval-engine.mjs` (new)
  - `apps/flagship-foundry/tests/retrieval-engine.test.mjs` (new)
- **Source Artifacts**:
  - `WO-RGP-010`
  - `WO-RGP-003`
  - `apps/flagship-foundry/packages/core/src/knowledge-retrieval.mjs`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
  - `node`
- **Constraints**:
  - Results remain advisory.
  - Token budget enforcement is mandatory.
- **Expected Outputs**:
  - Retrieval engine module and focused tests.
- **Acceptance Criteria**:
  - [ ] Retrieval returns ranked results with source, score, provenance, and token counts.
  - [ ] Retrieval supports artifact type and phase filters.
  - [ ] Retrieval respects task-class token budgets and max results.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/retrieval-engine.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: Delete the module and test.
- **Status**: blocked

**Principle Cards**:
- `principle:observed-vs-declared-truth`
- `principle:complexity-budgets`

### WO-RGP-012: Implement RAG API and Core Integration

- **Work Order ID**: `WO-RGP-012`
- **Lifecycle Stage**: `implement`
- **Phase ID**: `cursor-companion-rgp-rag-api`
- **System ID**: `apps/flagship-foundry`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Agent Persona**: `conservative_builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/apps/control-plane/src/server.mjs`
  - `apps/flagship-foundry/packages/core/src/context-cart.mjs`
  - `apps/flagship-foundry/packages/core/src/requirement-refinement.mjs`
  - `apps/flagship-foundry/packages/model-gateway/src/gateway.mjs`
  - `apps/flagship-foundry/tests/rag-api.test.mjs` (new)
- **Source Artifacts**:
  - `WO-RGP-010`
  - `WO-RGP-011`
  - `WO-RGP-003`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
  - `node`
- **Constraints**:
  - RAG state is projected through typed routes only.
  - DoR evidence must be advisory and provenance-bearing.
- **Expected Outputs**:
  - RAG routes, core integrations, and focused tests.
- **Acceptance Criteria**:
  - [ ] Index, query, and status routes exist.
  - [ ] Context cart accepts `authority: rag-retrieval` items with provenance fields.
  - [ ] Requirement refinement can surface RAG-backed ADR, fix-memory, schema, and gap evidence.
  - [ ] Gateway exposes embedding routing support for the RAG pipeline.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/rag-api.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: Revert server/core/gateway changes and delete the test.
- **Status**: blocked

**Principle Cards**:
- `principle:blast-radius-before-build`
- `principle:fix-memory-compounds`

### WO-RGP-013: Implement Companion RAG Search and Context-Cart UI

- **Work Order ID**: `WO-RGP-013`
- **Lifecycle Stage**: `implement`
- **Phase ID**: `cursor-companion-rgp-rag-ui`
- **System ID**: `apps/flagship-foundry/apps/cursor-companion`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Agent Persona**: `conservative_builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/apps/cursor-companion/extension.js`
  - `apps/flagship-foundry/apps/cursor-companion/context-cart.js`
  - `apps/flagship-foundry/apps/cursor-companion/requirement-panel.js`
  - `apps/flagship-foundry/apps/cursor-companion/control-plane-client.js`
  - `apps/flagship-foundry/tests/cursor-companion-rag.test.mjs` (new)
- **Source Artifacts**:
  - `WO-RGP-012`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
  - `node`
- **Constraints**:
  - Provenance must be visible in the UI.
  - Operator can accept, reject, and pin retrieved items.
- **Expected Outputs**:
  - RAG UI wiring and focused tests.
- **Acceptance Criteria**:
  - [ ] Operator can run a RAG search from the companion.
  - [ ] Retrieved items show relevance and provenance.
  - [ ] Accepted items appear in the context cart with `rag-retrieval` authority.
  - [ ] Requirement panel shows advisory RAG evidence during DoR review.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/cursor-companion-rag.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: Revert extension/client/panel changes and delete the test.
- **Status**: blocked

**Principle Cards**:
- `principle:observed-vs-declared-truth`

### WO-RGP-014: Verify Stream A RAG Slice

- **Work Order ID**: `WO-RGP-014`
- **Lifecycle Stage**: `verify`
- **Phase ID**: `cursor-companion-rgp-verify-rag`
- **System ID**: `apps/flagship-foundry`
- **Task Class**: `verification`
- **Agent Role**: `verifier`
- **Agent Persona**: `skeptical_verifier`
- **Model Tier**: `balanced_reasoner`
- **File Scope**:
  - Read-only over Stream A files and tests.
- **Source Artifacts**:
  - `WO-RGP-010`
  - `WO-RGP-011`
  - `WO-RGP-012`
  - `WO-RGP-013`
- **Allowed Tools**:
  - `read`
  - `node`
- **Constraints**:
  - Verify budget enforcement and provenance fidelity, not just happy-path retrieval.
- **Expected Outputs**:
  - Verification notes or evidence bundle references.
- **Acceptance Criteria**:
  - [ ] Indexing, retrieval, and API tests pass.
  - [ ] Retrieval respects token budgets and filters.
  - [ ] Companion UI presents RAG provenance clearly.
  - [ ] DoR evidence includes relevant ADRs or fix-memory when seeded fixtures exist.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/embedding-pipeline.test.mjs apps/flagship-foundry/tests/retrieval-engine.test.mjs apps/flagship-foundry/tests/rag-api.test.mjs apps/flagship-foundry/tests/cursor-companion-rag.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: None, read-only verification.
- **Status**: blocked

**Principle Cards**:
- `principle:independent-verification`

### WO-RGP-015: Implement Pipeline Composer and Context Assembler

- **Work Order ID**: `WO-RGP-015`
- **Lifecycle Stage**: `implement`
- **Phase ID**: `cursor-companion-rgp-pipeline-composer`
- **System ID**: `apps/flagship-foundry/packages/core`
- **Task Class**: `constraint_interpretation`
- **Agent Role**: `builder`
- **Agent Persona**: `conservative_builder`
- **Model Tier**: `frontier_reasoner`
- **File Scope**:
  - `apps/flagship-foundry/packages/core/src/pipeline-composer.mjs` (new)
  - `apps/flagship-foundry/packages/core/src/context-assembler.mjs` (new)
  - `apps/flagship-foundry/tests/pipeline-composer.test.mjs` (new)
- **Source Artifacts**:
  - `WO-RGP-001`
  - `WO-RGP-004`
  - `WO-RGP-006`
  - `WO-RGP-011`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
  - `node`
- **Constraints**:
  - Pipeline stages must reference approved work orders.
  - Context assembly preserves operator-pinned items when pruning.
- **Expected Outputs**:
  - Composer, assembler, and focused tests.
- **Acceptance Criteria**:
  - [ ] Composer validates stage order, adapter bindings, and approval posture.
  - [ ] Context assembler merges RAG hits, context cart items, and graph-adjacent artifacts.
  - [ ] Budget pruning is relevance-ranked and preserves pinned items.
  - [ ] Output context packet matches the schema contract.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/pipeline-composer.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: Delete the new modules and test.
- **Status**: blocked

**Principle Cards**:
- `principle:approval-at-plan-boundary`
- `principle:contract-first`

### WO-RGP-016: Implement Stage Dispatcher and Result Ingestor

- **Work Order ID**: `WO-RGP-016`
- **Lifecycle Stage**: `implement`
- **Phase ID**: `cursor-companion-rgp-stage-dispatcher`
- **System ID**: `apps/flagship-foundry/packages/core`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Agent Persona**: `conservative_builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/packages/core/src/stage-dispatcher.mjs` (new)
  - `apps/flagship-foundry/packages/core/src/result-ingestor.mjs` (new)
  - `apps/flagship-foundry/tests/pipeline-runtime.test.mjs` (new)
- **Source Artifacts**:
  - `WO-RGP-015`
  - `WO-RGP-004`
  - `apps/flagship-foundry/packages/core/src/run-executor.mjs`
  - `apps/flagship-foundry/packages/core/src/runs.mjs`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
  - `node`
- **Constraints**:
  - Every stage update must also update continuity.
  - Failure policies must be machine-enforced, not advisory.
- **Expected Outputs**:
  - Dispatcher, ingestor, and focused tests.
- **Acceptance Criteria**:
  - [ ] Dispatcher executes stages sequentially and applies halt, skip, and retry policies.
  - [ ] Result ingestor validates stage results and writes typed artifacts with provenance.
  - [ ] Interrupted pipelines preserve resumable state.
  - [ ] Continuity and evidence references update after each stage.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/pipeline-runtime.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: Delete the new modules and test.
- **Status**: blocked

**Principle Cards**:
- `principle:continuity-is-mandatory`
- `principle:artifact-authority`

### WO-RGP-017: Wire Execute-Mode Adapter Dispatch

- **Work Order ID**: `WO-RGP-017`
- **Lifecycle Stage**: `implement`
- **Phase ID**: `cursor-companion-rgp-execute-mode`
- **System ID**: `apps/flagship-foundry/packages/runtime-adapters`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Agent Persona**: `conservative_builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/packages/runtime-adapters/src/registry.mjs`
  - `apps/flagship-foundry/packages/core/src/run-executor.mjs`
  - `apps/flagship-foundry/configs/terminal-adapters/cursor-agent.json`
  - `apps/flagship-foundry/configs/terminal-adapters/claude-code.json`
  - `apps/flagship-foundry/configs/terminal-adapters/codex-cli.json`
  - `apps/flagship-foundry/configs/terminal-adapters/gemini-cli.json`
  - `apps/flagship-foundry/configs/terminal-adapters/openclaw.json`
  - `apps/flagship-foundry/tests/runtime-adapters-execute.test.mjs` (new)
- **Source Artifacts**:
  - `WO-RGP-016`
  - `apps/flagship-foundry/schemas/adapter-manifest.schema.json`
  - `apps/flagship-foundry/configs/terminal-adapters/dry-run.json`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
  - `node`
- **Constraints**:
  - Live adapter execution is approval-gated.
  - Structured task correlation IDs and logs are mandatory for every invocation.
- **Expected Outputs**:
  - Execute-mode adapter wiring and focused tests.
- **Acceptance Criteria**:
  - [ ] Real adapter dispatch is available for configured adapters.
  - [ ] Correlation IDs flow through adapter invocation envelopes.
  - [ ] Session logs and structured results are captured consistently.
  - [ ] Failures do not corrupt plan or continuity state.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/runtime-adapters-execute.test.mjs`
- **Approval Required**: yes
- **Rollback Notes**: Revert registry/run-executor/config changes and delete the test.
- **Status**: blocked

**Principle Cards**:
- `principle:approval-at-plan-boundary`
- `principle:blast-radius-before-build`

### WO-RGP-018: Implement Pipeline API and Session-Board Enhancement

- **Work Order ID**: `WO-RGP-018`
- **Lifecycle Stage**: `implement`
- **Phase ID**: `cursor-companion-rgp-pipeline-ui`
- **System ID**: `apps/flagship-foundry`
- **Task Class**: `deterministic_transformation`
- **Agent Role**: `builder`
- **Agent Persona**: `conservative_builder`
- **Model Tier**: `low_cost_executor`
- **File Scope**:
  - `apps/flagship-foundry/apps/control-plane/src/server.mjs`
  - `apps/flagship-foundry/apps/cursor-companion/extension.js`
  - `apps/flagship-foundry/apps/cursor-companion/session-board.js`
  - `apps/flagship-foundry/apps/cursor-companion/control-plane-client.js`
  - `apps/flagship-foundry/packages/core/src/session-projection.mjs`
  - `apps/flagship-foundry/tests/pipeline-session-board.test.mjs` (new)
- **Source Artifacts**:
  - `WO-RGP-016`
  - `WO-RGP-017`
  - `WO-RGP-004`
- **Allowed Tools**:
  - `read`
  - `apply_patch`
  - `node`
- **Constraints**:
  - Session board remains a projection over control-plane state.
  - Telemetry correlations must be visible without conflating declared approval state.
- **Expected Outputs**:
  - Pipeline API routes, companion session-board enhancements, and focused tests.
- **Acceptance Criteria**:
  - [ ] Pipeline create, launch, status, pause, and resume routes exist.
  - [ ] Session board shows current stage, active adapter, evidence, and blocking conditions.
  - [ ] Extension can launch a pipeline through typed control-plane methods.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/pipeline-session-board.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: Revert server/client/panel/session projection changes and delete the test.
- **Status**: blocked

**Principle Cards**:
- `principle:observed-vs-declared-truth`
- `principle:continuity-is-mandatory`

### WO-RGP-019: Verify Stream C Pipeline Slice

- **Work Order ID**: `WO-RGP-019`
- **Lifecycle Stage**: `verify`
- **Phase ID**: `cursor-companion-rgp-verify-pipeline`
- **System ID**: `apps/flagship-foundry`
- **Task Class**: `verification`
- **Agent Role**: `verifier`
- **Agent Persona**: `skeptical_verifier`
- **Model Tier**: `balanced_reasoner`
- **File Scope**:
  - Read-only over Stream C files and tests.
- **Source Artifacts**:
  - `WO-RGP-015`
  - `WO-RGP-016`
  - `WO-RGP-017`
  - `WO-RGP-018`
- **Allowed Tools**:
  - `read`
  - `node`
- **Constraints**:
  - Dry-run adapter may be used for proof if live adapters are not approval-enabled.
  - Verification must cover failure-policy behavior.
- **Expected Outputs**:
  - Verification notes or evidence bundle references.
- **Acceptance Criteria**:
  - [ ] Multi-stage pipeline executes in order with correct context propagation.
  - [ ] Halt, skip, and retry behaviors match contract.
  - [ ] Result ingestion creates typed artifacts with provenance.
  - [ ] Session board reflects stage and evidence state accurately.
- **Verification Plan**:
  - `node --test apps/flagship-foundry/tests/pipeline-composer.test.mjs apps/flagship-foundry/tests/pipeline-runtime.test.mjs apps/flagship-foundry/tests/runtime-adapters-execute.test.mjs apps/flagship-foundry/tests/pipeline-session-board.test.mjs`
- **Approval Required**: no
- **Rollback Notes**: None, read-only verification.
- **Status**: blocked

**Principle Cards**:
- `principle:independent-verification`

### WO-RGP-020: Verify Cross-Stream Integration

- **Work Order ID**: `WO-RGP-020`
- **Lifecycle Stage**: `verify`
- **Phase ID**: `cursor-companion-rgp-verify-integration`
- **System ID**: `apps/flagship-foundry`
- **Task Class**: `verification`
- **Agent Role**: `verifier`
- **Agent Persona**: `skeptical_verifier`
- **Model Tier**: `balanced_reasoner`
- **File Scope**:
  - Read-only over all Stream A/B/C files and tests.
- **Source Artifacts**:
  - `WO-RGP-009`
  - `WO-RGP-014`
  - `WO-RGP-019`
  - `docs/intent/intent-cursor-companion-rag-graph-pipelines-2026-04-03.md`
- **Allowed Tools**:
  - `read`
  - `node`
  - `pnpm`
- **Constraints**:
  - Must verify the full intent acceptance surface, not isolated subsystems only.
- **Expected Outputs**:
  - Integration evidence or a release-blocking defect list.
- **Acceptance Criteria**:
  - [ ] Full cycle works: graph build, RAG retrieval, context assembly, pipeline execution, result ingestion.
  - [ ] New artifacts from pipeline execution appear in graph and become indexable.
  - [ ] Export/import round-trip preserves provenance and relationship fidelity.
  - [ ] All 15 intent acceptance criteria are covered by evidence.
- **Verification Plan**:
  - `pnpm exec nx run flagship-foundry:test`
- **Approval Required**: no
- **Rollback Notes**: None, read-only verification.
- **Status**: blocked

**Principle Cards**:
- `principle:independent-verification`

### WO-RGP-021: Release Documentation and Handoff

- **Work Order ID**: `WO-RGP-021`
- **Lifecycle Stage**: `release`
- **Phase ID**: `cursor-companion-rgp-release-handoff`
- **System ID**: `docs`
- **Task Class**: `learning`
- **Agent Role**: `docs_release_agent`
- **Agent Persona**: `curious_architect`
- **Model Tier**: `balanced_reasoner`
- **File Scope**:
  - `docs/handoff/handoff-cursor-companion-rag-graph-pipelines-2026-04-03.md` (new)
  - `.foundry/projects/flagship-foundry-cursor-companion-rag-graph-pipelines/current-task.json`
- **Source Artifacts**:
  - `WO-RGP-020`
  - all stream evidence bundles and ADRs
- **Allowed Tools**:
  - `read`
  - `apply_patch`
- **Constraints**:
  - Handoff must support deterministic resume and operator review.
  - Continuity must reflect completion or blockers explicitly.
- **Expected Outputs**:
  - Release handoff document and updated continuity state.
- **Acceptance Criteria**:
  - [ ] Handoff explains what shipped, how to use it, known limits, and next actions.
  - [ ] Continuity state is updated with artifacts, verification, and remaining blockers.
  - [ ] ADR references and new contracts are linked from the handoff.
- **Verification Plan**:
  - `rg -n "Known|Next|ADR" docs/handoff/handoff-cursor-companion-rag-graph-pipelines-2026-04-03.md`
- **Approval Required**: no
- **Rollback Notes**: Delete the handoff doc and restore prior continuity state if needed.
- **Status**: blocked

**Principle Cards**:
- `principle:continuity-is-mandatory`

---

## Principle Attachments

| Principle | Attached Work Orders | Intent |
|-----------|----------------------|--------|
| `principle:contract-first` | `WO-RGP-001`, `WO-RGP-002`, `WO-RGP-003`, `WO-RGP-004`, `WO-RGP-007`, `WO-RGP-015` | Define contracts and decisions before implementation consumers. |
| `principle:artifact-authority` | `WO-RGP-005`, `WO-RGP-010`, `WO-RGP-016` | Keep graph, vector store, and stage outputs derived from canonical artifacts. |
| `principle:observed-vs-declared-truth` | `WO-RGP-003`, `WO-RGP-005`, `WO-RGP-011`, `WO-RGP-013`, `WO-RGP-018` | Distinguish projected retrieval and telemetry from approved/canonical state. |
| `principle:approval-at-plan-boundary` | `WO-RGP-004`, `WO-RGP-015`, `WO-RGP-017` | Prevent unapproved stage dispatch or freeform pipeline execution. |
| `principle:continuity-is-mandatory` | `WO-RGP-016`, `WO-RGP-018`, `WO-RGP-021` | Preserve resumability across interrupted pipelines and release handoff. |
| `principle:independent-verification` | `WO-RGP-009`, `WO-RGP-014`, `WO-RGP-019`, `WO-RGP-020` | Separate verification from construction. |
| `principle:fix-memory-compounds` | `WO-RGP-010`, `WO-RGP-012` | Ensure historical fix memory becomes queryable and useful during DoR. |
| `principle:complexity-budgets` | `WO-RGP-002`, `WO-RGP-006`, `WO-RGP-011` | Bound schema complexity, traversal depth, and retrieval volume. |
| `principle:blast-radius-before-build` | `WO-RGP-001`, `WO-RGP-007`, `WO-RGP-012`, `WO-RGP-017` | Declare high-impact control-plane and adapter surface changes before coding. |

---

## First Work Order Ready to Execute

`WO-RGP-001` is the first executable work order. It is the gate for all downstream schema and implementation work because ADR-014 through ADR-017 decide the vector store, graph derivation, failure propagation, and context-budget policy that later contracts must encode.
