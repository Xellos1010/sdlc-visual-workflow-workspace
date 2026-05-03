---
name: semantic-diff-explainer
description: explain code, schema, pseudocode, adr, documentation, and artifact diffs in semantic review terms for a cloud-agent sdlc workflow. use when reviewers need to understand what changed, why it matters, which behavior or contracts are affected, what risks and tests are relevant, which questions remain, or when a semantic_diff_report.md, risk_summary, review_questions, or decision-ledger handoff is needed from git diffs or artifact diffs.
---

# Semantic Diff Explainer

Turn raw diffs into reviewer-ready meaning. This skill explains the behavioral, architectural, contract, risk, and validation implications of changed artifacts without rewriting code.

## Core rule

Explain what the diff means, not just what lines changed. Do not claim behavior, safety, or validation unless the diff, tests, evidence, notes, or artifacts support it. Preserve uncertainty explicitly.

## Required inputs

Normalize available context into:

- `git_diff`: unified diff, PR diff, commit range, or changed-file list.
- `artifact_diffs`: pseudocode, schema, ADR, diagram, test, docs, memory, or generated artifact diffs.
- `work_order`: active scope, acceptance criteria, task state, issue, or PR body.

## Workflow

1. Identify changed artifact types and group related changes.
2. Summarize the semantic change in reviewer language: behavior, contract, data model, architecture, dependency, validation, docs, or cleanup.
3. Map each change to work-order scope and acceptance criteria when available.
4. Assess risk using `references/semantic-risk-taxonomy.md`.
5. Identify validation evidence present, missing, or insufficient.
6. Identify reviewer questions that would materially change acceptance, ADRs, parity, or rollback.
7. Produce `semantic_diff_report.md` using `references/semantic-diff-report-template.md`.
8. Produce `risk_summary` and `next_skill_handoff` for `decision-tradeoff-ledger` when decisions, tradeoffs, or reversibility conditions are present.

## Output contract

Always return this structure:

```markdown
# Semantic Diff Report

## Verdict
clear_for_review | review_questions_present | blocked

## semantic_diff_report.md
<report content>

## risk_summary
```json
{}
```

## Review questions
- <question or none>

## Evidence check
| Claim | Evidence present? | Source | Gap |
|---|---|---|---|

## next_skill_handoff
<handoff for decision-tradeoff-ledger or none>
```

## Explanation policy

- Prefer semantic groups over file-by-file narration when files participate in the same behavior.
- Mention file paths only when they help review or traceability.
- Separate confirmed behavior from likely intent.
- Distinguish implementation risk from product risk and operational risk.
- If tests are changed but not run, say validation artifacts are missing.
- If code changes without matching pseudocode, schema, ADR, or test updates, flag parity risk.
- If the diff is too large to inspect fully, summarize inspected areas and identify uninspected areas instead of overclaiming.

## Quality checklist

Before finalizing, verify:

- The report has a one-paragraph reviewer summary.
- Risks are tied to changed behavior or artifacts.
- Claims are backed by diff evidence, notes, or validation artifacts.
- Review questions are specific and decision-relevant.
- The decision-ledger handoff includes tradeoffs, uncertainty, and reversal conditions when present.
