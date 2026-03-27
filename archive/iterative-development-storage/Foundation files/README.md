# Flagship Foundry

Flagship Foundry is a **graph-native, framework-agnostic SDLC control plane** for human + AI orchestration.

This repository is intentionally **process-first** and **adapter-driven**:

- the graph ontology is the semantic source of truth;
- typed work orders are the execution contract;
- runbooks, schemas, personas, and guardrail packs define behavior;
- model providers, terminal agents, IDE shells, and versioning systems are adapters.

The immediate purpose of this repository is to provide a **minimum executable slice** that proves the architecture without prematurely locking the product to a single IDE, model vendor, language, or framework.

## What is in this starter repository

- `docs/` — architecture, handoff, roadmap, IDE strategy, local model guide, minimum executable slice
- `schemas/` — work order, continuity, runbook, persona, guardrail, evidence, fix memory, change request, provider, adapter, telemetry, incident, principle card
- `ontology/` — core node types, edge types, principle catalog, graph semantics
- `runbooks/` — feature, bug, change, handoff, telemetry, learning, provider onboarding, guardrail authoring
- `personas/` — phase-bound orchestration personalities
- `guardrails/` — sample language/platform/cloud rule packs
- `configs/` — provider profiles, routing policy, terminal adapter manifests
- `services/` — ecosystem, system, repo, and telemetry orchestration stubs
- `apps/control-plane/` — a runnable HTTP API stub for planning, graph access, patching, and catalog lookup
- `apps/orchestrator-cli/` — a terminal CLI to generate plans and summarize graphs/incidents
- `examples/minimum-executable-slice/` — a sample change request and incident used by the demo
- `state/` — sample graph and runtime state files

## Minimum executable slice

The runnable slice does four things:

1. accepts a typed change request;
2. expands it into typed work orders with routed personas and model tiers;
3. reads and mutates a graph state via patches;
4. exposes catalogs for runbooks, personas, providers, guardrails, and adapters.

That gives you a concrete starting point for plugging in real model runtimes, MCP tools, git/worktree execution, verification agents, and visualization surfaces.

## Quick start

Requirements: Node 20+.

Run the planner against the sample request:

```bash
npm run plan
```

Convert a sample incident into a change request:

```bash
npm run incident
```

Start the control-plane API:

```bash
npm run api
```

Run smoke tests:

```bash
npm test
```

## Example API calls

Plan a request:

```bash
curl -X POST http://localhost:4000/orchestration/plan   -H 'content-type: application/json'   -d @examples/minimum-executable-slice/sample-change-request.json
```

Inspect the graph:

```bash
curl http://localhost:4000/graph
```

Apply a patch:

```bash
curl -X POST http://localhost:4000/graph/patch   -H 'content-type: application/json'   -d '{"patches":[{"op":"set_property","targetType":"node","targetId":"system:control-plane","payload":{"properties":{"status":"planned"}}}]}'
```

## Read order for humans and agents

1. `docs/PROJECT_HANDOFF.md`
2. `docs/FOUNDRY_ECOSYSTEM_SPEC.md`
3. `docs/MINIMUM_EXECUTABLE_SLICE.md`
4. `docs/IDE_STRATEGY.md`
5. `docs/LOCAL_MODEL_GUIDE.md`
6. `schemas/`, `runbooks/`, `personas/`, `guardrails/`, and `configs/`
7. `services/`, `packages/`, and `apps/`

## Working principles

- human intent is authoritative;
- graphs, schemas, and artifacts outrank prompts;
- model selection is routed by task class and risk;
- verification agents are independent of builder agents;
- each completed task must leave resumable continuity and reusable learning.
