# Flagship Foundry

Flagship Foundry is a graph-native SDLC control plane for human plus AI orchestration.

**Runnable product code** for this effort lives in [`flagship-foundry-work/`](flagship-foundry-work/). See [`flagship-foundry-work/docs/REPOSITORY_LAYOUT.md`](flagship-foundry-work/docs/REPOSITORY_LAYOUT.md) for canonical layout and how this repo relates to research docs at the root.

This repository now includes a working import, knowledge-ingestion, gap-analysis, focus-view, approval-aware planning, and run-control slice that starts from an existing workspace rather than assuming a greenfield implementation path.

## What is here

Inside [`flagship-foundry-work/`](flagship-foundry-work/):

- `apps/control-plane/` — HTTP API for import, knowledge ingestion, gap analysis, focus views, planning, approval, run control, and graph patching
- `apps/orchestrator-cli/` — CLI for bootstrap, import, knowledge, gaps, focus, planning, environment scaffold, and runs
- `apps/cursor-companion/` — VS Code and Cursor companion
- `packages/core/` — import pipeline, graph store, plans, runs, knowledge, environment scaffold, catalogs
- `knowledge/`, `schemas/`, `runbooks/`, `personas/`, `guardrails/`, `configs/`, `ontology/`, `environments/`, `examples/`, `state/`

## Quick start

```bash
cd flagship-foundry-work
npm run bootstrap:full-sample
npm run api
npm test
```

## Sample commands

```bash
cd flagship-foundry-work
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
