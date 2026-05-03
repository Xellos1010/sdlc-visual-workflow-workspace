---
name: roadmap-feature-factory
description: create, refresh, reconcile, and prioritize feature roadmap entries from repository state, issues, docs, adrs, work orders, product goals, bugs, gaps, and scheduled audits in cloud-agent sdlc workflows. use during discovery, planning, operation, or backlog refresh when the agent must convert raw repo findings or human goals into feature candidates, dependencies, acceptance criteria, scope candidates, risks, and next work-order handoffs.
---

# Roadmap Feature Factory

Convert repo findings, issues, goals, and gaps into a durable roadmap that can feed scope chunking and work-order creation.

## Core rule

A roadmap entry is not an implementation order. It is a prioritized candidate with evidence, status, dependencies, risks, and the next safe planning action.

## Required inputs

- Repository intake audit
- Workspace authority resolution
- Issues, tickets, docs, ADRs, README, roadmap docs, and continuity state when available
- User goals or project strategy when provided
- Evidence from repository discovery or scheduled audits

## Workflow

1. Extract feature candidates from human goals, issues, docs, task notes, audit gaps, PRs, and continuity state.
2. Deduplicate overlapping candidates and preserve source evidence.
3. Classify each candidate by type, status, impact, complexity, dependency, risk, and evidence quality.
4. Identify missing definition or design artifacts before implementation is allowed.
5. Produce acceptance criteria only when supported by sources; otherwise list definition questions.
6. Rank items with a transparent rationale.
7. Produce `feature_roadmap.md` and `feature_roadmap.json`.

## Output format

```markdown
# Feature Roadmap

## Summary
- total_candidates:
- ready_for_scope_chunking:
- blocked_or_needs_definition:

## Roadmap table
| Priority | Feature | Type | Status | Impact | Complexity | Dependencies | Next action |
|---|---|---|---|---|---|---|---|

## Feature detail
### <feature name>
- source_evidence:
- problem_statement:
- user_or_system_value:
- acceptance_criteria:
- dependencies:
- risks:
- missing_context:
- recommended_next_skill:

## feature_roadmap.json
```json
{}
```

## next_skill_handoff
Usually hand ready items to `scope-chunker`; hand unclear items to `request-intake-normalizer`, `domain-context-locator`, or `architecture-snapshot-reader`.
```

## Guardrails

- Do not promise delivery dates unless provided by authority sources.
- Do not turn low-evidence ideas directly into implementation scope.
- Do not discard duplicate candidates; merge them and retain provenance.
