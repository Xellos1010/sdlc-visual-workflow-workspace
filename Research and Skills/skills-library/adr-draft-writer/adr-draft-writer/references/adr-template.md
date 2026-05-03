# ADR Template

Use this exact structure for `adr.md` unless the repository has a stronger ADR convention.

```markdown
# ADR-<id>: <title>

## Status
Proposed | Accepted | Superseded | Rejected

## Date
<YYYY-MM-DD>

## Context
<problem, forces, constraints, affected systems, and evidence>

## Options considered

### Option 1: <name>
<how it works>

Benefits:
- <specific benefit>

Risks:
- <specific risk>

### Option 2: <name>
<how it works>

Benefits:
- <specific benefit>

Risks:
- <specific risk>

## Decision
<chosen option and rationale>

## Consequences

Positive:
- <what becomes easier or safer>

Negative:
- <what becomes harder, riskier, or more expensive>

Neutral:
- <trade-offs, maintenance obligations, or accepted constraints>

## Reversal triggers
- <observable signal that should reopen the decision>

## Linked artifacts
- Work order: <path or id>
- Pseudocode: <path or id>
- Schema: <path or id>
- Code diff: <path, PR, or commit>
- Evidence: <validation report, test run, benchmark, review>
- Prior ADRs: <path or id>
```
