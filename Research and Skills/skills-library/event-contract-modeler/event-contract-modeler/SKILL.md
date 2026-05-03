---
name: event-contract-modeler
description: define event contracts, event names, payload schemas, producers, consumers, handler contracts, ordering guarantees, idempotency rules, retry behavior, dead-letter behavior, and observability for cloud-agent sdlc work. use after contract-first-io-schema-writer and adapter-boundary-planner when behavior is event-driven, async, queue-based, webhook-based, pub/sub, cron-triggered, lifecycle-hooked, plugin-driven, or requires producer and consumer coordination before pseudocode, implementation, review, validation, adr drafting, parity sync, or continuity updates.
---

# Event Contract Modeler

Model event-driven behavior so producers, transports, handlers, and consumers share one explicit contract.

## Core rule

An event contract is more than a payload. It must define who emits it, who consumes it, what ordering and delivery guarantees exist, how duplicates are handled, how failures are retried or dead-lettered, and what observability proves the event moved correctly.

## Required inputs

- `io_contract.schema.json`
- `adapter_boundary_contract.json` when available
- Runtime topology, queue/pubsub/webhook/plugin/lifecycle details, handler list, side effects, and operational constraints
- Existing event names, payload schemas, consumers, retries, dead-letter queues, idempotency keys, and tests

## Event design coverage

Always address:

- Event name, version, namespace, and ownership
- Producer trigger and emission point
- Payload and metadata shape
- Consumer list and handler responsibilities
- Delivery semantics: at-most-once, at-least-once, exactly-once illusion, sync, async, scheduled, or best-effort
- Ordering, partitioning, dedupe, idempotency, replay, and backfill behavior
- Retry, timeout, poison-message, dead-letter, and partial-failure behavior
- Observability: correlation ids, trace ids, metrics, audit events, and logs

## Workflow

1. Identify whether the behavior is event-driven or whether no event contract is needed.
2. Reuse existing event naming and envelope conventions when present.
3. Define producers, consumers, payloads, metadata, and handler responsibilities.
4. Specify idempotency and retry/dead-letter behavior before pseudocode.
5. Define event tests: producer contract tests, consumer contract tests, replay tests, and duplicate-delivery tests.
6. Produce `event_contract.json` using `references/event-contract.schema.json`.
7. Handoff to `pseudocode-spec-writer`; include event flow and handler contracts.

## Output contract

Always return this structure:

```markdown
# Event Contract

## Event summary
- Event-driven decision:
- Events added or changed:
- Producer boundary:
- Consumer boundary:
- Delivery semantics:

## Event flow
| Event | Producer | Consumers | Payload schema | Ordering | Idempotency | Failure handling |
|---|---|---|---|---|---|---|

## Handler contracts
- <handler name>: input, side effects, errors, retryability, observability

## event_contract.json
```json
{}
```

## next_skill_handoff
Send `event_contract.json`, `io_contract.schema.json`, and `type_system_plan.json` when available to `pseudocode-spec-writer`; preserve event tests and operational guarantees.
```

## Guardrails

- Do not introduce events for simple in-process control flow without a clear runtime or decoupling reason.
- Do not define an event payload without producer, consumer, and failure semantics.
- Do not claim exactly-once processing unless the underlying topology proves it; otherwise model idempotency.
- Do not omit replay/backfill implications for durable events.
- Do not change existing event names or envelopes without compatibility and migration notes.
