# Reverse-sync classification

Use these categories when converting code deltas into upstream artifact work.

| Category | Meaning | Downstream action |
|---|---|---|
| behavior | Runtime behavior changed | Patch pseudocode and tests |
| public_contract | API, CLI, event, block, schema, or interface changed | Patch pseudocode, schemas, docs, and ADR candidate |
| data_model | Persistence, data shape, migration, or serialization changed | Patch schemas and ADR candidate |
| architecture | Boundary, dependency direction, service ownership, or component role changed | ADR candidate and diagram candidate |
| verification | Tests, fixtures, validation commands, or evidence changed | Patch test spec and parity report |
| config | Build, env, deployment, flags, or secrets handling changed | Patch runbook/config docs and parity report |
| dependency | Library, package, runtime, framework, or tool version changed | ADR candidate if material; otherwise ledger entry |
| cleanup | Refactor without intended behavior change | Record evidence expectation and parity check |
| documentation | Docs changed without code | Sync memory and links |
| unknown | Insufficient evidence | Ask review question |

Material ADR triggers: public contract changes, persistence changes, auth/security changes, nontrivial dependency changes, architectural boundary changes, performance tradeoffs, rollback-impacting changes, and human overrides of prior agent decisions.
