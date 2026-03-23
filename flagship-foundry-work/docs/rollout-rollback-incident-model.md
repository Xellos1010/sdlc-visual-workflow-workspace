# Rollout, rollback, and incident documentation model (ADR-010)

This document implements [adr-010-rollout-rollback-and-incident-documentation-model.md](adr/adr-010-rollout-rollback-and-incident-documentation-model.md). It defines **how operator-facing records** relate to **canonical state** under `flagship-foundry-work/state/` and **continuity** under `.codex/projects/<project>/`.

## Principles

1. **State is truth** — Plans, approvals, runs, timelines, and evidence bundles in `state/` are authoritative for what happened. Operational docs **link** to them; they do not replace them.
2. **Runbooks shape process** — Process flow follows [runbook](../schemas/runbook.schema.json) contracts. Primary anchors:
   - [feature-delivery.runbook.json](../runbooks/feature-delivery.runbook.json) — release-style delivery
   - [telemetry-driven-improvement.runbook.json](../runbooks/telemetry-driven-improvement.runbook.json) — signal-driven change
   - [task-handoff.runbook.json](../runbooks/task-handoff.runbook.json) — agent continuity
3. **Continuity closes the loop** — After rollout, rollback, or incident closeout, update `.codex/projects/<project>/current-task.json` (`nextCommandSet`, `doneCriteria`, phase notes) so the next operator or agent can resume deterministically.

## Record types

| Record | Purpose | Governing runbook(s) |
| --- | --- | --- |
| **Rollout** | Planned promotion of a change with verified gates | Feature delivery |
| **Rollback** | Controlled reversal or stop at a boundary with retained diagnosis evidence | Feature delivery + M3 isolation/rollback semantics |
| **Incident** | Response to an unplanned signal; ties verifier evidence to fix-memory / guardrail proposals | Telemetry-driven improvement + task handoff |

## Minimum linkage — rollout

Every rollout record **must** identify:

| Field | Description | Example location pattern |
| --- | --- | --- |
| Plan | Approved work scope | `state/plans/plan-<ecosystem>-<slug>-<id>.json` |
| Approval | Decision artifact | `state/approvals/approval-*.json` (as produced by the control plane) |
| Run(s) | Execution instances | `state/runs/run-*.json` |
| Evidence | Correlated bundle or API ref | `GET /runs/:id/evidence-bundle` or exported bundle JSON |

Optional but recommended: CI run URL per [ci-release-gates.md](ci-release-gates.md).

## Minimum linkage — rollback

Every rollback record **must** identify:

| Field | Description |
| --- | --- |
| Trigger | Human, verifier failure, policy gate, or telemetry signal |
| Boundary | What is rolled back (e.g., plan scope, deployment slice, adapter config) |
| Stopping point | Run/task id where execution halted (`pause` / `stop` per M3 semantics) |
| Retained evidence | Paths or bundle ids for timeline + task evidence under `state/run-workspaces/<run-id>/` |

## Minimum linkage — incident

Every incident record **must** identify:

| Field | Description |
| --- | --- |
| Triggering signal | Alert, test failure, user report, verifier block |
| Impacted system | Ecosystem / project / control-plane surface |
| Verifier evidence | Test logs, evidence bundle, CI artifact name |
| Learning outputs | Proposed fix-memory entry or guardrail update (see `guardrails/`, knowledge packs) |

M3 adapter and telemetry evidence (ADR-007/008) are **inputs** to incident and rollback narrative, not optional appendices.

## Go / no-go checklist (M4 closure)

A release-style go/no-go **must** confirm:

- [ ] Current automated gates per [ci-release-gates.md](ci-release-gates.md) (ADR-009).
- [ ] M2/M3 quality signals still valid for the change scope (classification, parity policy, auth boundary, telemetry correlation, adapter isolation)—cite prior verifier notes or bundles.
- [ ] Rollout record links plan + approval + run + evidence.
- [ ] Continuity updated with `nextCommandSet` and open risks.

## Example stub (copy into an incident ticket or internal doc)

```json
{
  "recordType": "incident",
  "id": "inc-2026-03-23-example",
  "triggeringSignal": "Verifier blocked: npm test failure in gap-analysis",
  "impactedSystem": "flagship-foundry-work packages/core gap analysis",
  "verifierEvidence": "local: cd flagship-foundry-work && npm test (log path: …)",
  "runRef": "state/runs/run-….json",
  "evidenceBundleRef": "/runs/{id}/evidence-bundle",
  "proposedLearning": "guardrails/telemetry-and-observability.json review",
  "continuityUpdate": ".codex/projects/flagship-foundry/current-task.json"
}
```

## Related

- [ci-release-gates.md](ci-release-gates.md) — blocking CI and evidence threshold
- [source-of-truth-matrix.md](source-of-truth-matrix.md) — artifact classes
- [NEXT_AGENT_EXECUTION_STEPS.md](adr/NEXT_AGENT_EXECUTION_STEPS.md) — agent verification playbook
