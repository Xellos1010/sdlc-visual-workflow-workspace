---
name: memory-lifecycle-analyzer
description: analyze state ownership, allocation, borrowing, copying, mutation, caching, retention, cleanup, lifetimes, async captures, resource handles, and memory or state risks for cloud-agent sdlc design work. use after pseudocode-spec-writer when pseudocode_contract.json exists and before complexity assessment, concurrency review, pseudocode review verification, language-specific implementation planning, code generation, review, validation, adr drafting, parity sync, or continuity updates.
---

# Memory Lifecycle Analyzer

Identify how state and resources are created, owned, shared, mutated, retained, and cleaned up before implementation begins.

## Core rule

Every stateful value, cache, handle, listener, timer, stream, transaction, lock, closure capture, object reference, and external resource must have an owner, lifetime, mutation rule, and cleanup rule or be flagged as a gap.

## Required inputs

- `pseudocode_contract.json`
- `type_system_plan.json`
- Language, framework, runtime, and concurrency context
- `algorithm_decomposition.json`, `event_contract.json`, or adapter contracts when available
- Existing ownership patterns and cleanup conventions when known

## Language-specific checks

- Rust: ownership, borrowing, lifetimes, Send/Sync, Arc/Mutex, channels, async cancellation, Drop cleanup.
- TypeScript/JavaScript: object retention, mutation, async closure capture, AbortController use, listeners, timers, streams, caches.
- React: state ownership, memoization, effects, stale closures, re-render cost, cleanup in effects.
- Node: handles, streams, event emitters, process lifecycle, worker threads, sockets, file descriptors.
- Python: references, generators, context managers, async tasks, weak references, file handles, DB sessions.

## Workflow

1. Extract every stateful or resource-bearing item from pseudocode and types.
2. Assign owner, creation point, mutation points, readers, writers, sharing mode, and destruction/cleanup point.
3. Identify lifetime boundaries across requests, events, jobs, renders, transactions, tasks, sessions, and process lifetime.
4. Analyze copy/borrow/share behavior and mutation risk.
5. Identify retention risks, leak risks, stale state risks, resource starvation, unbounded growth, and cleanup omissions.
6. Define cleanup, cancellation, disposal, rollback, and cache eviction rules.
7. Produce `memory_lifecycle_report.json` using `references/memory-lifecycle-report.schema.json`.
8. Handoff to `complexity-notation-assessor` and `pseudocode-review-verifier`; also handoff to `concurrency-state-safety-analyzer` when shared mutable or async state exists.

## Output contract

Always return this structure:

```markdown
# Memory Lifecycle Report

## State ownership map
| State/resource | Owner | Created at | Read by | Written by | Lifetime | Cleanup |
|---|---|---|---|---|---|---|

## Mutation and sharing rules
- <state>: <immutable, mutable single-owner, shared read-only, shared mutable, external resource>

## Retention risks
| Risk | Cause | Impact | Mitigation | Blocking? |
|---|---|---|---|---|

## Cleanup plan
- <resource>: <cleanup/cancellation/eviction/rollback rule>

## language-specific notes
- <ownership, lifetime, runtime, or framework-specific note>

## memory_lifecycle_report.json
```json
{}
```

## next_skill_handoff
Send `memory_lifecycle_report.json` to `complexity-notation-assessor` and `pseudocode-review-verifier`; send to `concurrency-state-safety-analyzer` when async or shared state exists.
```

## Guardrails

- Do not treat memory lifecycle as optional for apparently small changes.
- Do not rely on garbage collection as a cleanup strategy for external resources.
- Do not approve unbounded caches, listeners, timers, streams, queues, or retained closures without limits and cleanup.
