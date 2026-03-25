# Plan Handoff: `.foundry` SSOT — Agents, Skills, Personas (post–M4 operate)

## Generated

- **Date**: 2026-03-23
- **Agent**: orchestrator (handoff-generator protocol)
- **Lifecycle Stage**: `operate` (continuity); next slice is **`improve` / greenfield migration** for SSOT (not yet reflected in `current-task.json`)
- **Phase ID**: `operate-m4-complete` (continuity) → proposed next: `foundry-ssot-layout` (see scope chunk)

## Summary

M1–M4 Flagship Foundry gap-closure is **complete**; continuity **authority** is under **`.foundry/projects/flagship-foundry/`** per **ADR-011**. The active program thread for the **next session** is **consolidating** root charter, duplicated **skills** and **agents** (`.cursor` / `.claude` / `.codex`), and **personas** into **`.foundry/`** as the single editable source of truth, with **thin adapters** in each CLI so improvements **waterfall** downstream. Intent and work-order decomposition already exist; **editorial merge** is required because copies **diverge** across environments.

## Evidence References

| Claim | Evidence | Path |
|-------|----------|------|
| Continuity instance is `.foundry` | `runtimeInstanceAuthority` + phase notes | `.foundry/projects/flagship-foundry/current-task.json` |
| M4 + ADR-011 done criteria met | `doneCriteria`, `artifacts` | same file |
| SSOT migration intent defined | Intent packet | `flagship-foundry-work/docs/intent/intent-foundry-dot-foundry-ssot-charters-personas-skills-2026-03-23.md` |
| Work orders sequenced | Scope chunk (wo-001 … wo-006) | `flagship-foundry-work/docs/intent/scope-chunk-foundry-dot-foundry-ssot-charters-personas-skills-2026-03-23.md` |
| `.foundry` layout normative | ADR | `flagship-foundry-work/docs/adr/adr-011-foundry-directory-layout-and-continuity-instance.md` |
| Triplicated skills/agents; diffs exist | Systems-architect evaluation | Conversation / grep: `.cursor` vs `.claude` `SKILL.md` and `orchestrator.md` differ |
| Personas today live under app tree | Persona packs | `flagship-foundry-work/personas/*.json` |

## Continuity State Snapshot

Source: `.foundry/projects/flagship-foundry/current-task.json` (as of handoff generation).

- **Active Branch**: `main`
- **Current Phase**: `operate-m4-complete` / **done**
- **Next Commit**: `main` — *(empty message in continuity; set when SSOT work starts)*
- **Next Command Set** (run on Flagship changes):

  ```bash
  cd flagship-foundry-work && npm test
  cd flagship-foundry-work && npm run ci:targeted
  ```

- **Blocked By**: none listed
- **Done Criteria** (program-level, already satisfied for M4):

  - [x] M1–M4 work orders delivered per `MILESTONE_CHAINED_EXECUTION_PLAN.md`
  - [x] ADR-009 and ADR-010 accepted with implementation/docs in repo
  - [x] ADR-011 accepted; continuity under `.foundry/projects/`

**Note:** When SSOT migration **starts**, update continuity to a new `currentPhase` (for example `foundry-ssot-layout` / `in_progress`) and set `nextCommandSet` to match the verifier plan for touched packages.

## Supporting Files for Context Recovery

Load these to reconstruct full context:

- [ ] `.foundry/projects/flagship-foundry/current-task.json` — machine-readable state
- [ ] `.foundry/projects/flagship-foundry/SDLC_CHARTER.md` — project charter (inherits root charter today)
- [ ] `.claude/CHARTER.md` — current root doctrine (candidate to move under `.foundry/`)
- [ ] `flagship-foundry-work/docs/intent/intent-foundry-dot-foundry-ssot-charters-personas-skills-2026-03-23.md` — acceptance criteria and rollback
- [ ] `flagship-foundry-work/docs/intent/scope-chunk-foundry-dot-foundry-ssot-charters-personas-skills-2026-03-23.md` — wo-001 … wo-006
- [ ] `flagship-foundry-work/docs/adr/adr-011-foundry-directory-layout-and-continuity-instance.md` — `.foundry/projects/` contract
- [ ] `flagship-foundry-work/personas/environment-migrator.json` — next persona pack
- [ ] `.cursor/skills/handoff-generator/templates/PLAN_HANDOFF_TEMPLATE.md` — template used for this document

## Open Questions and Blockers

- **Layout:** Exact `.foundry/` subpaths for **personas** and **skills** (repo-wide vs per `projects/<slug>/`).
- **Skills transport:** Full files under `.foundry/skills/` vs manifest + generated stubs per CLI.
- **Schema:** Reconcile **`.foundry/schemas/task-state.schema.json`** vs **`.codex/schemas/task-state.schema.json`** and relationship to **`flagship-foundry-work/schemas/continuity-state.schema.json`** so only **one** normative lifecycle contract is edited.
- **Triplication:** Skills and agents **differ** across `.cursor` / `.claude` / `.codex` — **merge** before deleting bodies.

## Rollback Notes

- Keep **dual-read** or forwarding stubs until all references point at `.foundry/` (see intent packet rollback).
- Revert SSOT commits with `git revert` / branch reset; continuity JSON schema unchanged if only paths and file moves roll back.
- Do **not** delete `.cursor/rules/**` — out of scope; only Foundry agent/skill/persona/charter surfaces move.

## Next Steps (ordered)

1. **Approve layout** (ADR addendum or short README under `.foundry/`) — **wo-001** in scope chunk.
2. **Three-way merge** of representative skills and agents (`define-intent`, `orchestrator`) to establish canonical text in **`.foundry/`**.
3. **Replace** duplicate bodies with **thin wrappers** in `.cursor`, `.claude`, `.codex` per `guardrail:terminal-agent-adapters`.
4. **Move personas** from `flagship-foundry-work/personas/` to agreed `.foundry/` path; update control plane / catalogs.
5. **Update** `.claude/CLAUDE.md`, `.foundry/README.md`, and rules that still cite `.codex/projects/` for Foundry authority.
6. Run **`npm test`** and **`npm run ci:targeted`** from `flagship-foundry-work`; update `current-task.json` phase and evidence paths.

---

## Next persona to execute: Environment Migrator

**Persona id:** `persona:environment-migrator`  
**Definition:** `flagship-foundry-work/personas/environment-migrator.json`

| Field | Value |
|--------|--------|
| **Purpose** | Keep Cursor, Codex, Claude Code, and MCP configuration aligned to the same project intent. |
| **Activation** | Environment scaffold; **tool migration**; parity audit. |
| **Guardrails** | `guardrail:terminal-agent-adapters` — adapters stay thin; no duplicated canonical prose outside `.foundry/`. |

### Instructions for the executing agent (copy-paste)

1. **Read** the intent packet and scope chunk (links in Supporting Files above). **Do not** bulk-delete `.cursor/skills` until canonical files exist under `.foundry/` and wrappers are in place.
2. **Resolve open layout questions** (or document provisional paths in a short ADR addendum under `flagship-foundry-work/docs/adr/`): e.g. `.foundry/skills/<name>/SKILL.md`, `.foundry/agents/<role>.md`, `.foundry/personas/*.json`, root `.foundry/CHARTER.md`.
3. **Diff** `.cursor`, `.claude`, and `.codex` copies of **at least** `skills/define-intent/SKILL.md` and `agents/orchestrator.md`; **merge** into `.foundry/` versions; record merge rationale in the ADR addendum or PR description.
4. **Add thin wrappers** in each CLI tree that only point to `.foundry/` (relative paths from each wrapper to repo root).
5. **Update** `flagship-foundry-work` references (personas path, control plane path resolution if any) and run `cd flagship-foundry-work && npm test && npm run ci:targeted`.
6. **Update continuity** in `.foundry/projects/flagship-foundry/current-task.json`: new `currentPhase` for SSOT work, `artifacts` listing new ADR + evidence paths, refreshed `nextCommandSet` if needed.
7. **Hand off to `@verifier`** when acceptance criteria in the intent packet are testable (grep for stale paths, CI green).

### Prompt starter for the next session

```text
You are operating as persona:environment-migrator (see flagship-foundry-work/personas/environment-migrator.json).
Execute wo-001 through wo-004 from flagship-foundry-work/docs/intent/scope-chunk-foundry-dot-foundry-ssot-charters-personas-skills-2026-03-23.md.
Canonical content goes under .foundry/; .cursor/.claude/.codex get thin wrappers only.
Update .foundry/projects/flagship-foundry/current-task.json when phase or evidence changes.
```

---

## Optional follow-on personas

| After | Persona / agent | Why |
|-------|------------------|-----|
| Implementation complete | `@verifier` | Independent path + CI verification |
| Docs + continuity packaging | `@docs-release-agent` | Release notes, continuity polish |
| Contract/schema decisions | `@systems-architect` | If `continuity-state` vs `task-state` split needs ADR change |
