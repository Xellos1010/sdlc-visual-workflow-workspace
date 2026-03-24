# Scope Chunk: `.foundry` SSOT for Charters, Personas, and Skills

**Date:** 2026-03-23  
**Source intent:** `intent-foundry-dot-foundry-ssot-charters-personas-skills-2026-03-23.md`  
**DoR note:** Intent packet lists **pending** decisions on exact `.foundry/` subpaths for personas/skills and stub vs symlink strategy. **Do not start destructive moves** until those are resolved (or implement behind a feature flag / dual-read only).

---

## Impacted Node Inventory

| Node ID | Node Type | Change Type | Contracts | Guardrail Packs |
|---------|-----------|-------------|-----------|-----------------|
| `.foundry` tree | filesystem | modify/extend | ADR-011, README | workspace-governance |
| `continuity-state.schema.json` / authority | contract | possible modify | ADR-002 | workspace-governance |
| `continuity.mjs`, import pipeline | component | modify | continuity schema | nx-monorepo |
| `.cursor/rules`, `.cursor/agents`, `.cursor/skills` | adapter | modify | handoff docs | terminal-agent-adapters |
| Flagship control plane / server | component | modify | path config | workspace-governance |
| Tests | verification | modify | — | — |

---

## Work Order: wo-001-layout-and-adr

- **Lifecycle Stage:** architect / plan
- **Phase ID:** `foundry-ssot-layout`
- **Task Class:** `constraint_interpretation`
- **Agent Role:** systems-architect
- **Model Tier:** frontier_reasoner
- **File Scope:** New or updated ADR addendum; `.foundry/README.md` (replace stale Codex-only copy); optional `flagship-foundry-work/docs/guides/*` pointer
- **Source Artifacts:** Intent packet, ADR-011
- **Constraints:** workspace-governance; no secrets in `.foundry/`
- **Acceptance Criteria:**
  - [ ] Normative subpaths for personas and skills under `.foundry/` are documented
  - [ ] Inheritance model (base vs overlay) is explicit
- **Verification Plan:** Doc review; no code gate
- **Rollback Notes:** Revert README/ADR commit
- **Approval Required:** yes (layout affects all agents)

---

## Work Order: wo-002-schema-and-authority

- **Lifecycle Stage:** implement
- **Phase ID:** `foundry-ssot-schema`
- **Task Class:** `structured_generation`
- **Agent Role:** builder
- **Model Tier:** low_cost_executor
- **File Scope:** `flagship-foundry-work/schemas/continuity-state.schema.json` (if authority patterns need extension); `packages/core/src/continuity.mjs`; tests under `flagship-foundry-work/tests/`
- **Source Artifacts:** ADR-002, ADR-011, intent packet
- **Constraints:** artifact-authority; observed-vs-declared-truth for instance vs import
- **Acceptance Criteria:**
  - [ ] Validation accepts documented `.foundry` paths for persona/skill references if added to continuity
- **Verification Plan:** `node` / `pnpm` tests for `flagship-foundry-work` core package (per project `package.json`)
- **Rollback Notes:** Revert schema + continuity loader
- **Approval Required:** yes if schema is breaking

---

## Work Order: wo-003-migrate-personas-skills

- **Lifecycle Stage:** implement
- **Phase ID:** `foundry-ssot-content`
- **Task Class:** `deterministic_transformation`
- **Agent Role:** builder
- **Model Tier:** low_cost_executor
- **File Scope:** Move or copy `flagship-foundry-work/personas/**` → `.foundry/...` (exact target from wo-001); skills: Foundry-owned skills from `.cursor/skills/` / `.claude/skills/` → `.foundry/...`; update references
- **Constraints:** terminal-agent-adapters (forwarding stubs); no duplicate canonical text
- **Acceptance Criteria:**
  - [ ] Single canonical copy per Foundry persona/skill
  - [ ] Legacy paths either removed or forward to `.foundry/` per rollback plan
- **Verification Plan:** Grep for broken paths; run targeted tests
- **Rollback Notes:** Restore stubs pointing to `.foundry/`
- **Approval Required:** yes (high blast radius)

---

## Work Order: wo-004-agent-adapters

- **Lifecycle Stage:** implement
- **Phase ID:** `foundry-ssot-adapters`
- **Task Class:** `deterministic_transformation`
- **Agent Role:** builder
- **Model Tier:** low_cost_executor
- **File Scope:** `.cursor/rules/**` (only lines referencing Foundry paths); `.cursor/agents/*` if needed; `.claude/` mirror if repo uses it
- **Constraints:** terminal-agent-adapters
- **Acceptance Criteria:**
  - [ ] Cursor/Claude agents document inheritance from `.foundry/`
- **Verification Plan:** Manual smoke: agent loads without missing file errors
- **Rollback Notes:** Restore previous rule text
- **Approval Required:** no

---

## Work Order: wo-005-flagship-discovery

- **Lifecycle Stage:** implement
- **Phase ID:** `foundry-ssot-control-plane`
- **Task Class:** `deterministic_transformation`
- **Agent Role:** builder
- **Model Tier:** low_cost_executor
- **File Scope:** `flagship-foundry-work/apps/control-plane/src/server.mjs` (or relevant modules); import pipeline if indexing `.foundry`
- **Constraints:** workspace-governance
- **Acceptance Criteria:**
  - [ ] Control plane discovers `.foundry` project state and new persona/skill roots if in scope
- **Verification Plan:** Unit/integration tests for path resolution
- **Rollback Notes:** Feature flag or config flag to old paths
- **Approval Required:** no

---

## Work Order: wo-006-verify

- **Lifecycle Stage:** verify
- **Phase ID:** `foundry-ssot-verify`
- **Task Class:** `verification`
- **Agent Role:** verifier
- **Model Tier:** balanced_reasoner
- **File Scope:** Evidence bundle only (tests + grep + import report)
- **Acceptance Criteria:** All intent acceptance criteria checked
- **Verification Plan:** Run full `nextCommandSet` from `current-task.json` when available; else Nx affected as per orchestrator rule
- **Rollback Notes:** N/A
- **Approval Required:** no

---

## Scope Chunk Summary

- **Total Work Orders:** 6
- **Estimated Phases:** layout decision (wo-001) → schema + continuity (wo-002) → content migration (wo-003) → adapters (wo-004) → control plane (wo-005) → verify (wo-006)
- **Critical Path:** wo-001 → wo-002 → wo-003 → wo-006 (wo-004/005 can parallelize after wo-001)

---

## Principle Card Attachments

- **artifact-authority:** wo-0003, wo-004 (no duplicated canonical prose)
- **blast-radius-before-build:** wo-001 (inventory before moves)
- **continuity-is-mandatory:** wo-002 (phase transitions update state)

---

## Open Questions (blockers for wo-003)

1. **Subpaths:** e.g. `.foundry/personas/*.json` vs `.foundry/projects/<slug>/personas/*.json`
2. **Skills format:** single tree `.foundry/skills/<name>/SKILL.md` vs manifest-generated stubs
3. **Dual-read window:** duration and logging for `.codex` fallback
