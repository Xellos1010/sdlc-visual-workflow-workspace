# Repository layout and canonical source

## Canonical application root

**`flagship-foundry-work/`** is the canonical root for runnable Flagship Foundry code: control plane, CLI, Cursor companion, MCP server, model gateway, packages, schemas, ontology, and generated `state/`.

Open this folder as the VS Code/Cursor workspace when developing or running Foundry. Scripts such as `npm run api` and `npm test` assume the current working directory is `flagship-foundry-work/`.

## Parent workspace (SDLC meta-repo)

The enclosing repository (`SDLC - Visual - Workflow - SoftwareEngineering-NewAge`) may contain:

- Cursor rules, skills, and SDLC orchestration docs
- **`.foundry/projects/<project>/`** — Flagship Foundry **continuity** (`current-task.json`, `SDLC_CHARTER.md`) per **ADR-011** (agent-neutral; not Codex-specific)
- Research markdown, plans, and handoff notes at the repo root
- A copy of or symlink to `flagship-foundry-work`
- Legacy **`.codex/projects/`** may still exist for other tools; Foundry runtime uses **`.foundry/projects/`** for continuity

**Doc sync policy:** Product behavior and APIs are defined by code and `flagship-foundry-work/docs/`. Root-level research files are supporting material; when they conflict with `flagship-foundry-work`, **prefer the implementation under `flagship-foundry-work/`** and update research docs when intentionally changing behavior.

## State and artifacts

Generated artifacts live under `flagship-foundry-work/state/` (ecosystems, plans, runs, knowledge). Do not commit secrets; treat `state/` as machine-local unless your team policy says otherwise.

For canonical-vs-generated-vs-archive classification and sync direction, see [source-of-truth-matrix.md](source-of-truth-matrix.md).

## CI and release evidence

Automated gate baseline and release sign-off expectations (ADR-009) are in [ci-release-gates.md](ci-release-gates.md). The repo-root workflow `.github/workflows/flagship-foundry-ci.yml` runs when `flagship-foundry-work/` changes.

Operational rollout, rollback, and incident records (ADR-010) are described in [rollout-rollback-incident-model.md](rollout-rollback-incident-model.md); they must link to canonical `state/` artifacts and continuity.
