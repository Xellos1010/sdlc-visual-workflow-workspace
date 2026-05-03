# ADR-010: Define Rollout, Rollback, and Incident Documentation Model

## Status
accepted

## Date
2026-03-23

## Context
`WO-FF-010` is the final `M4` work order for go/no-go and operating-model closure. The initiative already has structured artifacts for plans, approvals, runs, evidence, runbooks, personas, and continuity, but it does not yet have one documented model for how rollout, rollback, and incident records relate to each other.

Relevant existing building blocks include:
- runbook contracts in `flagship-foundry-work/schemas/runbook.schema.json`
- run and execution history contracts in `flagship-foundry-work/schemas/run.schema.json` and `flagship-foundry-work/schemas/run-timeline.schema.json`
- continuity contract authority in `flagship-foundry-work/schemas/continuity-state.schema.json`
- operational runbooks under `flagship-foundry-work/runbooks/`
- approval state under `flagship-foundry-work/state/approvals/`
- plan state under `flagship-foundry-work/state/plans/`
- run state under `flagship-foundry-work/state/runs/`

The gap is not whether documentation exists, but whether the operational narrative is consistently modeled. `M4` needs a clear rule for which artifacts constitute rollout records, rollback records, and incident records, and how they tie back to approvals, evidence, and continuity state.

## Options Considered

### Option A: Use free-form markdown or chat notes for operations
**Description**: Let operators document rollout, rollback, and incidents in whatever format is convenient.  
**Pros**: Flexible and low-friction.  
**Cons**: Inconsistent handoff quality, poor machine-readability, and weak continuity for later agents.

### Option B: Use one generic release checklist for everything
**Description**: Collapse rollout, rollback, and incidents into a single checklist artifact.  
**Pros**: Simpler than multiple artifact types.  
**Cons**: Blurs different operational scenarios and weakens incident-specific learning.

### Option C: Use a structured runbook-backed documentation model linked to state and evidence
**Description**: Model rollout, rollback, and incidents as related but distinct documentation flows anchored in runbooks, approvals, runs, and continuity.  
**Pros**: Supports deterministic handoff, machine-readable traceability, and better operational learning.  
**Cons**: Requires more discipline than free-form notes.

## Decision
Choose **Option C**.

Documentation model:
- Rollout, rollback, and incident handling must be modeled as structured operational records, not only narrative prose.
- The canonical process shape comes from runbook contracts and existing runbook assets, especially the delivery and telemetry-oriented runbooks.
- State artifacts remain the source data for what happened; operator-facing documentation must link back to them rather than restating them manually.

Minimum linkage requirements:
- Every rollout record must identify the governing plan, approval artifact, run or runs executed, and supporting evidence bundle.
- Every rollback record must identify the trigger, the boundary being rolled back, the stopping point, and the retained evidence for diagnosis.
- Every incident record must identify the triggering signal, impacted system, verifier evidence, and any resulting fix-memory or guardrail update proposal.
- Operational closeout must update continuity pointers so the next agent or operator knows the next command set and open risks.

Milestone alignment:
- `WO-FF-010` closes only when `M4` has a documented go/no-go model that references actual plan, approval, run, and evidence artifacts.
- `M3` adapter and telemetry evidence becomes an input to the incident and rollback record, not a disconnected appendix.
- The documentation model must support both release-style rollout and incident-driven rollback without requiring a separate one-off process.

## Consequences

### Positive
- Gives Foundry a reusable operating model instead of milestone-specific ceremony.
- Improves resumability because operational docs point back to canonical state and continuity artifacts.
- Connects incidents to learning loops through fix-memory and guardrail updates.

### Negative
- Operators must maintain structured records even when a free-form note would feel faster.
- Some existing runbooks may need refinement so the model is consistently applied.

### Risks
- If operator-facing documents duplicate too much state, they may drift from the canonical artifacts they are supposed to summarize.
- If continuity updates are skipped, the documentation model may still fail resumability even with good incident notes.
- If incident records do not link to evidence and learning outputs, the model may become procedural rather than improving system quality.

## References
- `.cursor/plans/foundry-gap-analysis-intent_d20ed327.plan.md`
- `apps/flagship-foundry/docs/adr/NEXT_AGENT_EXECUTION_STEPS.md`
- `apps/flagship-foundry/schemas/runbook.schema.json`
- `apps/flagship-foundry/schemas/run.schema.json`
- `apps/flagship-foundry/schemas/run-timeline.schema.json`
- `apps/flagship-foundry/schemas/continuity-state.schema.json`
- `apps/flagship-foundry/runbooks/feature-delivery.runbook.json`
- `apps/flagship-foundry/runbooks/telemetry-driven-improvement.runbook.json`
- `apps/flagship-foundry/runbooks/task-handoff.runbook.json`
- `apps/flagship-foundry/guardrails/telemetry-and-observability.json`
- `apps/flagship-foundry/configs/approval-policies/default.json`
