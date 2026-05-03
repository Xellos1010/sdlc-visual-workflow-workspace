# Cursor / VS Code extension: Foundry init and re-init

This document describes how a **local VS Code–compatible extension** (runs in Cursor) can support **initialize** and **re-initialize** workflows without replacing the orchestrator CLI.

## Feasible capabilities

- **Commands** registered in `package.json` (e.g. “Foundry: Init project”, “Foundry: Import ecosystem”, “Foundry: Start control plane”).
- **Spawn terminal or subprocess**: `node apps/flagship-foundry/apps/orchestrator-cli/src/main.mjs init-project my-project "objective"` with `cwd` set to the **monorepo root** (parent of `apps/`) so paths resolve, and the **workspace folder** where `.foundry` should appear as the logical project root.
- **Configuration**: `flagshipFoundry.controlPlaneUrl`, `flagshipFoundry.foundryRoot`, paths to import configs.
- **Health check**: `fetch` to `GET /health` on the control plane before actions that require the API.

## Integration points

- **CLI**: `apps/orchestrator-cli/src/main.mjs` — same surface as `npm run` scripts in `package.json`.
- **Control plane**: `npm run api` from `apps/flagship-foundry/`.
- **Existing extension**: `apps/cursor-companion/` — extend with new commands rather than forking unrelated code.

## Non-goals

- **No blind overwrite** of user-owned files (**ADR-004**). Re-init flows that touch skills, rules, or parity projections must use **dry-run**, **diff**, or **explicit approval**.
- **No dependency** on undocumented Cursor-internal CLIs.
- **Secrets** are not written into `.foundry/`; use environment or secure storage for tokens (**ADR-006**).

## Recommended UX

1. Prompt for **project slug** and **objective** → run `init-project`.
2. Optional: open **import config** picker → run `import` / `visualize`.
3. Optional: start **control plane** in a dedicated terminal if not already running.

## References

- `apps/cursor-companion/README.md`
- [ecosystem-onboarding.md](ecosystem-onboarding.md)
