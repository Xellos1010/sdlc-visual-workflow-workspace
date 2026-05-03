---
name: risk-blast-radius-analyzer
description: analyze proposed work orders, implementation diffs, changed files, branches, pull requests, or planned edits for hidden risk, affected systems, dependency paths, validation gaps, review gates, rollback needs, and escalation triggers. use during planning, verification, integration, or before mutation when cloud-agent work may touch shared code, contracts, state, security, migrations, generated files, ci, deployment, or multiple repository areas.
---

# Risk Blast Radius Analyzer

Evaluate the hidden impact of proposed or actual changes before implementation, verification, integration, or release.

## Core rule

Risk is determined by affected behavior and reversibility, not just diff size. Small changes in shared, stateful, security-sensitive, or public-contract files can be high risk.

## Required inputs

- Work order, changed file list, diff summary, PR, or planned file scope
- Repository intake audit and architecture/context artifacts when available
- Known tests, CI, validation commands, ownership, and rollback path
- Evidence from generated-code review or implementation insertion verification when available

## Workflow

1. List touched or proposed files and map them to runtime surfaces, packages, owners, and dependent systems.
2. Identify hidden-risk signals from `references/risk-taxonomy.md`.
3. Classify risk level and justify it with evidence.
4. Define required validation commands, manual review gates, rollback notes, and escalation conditions.
5. Identify sibling systems that need impact checks even if not directly edited.
6. Produce `risk_blast_radius_report.md` and `risk_blast_radius_report.json`.

## Output format

```markdown
# Risk Blast Radius Report

## Risk level
- level:
- rationale:
- confidence:

## Affected systems
| System | Files | Impact | Risk signal |
|---|---|---|---|

## Validation requirements
| Requirement | Reason | Blocking? |
|---|---|---|

## Review and escalation gates
- required_reviewers_or_roles:
- human_approval_needed:
- blocked_actions:

## Rollback notes
- rollback_path:
- irreversible_risks:

## risk_blast_radius_report.json
```json
{}
```

## next_skill_handoff
Usually hand to `generated-code-reviewer`, `test-execution-verifier`, `performance-budget-enforcer`, `pr-integration-governor`, or `memory-continuity-manager`.
```

## Guardrails

- Do not downgrade risk because tests passed if the changed surface is untested or unobserved.
- Do not approve merge or release; provide risk evidence and gates only.
- Do not ignore indirect consumers of shared contracts or data models.
