# Commit history overview (template)

**Purpose:** After squashing git history to a single public commit, preserve a human-readable record of what the old history contained **without** pasting secrets, tokens, or private customer identifiers.

## How to use

1. Fill in each section below while you still have access to the pre-squash log (or export `git log --oneline` to a local file that you do **not** commit if it contains sensitive titles).
2. Store the completed overview in your release bundle, internal wiki, or commit a **redacted** version here.
3. Remove or redact any line that references internal hostnames, credentials, or customer names.

---

## Release snapshot

| Field | Value |
|--------|--------|
| Public release tag or date | |
| Single-commit SHA (after squash) | |
| Default branch | |

## Major themes (pre-squash era)

Bullet list of 5–15 themes (features, refactors, migrations). Example:

- Import pipeline and graph store for Flagship Foundry
- Control-plane auth model (ADR-006)
- Cursor companion operator surface

## Notable ADRs or decisions

Link or list ADR IDs only (no internal ticket URLs unless public):

-

## Areas of the tree touched most often

Optional: high-level directories (`apps/flagship-foundry/`, `.cursor/rules/`, …).

## Verification that was run before squash

-

## Explicit exclusions (never public)

List categories only (do not paste values):

- Production API endpoints or keys
- Personal machine paths
- Customer-specific project names (unless already public)

## Sign-off

| Role | Name | Date |
|------|------|------|
| Prepared by | | |
