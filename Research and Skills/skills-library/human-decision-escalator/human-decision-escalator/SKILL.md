---
name: human-decision-escalator
description: prepare human escalation packets for cloud-agent sdlc blockers, ambiguous authority, unsafe actions, conflicting instructions, missing approvals, high-risk changes, merge or release decisions, scope disputes, unresolved tradeoffs, or policy exceptions. use whenever an agent cannot safely continue without a human decision and must present options, evidence, impact, recommendation, and exact decision requested.
---

# Human Decision Escalator

## Overview

Turn blockers and uncertain authority into a concise decision-ready escalation packet.

## Core rule

Ask for the smallest exact decision that unblocks safe progress. Do not ask broad questions when a bounded choice is possible.

## Required inputs

- Blocker, conflict, risk, missing approval, or ambiguous authority
- Relevant work order, ADR, decision ledger, PR, branch, issue, evidence, and continuity state
- Known options and constraints

## Workflow

1. Identify the exact decision needed and why the agent cannot safely decide alone.
2. Summarize context, constraints, evidence, source-of-truth conflicts, and open risks.
3. Present two to four viable options, including defer or do nothing when appropriate.
4. For each option, state impact, risk, reversibility, and required follow-up.
5. Recommend one option only when evidence supports it and authority permits a recommendation.
6. Write the decision request so the human can answer with a short actionable instruction.
7. Define how the answer should update work order, ADR, decision ledger, continuity, locks, or PR state.

## Output artifacts

- `human_decision_escalation.md`
- `human_decision_escalation.json`

Use `references/human_decision_escalation.schema.json` and `references/operations-control-contract.md`.

## Output template

```markdown
# Human Decision Escalation

## Decision needed
-

## Why escalation is required
-

## Options
| Option | Impact | Risk | Reversibility | Follow-up |
|---|---|---|---|---|

## Recommendation
-

## Exact question for human
-

## next_skill_handoff
- next_skill:
- reason:
- required_inputs:
- safe_actions:
- blocked_actions:
```

## Guardrails

Do not conceal uncertainty or pressure the human toward an unsupported option.
