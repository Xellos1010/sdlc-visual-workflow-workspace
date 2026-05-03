---
name: trace-evidence-collector
description: collect, normalize, cross-reference, and package trace evidence for cloud-agent sdlc work across commands, logs, diffs, prs, issues, work orders, adrs, validation reports, test output, screenshots, and continuity state. use before independent verification, pr integration, release readiness, audit handoff, memory continuity updates, or human escalation when evidence must be concrete and traceable.
---

# Trace Evidence Collector

## Overview

Build a traceable evidence bundle that reviewers can inspect without relying on narrative claims.

## Core rule

Evidence must be concrete and inspectable. A statement such as "tests passed" is not evidence unless it includes a command, log, CI run, or comparable artifact.

## Required inputs

- Claims, acceptance criteria, work order, PR, diff, issue, ADR, validation output, and continuity state
- Relevant file paths, command logs, CI runs, screenshots, reports, or connector records

## Workflow

1. List every claim that needs evidence.
2. Collect evidence pointers from files, command output, CI logs, PRs, issues, ADRs, reports, and continuity records.
3. Normalize each item with source, artifact path or URL, command, status, timestamp when available, and confidence.
4. Map evidence to acceptance criteria, risks, decisions, files, commits, branches, and validation commands.
5. Detect stale, duplicate, contradictory, partial, or missing evidence.
6. Produce a reviewer-ready table and machine-readable evidence bundle.
7. Route evidence gaps to the right next skill.

## Output artifacts

- `trace_evidence_bundle.md`
- `trace_evidence_bundle.json`

Use `references/trace_evidence_bundle.schema.json` and `references/operations-control-contract.md`.

## Output template

```markdown
# Trace Evidence Bundle

## Evidence summary
| Claim | Evidence | Source | Status | Confidence |
|---|---|---|---|---|

## Missing or stale evidence
-

## Contradictions
-

## next_skill_handoff
- next_skill:
- reason:
- required_inputs:
- safe_actions:
- blocked_actions:
```

## Guardrails

Do not invent evidence. Preserve uncertainty and source limitations.
