# Repository layout and canonical source

## Canonical application root

**`apps/flagship-foundry/`** is the canonical root for runnable Flagship Foundry code in this monorepo: control plane, CLI, Cursor companion, MCP server, model gateway, packages, schemas, ontology, and generated `state/`.

Open this folder (or the monorepo root) in VS Code or Cursor when developing Foundry. Scripts such as `npm run api` and `npm test` assume the current working directory is **`apps/flagship-foundry/`**.

**Legacy name:** Older docs and ADRs may say `flagship-foundry-work/`; treat that as the same logical tree as **`apps/flagship-foundry/`** here.

## Parent workspace (SDLC meta-repo)

The enclosing monorepo may contain:

- Cursor rules, skills, and SDLC orchestration docs under **`.cursor/`**
- **`.foundry/projects/<project>/`** — Flagship Foundry **continuity** (`current-task.json`, `SDLC_CHARTER.md`) per **ADR-011** (agent-neutral; not Codex-specific)
- Research markdown, plans, and handoff notes at the repo root
- Legacy **`.codex/projects/`** may still exist for other tools; Foundry runtime uses **`.foundry/projects/`** for continuity

**Doc sync policy:** Product behavior and APIs are defined by code and **`apps/flagship-foundry/docs/`**. Root-level research files are supporting material; when they conflict with the app tree, **prefer the implementation under `apps/flagship-foundry/`** and update research docs when intentionally changing behavior.

## State and artifacts

Generated artifacts live under **`apps/flagship-foundry/state/`** (ecosystems, plans, runs, knowledge). Do not commit secrets; treat `state/` as machine-local unless your team policy says otherwise.

For canonical-vs-generated-vs-archive classification and sync direction, see [source-of-truth-matrix.md](source-of-truth-matrix.md).

## CI and release evidence

Automated gate baseline and release sign-off expectations (ADR-009) are in [ci-release-gates.md](ci-release-gates.md). The repo-root workflow **`.github/workflows/flagship-foundry-ci.yml`** runs when **`apps/flagship-foundry/`** changes.

Operational rollout, rollback, and incident records (ADR-010) are described in [rollout-rollback-incident-model.md](rollout-rollback-incident-model.md); they must link to canonical `state/` artifacts and continuity.
