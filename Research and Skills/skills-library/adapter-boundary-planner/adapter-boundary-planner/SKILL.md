---
name: adapter-boundary-planner
description: define adapter seams, ports, adapters, integration boundaries, error boundaries, retry policy, idempotency expectations, observability points, and vendor isolation for cloud-agent sdlc design work. use after base-interface-class-planner when interface_plan.json exists or when external apis, message endpoints, plugins, mcp tools, databases, filesystems, queues, webhooks, or vendor-specific implementations need bounded adapters before dependency inversion, contract-first io schemas, pseudocode, implementation, review, validation, adr drafting, parity sync, or continuity updates.
---

# Adapter Boundary Planner

Define integration seams that isolate volatile runtime, vendor, protocol, persistence, and transport details from domain logic.

## Core rule

Adapters must protect the stable code from unstable details. Never let external protocol shapes, SDK objects, transport errors, retry semantics, or vendor-specific configuration leak into high-level modules unless the architecture snapshot already establishes that as the accepted boundary.

## Required inputs

- `interface_plan.json` when available
- `architecture_snapshot.json`, `insertion_point_map.json`, and `abstraction_decision.json` when available
- Integration requirements, runtime topology, event contracts, data contracts, auth requirements, rate limits, and operational constraints
- Existing adapters, ports, repository patterns, plugin boundaries, MCP/tool contracts, queue handlers, database clients, and tests

## Boundary categories

Classify each adapter boundary as one or more of:

- `api_client`: external HTTP/RPC/GraphQL/SDK boundary
- `persistence_adapter`: database, cache, filesystem, or object storage boundary
- `message_adapter`: queue, pub/sub, webhook, event bus, or stream boundary
- `tool_or_plugin_adapter`: MCP, plugin, extension, command, or tool invocation boundary
- `framework_adapter`: framework lifecycle, request/response, rendering, or routing boundary
- `vendor_adapter`: implementation-specific vendor or provider boundary
- `test_adapter`: fake, stub, fixture, or contract test harness

## Workflow

1. Identify the stable port/contract and the volatile implementation details to isolate.
2. List inbound and outbound adapters separately.
3. Define the normalized data shape that crosses the boundary; reject SDK-native leakage unless explicitly justified.
4. Define error taxonomy, retry behavior, timeout/cancellation behavior, idempotency requirements, and fallback behavior.
5. Define observability points: logs, spans, metrics, structured error fields, correlation ids, and audit events.
6. Identify test strategy: contract tests, fake adapters, integration tests, golden payloads, and failure-mode tests.
7. Produce `adapter_boundary_contract.json` using `references/adapter-boundary-contract.schema.json`.
8. Handoff to `dependency-inversion-planner`, `contract-first-io-schema-writer`, or `event-contract-modeler` as appropriate.

## Output contract

Always return this structure:

```markdown
# Adapter Boundary Contract

## Boundary summary
- Stable side:
- Volatile side:
- Adapter category:
- Leakage risks:

## Ports and adapters
| Port | Adapter | Direction | Normalized shape | Error boundary | Tests |
|---|---|---|---|---|---|

## Retry, timeout, and idempotency
- Retry policy:
- Timeout/cancellation:
- Idempotency key or dedupe rule:
- Dead-letter or fallback behavior:

## Observability points
- Logs:
- Metrics:
- Traces:
- Audit/correlation fields:

## adapter_boundary_contract.json
```json
{}
```

## next_skill_handoff
Send `adapter_boundary_contract.json` to `dependency-inversion-planner`, `contract-first-io-schema-writer`, and `event-contract-modeler` when event-driven behavior exists.
```

## Guardrails

- Do not let SDK or transport-native objects cross into domain code without explicit justification.
- Do not define retries without idempotency and timeout considerations.
- Do not hide operational errors; preserve typed, observable failure modes.
- Do not design only the happy path; include failure, partial success, and rollback behavior.
- If the system already has an adapter convention, follow it unless a documented constraint requires deviation.
