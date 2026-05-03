# Semantic risk taxonomy

| Risk class | Severity guidance | Examples |
|---|---|---|
| behavior_change | medium to high | User-visible flow, command behavior, state transition, error handling |
| public_contract | high | API, schema, event, CLI, block attributes, exported type |
| persistence | high | Database shape, migration, serialization, storage path |
| auth_security | high | Permission, secret, auth flow, input validation, unsafe output |
| architecture_boundary | medium to high | Ownership change, dependency direction, adapter boundary, service split |
| performance | medium to high | Algorithmic cost, caching, concurrency, blocking IO |
| observability | low to medium | Logging, metrics, traceability, error surface |
| test_gap | medium | Behavior changed without validation evidence |
| rollback | medium to high | Hard-to-reverse change, migration, external dependency |
| docs_only | low | Documentation update with no behavior change |
| unknown | medium | Diff too large, incomplete context, missing artifact |

Escalate severity when a change crosses public boundaries, affects persistence, weakens validation, contradicts an ADR, or lacks rollback evidence.
