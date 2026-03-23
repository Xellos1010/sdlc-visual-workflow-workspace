# Flagship Foundry

Flagship Foundry is a graph-native SDLC control plane for human plus AI orchestration.

This repository now includes a working import, knowledge-ingestion, gap-analysis, focus-view, approval-aware planning, and run-control slice that starts from an existing workspace rather than assuming a greenfield implementation path.

## What is here

- `apps/control-plane/` - HTTP API for import, knowledge ingestion, gap analysis, focus views, planning, approval, run control, and graph patching
- `apps/orchestrator-cli/` - CLI for bootstrap, import, knowledge ingestion, gap analysis, focus views, planning, environment scaffold, and run simulation
- `apps/cursor-companion/` - VS Code and Cursor companion surface with start, import, ingest, gap, plan, focus, approve, and run control actions
- `packages/core/` - import pipeline, graph store, plans, runs, visualizations, focus views, knowledge ingestion, environment scaffold, SME profile generation, and catalogs
- `knowledge/` - domain packs, framework registries, source presets, and agent plus skill blueprints
- `schemas/` - contracts for import, graph, plans, runs, knowledge sources, documents, gap reports, focus views, runbooks, personas, guardrails, and fix memory
- `runbooks/`, `personas/`, `guardrails/`, `configs/`, `ontology/` - process, role, policy, and routing catalogs
- `environments/` - project-local parity templates for Cursor, Codex, and Claude Code
- `examples/current-workspace/` - current ecosystem export bundle, requests, and generated artifacts
- `examples/knowledge-sources/` - seed knowledge manifest and local documentation sources
- `state/` - generated ecosystem manifests, graphs, knowledge bases, plans, runs, visualizations, and profile outputs

## Quick start

```bash
npm run bootstrap:full-sample
npm run api
npm test
```

## Sample commands

```bash
npm run import:sample
npm run knowledge:sample
npm run gap:sample
npm run focus:sample
npm run plan:sample
```

## Primary URLs

- `GET /health`
- `POST /ingestion/workspace-import`
- `POST /knowledge/ingest`
- `POST /analysis/gaps`
- `POST /analysis/focus`
- `POST /planning/create`
- `POST /runs/start`
- `POST /plans/:id/approve`
- `POST /runs/:id/pause|resume|stop`
- `POST /environments/scaffold`

## Current direction

Start with the Cursor companion and terminal adapters while keeping the control plane framework-agnostic. Use import plus knowledge plus gap analysis to identify where doctrine, skills, runbooks, personas, and environment parity are still incomplete before wiring a real executor.
