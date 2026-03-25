# ADR-011a: `.foundry` SSOT Layout for Personas, Skills, and Agent Definitions

## Status
proposed

## Date
2026-03-23

## Context

ADR-011 established `.foundry/projects/<slug>/` as the canonical location for per-project continuity instances (`current-task.json`, `SDLC_CHARTER.md`). That ADR explicitly reserved future non-project subtrees under `.foundry/` but deferred decisions on three categories of Foundry-owned content:

1. **Personas** (13 structured JSON files currently in `flagship-foundry-work/personas/`): agent personality packs that define role, purpose, activation criteria, and guardrail/runbook bindings.
2. **Skills** (10 procedural markdown documents currently duplicated in `.cursor/skills/` and `.claude/skills/`): executable step-by-step procedures invoked by agents.
3. **Agent definitions** (8 markdown files currently duplicated in `.cursor/agents/` and `.claude/agents/`): role descriptions, phase bindings, forbidden behaviors, and output contracts for specialist agents.

Today, these three artifact types are fragmented:

- Personas live only in `flagship-foundry-work/personas/` and are not discoverable under `.foundry/`.
- Skills are fully duplicated across `.cursor/skills/<name>/SKILL.md` and `.claude/skills/<name>/SKILL.md`. The bodies are nearly identical; differences are limited to path references (e.g., `flagship-foundry/` vs `foundry/flagship-foundry-work/`) and frontmatter fields specific to each tool (Cursor uses `model:` for routing; Claude Code uses `effort:`).
- Agent definitions are duplicated across `.cursor/agents/<name>.md` and `.claude/agents/<name>.md`. The `.claude/` versions are consistently more detailed (fuller quality gate descriptions, more skills listed, architectural principles enumerated). The `.cursor/` versions are condensed and route to different model identifiers (`composer-2-fast`, `gpt-5.4-medium`).

This duplication violates the **artifact-authority** principle: there is no single canonical text for Foundry-owned behavioral content. Drift has already occurred in path references across the two environments.

Three open questions require resolution before implementation (wo-003) can proceed:

1. Should personas live at `.foundry/personas/` (flat, repo-wide) or `.foundry/projects/<slug>/personas/` (per-project scoped)?
2. Should skills use `.foundry/skills/<name>/SKILL.md` (directory-per-skill mirroring existing structure) or a manifest-generated stub approach?
3. What is the dual-read window duration and logging strategy for the `.codex/` fallback path?

## Options Considered

### Question 1: Persona Subpath

#### Option 1A: Flat repo-wide — `.foundry/personas/<id>.json`

**Description**: All 13 persona JSON files live directly under `.foundry/personas/`. The `$schema` ref updates to point to the Foundry schema location. No project-slug segmentation.

**Pros**:
- Personas are inherently cross-cutting: `persona:ecosystem-orchestrator` and `persona:independent-verifier` apply to any project in the monorepo.
- Matches the existing flat structure under `flagship-foundry-work/personas/`.
- Simpler discovery contract: glob `.foundry/personas/*.json`, validate against `persona-pack.schema.json`.
- Avoids premature nesting per ADR-011's ontology discipline ("avoid deep trees until there is a concrete consumer").

**Cons**:
- If a future project needs a project-scoped persona override, there is no namespace for it at this level.
- All personas are visible to all projects, which may be noise for single-project use.

#### Option 1B: Per-project scoped — `.foundry/projects/<slug>/personas/<id>.json`

**Description**: Personas are nested under each project's directory.

**Pros**:
- Supports project-specific persona sets.
- Keeps all project-related configuration in one tree.

**Cons**:
- Requires duplicating persona files across projects in a monorepo, contradicting SSOT.
- All 13 current personas are repo-wide (none reference a specific project slug).
- Creates deep nesting: `.foundry/projects/flagship-foundry/personas/ecosystem-orchestrator.json` is unwieldy.
- No current consumer needs project-scoped personas.

### Question 2: Skills Format

#### Option 2A: Directory-per-skill — `.foundry/skills/<name>/SKILL.md`

**Description**: Mirror the existing `.cursor/skills/<name>/SKILL.md` directory structure. Each skill is a directory containing at minimum a `SKILL.md` file; additional assets (templates, examples) may be co-located.

**Pros**:
- Familiar structure; both Cursor and Claude Code already use this layout.
- Allows co-location of auxiliary files per skill (e.g., a template or schema used by the skill).
- No tooling changes needed to the skill loading path beyond updating the base directory.
- Human-readable; discoverable with `ls .foundry/skills/`.

**Cons**:
- 10 directories is modestly verbose at the filesystem level.
- Environment-specific frontmatter (model routing, tool-specific keys) must be handled by the overlay, not the base file.

#### Option 2B: Manifest-generated stubs

**Description**: A single `.foundry/skills/manifest.json` defines skill metadata. At build or init time, a generator produces stub files in `.cursor/skills/` and `.claude/skills/` from the manifest plus the canonical SKILL.md body.

**Pros**:
- Single manifest as the registry; enforces consistency by construction.
- Environment-specific frontmatter is templated from the manifest.

**Cons**:
- Requires implementing and maintaining a generator tool.
- Generated files are harder to review in git diffs (are they stale? regenerated?).
- Adds a build step dependency; skill content is not immediately readable without running the generator.
- No existing consumer for this manifest pattern; premature tooling per ontology discipline.

### Question 3: Dual-Read Window

#### Option 3A: 30-day dual-read with structured logging

**Description**: After `.foundry/` paths are canonical, `continuity.mjs` and the import pipeline try `.foundry/projects/<slug>/current-task.json` first. On miss, fall back to `.codex/projects/<slug>/current-task.json` with a `WARN`-level log message including the legacy path. After 30 calendar days from the merge date of the migration commit, the fallback path is removed in a follow-up commit.

**Pros**:
- Bounded window prevents indefinite technical debt.
- 30 days covers typical sprint and release cycles.
- Structured logging makes fallback usage observable and auditable.

**Cons**:
- Requires a follow-up cleanup commit (low cost).
- 30 days may be too long for a fast-moving team or too short for teams with slower release cadences.

#### Option 3B: No dual-read; hard cutover with symlinks

**Description**: Create symlinks from `.codex/projects/<slug>/current-task.json` to `.foundry/projects/<slug>/current-task.json`. No code-level fallback.

**Pros**:
- Simplest code path; no conditional reads.

**Cons**:
- Symlinks have cross-platform issues (Windows Git default does not follow symlinks).
- If a tool resolves symlinks differently, it may write to the wrong location.
- No observability of which path was accessed.

## Decision

### Question 1: Personas at `.foundry/personas/<id>.json` (flat, repo-wide) — Option 1A

Personas are cross-cutting by nature. All 13 existing personas define Foundry-wide agent roles (ecosystem-orchestrator, independent-verifier, chrome-extension-mv3-sme, etc.) with no project-specific binding. Nesting them under `projects/<slug>/` would either require duplication across projects (violating SSOT) or an arbitrary choice of which project "owns" them. The flat layout is simpler, matches the existing structure, and follows ADR-011's guidance to avoid deep trees until a concrete consumer demands them.

If project-scoped persona overrides are needed in the future, the convention `.foundry/projects/<slug>/persona-overrides/<id>.json` can be introduced as an additive extension without breaking the base layout.

### Question 2: Skills as `.foundry/skills/<name>/SKILL.md` (directory-per-skill) — Option 2A

The directory-per-skill layout mirrors what both Cursor and Claude Code already consume. It requires no new tooling, keeps content human-readable and git-reviewable, and allows co-location of per-skill auxiliary files. The manifest-generated approach (Option 2B) would introduce a build step and a new tool with no current consumer -- premature per ontology discipline.

The canonical `SKILL.md` in `.foundry/skills/<name>/` contains the **environment-neutral procedure body** only. Environment-specific frontmatter (model routing, tool-specific keys like Cursor's `model:` or Claude Code's `effort:`) belongs exclusively in the overlay files under `.cursor/skills/<name>/` or `.claude/skills/<name>/`.

### Question 3: 30-day dual-read with structured logging — Option 3A

The dual-read window provides a safe migration path without cross-platform symlink concerns. The 30-day window is long enough to cover typical sprint cycles and short enough to avoid indefinite technical debt. Structured `WARN`-level logging makes fallback usage observable so the team knows when the window can be closed early or must be extended.

The dual-read applies only to **continuity instance paths** (project charters and `current-task.json`). Persona and skill paths do not need dual-read because they are being consolidated from `flagship-foundry-work/personas/` (not `.codex/`) and the environment overlay stubs will be updated in the same migration pass.

## Normative Layout

After this decision, the canonical `.foundry/` tree is:

```
.foundry/
  README.md                              # Layout guide and discovery contract
  schemas/                               # Foundry-owned schemas (task-state, etc.)
    task-state.schema.json
  projects/                              # Per-project continuity instances
    <slug>/
      current-task.json                  # Runtime continuity (ADR-011)
      SDLC_CHARTER.md                    # Human-readable charter (ADR-011)
  personas/                              # Repo-wide persona packs (NEW)
    <id>.json                            # e.g., ecosystem-orchestrator.json
  skills/                                # Foundry-owned skill procedures (NEW)
    <name>/
      SKILL.md                           # Canonical procedure body (env-neutral)
  agents/                                # Foundry-owned agent definitions (NEW)
    <name>.md                            # Canonical role definition (env-neutral)
```

### Reserved (do not create until a feature needs them)
- `.foundry/cache/`
- `.foundry/templates/`
- `.foundry/projects/<slug>/persona-overrides/`

## Inheritance Model

The inheritance model follows a **base + overlay** pattern:

```
 .foundry/                        <-- BASE (canonical, Foundry-owned)
   agents/<name>.md                    Full role definition, phase bindings,
   skills/<name>/SKILL.md              forbidden behaviors, output contracts,
   personas/<id>.json                  procedure steps (environment-neutral)

 .cursor/                         <-- OVERLAY (Cursor-specific adapter)
   agents/<name>.md                    Frontmatter: model routing (e.g., composer-2-fast)
   skills/<name>/SKILL.md              + import/include of .foundry base content
                                       + Cursor-specific tool integrations

 .claude/                         <-- OVERLAY (Claude Code-specific adapter)
   agents/<name>.md                    Frontmatter: model routing (e.g., opus)
   skills/<name>/SKILL.md              + import/include of .foundry base content
                                       + Claude Code-specific tool integrations
```

**Rules:**
1. The `.foundry/` copy is the **single source of truth** for Foundry-behavioral content.
2. Overlay files in `.cursor/` and `.claude/` **must not duplicate** the canonical procedure body. They contain only: (a) tool-specific frontmatter, (b) a reference to the `.foundry/` base file, and (c) environment-specific extensions (e.g., tool-specific invocation syntax).
3. If an overlay file exists without a corresponding `.foundry/` base, it is a **tool-specific-only** artifact (not Foundry-owned) and is not subject to this ADR.
4. Persona JSON files have no overlay mechanism; they are consumed directly from `.foundry/personas/` by all environments.

## Dual-Read Migration Strategy

**Scope**: Continuity instance paths only (`current-task.json`, `SDLC_CHARTER.md`).

**Mechanism**:
1. `continuity.mjs` resolves project state by trying `.foundry/projects/<slug>/current-task.json` first.
2. On file-not-found, fall back to `.codex/projects/<slug>/current-task.json`.
3. On fallback hit, emit a structured warning:
   ```
   WARN [continuity] Legacy path used: .codex/projects/<slug>/current-task.json
     Migrate to: .foundry/projects/<slug>/current-task.json
     Deprecation window closes: <merge-date + 30 days>
   ```
4. The fallback code path is removed in a follow-up commit after 30 calendar days from the migration merge date. The removal date is tracked as a comment in the source and as a `derivedMirrors` entry in the continuity instance.

**Not in scope for dual-read**: Personas (moving from `flagship-foundry-work/personas/`, not `.codex/`) and skills (overlay stubs updated in the same pass as the base files are created).

## Consequences

### Positive
- Single canonical text for all 13 personas, 10 skills, and 8 agent definitions eliminates drift.
- New environment integrations (e.g., a future Windsurf or VS Code agent) inherit Foundry behavior by reading `.foundry/` without copying content.
- Flat persona layout keeps paths short and discovery simple.
- Directory-per-skill preserves familiar structure and requires no new build tooling.
- 30-day dual-read provides a safe, observable migration with a hard deadline.

### Negative
- Overlay files in `.cursor/` and `.claude/` must be refactored from full copies to thin wrappers (one-time cost, bounded to wo-004).
- Developers must know to edit `.foundry/` for canonical content, not the overlay -- requires team communication.
- The 30-day window adds temporary code complexity in `continuity.mjs` (removed after window closes).

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Developers edit overlay instead of base, causing drift | Medium | CI lint rule: overlay files must not contain canonical body text (can be a grep-based check). Document in `.foundry/README.md`. |
| Dual-read window expires before all consumers migrate | Low | The 30-day window can be extended with a documented justification commit. Logging makes usage observable. |
| `.foundry/personas/` is too flat for future multi-tenancy | Low | Reserved `projects/<slug>/persona-overrides/` provides an escape hatch without restructuring. |
| Environment tooling cannot resolve `@import` or `@include` from overlay to base | Medium | Overlay mechanism is tool-specific (Cursor uses `@file` references; Claude Code uses inline includes). Each adapter documents its own resolution strategy. If includes are not supported, the overlay contains a brief pointer comment and the full procedure is loaded at runtime from `.foundry/`. |

## References

- `flagship-foundry-work/docs/adr/adr-011-foundry-directory-layout-and-continuity-instance.md`
- `flagship-foundry-work/docs/adr/adr-002-continuity-schema-authority-and-bootstrap.md`
- `flagship-foundry-work/docs/intent/intent-foundry-dot-foundry-ssot-charters-personas-skills-2026-03-23.md`
- `flagship-foundry-work/docs/intent/scope-chunk-foundry-dot-foundry-ssot-charters-personas-skills-2026-03-23.md`
- `flagship-foundry-work/schemas/persona-pack.schema.json`
- `flagship-foundry-work/schemas/continuity-state.schema.json`
- `flagship-foundry-work/packages/core/src/continuity.mjs`
