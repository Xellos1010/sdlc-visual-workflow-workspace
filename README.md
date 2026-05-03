# Flagship Foundry

Flagship Foundry is a graph-native SDLC control plane for human plus AI orchestration.

**Runnable product code** for this effort lives in [`apps/flagship-foundry/`](apps/flagship-foundry/). See [`apps/flagship-foundry/docs/REPOSITORY_LAYOUT.md`](apps/flagship-foundry/docs/REPOSITORY_LAYOUT.md) for canonical layout and how this repo relates to research docs at the root.

This repository now includes a working import, knowledge-ingestion, gap-analysis, focus-view, approval-aware planning, and run-control slice that starts from an existing workspace rather than assuming a greenfield implementation path.

## What is here

Inside [`apps/flagship-foundry/`](apps/flagship-foundry/):

- `apps/control-plane/` — HTTP API for import, knowledge ingestion, gap analysis, focus views, planning, approval, run control, and graph patching
- `apps/orchestrator-cli/` — CLI for bootstrap, import, knowledge, gaps, focus, planning, environment scaffold, and runs
- `apps/cursor-companion/` — VS Code and Cursor companion
- `packages/core/` — import pipeline, graph store, plans, runs, knowledge, environment scaffold, catalogs
- `knowledge/`, `schemas/`, `runbooks/`, `personas/`, `guardrails/`, `configs/`, `ontology/`, `environments/`, `examples/`, `state/`

## Quick start

```bash
# From repo root (Nx monorepo)
pnpm install
pnpm exec nx run flagship-foundry:test
pnpm exec nx run flagship-foundry:ci-targeted

# Or from the app directory
cd apps/flagship-foundry
npm run bootstrap:full-sample
npm run api
npm test
```

## Sample commands

```bash
cd apps/flagship-foundry
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

## Community

- [Contributing](CONTRIBUTING.md) — setup, verification, and PR expectations
- [Security policy](SECURITY.md) — report vulnerabilities privately
- [Code of conduct](CODE_OF_CONDUCT.md)
- [License](LICENSE)
- [Public release checklist](docs/PUBLIC_RELEASE.md) and [commit history overview template](docs/COMMIT_HISTORY_OVERVIEW.md) for history squashes or external handoffs
