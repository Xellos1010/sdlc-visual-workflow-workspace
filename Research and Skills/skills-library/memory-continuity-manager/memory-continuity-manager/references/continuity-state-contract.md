# Continuity State Contract

A continuity update should preserve these durable fields when present:

- project slug, work order id, issue id, branch, pull request, owner agent, phase, status
- objective, scope, non-goals, authority stack, constraints, approval boundaries
- completed artifacts, pending artifacts, blocked artifacts, stale artifacts
- commands run, validation results, evidence bundle handles, failure logs
- ADR ids, decision ledger entries, parity reports, handoffs, fix memories
- locks, lock owner, lock reason, lock expiry, successor work order

Use statuses: `active`, `verify_ready`, `blocked`, `incomplete`, `complete`, `superseded`, `abandoned`.

Completion requires: scope satisfied, validation passed or explicitly waived, parity checked, ADR/ledger updated when needed, and continuity patch prepared.
