---
name: software-engineer-decision-capture
description: capture, clarify, and prepare adr candidates for design decisions implied by human engineer code changes in a cloud-agent sdlc workflow. use when a human_delta_record.json, diff summary, commit, pull request, or implementation divergence suggests a material architecture, persistence, dependency, schema, security, performance, rollback, or workflow decision that is not represented in the existing adr index, or when questions for the engineer are needed before updating decisions.
---

# Software Engineer Decision Capture

Convert human-authored implementation changes into explicit decision records or review questions. This skill prevents human engineering intent from becoming invisible system behavior.

## Core rule

Do not invent the engineer's hidden intent. Separate decisions that are directly evidenced by code or notes from decisions that require confirmation. When intent is unclear, ask precise questions and create ADR candidates with `status: needs_confirmation`.

## Required inputs

Normalize available context into:

- `human_delta_record.json`: accepted delta record from `human-code-delta-ingestor`, if available.
- `diff_summary`: semantic diff summary, PR summary, commit messages, or changed-file summary.
- `existing_adr_index`: ADR index, decision ledger, relevant ADRs, or statement that no ADR index was available.

## Workflow

1. Identify material decision signals in the human delta.
2. Check whether each signal is already represented in the ADR index or decision ledger.
3. Classify decision type: architecture, interface, schema, persistence, dependency, workflow, security, performance, observability, rollout, rollback, or operational policy.
4. For each decision signal, classify evidence level:
   - `explicit`: stated in notes, PR, commit, ADR, or review.
   - `strongly_implied`: code structure makes the decision visible but rationale is unstated.
   - `unclear`: behavior changed but design intent is ambiguous.
5. Generate `human_decision_capture.md` using `references/decision-capture-template.md`.
6. Generate `questions_for_engineer` only for material ambiguity that blocks ADR accuracy or safe parity updates.
7. Generate ADR update candidates using `references/adr-update-candidate-schema.json`.
8. Produce `next_skill_handoff` for `adr-draft-writer` when at least one ADR candidate exists.

## Output contract

Always return this structure:

```markdown
# Human Decision Capture

## Verdict
captured | captured_with_questions | no_material_decision | blocked

## human_decision_capture.md
<decision capture content>

## questions_for_engineer
- <question or none>

## adr_update_candidates
```json
[]
```

## Existing ADR coverage
| Decision signal | Covered by ADR? | ADR id/path | Gap |
|---|---|---|---|

## next_skill_handoff
<handoff for adr-draft-writer or none>
```

## Decision capture policy

- Material decisions must become ADR candidates or explicit ledger entries.
- Refactors are not ADR decisions unless they change ownership, boundaries, contracts, dependencies, performance posture, or rollback risk.
- Do not ask broad questions such as "why did you do this?" Ask targeted questions tied to artifact gaps.
- If code contradicts an accepted ADR, flag an ADR conflict instead of assuming the ADR is obsolete.
- If a human override reversed an agent choice, record the reversal condition and hand off to `decision-tradeoff-ledger` through ADR drafting.
- If the decision is small and already covered by an existing ADR, produce `no_material_decision` and list the covering ADR.

## Question style

Good questions are narrow, answerable, and artifact-oriented:

- "Should the new adapter boundary in `<path>` supersede ADR-012, or is it a temporary implementation detail?"
- "Is the schema field `<field>` now part of the public contract, or is it internal-only?"
- "Should the dependency on `<package>` be captured as an accepted tool decision?"

Avoid questions that ask the engineer to restate the entire implementation.

## Quality checklist

Before finalizing, verify:

- Every ADR candidate names the observed decision, evidence, consequences, and uncertainty.
- Questions are only included when they change the ADR or parity outcome.
- Existing ADR coverage is checked before proposing new ADRs.
- The handoff to `adr-draft-writer` includes options, chosen or implied option, consequences, affected artifacts, and confidence.
