# Agent and Skill Blueprints

## Goal

Provide reusable, composable definitions for role-based agents and future framework-specific skills without binding Foundry to one terminal runtime.

## Current blueprints

### Agent blueprints

Located in `knowledge/templates/agent-blueprints/`:

- `planner.json`
- `adversarial-reviewer.json`
- `implementer.json`
- `verifier.json`
- `knowledge-curator.json`

Each blueprint defines a reusable role contract that can later be projected into Cursor rules, Codex prompts, Claude Code instructions, OpenClaw plugins, or local gateway formats.

### Skill blueprints

Located in `knowledge/templates/skill-blueprints/`:

- `framework-sme-skill.json`
- `task-workflow-skill.json`

These exist to standardize future framework or platform skill creation from the same knowledge and runbook catalogs.

## Composition model

A task or plan should compose from:

- domain pack requirements;
- framework or platform registry matches;
- persona pack selection;
- runbook phase;
- review policy;
- environment adapter projection.

This keeps skill generation and agent orchestration aligned to the same doctrine.
