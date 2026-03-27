# Control Plane API Overview

The control plane API is deliberately small.

## Endpoints

- `GET /health` — health response and runtime graph path
- `GET /graph` — return graph JSON
- `POST /graph/patch` — apply graph patch operations
- `POST /change-requests` — persist a change request envelope
- `POST /orchestration/plan` — return a generated orchestration plan
- `POST /telemetry/intake` — translate an incident into a change request
- `GET /catalogs/runbooks` — list runbook metadata
- `GET /catalogs/personas` — list persona metadata
- `GET /catalogs/providers` — list provider metadata
- `GET /catalogs/adapters` — list adapter metadata
- `GET /catalogs/guardrails` — list guardrail metadata

## Design intent

This API is not the final product API. It is the first stable contract that lets terminal agents, future IDE surfaces, and automated supervisors speak to a shared control plane.

The API should remain:
- implementation-light,
- schema-driven,
- provider-agnostic,
- safe to wrap inside MCP or OpenAPI adapters later.
