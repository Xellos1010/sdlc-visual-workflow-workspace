---
name: adr-writer
description: >
  Creates Architecture Decision Records in standard format with context,
  options, decision, and consequences. Used by the systems-architect agent.
---

# ADR Writer

Create Architecture Decision Records that capture the reasoning behind structural decisions.

## ADR Template

```markdown
# ADR-[NNN]: [Short Decision Title]

## Status
[proposed | accepted | deprecated | superseded by ADR-NNN]

## Date
[ISO 8601 date]

## Context
[Why does this decision need to be made? Include constraints, requirements, and forces.]

## Options Considered

### Option A: [Name]
**Description**: ...
**Pros**: ...
**Cons**: ...

### Option B: [Name]
**Description**: ...
**Pros**: ...
**Cons**: ...

## Decision
[What we decided and why — reference specific tradeoffs.]

## Consequences

### Positive
- ...

### Negative
- ...

### Risks
- ...

## References
- [File paths, schema references, prior ADRs]
```

## Naming Convention
- Store in `docs/adr/`
- File name: `adr-NNN-short-kebab-title.md`
- Number sequentially within the project

## Quality Checklist
- [ ] Context explains WHY, not just WHAT
- [ ] At least two options considered
- [ ] Decision rationale references the tradeoffs
- [ ] All file references use actual existing paths
- [ ] Status set to `proposed` for new ADRs
