---
name: independent-verifier
description: independently verify cloud-agent sdlc work, implementation claims, test evidence, scope compliance, acceptance criteria, risk gates, artifacts, and release or merge readiness. use after generated-code-reviewer, test-execution-verifier, performance-budget-enforcer, pr-integration-governor checks, or human review when a second-pass verifier must confirm work without relying on the original implementer summary.
---

# Independent Verifier

## Overview

Perform an independent second-pass verification before integration, release, continuity closure, or human handoff.

## Core rule

Do not rely on the implementer summary as proof. Verify claims against concrete artifacts or mark them `not_evidenced`.

## Required inputs

- Work order, acceptance criteria, and allowed scope
- Implementation diff, generated reports, validation logs, PR body, ADRs, and continuity state when available
- Test, typecheck, lint, performance, security, and manual evidence when required

## Workflow

1. Restate the claimed work and expected output.
2. Map each acceptance criterion to evidence.
3. Check scope boundaries: allowed files, forbidden files, locks, branch lane, and rollback notes.
4. Confirm validation evidence includes command, result, environment, and artifact pointer when available.
5. Classify each criterion as pass, fail, blocked, or not_evidenced.
6. Identify residual risks, missing evidence, human decisions, and rollback concerns.
7. Emit final disposition: verified, verified_with_notes, blocked, failed, or needs_human_review.

## Output artifacts

- `independent_verification_report.md`
- `independent_verification_report.json`

Use `references/independent_verification_report.schema.json` and `references/operations-control-contract.md`.

## Output template

```markdown
# Independent Verification Report

## Status
- status:
- confidence:
- safe_next_action:

## Findings
| Criterion or claim | Evidence | Disposition | Notes |
|---|---|---|---|

## Blocking gaps
-

## Human decisions required
-

## next_skill_handoff
- next_skill:
- reason:
- required_inputs:
- safe_actions:
- blocked_actions:
```

## Guardrails

Do not mutate repository state. Do not mark missing evidence as pass.
