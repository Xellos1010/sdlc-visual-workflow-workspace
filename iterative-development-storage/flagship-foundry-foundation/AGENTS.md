# Agent Operating Notes

## Purpose

This repository is an orchestration skeleton, not a finished product. Agents should extend the system by preserving the core invariants instead of hard-wiring a favorite model, IDE, or framework.

## Mandatory read order

1. `docs/PROJECT_HANDOFF.md`
2. `docs/FOUNDRY_ECOSYSTEM_SPEC.md`
3. `docs/MINIMUM_EXECUTABLE_SLICE.md`
4. `schemas/agent-work-order.schema.json`
5. `schemas/continuity-state.schema.json`
6. `manifests/*.json`
7. `runbooks/` relevant to the task being performed
8. `personas/` relevant to the lifecycle stage
9. `services/` and `packages/` implementation files

## Artifact authority

Use this ordering when facts disagree:

1. schema and contract files
2. runbooks and guardrail packs
3. continuity state and graph state
4. implementation stubs
5. convenience notes

## Rules of engagement

- Do not replace typed work orders with free-form prompting.
- Do not couple the system to one provider or editor unless the task explicitly requires an adapter.
- Every behavior change should update the nearest schema, runbook, persona, or guardrail pack.
- Every new capability should add at least one example request or incident.
- Prefer additive graph patches over ad hoc mutations.
- Preserve the difference between declared truth, inferred truth, and runtime evidence.

## Current target

Strengthen the minimum executable slice until it can:

- register real repositories and systems;
- ingest telemetry and incidents;
- route tasks to provider adapters;
- emit git/worktree-safe execution envelopes;
- verify outcomes independently;
- write back learning in fix-memory format.
