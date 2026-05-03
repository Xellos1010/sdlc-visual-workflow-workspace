---
name: blast-radius-preflight-analyzer
description: estimate pre-implementation risk, blast radius, manual review triggers, high-risk files, and test expansion requirements for cloud-agent sdlc work. use after impacted-system-cartographer when impacted_systems.json exists and before architecture snapshots, insertion-point selection, abstraction planning, pseudocode, implementation, review, validation, adr drafting, parity sync, or continuity updates.
---

# Blast Radius Preflight Analyzer

Convert an impacted-system map into a risk score and gate plan before design proceeds.

## Core rule

Risk is not only file count. Public contracts, persistence, auth, generated artifacts, cross-owner boundaries, migrations, shared abstractions, and runtime entry points can make a small diff high risk.

## Required inputs

- `impacted_systems.json`
- `objective_classification.json`, `route_plan.json`, and `constraint_contract.json` when available
- Target or changed paths, dependency graph, test inventory, public contract list, migration list, generated artifact list, and ownership metadata when available

## Risk scoring

Score 0-10 using the highest justified score, not an average:

- `0-2 low`: isolated implementation, strong tests, no public contracts or owner boundaries
- `3-5 medium`: multiple files, shared helpers, moderate test expansion, limited runtime exposure
- `6-8 high`: public contracts, migrations, auth, persistence, concurrency, generated artifacts, cross-package or cross-owner impact
- `9-10 critical`: irreversible data change, security-sensitive surface, deployment/release risk, external customer-facing protocol, broad dependency fanout, or unclear authority

## Manual review triggers

Trigger human review when any of these are present:

- auth, permissions, identity, secrets, payments, PII, compliance, or external integrations
- database migrations, data backfills, destructive operations, irreversible transformations, or schema compatibility risk
- public API, SDK, generated contract, block interface, plugin API, CLI command, or event protocol changes
- high fanout dependency, shared abstraction, global config, build/deploy pipeline, or runtime scheduling changes
- missing tests for affected runtime surface or inability to verify impact safely

## Workflow

1. Read `impacted_systems.json` and list risk drivers by surface.
2. Score blast radius using direct and indirect impact, not just target files.
3. Identify high-risk files, generated artifacts, protected directories, migrations, and owner boundaries.
4. Define required test expansion and verification evidence.
5. Mark required approvals and manual review gates.
6. Produce `blast_radius_report.json` using `references/blast-radius-report.schema.json`.
7. Handoff to `architecture-snapshot-reader`.

## Output contract

Always return this structure:

```markdown
# Blast Radius Preflight

## Risk score
- Score:
- Class:
- Rationale:

## Risk drivers
- <driver and evidence>

## Manual review triggers
- <trigger or none>

## Test expansion requirements
- <test or evidence requirement>

## blast_radius_report.json
```json
{}
```

## next_skill_handoff
Send `blast_radius_report.json` to `architecture-snapshot-reader`; include manual review gates and required verification evidence.
```

## Guardrails

- Do not lower risk because the requested change sounds small.
- Do not skip manual review triggers for security, persistence, public contracts, irreversible actions, or missing authority.
- Do not approve implementation when verification requirements are unknown.
- If impact evidence is incomplete, score based on the credible worst case and mark the uncertainty.
