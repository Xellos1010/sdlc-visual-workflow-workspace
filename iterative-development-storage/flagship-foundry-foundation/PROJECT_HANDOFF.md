# Project Handoff

## Executive summary

This repository turns the earlier ecosystem bundle into a **runnable starter control plane** for the vision:

- graph-native SDLC orchestration
- provider-agnostic and framework-agnostic execution envelopes
- typed microtasks with explicit personas, evidence, and handoff
- terminal-agent compatibility first
- local/remote model hosting as a pluggable backend
- future IDE product defined separately from the control plane

This is the correct starting point because it fixes the hardest structural problem first: **how intent, graph state, work orders, evidence, and learning fit together without depending on one chat tool or one code editor**.

## What exists now

### Runnable assets
- a control-plane HTTP API
- a planner CLI
- a simple graph store with patching
- orchestration stubs for ecosystem, system, repo, and telemetry layers
- sample change request and incident inputs
- smoke tests

### Core contracts
- agent work order schema
- continuity state schema
- change request schema
- incident schema
- runbook schema
- persona pack schema
- guardrail pack schema
- evidence bundle schema
- fix memory schema
- provider and adapter manifest schemas
- evolution event schema

### Process assets
- runbooks for feature, bug, change, handoff, telemetry remediation, learning, guardrail authoring, and provider onboarding
- persona packs aligned to SDLC phases
- sample guardrail packs for TypeScript, Chrome extension MV3, Android, iOS, web frontend, AWS serverless, and Azure containerized services

### Strategy assets
- IDE decision record and implementation direction
- terminal agent support guidance
- local/remote model guide
- low-level model training guide
- large-codebase and versioning strategy
- principles alignment guidance
- roadmap

## What is intentionally not implemented yet

- real model execution and tool calling
- real repository ingestion and symbol graph extraction
- real git/worktree executor
- visual canvas or animated diagram layer
- production auth, tenancy, billing, or RBAC
- training pipeline automation

Those are downstream of the structural contracts already created here.

## How the current code works

### Control plane
`apps/control-plane/src/server.mjs` exposes minimal endpoints for graph access, plan generation, telemetry intake, and catalog discovery.

### Planner
`packages/core/src/planner.mjs` persists a change request and asks the ecosystem orchestrator to generate a plan.

### Orchestrators
- `services/ecosystem-orchestrator/` owns global routing and summary planning
- `services/system-orchestrator/` owns system-level design/diagnosis decomposition
- `services/repo-orchestrator/` owns builder and verifier work-order generation
- `services/telemetry-intake/` translates runtime evidence into change requests

### Graph
`packages/core/src/graph-store.mjs` loads and patches a graph document.

## Immediate next engineering tranche

1. **System registration**
   - register real repos, systems, owners, contracts, and runtimes
   - map each registered system into graph nodes and edges

2. **Execution envelopes**
   - add git/worktree-safe execution plans to work orders
   - add file and contract scope narrowing per microtask

3. **Adapter bridge layer**
   - implement terminal-adapter launchers for Codex, Claude Code, Gemini CLI, and OpenClaw
   - normalize work-order input/output payloads

4. **Verification layer**
   - add independent verifier execution and evidence bundle writing
   - add release recommendation synthesis

5. **Learning layer**
   - write structured fix-memory records from resolved work
   - build export tooling for training corpora

6. **Visualization layer**
   - graph canvas, sequence playback, incident cockpit, and production data flow overlays

## Open decisions that still need resolution

- graph database backend: embedded first or external first
- repository index backend: tree-sitter/SCIP/LSIF/Ctags hybrid or another registry
- evidence store format: filesystem, object storage, or event log first
- versioning abstraction depth beyond Git in phase 1
- whether visualization ships as web app first or embedded inside IDE first
- which terminal adapter to implement first for full execution

## Recommendation on sequencing

### Recommended build order
1. repository registration + graph ingestion
2. terminal adapter bridge for one strong primary environment
3. verifier + evidence bundle writing
4. continuity writer and evolution ledger
5. visualization dashboard
6. Theia-based IDE shell
7. marketplace and training pipeline

### Recommended primary execution environment for phase 1
Use a **terminal-first workflow** with the current control plane and an adapter for one of the major terminal agents. Keep the work-order contracts stable and make every runtime an adapter.

## Definition of done for the next agent tranche

The next major tranche should be considered complete only when:

- a real repository can be registered into the graph;
- a real change request can route to an execution envelope;
- a terminal adapter can consume a work order and produce an evidence bundle;
- continuity state is updated deterministically;
- at least one fix-memory record is emitted automatically.

## How to resume work safely

1. Read this document.
2. Read `docs/FOUNDRY_ECOSYSTEM_SPEC.md`.
3. Read `docs/MINIMUM_EXECUTABLE_SLICE.md`.
4. Inspect `manifests/*.json` to understand the current catalogs.
5. Run `npm test`.
6. Run `npm run plan`.
7. Extend one vertical slice end to end rather than adding disconnected files.
