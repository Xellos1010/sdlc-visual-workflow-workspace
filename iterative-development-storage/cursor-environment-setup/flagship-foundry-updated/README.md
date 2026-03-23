# Flagship Foundry

Flagship Foundry is a graph-native SDLC control plane for human plus AI orchestration.

This repository now includes a working import-and-scaffold pipeline that can bootstrap an existing ecosystem, generate visualizations, derive SME profiles, create approval-aware plans, and control simulated agent runs.

## What is here

- `apps/control-plane/` — HTTP API for import, planning, blast radius, approval, run control, and graph patching
- `apps/orchestrator-cli/` — CLI for bootstrap, import, planning, and run simulation
- `apps/cursor-companion/` — VS Code and Cursor companion surface with start, import, approve, and run control actions
- `packages/core/` — import pipeline, graph store, plans, runs, visualizations, SME profile generation, and catalogs
- `schemas/` — contracts for import, graph, plans, runs, runbooks, personas, guardrails, and fix memory
- `runbooks/`, `personas/`, `guardrails/`, `configs/`, `ontology/` — process and role catalogs
- `examples/current-workspace/` — current ecosystem export bundle, sample requests, and generated artifacts
- `state/` — generated ecosystem manifests, graphs, plans, runs, visualizations, and profile outputs

## Quick start

```bash
npm run bootstrap:sample
npm run api
npm test
```

## Primary URLs

- `GET /health`
- `POST /ingestion/workspace-import`
- `POST /planning/create`
- `POST /analysis/blast-radius`
- `POST /runs/start`
- `POST /plans/:id/approve`
- `POST /runs/:id/pause|resume|stop`

## Current direction

Start with the Cursor companion and terminal adapters while keeping the control plane framework-agnostic. The long-term dedicated shell can still become a Theia-based environment later.
