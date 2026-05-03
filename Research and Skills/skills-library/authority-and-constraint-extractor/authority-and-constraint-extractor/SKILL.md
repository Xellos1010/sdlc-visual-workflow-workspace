---
name: authority-and-constraint-extractor
description: extract source-of-truth order, hard constraints, approvals, non-goals, security boundaries, runtime restrictions, rollback requirements, and quality bars for cloud-agent sdlc work. use when a route plan exists and the agent must know what it may and may not do before context discovery, design, pseudocode, implementation, review, validation, release, adr drafting, parity sync, or continuity updates.
---

# Authority And Constraint Extractor

Create a constraint contract that binds the rest of the SDLC chain.

## Core rule

Authority beats convenience. When instructions conflict, preserve the conflict, choose the highest-authority source, and mark any unsafe or unclear action as blocked or human-review-required.

## Required inputs

- `request_envelope.json`
- `objective_classification.json`
- `route_plan.json`
- Workspace authority stack, docs, runbooks, ADRs, issue/PR instructions, current-task files, branch policy, security policy, and continuity state when available

## Authority order

Use this default order unless project documentation defines a stricter one:

1. System, safety, and platform constraints
2. Human operator's latest explicit instruction
3. Repository governance, branch policy, and active locks
4. Current work order and acceptance criteria
5. ADRs and decision ledger
6. Architecture docs, runbooks, schemas, and tests
7. Codebase reality
8. Prior conversation or inferred convention

Consult `references/authority-stack-contract.md` for conflict handling.

## Extraction workflow

1. List all authoritative sources consulted or required.
2. Extract hard constraints, soft preferences, non-goals, approval boundaries, and blocked actions.
3. Identify security, privacy, data migration, external API, dependency, deployment, and runtime restrictions.
4. Define the quality bar: tests, evidence, review gates, complexity, observability, rollback, and documentation requirements.
5. Resolve conflicts using authority order; preserve unresolved conflicts as blockers.
6. Produce `constraint_contract.json` using `references/constraint-contract.schema.json`.
7. Handoff to `domain-context-locator`.

## Output contract

Always return this structure:

```markdown
# Constraint Contract

## Authority stack
1. <source and authority level>

## Hard constraints
- <constraint or none>

## Approval boundaries
- <boundary or none>

## Non-goals
- <non-goal or none>

## Quality bar
- Tests:
- Review:
- Evidence:
- Rollback:

## constraint_contract.json
```json
{}
```

## next_skill_handoff
Send `constraint_contract.json` to `domain-context-locator` with unresolved conflicts and mandatory evidence requirements preserved.
```

## Guardrails

- Do not treat absent approval as approval for deploys, destructive changes, external communication, data migration, or irreversible operations.
- Do not erase lower-authority constraints; mark them superseded when conflicts are resolved.
- If a requested action violates hard constraints, return blocked status and the minimum safe alternative.
