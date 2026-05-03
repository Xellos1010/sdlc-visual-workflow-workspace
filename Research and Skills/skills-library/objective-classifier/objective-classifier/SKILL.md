---
name: objective-classifier
description: classify normalized cloud-agent sdlc request envelopes into objective type, risk class, route family, and downstream routing signals. use when request_envelope.json exists but objective_classification.json does not, before problem-type-router, authority extraction, context discovery, pseudocode planning, implementation, review, validation, adr drafting, or continuity updates.
---

# Objective Classifier

Classify a normalized request into the objective type and risk profile needed for route planning.

## Core rule

Classify the work, not the phrasing. A request like "clean this up" may be a refactor, bug fix, migration, documentation task, or operations task depending on deliverables, affected system, and risk.

## Required inputs

- `request_envelope.json` from `request-intake-normalizer`.
- Known project state, active work orders, issues, PRs, branch state, or continuity state when available.

## Objective taxonomy

Use exactly one primary objective type and zero or more secondary objective types:

- `new_system`
- `new_feature`
- `refactor`
- `bug_fix`
- `migration`
- `external_library`
- `experiment`
- `diagnosis`
- `documentation`
- `release`
- `operations`

Consult `references/objective-taxonomy.md` when classification is ambiguous.

## Classification workflow

1. Read `request_envelope.json` and list the requested outcomes.
2. Determine the primary objective based on the dominant deliverable and risk surface.
3. Add secondary objectives for material supporting work, such as documentation, migration, or diagnosis.
4. Assign risk class: `low`, `medium`, `high`, or `critical`.
5. Identify whether the request is implementation-leading, reverse-sync, review-only, planning-only, release/ops, or diagnostic.
6. Detect mandatory controls: architecture snapshot, ADR, human review, security review, migration plan, test expansion, or rollback plan.
7. Produce `objective_classification.json` using `references/objective-classification.schema.json`.
8. Handoff to `problem-type-router`.

## Output contract

Always return this structure:

```markdown
# Objective Classification

## Primary objective
<objective type>

## Secondary objectives
- <objective type or none>

## Risk precheck
- Risk class:
- Primary risk drivers:
- Mandatory controls:

## objective_classification.json
```json
{}
```

## next_skill_handoff
Send `objective_classification.json` to `problem-type-router` with risk drivers and mandatory controls preserved.
```

## Guardrails

- Do not route directly to implementation.
- Do not downgrade risk when public contracts, migrations, auth, persistence, concurrency, or irreversible operations are involved.
- If the request is only to understand or inspect, classify as `diagnosis` or `documentation`, not implementation.
- If human code has already changed and upstream artifacts are stale, classify as reverse-sync even if the prompt asks for review.
