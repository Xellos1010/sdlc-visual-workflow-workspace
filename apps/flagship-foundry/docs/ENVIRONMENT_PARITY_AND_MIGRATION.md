# Environment Parity and Migration

## Principle

Cursor, Codex, Claude Code, Gemini, local models, and future runtimes should all consume the same project doctrine and work-order contract. Tool-specific files are projections of that intent, not separate systems of truth.

## Current parity templates

- `environments/cursor/project/`
- `environments/codex/project/`
- `environments/claude/project/`

## Current scaffold command

```bash
node apps/orchestrator-cli/src/main.mjs scaffold-env cursor-project ./some-target --dry-run
```

## What parity should cover

- approval defaults;
- shared MCP servers;
- project doctrine and guardrails;
- runbook references;
- local model routing or gateway endpoints;
- task result and evidence expectations.

## Migration posture

Foundry should detect what already exists in `.cursor`, `.claude`, `.codex`, `AGENTS.md`, `CLAUDE.md`, and `.mcp.json`, then show what is missing rather than overwriting working setups blindly.
