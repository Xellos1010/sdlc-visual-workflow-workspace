# Project Handoff

## What exists now

This repository is no longer only a written concept bundle. It now contains:

- a runnable control-plane API under `apps/control-plane/`;
- a planner and bootstrap CLI under `apps/orchestrator-cli/`;
- a Cursor-compatible companion extension under `apps/cursor-companion/`;
- a workspace import pipeline that supports filesystem and export-bundle ingestion;
- graph, plan, run, visualization, and SME-profile generation;
- static catalogs for runbooks, personas, guardrails, and adapter manifests;
- a sample import of the current workspace export bundle under `examples/current-workspace/`.

## Where to resume

1. `README.md`
2. `docs/IMPORT_AND_SCAFFOLD_PIPELINE.md`
3. `docs/BLAST_RADIUS_STRATEGY.md`
4. `docs/CURSOR_EXTENSION_BOOTSTRAP.md`
5. `state/ecosystems/web-automation-workspace/manifest.json`
6. `state/ecosystems/web-automation-workspace/graph.json`
7. latest files in `state/plans/` and `state/runs/`

## Primary next tranche

Implement one real terminal adapter end to end so that a work order can leave simulation mode and produce real evidence bundles against a repo-safe worktree.

## Important doctrine

- manual approval is the default plan boundary;
- auto approval is a deliberate policy toggle, not an assumption;
- blast radius must be wider than changed files when shared patterns are in play;
- no task is complete without evidence, continuity, and handoff.
