# Docker and local development

## Default: no Docker required

For most contributors, run **Node.js on the host** from `flagship-foundry-work/`:

- `npm install`, `npm test`, `npm run api`, orchestrator CLI — all expect direct filesystem access to the repo and `state/`.

## Optional: containerize the control plane

**When it helps**

- CI pipelines that need a **reproducible** Node version and dependency install
- Teams that want a **single command** to start the HTTP API with pinned deps

**Typical pattern**

- Build an image that contains `flagship-foundry-work` (or install from lockfile)
- Expose the control-plane port (per `apps/control-plane` defaults)
- Mount **read/write** only what is required; **never** bake secrets into images

**Security (ADR-006)**

- Non-loopback access requires **bearer tokens** and scoped CORS
- Pass `FLAGSHIP_CONTROL_PLANE_BEARER_TOKEN` and related env via **env files or secrets**, not committed config

## What usually stays on the host

- **Orchestrator CLI** — needs direct paths to customer repos for `filesystem` import
- **Local-shell execute runs** — isolation and sandbox behavior differ by OS (**ADR-008**); Docker is not a substitute for that policy without a dedicated design

## What may be containerized later

- **Graph viewer** dev server (`apps/graph-viewer`) if teams use it in shared demos
- **MCP server** (`apps/foundry-mcp-server`) for isolated dependency sets

## Summary

| Component | Default | Container optional? |
|-----------|---------|---------------------|
| CLI + tests | Host | No |
| Control plane API | Host | Yes |
| CI gates (`npm test`, `ci:targeted`) | Host / CI runner | Yes |
