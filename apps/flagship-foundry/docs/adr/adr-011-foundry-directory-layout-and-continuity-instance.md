# ADR-011: `.foundry` Directory Layout and Continuity Instance Location

## Status
accepted

## Date
2026-03-23

## Context

ADR-002 established **Option C**: the continuity **contract** lives in `flagship-foundry-work/schemas/continuity-state.schema.json`, while the **runtime instance** was pinned to **`.codex/projects/<project>/current-task.json`**.

Operators and multi-agent workflows need a **vendor-neutral** root for Foundry-owned continuity so project state is not implied to be **Codex-specific**. The schema currently **restricts** `authority.runtimeInstanceAuthority` to a `.codex/...` pattern, which blocks moving the instance without a contract change.

Forces:

- **ADR-002** split (contract vs instance) must remain; only the **instance path** and **on-disk layout** change.
- **Simplicity**: avoid deep trees under `.foundry/` until there is a concrete consumer (per ontology discipline).
- **Migration**: existing repos may already have `.codex/projects/**`; need a clear story without silent data loss (**ADR-004** alignment for projections/overwrites).
- **Import pipeline** (`import-pipeline.mjs`) treats `.codex/` as high-signal workspace content; Foundry metadata under `.foundry/` should be **discoverable** without conflating with Codex app config.

## Options Considered

### Option A: Single file at repo root (`.foundry/current-task.json`)

**Description**: One continuity file for the whole repository.

**Pros**: Minimal path depth; trivial to document.

**Cons**: Does not scale to **multiple Foundry projects** in one monorepo; conflicts with `init-project <name>` today, which is **per project name**.

### Option B: Flat `.foundry/<slug>/` without a `projects/` segment

**Description**: Paths like `.foundry/my-app/current-task.json`.

**Pros**: Shorter paths.

**Cons**: Mixes “registry of projects” with future top-level folders (templates, cache); harder to reserve **namespaces** for non-project artifacts.

### Option C: Namespace layout — `.foundry/projects/<slug>/` as canonical (recommended)

**Description**:

- **Canonical continuity instance**: `.foundry/projects/<projectSlug>/current-task.json`
- **Charter** (same as today): `.foundry/projects/<projectSlug>/SDLC_CHARTER.md`
- **Schema pattern** for `authority.runtimeInstanceAuthority`: `^\.foundry/projects/[^/]+/current-task\.json$`
- **Optional** (human-only, not validated by continuity schema in v1): `.foundry/README.md` explaining the folder—operators may commit or gitignore it.
- **Explicitly out of scope for v1** (reserved names; do not create by default): `.foundry/cache/`, `.foundry/templates/` — add only when a feature needs them.

**Pros**: Aligns with existing **per-project** continuity semantics; clear separation between **project instances** and future **shared** folders; matches intent packet diagrams; keeps blast radius of migrations bounded to `projects/`.

**Cons**: Slightly longer paths; requires one-time migration from `.codex/projects/`.

## Decision

Choose **Option C**.

- The **runtime instance authority** for Flagship Foundry continuity is **`.foundry/projects/<project>/current-task.json`** (repo-relative POSIX path string in JSON).
- **ADR-002 Option C** remains in force: **contract authority** stays the Foundry schema; **instance authority** is updated from `.codex/...` to `.foundry/...` as defined here.
- **Legacy `.codex/projects/`** may remain on disk for **other tools**; Foundry runtime reads/writes **`.foundry/projects/`** after implementation. **Migration** is documented separately (copy, symlink, or dual-write during transition)—not part of this ADR’s normative layout.
- **`derivedMirrors`** in `current-task.json` may list former `.codex/projects/.../current-task.json` paths during migration for audit only; mirrors are **non-authoritative** per ADR-002.

## Consequences

### Positive

- Continuity location is **branded and agent-agnostic**.
- Clear place for **multiple projects** in one repo.
- Room for future **non-project** subtrees under `.foundry/` without colliding with project slugs.

### Negative

- Requires coordinated updates: **schema pattern**, **`continuity.mjs`**, **tests**, **cursor rules** referencing `.codex/projects/**/current-task.json`, and any **bootstrap** docs.
- Teams must run a **one-time migration** or accept parallel folders during cutover.

### Risks

- Stale automation referencing `.codex` for Foundry continuity causes **split-brain** if not updated in one pass.
- Accidental commit of **secrets** into `.foundry/` — mitigate with `.gitignore` guidance for local-only files (charters and task JSON should be reviewable; env secrets should not appear).

## References

- `flagship-foundry-work/docs/adr/adr-002-continuity-schema-authority-and-bootstrap.md`
- `flagship-foundry-work/schemas/continuity-state.schema.json`
- `flagship-foundry-work/packages/core/src/continuity.mjs`
- `flagship-foundry-work/docs/intent/intent-foundry-dot-foundry-ecosystem-init-2026-03-23.md`
