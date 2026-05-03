# Commit history overview (pre-squash archive)

**Purpose:** This repository was published with a **single squashed commit** on the default branch. This file summarizes the **25 commits** that existed on `master` immediately before that squash, without reproducing secrets or private customer data.

**Single-commit SHA (squashed tip):** This file lives in the **only** commit on the public branch; the canonical hash is always `git rev-parse HEAD` (short: `git rev-parse --short HEAD`).

---

## Release snapshot

| Field | Value |
|--------|--------|
| Public release date | 2026-05-02 |
| Squashed branch tip | Run `git rev-parse HEAD` (one commit on `master`) |
| Pre-squash tip (last old commit) | `912bab1` (preserved on branch `archive/pre-public-squash-912bab1` until you delete it) |
| Pre-squash commit count | 25 |
| Default branch | `master` |
| Primary author (shortlog) | Evan McCall (25 commits) |

## Major themes (pre-squash era)

- **Monorepo / Nx** — Scaffold, `flagship-foundry-work` → `apps/flagship-foundry`, workspace hygiene and ignores.
- **Flagship Foundry** — Control plane, orchestrator CLI, import/knowledge/gap/focus/plan/run flows, CI (`flagship-foundry-ci`), ADRs, continuity (`.foundry`), Cursor companion.
- **SSOT migration** — Personas, skills, agents under `.foundry/` with adapter work.
- **Artifact / import bridge** — Workspace orders, manifests, validators, transforms.
- **Viewer PoC** — Express API (`/api/tree`, `/api/file`), DOMPurify, vanilla UI, Rust todo pseudocode insertion.
- **Docs & governance** — UI/UX guides, operator kits, CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, LICENSE, release checklist, path sanitization for public clone.
- **Cleanup** — Removed obsolete HTML docs, nested repo links, exports; tightened `.gitignore`.

## Notable ADRs (Foundry)

Referenced in-tree under `apps/flagship-foundry/docs/adr/` (examples): ADR-001 artifact authority, ADR-002 continuity schema, ADR-006 control-plane auth, ADR-009 CI gates, ADR-010 rollout/rollback, ADR-011 `.foundry` layout, ADR-013 Cursor companion surface — see that directory for full list and status.

## Areas of the tree touched most often

- `apps/flagship-foundry/` (product code, schemas, docs, examples)
- `.cursor/` (rules, agents, skills)
- `.foundry/`, `.claude/`, `.github/workflows/`
- `Research and Skills/` (reference material)
- Root `README.md`, `package.json`, `nx.json`, `.gitignore`

## Verification before squash

- Targeted checks were discussed in-session; full `npm test` under `apps/flagship-foundry` may still require optional fixture dirs (`chatgpt-workspace-orders`, etc.) on a clean clone — see `CONTRIBUTING.md` and CI workflow.

## Explicit exclusions (never in public artifacts)

- Production API keys, bearer tokens, session material.
- Real home-directory paths in docs (sanitized before squash where listed in ADRs and examples).
- Customer-specific sample names in import configs (replaced with `sample-import` placeholders).

## Appendix — full pre-squash `git log --oneline`

Oldest → newest (as recorded at squash time):

```
6195e67 initial
30d220b Add initial project structure with MCP configuration, planning documentation, and graph viewer application
d2ee92a feat(flagship-foundry): phase lifecycle viewer, ontology, and compliance APIs
54e9c99 feat(flagship-foundry): enhance documentation, CI setup, and orchestration features
0e38d43 feat(foundry): SSOT migration complete — personas, skills, agents under .foundry/ with adapter stubs (wo-001–wo-005)
ff5b29c chore: add .gitignore, dev/setup scripts, fix run HTTP 500, remove tracked node_modules
0a41b12 chore(flagship-foundry): remove outdated task and charter files, add pnpm lock files for new apps and packages
b0c838a feat(nx): Nx monorepo scaffold + flagship-foundry-work → apps/flagship-foundry (WO-NX-001..006)
1528fc9 chore(foundry): align agent and skill overlays with Cursor, Claude, Codex
932de6f chore: remove outdated research documents and files
096986d chore: update project configuration and dependencies
e804b4e Initial project import
1961a41 Tighten ignore rules
1f87631 Remove nested repo links and tighten ignore rules
cafffe3 Ignore and remove exports
4297909 feat: initialize flagship-foundry core modules, schemas, and GPT operator project kits while updating terminal adapter configurations.
21aa889 feat: initialize project documentation, UI/UX design guides, and workspace operator kit configurations.
d174107 feat(viewer): add express + open deps and viewer npm scripts
60bf100 feat(viewer): Express server with /api/tree and /api/file
8aaf84d feat(viewer): single-page artifact viewer with DOMPurify sanitization
b6f575f feat(viewer): artifact viewer PoC complete — Express + vanilla JS + CDN libs
76379f0 feat(viewer): pseudocode insertion into Rust todos with save
b73efd5 Remove obsolete files and directories, including workspace configuration, Codex README, and various project plans, to streamline the repository structure and eliminate unused resources.
b1d87a2 Enhance repository structure by adding essential documentation files including CODE_OF_CONDUCT.md, CONTRIBUTING.md, SECURITY.md, and LICENSE. Update .gitignore to include additional patterns for better exclusion of sensitive and temporary files. Modify README.md and QUICKSTART.md for clarity on project setup and usage. Adjust repository layout documentation to reflect new paths and improve overall organization.
912bab1 Remove obsolete HTML documentation files related to system architecture, action mapping, approaches, data models, database strategy, identity models, and platform abstraction layer to streamline the repository and eliminate unused resources.
```

## Sign-off

| Role | Action |
|------|--------|
| History consolidated | Single orphan commit on `master`, prior chain preserved only in this document. |
