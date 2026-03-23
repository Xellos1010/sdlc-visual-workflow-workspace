# ADR Decision Packet (Pre-Build)

This packet captures pre-build decisions for the Foundry gap-closure execution plan and maps them to work-order gating.

## Decision Summary

| ADR | Decision | Status | Blocker |
| --- | --- | --- | --- |
| ADR-001 | Canonical authority remains in `flagship-foundry-work/`; root research is reference-only unless promoted | accepted | Yes |
| ADR-002 | Continuity contract authority in Foundry schema; runtime instance authority in `.codex/projects/<project>/current-task.json` | accepted | Yes |
| ADR-003 | Artifact classes: canonical/generated/archive with retention and no destructive cleanup before parity + approval | accepted | Yes |
| ADR-004 | Parity projection uses detect/diff/merge with conflict approvals; no blind overwrite | accepted | Yes |
| ADR-006 | Scoped bearer-token model for non-loopback with bounded local-dev exception | accepted | Yes |
| ADR-009 | CI gate baseline + release evidence threshold (blocking tests + targeted gate + retained evidence) | accepted | Yes (M4 / WO-FF-009) |
| ADR-010 | Rollout, rollback, and incident documentation model (runbook-backed, state-linked) | accepted | Yes (M4 / WO-FF-010) |

## Gate Matrix

| Work Order | Depends On ADRs | Start Condition |
| --- | --- | --- |
| WO-FF-001 | ADR-001, ADR-003 | Authority and artifact class policy accepted |
| WO-FF-002 | ADR-002 | Continuity authority model accepted |
| WO-FF-003 | ADR-001, ADR-003 | Classification and retention accepted |
| WO-FF-004 | ADR-004 | Projection conflict policy accepted |
| WO-FF-005 | ADR-001 | Canonical knowledge authority accepted |
| WO-FF-006 | ADR-006 | Auth and trust-boundary accepted |
| WO-FF-007 | ADR-006, ADR-002 | Security + continuity contract accepted |
| WO-FF-008 | ADR-006, ADR-002 | Security baseline and continuity accepted |
| WO-FF-009 | ADR-001, ADR-004, ADR-006, ADR-009 | Authority + projection + security + CI baseline accepted |
| WO-FF-010 | ADR-001, ADR-003, ADR-006 | Operational model inputs accepted |

## Approval Record

| ADR | Approver | Date | Notes |
| --- | --- | --- | --- |
| ADR-001 |  |  |  |
| ADR-002 |  |  |  |
| ADR-003 |  |  |  |
| ADR-004 |  |  |  |
| ADR-006 |  |  |  |
| ADR-009 | program | 2026-03-23 | CI workflow + `docs/ci-release-gates.md`; ADR-009 accepted per implementation |
| ADR-010 | program | 2026-03-23 | `docs/rollout-rollback-incident-model.md`; ADR-010 accepted |

## Completion Criteria (Pre-Build Exit)

- All blocker ADRs are accepted and linked in work-order artifacts.
- `WO-FF-001` and `WO-FF-002` kickoffs reference approved ADR IDs.
- No builder implementation starts on blocked WOs before decision acceptance.

## Related ADR Files

- `docs/adr/adr-001-artifact-authority-and-research-home.md`
- `docs/adr/adr-002-continuity-schema-authority-and-bootstrap.md`
- `docs/adr/adr-003-artifact-classification-drift-and-archive-retention.md`
- `docs/adr/adr-004-parity-projection-merge-policy.md`
- `docs/adr/adr-006-control-plane-auth-and-trust-boundary.md`
- `docs/adr/adr-009-ci-gate-baseline-and-release-evidence-threshold.md`
- `docs/adr/adr-010-rollout-rollback-and-incident-documentation-model.md`
