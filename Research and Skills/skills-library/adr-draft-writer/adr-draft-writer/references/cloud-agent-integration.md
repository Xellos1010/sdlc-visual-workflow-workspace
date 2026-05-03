# Cloud Agent Integration Notes

Use these upstream and downstream relationships when drafting ADRs in the granular codegen SDLC chain.

## Common upstream triggers

- `architecture-drift-detector`: drift reveals a decision gap or architecture repair candidate.
- `generated-code-reviewer`: implementation review identifies a material design trade-off.
- `test-execution-verifier`: validation evidence changes the acceptable path.
- `human-code-delta-ingestor`: human edits introduce new architecture, schema, persistence, or tool choices.
- `software-engineer-decision-capture`: human notes need durable decision capture.

## Downstream handoffs

- `adr-indexer`: always hand off new or changed ADRs for indexing and cross-linking.
- `decision-tradeoff-ledger`: use when the decision should be summarized in a durable trade-off ledger.
- `parity-sync-manager`: use when pseudocode, schemas, diagrams, tests, memory, or implementation must be updated to match the ADR.

## No-ADR alternative

If the decision is not material enough for an ADR, return a brief decision note with:

- decision
- reason
- affected artifacts
- why no ADR is required
- any follow-up action
