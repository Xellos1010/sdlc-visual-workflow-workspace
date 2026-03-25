# Work orders: Nx monorepo + `flagship-foundry-work` → `apps/flagship-foundry`

**Source intent**: `docs/intent/intent-nx-flagship-foundry-apps-2026-03-24.md`  
**Schema**: `flagship-foundry-work/schemas/agent-work-order.schema.json` (JSON examples at end)  
**Model routing**: `flagship-foundry-work/configs/model-routing/default.json`

---

## Impacted node inventory

| Node ID | Node Type | Change Type | Contracts / consumers | Guardrail packs |
|---------|-----------|-------------|----------------------|-----------------|
| `repo-root` | system | modify | New `nx.json`, root `package.json`, pnpm workspace | `guardrail:nx-monorepo` |
| `flagship-foundry-work/` | component | delete (path) / relocate | All internal `apps/*`, `packages/*`, `examples/`, `state/` | `guardrail:nx-monorepo` |
| `apps/flagship-foundry/` | component | new (path) | Same tree after `git mv` | `guardrail:nx-monorepo` |
| `README.md` (root) | contract (docs) | modify | Links `cd flagship-foundry-work` | — |
| `setup.sh` | contract (script) | modify | npm install paths | — |
| `.github/workflows/flagship-foundry-ci.yml` | contract (CI) | modify | `working-directory`, path filters | — |
| `.foundry/projects/flagship-foundry/current-task.json` | contract (continuity) | modify | `authority.contractAuthority`, paths in `nextCommandSet`, `artifacts` | `principle:artifact-authority` |
| `flagship-foundry-work/docs/**` | docs | modify | Hard-coded `flagship-foundry-work/` strings | — |
| `.cursor` / `.claude` references | docs | modify | Optional path updates to schemas | — |

**Blast-radius note** (`principle:blast-radius-before-build`): Grep for `flagship-foundry-work` after WO-NX-005; fix or document intentional exceptions (e.g. historical ADR absolute paths).

---

## Principle attachments (from `ontology/principle-catalog.json`)

| Principle | Work orders |
|-----------|-------------|
| **artifact-authority** | WO-NX-000, WO-NX-004, WO-NX-005 — Nx `project.json`, continuity `contractAuthority`, and docs must agree on canonical paths. |
| **blast-radius-before-build** | WO-NX-000, WO-NX-002 — Enumerate grep hits before move; rerun after move. |
| **approval-at-plan-boundary** | WO-NX-000 — Human sign-off on layout + package manager before large file moves. |
| **independent-verification** | WO-NX-006 — Verifier runs gates; not the same actor as implementer when using formal SDLC. |
| **continuity-is-mandatory** | WO-NX-005, WO-NX-006 — Update `current-task.json`, `nextCommandSet`, and handoff notes. |

*Scope-chunker template principles* (`complexity-budgets`, `contract-first`, `observed-vs-declared-truth`) are **not** in the current `principle-catalog.json`; use the rows above.

---

# Scope chunk summary

- **Total work orders**: 7 (WO-NX-000 … WO-NX-006)
- **Estimated phases**: architect lock → scaffold → relocate → wire workspaces → Nx targets → path/docs/CI → verify
- **Critical path**: WO-NX-000 → WO-NX-001 → WO-NX-002 → WO-NX-003 → WO-NX-004 → WO-NX-005 → WO-NX-006
- **Parallelizable**: WO-NX-005 can split: (5a) CI + root README + setup, (5b) Foundry-internal docs — same assignee recommended for merge order
- **Approval gates**: **WO-NX-000** (layout + pnpm)

---

## Work order sequence

1. **WO-NX-000**: Architecture lock — layout & package manager → @systems-architect (`strategic_reasoning`) — depends on: none — **Approval: yes**
2. **WO-NX-001**: Nx + pnpm scaffold at repo root → @builder (`deterministic_transformation`) — depends on: WO-NX-000
3. **WO-NX-002**: Move tree `flagship-foundry-work` → `apps/flagship-foundry` → @builder (`deterministic_transformation`) — depends on: WO-NX-001
4. **WO-NX-003**: Workspace / install graph (pnpm `packages` globs, nested `package.json` if needed) → @builder (`structured_generation`) — depends on: WO-NX-002
5. **WO-NX-004**: Nx `project.json`, tags, targets (`test`, `ci-targeted`, etc.) → @builder (`structured_generation`) — depends on: WO-NX-003
6. **WO-NX-005**: Update README, `setup.sh`, CI, continuity paths, high-signal doc strings → @builder (`deterministic_transformation`) — depends on: WO-NX-004
7. **WO-NX-006**: Independent verification → @verifier (`verification`) — depends on: WO-NX-005

---

## Work Order: WO-NX-000

- **Lifecycle stage**: architect (exit) / plan
- **Phase ID**: `nx-migration-architecture-lock`
- **Task class**: `strategic_reasoning`
- **Agent role**: systems-architect
- **Model tier**: `frontier_reasoner`
- **File scope**: None (decision record only). Optional: `docs/adr/adr-nx-root-and-flagship-app-path.md` if your process requires ADR.
- **Source artifacts**: `docs/intent/intent-nx-flagship-foundry-apps-2026-03-24.md`, `flagship-foundry-work/guardrails/nx-monorepo.json`
- **Constraints**: `guardrail:nx-monorepo`; `principle:approval-at-plan-boundary`
- **Acceptance criteria**:
  - [ ] **Decision A**: Single Nx application folder `apps/flagship-foundry` retaining internal `apps/` + `packages/` (recommended default) *or* explicit choice to flatten with rationale.
  - [ ] **Decision B**: Root package manager is **pnpm** with workspace definition *or* documented exception.
  - [ ] **Decision C**: CI continues to run Foundry tests from the new `working-directory` path.
- **Verification plan**: Human review + link decisions in WO-NX-001 PR description.
- **Rollback notes**: N/A (no code move yet).
- **Approval required**: **yes**

---

## Work Order: WO-NX-001

- **Lifecycle stage**: implement
- **Phase ID**: `nx-root-scaffold`
- **Task class**: `deterministic_transformation`
- **Agent role**: builder
- **Model tier**: `low_cost_executor`
- **File scope** (create/modify): `package.json` (root), `pnpm-workspace.yaml`, `nx.json`, `pnpm-lock.yaml` (generated), optional `.npmrc`, `tsconfig.base.json` (if Nx/plugin expects it), `.gitignore` updates for Nx cache
- **Source artifacts**: WO-NX-000 decisions, Nx docs (version aligned with org)
- **Constraints**: `guardrail:nx-monorepo`; workspace rules favor pnpm + Nx
- **Acceptance criteria**:
  - [ ] Root `pnpm install` succeeds.
  - [ ] `pnpm exec nx --version` (or `nx graph` / `nx show projects`) runs without error.
- **Verification plan**:
  - `pnpm install`
  - `pnpm exec nx report` or `pnpm exec nx graph --file=/tmp/graph.html` (non-interactive)
- **Rollback notes**: Revert scaffold commit; delete generated lockfile if abandoning pnpm.
- **Approval required**: no

---

## Work Order: WO-NX-002

- **Lifecycle stage**: implement
- **Phase ID**: `relocate-flagship-tree`
- **Task class**: `deterministic_transformation`
- **Agent role**: builder
- **Model tier**: `low_cost_executor`
- **File scope**: `git mv flagship-foundry-work apps/flagship-foundry` (exact name per WO-NX-000)
- **Source artifacts**: WO-NX-000
- **Constraints**: `principle:blast-radius-before-build` — capture `rg flagship-foundry-work` count before/after
- **Acceptance criteria**:
  - [ ] Old path `flagship-foundry-work/` no longer exists at repo root (except documented symlinks if any — default: none).
  - [ ] New path contains prior `package.json`, `apps/`, `packages/`, `examples/`, `state/`, `guardrails/`, `schemas/`, etc.
- **Verification plan**:
  - `test -d apps/flagship-foundry && ! test -d flagship-foundry-work`
  - `node apps/flagship-foundry/apps/orchestrator-cli/src/main.mjs --help` or `npm test` from `apps/flagship-foundry` if workspaces not yet wired
- **Rollback notes**: `git revert` or `git mv` back.
- **Approval required**: no (mechanical, post-WO-NX-000)

---

## Work Order: WO-NX-003

- **Lifecycle stage**: implement
- **Phase ID**: `pnpm-workspace-graph`
- **Task class**: `structured_generation`
- **Agent role**: builder
- **Model tier**: `low_cost_executor`
- **File scope**: Root `pnpm-workspace.yaml` / root `package.json` `workspaces`, any `package.json` adjustments under `apps/flagship-foundry` for workspace protocol
- **Source artifacts**: Prior Foundry `package.json` scripts; internal package names under `apps/flagship-foundry/packages/*`
- **Constraints**: `guardrail:nx-monorepo`
- **Acceptance criteria**:
  - [ ] Single `pnpm install` at root links Foundry internal packages as before (or documents new consumption pattern).
  - [ ] `pnpm --filter flagship-foundry...` or documented equivalent runs `test` from root without `cd` into nested app (optional but preferred).
- **Verification plan**:
  - `pnpm install` at root
  - `pnpm exec npm test` in `apps/flagship-foundry` **or** root script delegating to same
- **Rollback notes**: Revert workspace config; rely on nested `npm install` temporarily.
- **Approval required**: no

---

## Work Order: WO-NX-004

- **Lifecycle stage**: implement
- **Phase ID**: `nx-project-targets`
- **Task class**: `structured_generation`
- **Agent role**: builder
- **Model tier**: `low_cost_executor`
- **File scope**: `apps/flagship-foundry/project.json` (or `apps/flagship-foundry/apps/*/project.json` if split — default one project), root `nx.json` project registration if manual, tags per workspace architecture rules (e.g. `scope:foundry`, `type:app`)
- **Source artifacts**: `flagship-foundry-work/package.json` scripts → map to `nx` targets
- **Constraints**: `guardrail:nx-monorepo`; `principle:artifact-authority`
- **Acceptance criteria**:
  - [ ] `pnpm exec nx run flagship-foundry:test` (or chosen project name) runs Node test suite equivalent to prior `npm test`.
  - [ ] Target for visualize smoke exists mirroring `ci:targeted` (`npm run ci:targeted` behavior).
- **Verification plan**:
  - `pnpm exec nx run <project>:test`
  - `pnpm exec nx run <project>:ci-targeted` (name per implementation)
  - `pnpm exec nx affected -t test --base=main --head=HEAD` on a test branch with a touch inside Foundry
- **Rollback notes**: Remove `project.json`; use package scripts only.
- **Approval required**: no

---

## Work Order: WO-NX-005

- **Lifecycle stage**: implement
- **Phase ID**: `path-and-continuity-refresh`
- **Task class**: `deterministic_transformation`
- **Agent role**: builder
- **Model tier**: `low_cost_executor`
- **File scope**:
  - `README.md` (root)
  - `setup.sh`
  - `.github/workflows/flagship-foundry-ci.yml`
  - `.foundry/projects/flagship-foundry/current-task.json` — **`authority.contractAuthority`** → `apps/flagship-foundry/schemas/continuity-state.schema.json`; `nextCommandSet`, `artifacts`, `nextCommit.scope` path strings
  - Grep-driven updates: `.claude/CLAUDE.md`, `.foundry/agents/docs-release-agent.md`, `flagship-foundry-work` → `apps/flagship-foundry` in user-facing docs under new tree
  - `docs/intent/intent-nx-flagship-foundry-apps-2026-03-24.md` — add footnote “post-migration canonical path” if you keep historical wording
- **Source artifacts**: `rg flagship-foundry-work` (full repo)
- **Constraints**: `principle:continuity-is-mandatory`, `principle:artifact-authority`
- **Acceptance criteria**:
  - [ ] Intent AC: no stale root docs/scripts require obsolete path (or exceptions listed in README “Legacy paths”).
  - [ ] CI workflow paths and caches updated.
  - [ ] Continuity JSON validates against schema at **new** `contractAuthority` path.
- **Verification plan**:
  - `rg flagship-foundry-work` — only acceptable hits: git history, ADR archives, or explicit migration note
- **Rollback notes**: Revert doc/CI commit.
- **Approval required**: no

---

## Work Order: WO-NX-006

- **Lifecycle stage**: verify
- **Phase ID**: `nx-migration-verification`
- **Task class**: `verification`
- **Agent role**: verifier (independent from implementer when formal)
- **Model tier**: `balanced_reasoner`
- **File scope**: None (read-only validation); may append evidence file under `apps/flagship-foundry/` if your CI expects it
- **Source artifacts**: Full intent acceptance criteria; this work-order doc
- **Constraints**: `principle:independent-verification`; `guardrail:nx-monorepo` evidence: affected list + commands run
- **Acceptance criteria** (maps to intent):
  - [ ] Fresh-clone path: documented `pnpm install` + `pnpm exec nx --version` at root.
  - [ ] Obsolete path: `rg` gate per WO-NX-005.
  - [ ] Smoke: `nx` target or documented script runs `test` + one sample flow (`visualize:sample` or `cli --help` + one subcommand).
  - [ ] `nx affected` includes Foundry project when touching files under `apps/flagship-foundry`.
  - [ ] Lint/typecheck if added at root: green for migrated scope.
- **Verification plan** (example — adjust project names):
  - `pnpm install`
  - `pnpm exec nx run flagship-foundry:test`
  - `pnpm exec nx run flagship-foundry:ci-targeted`
  - `pnpm exec nx affected -t test --base=origin/main --head=HEAD`
  - Optional: `pnpm exec nx affected:lint` if configured
- **Rollback notes**: File issue; revert to pre-merge commit.
- **Approval required**: no

---

## First work order (ready to execute)

Use **WO-NX-000** in full above: record decisions **A/B/C**, then assign **WO-NX-001** to @builder.

---

## JSON work orders (machine-readable)

Valid instances of `agent-work-order.schema.json`:

```json
[
  {
    "id": "WO-NX-000",
    "projectId": "sdlc-workspace",
    "phase": "architect",
    "title": "Lock Nx layout and root package manager",
    "personaIds": ["nx-monorepo-cartographer", "ecosystem-orchestrator"],
    "commands": [],
    "acceptanceCriteria": [
      "Single-folder vs flatten decision recorded",
      "pnpm vs alternative documented",
      "CI working-directory strategy agreed"
    ],
    "status": "queued"
  },
  {
    "id": "WO-NX-001",
    "projectId": "sdlc-workspace",
    "phase": "implement",
    "title": "Scaffold Nx and pnpm at repository root",
    "personaIds": ["nx-monorepo-cartographer"],
    "commands": ["pnpm install", "pnpm exec nx report"],
    "acceptanceCriteria": [
      "Root pnpm install succeeds",
      "nx CLI available from root"
    ],
    "status": "queued"
  },
  {
    "id": "WO-NX-002",
    "projectId": "sdlc-workspace",
    "phase": "implement",
    "title": "Relocate flagship-foundry-work to apps/flagship-foundry",
    "personaIds": ["environment-migrator"],
    "commands": ["git mv flagship-foundry-work apps/flagship-foundry"],
    "acceptanceCriteria": [
      "New path contains full prior tree",
      "Old root path removed"
    ],
    "status": "queued"
  },
  {
    "id": "WO-NX-003",
    "projectId": "sdlc-workspace",
    "phase": "implement",
    "title": "Wire pnpm workspace for Flagship under apps/",
    "personaIds": ["nx-monorepo-cartographer"],
    "commands": ["pnpm install"],
    "acceptanceCriteria": [
      "Workspace links resolve from root",
      "Tests runnable from root or documented filter"
    ],
    "status": "queued"
  },
  {
    "id": "WO-NX-004",
    "projectId": "sdlc-workspace",
    "phase": "implement",
    "title": "Add Nx project.json and targets for Flagship",
    "personaIds": ["nx-monorepo-cartographer"],
    "commands": ["pnpm exec nx run flagship-foundry:test"],
    "acceptanceCriteria": [
      "nx test target matches prior npm test",
      "ci-targeted or equivalent target exists"
    ],
    "status": "queued"
  },
  {
    "id": "WO-NX-005",
    "projectId": "sdlc-workspace",
    "phase": "implement",
    "title": "Update CI, continuity, and path references",
    "personaIds": ["docs-release-agent", "environment-migrator"],
    "commands": ["rg flagship-foundry-work"],
    "acceptanceCriteria": [
      "CI paths updated",
      "current-task contractAuthority points to new schemas path",
      "No unintended stale path references"
    ],
    "status": "queued"
  },
  {
    "id": "WO-NX-006",
    "projectId": "sdlc-workspace",
    "phase": "verify",
    "title": "Independent verification of Nx migration",
    "personaIds": ["independent-verifier"],
    "commands": [
      "pnpm install",
      "pnpm exec nx affected -t test --base=origin/main --head=HEAD"
    ],
    "acceptanceCriteria": [
      "All intent acceptance criteria satisfied",
      "Evidence of commands captured for PR or ci-gate"
    ],
    "status": "queued"
  }
]
```

---

## Default recommendation (WO-NX-000 pre-filled)

Unless you override in WO-NX-000:

- **Layout**: `apps/flagship-foundry` as a **single** Nx project containing existing internal `apps/` and `packages/` (no flattening in this slice).
- **Package manager**: **pnpm** at repo root.
- **Nx project name**: `flagship-foundry` (matches `package.json` name inside the moved tree).
