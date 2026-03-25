# Source of Truth Matrix

This matrix defines artifact classes, canonical homes, and sync direction under ADR-001 and ADR-003.

| Artifact area | Artifact class | Canonical home | Sync direction | ADR references |
| --- | --- | --- | --- | --- |
| Product behavior and runnable contracts (APIs, schemas, executable code) | canonical | `flagship-foundry-work/` and `flagship-foundry-work/docs/` | canonical -> projections only | ADR-001, ADR-003 |
| Generated runtime/project state (`state/` plans, runs, graph, knowledge manifests) | generated | `flagship-foundry-work/state/` | canonical inputs -> generated outputs (no reverse authority) | ADR-003 |
| Root-level SDLC research/plans outside `flagship-foundry-work/` | archive | Parent workspace root research locations | canonical -> archive snapshots/promotions only | ADR-001, ADR-003 |
| Deprecated/iterative copies retained for rollback or audit | archive | Team-defined archive locations with retention policy | canonical -> archive only; no archive -> canonical promotion without curation | ADR-003 |
| CI workflow definitions and gate scripts (blocking automation contract) | canonical | `.github/workflows/flagship-foundry-ci.yml` (parent repo root) + `flagship-foundry-work/package.json` scripts | canonical -> CI truth; no silent waiver of documented gates | ADR-001, ADR-009 |
| CI run artifacts (logs, uploaded `ci-gate-evidence.txt`) | generated | GitHub Actions / CI provider | CI inputs -> retained outputs for audit; not behavior authority | ADR-009 |
| Operational rollout / rollback / incident records (tickets, postmortems) | archive or generated | Team tracker + `docs/rollout-rollback-incident-model.md` pattern | Must link to canonical `state/` + continuity; never override product state | ADR-001, ADR-010 |

## Notes

- Canonical sources are the only authority for behavior-changing decisions.
- Generated artifacts are reproducible outputs and are not manually authoritative.
- Archive artifacts are historical references retained per ADR-003 retention rules.
