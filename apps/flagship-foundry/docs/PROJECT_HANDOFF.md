# Project Handoff

## What exists now

This repository now contains a runnable minimum slice for Foundry as an import-first orchestration system:

- a control-plane API under `apps/control-plane/`;
- a planner and bootstrap CLI under `apps/orchestrator-cli/`;
- a Cursor-compatible companion extension under `apps/cursor-companion/`;
- a workspace import pipeline for filesystem and export-bundle ingestion;
- a graph of systems, projects, frameworks, platforms, diagrams, task states, and agent environments;
- a seed knowledge-base ingestion pipeline with versioned source manifests;
- a knowledge-gap analysis pass that maps ecosystems against required domain packs;
- a focus-view generator for drill-down blast-radius visualization;
- approval-aware and debate-aware plan generation;
- simulated run control with start, pause, resume, and stop.

## Where to resume

1. `README.md`
2. `docs/FOUNDRY_KNOWLEDGE_PIPELINE.md`
3. `docs/INTERACTIVE_DRILLDOWN_AND_DEBATE.md`
4. `docs/ENVIRONMENT_PARITY_AND_MIGRATION.md`
5. `state/ecosystems/web-automation-workspace/manifest.json`
6. `state/ecosystems/web-automation-workspace/graph.json`
7. `state/knowledge/foundry-foundational-docs/manifest.json`
8. `state/ecosystems/web-automation-workspace/analysis/gap-report.json`
9. latest files in `state/plans/` and `state/runs/`

## Primary next tranche

Implement one real terminal adapter end to end so an approved work order can leave simulation mode, execute in a controlled worktree, emit evidence, update continuity, and write fix-memory artifacts automatically.

## Important doctrine

- manual approval is the default plan boundary;
- auto approval is a deliberate policy toggle, not an assumption;
- blast radius must be wider than changed files when shared patterns are in play;
- environment-specific prompts are projections of shared doctrine, not separate truth;
- no task is complete without evidence, continuity, and handoff.
