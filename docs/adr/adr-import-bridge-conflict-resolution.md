# ADR: Import Bridge Manual Conflict Resolution

**Status**: accepted
**Date**: 2026-03-31
**Work order**: WO-IB-010

## Context

Importing external artifacts into Foundry risks overwriting existing ADRs, schemas, staged documents, and continuity state. The intent packet locked manual diff comparison and operator-controlled merge as the conflict strategy.

## Options

1. Overwrite existing files automatically.
2. Abort on every conflict with no merge help.
3. Detect conflicts, show diffs, and let the operator choose per artifact.

## Decision

Choose option 3. The bridge now detects conflicting targets before commit, emits unified diffs, computes field-level differences for continuity JSON, and supports three decisions: `accept-incoming`, `keep-existing`, and `manual-merge`.

The current operator surface is CLI-first. Conflict decisions are passed as explicit `--decision <target>=<mode>` flags so the import remains replayable and auditable in shell history and release notes.

## Consequences

- Imports stay reviewable and do not silently replace runtime authority.
- Manual merge remains a human approval point.
- The current CLI uses explicit flags and merge-preview files instead of a fully interactive prompt UI.
- Release handoff must call out that `manual-merge` creates a preview artifact and editor command, not an in-process merge session.
