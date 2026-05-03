# Artifact Authority Map

Use this authority order as the default unless the repository or human operator provides a stronger rule.

## Agent-generated implementation path

1. Human request and accepted work order
2. Constraint contract and authority extraction
3. Approved schemas and event contracts
4. Approved pseudocode contract
5. ADRs and decision ledger
6. Implementation diff
7. Tests and validation evidence
8. Continuity memory

## Human engineer direct-edit path

1. Explicit human approval or committed human diff
2. Existing architecture constraints and ADRs
3. Implementation diff
4. Validation evidence
5. Reverse-sync patches for pseudocode, schemas, tests, diagrams, ADRs, and memory

## Conflict handling

- If implementation violates an ADR, mark `authority_conflict` and request human review unless a superseding ADR exists.
- If code changes behavior not covered by pseudocode, propose a pseudocode patch and test update.
- If schema changes without implementation or tests, propose downstream patches.
- If tests changed without requirement or pseudocode support, flag the source of expected behavior as unresolved.
- If evidence is missing, mark validation incomplete and block closure.
