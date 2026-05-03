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

## CI and release gates

Blocking automation and the release evidence threshold are documented in **[docs/ci-release-gates.md](docs/ci-release-gates.md)** (ADR-009). GitHub Actions runs **`npm test`** plus **`npm run ci:targeted`** (orchestrator visualize smoke) from **`apps/flagship-foundry/`**; workflow definition lives at **`.github/workflows/flagship-foundry-ci.yml`** in this monorepo.

Rollout, rollback, and incident documentation (how operator records link to plans, runs, and evidence) are defined in **[docs/rollout-rollback-incident-model.md](docs/rollout-rollback-incident-model.md)** (ADR-010).

## Continuity and `.foundry`

Per **ADR-011**, machine-readable **project continuity** (task state) lives under **`.foundry/projects/<project>/current-task.json`** at the **workspace root** you choose when running `init-project`—not under `apps/flagship-foundry/state/`. See **[docs/guides/ecosystem-onboarding.md](docs/guides/ecosystem-onboarding.md)** for a full import → knowledge → gap → plan → continuity walkthrough.

- **Docker (optional):** [docs/docker-and-local-dev.md](docs/docker-and-local-dev.md)
- **Cursor extension init patterns:** [docs/guides/cursor-extension-foundry-init.md](docs/guides/cursor-extension-foundry-init.md)

## Control-plane auth and trust boundary config

ADR-006 Option B is enforced in the control plane:
- non-loopback requests require a scoped bearer token
- loopback (`127.0.0.1` / `::1`) can bypass auth in local dev
- CORS only allows explicit origins (no wildcard)

Set these variables before `npm run api`:

```bash
# Required for non-loopback access
export FLAGSHIP_CONTROL_PLANE_BEARER_TOKEN="replace-me"
export FLAGSHIP_CONTROL_PLANE_BEARER_SCOPES="control-plane:read,control-plane:write,control-plane:execute"

# Optional: multiple scoped tokens (overrides *_BEARER_* when set)
# export FLAGSHIP_CONTROL_PLANE_TOKENS='[{"token":"token-a","scopes":["control-plane:read"]}]'

# Optional local dev exception (default 1 = enabled)
export FLAGSHIP_ALLOW_LOOPBACK_NO_AUTH=1

# Explicit CORS allowlist (comma-separated; no wildcard)
export FLAGSHIP_CORS_ORIGINS="http://localhost:3000,http://localhost:4010"
```

## Runtime adapter isolation and rollback boundary

ADR-008 indicators are enforced for execute-mode runs:
- run records include an explicit `isolation` contract (`run-scoped` workspace, default `workspace-only` writes)
- run records include explicit `rollback` semantics (`pause`/`stop` preserve task evidence and timeline)
- local-shell executor persists per-task evidence JSON under `state/run-workspaces/<run-id>/`
- non-zero local-shell exits mark the task and run as failed while preserving artifacts for diagnosis

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
- `GET /planning/context?ecosystemId=&knowledgeBaseId=`
- `POST /runs/start` (use `mode: execute` + `adapterId: adapter:local-shell` for real local execution)
- `GET /runs/:id/evidence-bundle`
- `POST /runs/:id/ralph-sync` (body: `prdPath`, `projectName`)
- `POST /plans/:id/approve`
- `GET|POST /plans/:id/debate`
- `GET /projects/:id/gates`
- `GET /swarm/registry` — `POST /swarm/orchestration-stub`
- `GET /trace/forward|backward|file` — graph trace helpers
- `GET /environments/detect?targetDir=`
- `POST /environments/scaffold`

See [docs/REPOSITORY_LAYOUT.md](docs/REPOSITORY_LAYOUT.md) for repo boundaries and [docs/source-of-truth-matrix.md](docs/source-of-truth-matrix.md) for artifact authority and sync direction.

## Current direction

Start with the Cursor companion and terminal adapters while keeping the control plane framework-agnostic. Use import plus knowledge plus gap analysis to identify where doctrine, skills, runbooks, personas, and environment parity are still incomplete before wiring a real executor.
