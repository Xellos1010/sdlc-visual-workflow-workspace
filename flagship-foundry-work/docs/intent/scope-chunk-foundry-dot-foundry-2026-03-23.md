# Scope Chunk Summary: `.foundry` continuity, onboarding, Docker, extension

**Intent packet:** `docs/intent/intent-foundry-dot-foundry-ecosystem-init-2026-03-23.md`  
**Architecture decision:** `docs/adr/adr-011-foundry-directory-layout-and-continuity-instance.md` (**accepted**; implemented 2026-03-23)  
**Date:** 2026-03-23

### Implementation status (2026-03-23)

| WO | Status | Notes |
|----|--------|--------|
| WO-FF-011-01 | **Done** | Schema, `continuity.mjs`, tests, ADR-002/011, instance migrated to `.foundry/projects/flagship-foundry/` |
| WO-FF-011-02 | **Done** | `import-pipeline.mjs`: `.foundry/` scan + `environment:foundry` |
| WO-FF-011-03 | **Done** | `docs/guides/ecosystem-onboarding.md`, README, REPOSITORY_LAYOUT, IMPORT pipeline, `.cursor` rules, `sdlc-phase-router` skill |
| WO-FF-011-04 | **Done** | `docs/docker-and-local-dev.md` |
| WO-FF-011-05 | **Done** | `docs/guides/cursor-extension-foundry-init.md` |

**Verify:** `cd flagship-foundry-work && npm test` — **60/60 pass**.

---

## Impacted Node Inventory

| Node ID | Node Type | Change Type | Contracts | Guardrail Packs |
|---------|-----------|-------------|-----------|-----------------|
| `continuity-state.schema.json` | contract | modify | `authority.runtimeInstanceAuthority` pattern | contract-first |
| `continuity.mjs` | component | modify | reads/writes instance path | observed-vs-declared-truth |
| `continuity.test.mjs` | test | modify | asserts paths under tmp | verification |
| `import-pipeline.mjs` | component | modify | optional `.foundry/` scan parity with `.codex/` | complexity-budgets |
| `adr-002` | ADR | amend by reference | ADR-011 supersedes runtime path clause | — |
| `.cursor/rules/**` (workspace) | policy | modify | pointer to `.foundry/projects/**` | — |
| `docs/guides/*` (new) | doc | create | operator walkthrough | — |
| `docs/deployment-or-docker.md` or under `docs/` | doc | create | Docker posture | security baseline |
| `apps/cursor-companion/` | component | optional modify | init/re-init commands | extension security |
| `.codex/projects/flagship-foundry/current-task.json` | instance | migrate / replace | move to `.foundry/projects/...` | continuity |

---

## Task Class Mapping

`configs/model-routing/default-routing.json` is not present under `flagship-foundry-work/`; mapping uses the scope-chunker default table:

| Work order | Task class | Model tier |
|------------|------------|------------|
| WO-FF-011-01 | structured_generation | low_cost_executor |
| WO-FF-011-02 | structured_generation | low_cost_executor |
| WO-FF-011-03 | structured_generation | low_cost_executor |
| WO-FF-011-04 | strategic_reasoning | frontier_reasoner |
| WO-FF-011-05 | structured_generation + verification | low_cost_executor + balanced_reasoner |

---

## Principle Cards

- **`principle:contract-first`** — WO-FF-011-01: merge ADR-011 → schema before `continuity.mjs` behavior.
- **`principle:complexity-budgets`** — WO-FF-011-02: only add `.foundry/` scan paths that mirror existing `.codex/` logic; no new nested caches in v1.
- **`principle:observed-vs-declared-truth`** — WO-FF-011-01: `runtimeInstanceAuthority` string must match actual file path written by `init-project`.

---

## Work Order: WO-FF-011-01

- **Lifecycle Stage**: implement  
- **Phase ID**: `foundry-continuity-instance-path`  
- **Task Class**: structured_generation  
- **Agent Role**: builder  
- **Model Tier**: low_cost_executor  
- **File Scope** (create/modify):
  - `flagship-foundry-work/docs/adr/adr-011-foundry-directory-layout-and-continuity-instance.md` (flip **Status** to `accepted` when implementation matches — after review)
  - `flagship-foundry-work/schemas/continuity-state.schema.json` — `runtimeInstanceAuthority` pattern → `^\\.foundry/projects/[^/]+/current-task\\.json$`
  - `flagship-foundry-work/packages/core/src/continuity.mjs` — `projectDir`, `authorityFor`, `CONTRACT_AUTHORITY_PATH` references; root = `.foundry/projects`
  - `flagship-foundry-work/tests/continuity.test.mjs` — expect `.foundry/projects/...`
  - `flagship-foundry-work/docs/adr/adr-002-continuity-schema-authority-and-bootstrap.md` — add short **Amendment** subsection: runtime instance path superseded by ADR-011 (link)
- **Source Artifacts**: intent packet, ADR-011  
- **Constraints**: ADR-002 contract/instance split preserved; ADR-004 no silent overwrite of user files during migration docs (handled in WO-03).  
- **Acceptance Criteria**:
  - [ ] `init-project` writes `current-task.json` under `.foundry/projects/<name>/` when run from chosen cwd
  - [ ] Schema validates instance path string for new projects
  - [ ] Unit tests pass  
- **Verification Plan**:
  - `cd flagship-foundry-work && npm test`
- **Rollback Notes**: revert schema + continuity + tests; restore ADR-011 to `proposed` or `deprecated`  
- **Approval Required**: yes (schema + authority path — **architect sign-off**)

---

## Work Order: WO-FF-011-02

- **Lifecycle Stage**: implement  
- **Phase ID**: `import-pipeline-foundry-scan`  
- **Task Class**: structured_generation  
- **Agent Role**: builder  
- **Model Tier**: low_cost_executor  
- **File Scope**:
  - `flagship-foundry-work/packages/core/src/import-pipeline.mjs` — extend `shouldReadFilesystemPath` (or equivalent) so `.foundry/` metadata is considered similarly to `.codex/` where appropriate (e.g. rules/skills pointers if present under `.foundry/` — **minimal**: include `.foundry/projects/**` non-secret JSON/md if aligned with product decision)
- **Source Artifacts**: ADR-011, intent packet §import  
- **Constraints**: Do not import giant binary blobs; keep parity with existing inclusion rules.  
- **Acceptance Criteria**:
  - [ ] Filesystem import includes agreed `.foundry/` subtrees without duplicating entire `state/`  
  - [ ] `npm test` green  
- **Verification Plan**: `cd flagship-foundry-work && npm test`  
- **Rollback Notes**: revert import-pipeline hunk  
- **Approval Required**: no (bounded path logic)

---

## Work Order: WO-FF-011-03

- **Lifecycle Stage**: implement  
- **Phase ID**: `ecosystem-onboarding-docs-migration`  
- **Task Class**: structured_generation  
- **Agent Role**: builder + docs-release-agent  
- **Model Tier**: low_cost_executor  
- **File Scope**:
  - `flagship-foundry-work/docs/guides/ecosystem-onboarding.md` (new) — step-by-step: import → knowledge → gap → plan → continuity → optional API + companion  
  - `flagship-foundry-work/README.md` — link to guide + `.foundry` note  
  - `flagship-foundry-work/docs/REPOSITORY_LAYOUT.md` — `.foundry` section  
  - **Parent workspace** `.cursor/rules/03-workflow/sdlc-setup.mdc`, `ai-sdlc-orchestrator.mdc` — update paths from `.codex/projects/...` to `.foundry/projects/...` (and mention migration)  
  - Grep entire repo for `codex/projects` in **docs and rules** (exclude `node_modules`, `state/` archives if policy says archive-only)
- **Source Artifacts**: intent packet acceptance criteria  
- **Constraints**: ADR-001 canonical docs in `flagship-foundry-work/docs/`  
- **Acceptance Criteria**:
  - [ ] Walkthrough runnable by a new engineer with commands as written  
  - [ ] Migration subsection: copy vs symlink vs fresh init  
- **Verification Plan**: peer review + spot-run commands  
- **Rollback Notes**: docs revert  
- **Approval Required**: no  

---

## Work Order: WO-FF-011-04

- **Lifecycle Stage**: implement  
- **Phase ID**: `docker-posture-doc`  
- **Task Class**: strategic_reasoning  
- **Agent Role**: systems-architect / builder  
- **Model Tier**: frontier_reasoner  
- **File Scope**:
  - `flagship-foundry-work/docs/docker-and-local-dev.md` (new) — optional Docker for control plane; host-mount; ADR-006 env; when not to containerize CLI  
- **Source Artifacts**: intent packet Docker section  
- **Acceptance Criteria**:
  - [ ] Clear default: Node on host for dev; optional CI/container story  
  - [ ] Security: tokens, bind mounts  
- **Verification Plan**: doc review  
- **Rollback Notes**: delete file  
- **Approval Required**: no  

---

## Work Order: WO-FF-011-05

- **Lifecycle Stage**: implement  
- **Phase ID**: `cursor-companion-init-assessment`  
- **Task Class**: verification (assessment) + structured_generation (optional spike)  
- **Agent Role**: builder  
- **Model Tier**: balanced_reasoner  
- **File Scope**:
  - `flagship-foundry-work/docs/guides/cursor-extension-foundry-init.md` (new) — feasible commands, settings, non-goals  
  - Optional: `apps/cursor-companion/` — new command “Initialize Foundry continuity” calling CLI with dry-run  
- **Source Artifacts**: intent packet §extension  
- **Constraints**: ADR-004 — no blind overwrite; confirm dialogs or dry-run  
- **Acceptance Criteria**:
  - [ ] Document lists VS Code API capabilities vs limitations  
  - [ ] If code ships: does not auto-apply parity merges  
- **Verification Plan**: manual extension smoke in dev host  
- **Rollback Notes**: docs-only path minimal  
- **Approval Required**: optional for code changes (yes if companion behavior changes)

---

## Scope Chunk Summary

| Metric | Value |
|--------|--------|
| **Total Work Orders** | 5 |
| **Estimated Phases** | implement ADR-011 + code (01–02) → docs/rules (03) → Docker doc (04) → extension (05) |
| **Critical Path** | WO-FF-011-01 → WO-FF-011-02 → WO-FF-011-03 |
| **Parallelizable** | WO-FF-011-04 parallel with 02–03 after ADR-011 text is stable; WO-FF-011-05 parallel with 04 |
| **Approval Gates** | WO-FF-011-01 (schema/instance path) |

---

## Work Order Sequence

1. **WO-FF-011-01**: Schema + `continuity.mjs` + tests + ADR-002 amendment note → **@builder** (depends: ADR-011 review)  
2. **WO-FF-011-02**: Import pipeline `.foundry` scan → **@builder** (depends: 01)  
3. **WO-FF-011-03**: Onboarding guide + workspace rules path updates → **@builder** / **@docs-release-agent** (depends: 01; can overlap 02)  
4. **WO-FF-011-04**: Docker/local dev doc → **@builder** (depends: none for draft)  
5. **WO-FF-011-05**: Extension assessment (+ optional spike) → **@builder** (depends: 01 for path accuracy)

---

## First Work Order (Ready to Execute)

**WO-FF-011-01** — Implement **ADR-011** normative layout in **schema + continuity runtime + tests**; amend **ADR-002** by reference; keep **ADR-011** as `proposed` until verifier green, then set `accepted`.

**Verifier command:** `cd flagship-foundry-work && npm test`

---

## Continuity Writer (manual follow-up)

After plan approval, update `.foundry/projects/<id>/current-task.json` (or legacy path until 01 ships) with:

- `lifecycleStage`: `plan` or `implement`  
- `nextCommandSet`: include `WO-FF-011-01` verification command  
- `artifacts`: add paths to this chunk doc + ADR-011  

---

## References

- `flagship-foundry-work/schemas/agent-work-order.schema.json`
- `flagship-foundry-work/ontology/principle-catalog.json` (principle ids cited conceptually where `principle:*` aliases apply)
