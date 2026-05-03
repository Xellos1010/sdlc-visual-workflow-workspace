---
name: concurrency-state-safety-analyzer
description: analyze async tasks, shared mutable state, locks, transactions, race conditions, event ordering, retry interactions, cancellation, deadlock risk, idempotency, and concurrency safety for cloud-agent sdlc design verification. use after algorithm-decomposition-planner when async, event-driven, queue-based, concurrent, transactional, streaming, multi-request, multi-agent, or shared-state behavior exists and before pseudocode review verification, implementation planning, generated-code review, validation, adr drafting, parity sync, or continuity updates.
---

# Concurrency State Safety Analyzer

Review concurrency and state-safety risks before implementation changes introduce races, deadlocks, duplicate effects, stale state, or broken ordering.

## Core rule

Any design with async work, queues, retries, locks, transactions, streams, shared state, event handlers, background jobs, or multiple writers must define ownership, ordering, cancellation, and idempotency rules before implementation.

## Required inputs

- `algorithm_decomposition.json`
- `memory_lifecycle_report.json` when available
- `event_contract.json`, adapter contract, runtime topology, queue/transaction details, and retry policy when available
- Runtime and framework context, including request lifecycle, job lifecycle, transaction isolation, and cancellation primitives

## Workflow

1. Identify concurrent actors: requests, tasks, workers, handlers, timers, processes, threads, queues, and users.
2. Identify shared state, external resources, transactions, locks, and ordering-sensitive effects.
3. Map read/write conflicts, duplicate delivery, retries, out-of-order events, lost updates, stale caches, and partial failures.
4. Define lock, transaction, idempotency, dedupe, cancellation, timeout, and cleanup policy.
5. Check for deadlocks, priority inversion, backpressure, unbounded queues, and retry storms.
6. Record blocking risks and required tests or instrumentation.
7. Produce `concurrency_safety_report.json` using `references/concurrency-safety-report.schema.json`.
8. Handoff to `pseudocode-review-verifier`.

## Output contract

Always return this structure:

```markdown
# Concurrency State Safety Report

## Concurrent actors
| Actor | Trigger | Shared state/resource | Ordering requirement | Failure mode |
|---|---|---|---|---|

## State risks
| Risk | Scenario | Impact | Mitigation | Blocking? |
|---|---|---|---|---|

## Lock, transaction, and idempotency strategy
- Lock strategy:
- Transaction boundary:
- Idempotency/dedupe rule:
- Retry/backoff rule:
- Dead-letter/fallback rule:

## Cancellation and cleanup policy
- Timeout/cancellation:
- Cleanup:
- Backpressure:

## Required tests
- <race, retry, ordering, cancellation, duplicate, transaction, or load test>

## concurrency_safety_report.json
```json
{}
```

## next_skill_handoff
Send `concurrency_safety_report.json` to `pseudocode-review-verifier`.
```

## Guardrails

- Do not assume FIFO ordering unless the runtime or queue contract guarantees it.
- Do not rely on retries without idempotency or dedupe rules.
- Do not leave cancellation, timeout, or cleanup as implementation details.
