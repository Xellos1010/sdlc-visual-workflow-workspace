---
name: adr-draft-writer
description: write architecture decision records for material architecture, abstraction, schema, performance, persistence, integration, tool, codegen, or trade-off decisions in a cloud-agent SDLC workflow. use when an agent makes, detects, reviews, or must document a historically inspectable decision, including outputs from generated-code-reviewer, human-code-delta-ingestor, architecture-drift-detector, or decision-tradeoff-ledger.
---

# ADR Draft Writer

Create durable Architecture Decision Records (ADRs) for decisions that must remain inspectable across code, pseudocode, schema, test, evidence, and memory artifacts.

## Core rule

Write an ADR only when the decision changes or constrains architecture, contracts, persistence, tooling, performance budgets, integrations, workflow policy, or long-lived implementation direction. For routine implementation details, produce a short decision note instead and say an ADR is not required.

## Required inputs

Work from the available conversation, repo context, diffs, work orders, pseudocode, schemas, validation evidence, and human notes. Normalize the inputs into:

- `decision_context`: problem, forces, constraints, affected systems, evidence
- `options`: at least two credible options, unless documenting a mandatory compliance constraint
- `chosen_option`: the selected path
- `consequences`: positive, negative, and neutral impacts
- `affected_artifacts`: paths, work orders, schemas, tests, PRs, diffs, prior ADRs, evidence bundles

Do not invent file paths, prior ADRs, validation results, or approvals. If evidence is missing, mark it explicitly in the ADR and in follow-up actions.

## Workflow

1. Decide whether the decision warrants an ADR.
2. Determine the ADR status: `Proposed`, `Accepted`, `Superseded`, or `Rejected`.
3. Resolve the ADR id and filename:
   - Prefer the next sequential id in `docs/adr/` when repository context is available.
   - If the next id cannot be verified, use `ADR-XXX` and add a follow-up action to assign the id.
   - Filename format: `adr-NNN-short-kebab-title.md`.
4. Draft `adr.md` using the template in `references/adr-template.md`.
5. Draft `adr_metadata.json` using `references/adr-metadata-schema.json` as the shape.
6. Produce a concise decision summary for humans and downstream agents.
7. Produce follow-up actions and `next_skill_handoff` for `adr-indexer`.
8. Run the quality checklist before returning the final answer.

## Output contract

Always return these sections when asked to draft an ADR:

```markdown
# ADR Draft Package

## Recommended path
[Create ADR / Update existing ADR / No ADR needed]

## Filename
[docs/adr/adr-NNN-short-kebab-title.md or unresolved filename]

## adr.md
[Complete ADR markdown]

## adr_metadata.json
[JSON metadata]

## Decision summary
[Short summary]

## Follow-up actions
- [Action]

## next_skill_handoff
[Handoff for adr-indexer]
```

If editing a repository directly, write or update the ADR file at the resolved path and still summarize the package.

## ADR quality checklist

Before finalizing, verify:

- The context explains why the decision exists, not just what changed.
- The ADR includes at least two options or explains why only one option is valid.
- The decision clearly names the chosen option and the rejected alternatives.
- Consequences include positive, negative, and neutral impacts where applicable.
- Reversal triggers describe concrete signals that should reopen the decision.
- Linked artifacts use actual available paths or are marked as unverified.
- Follow-up actions include missing evidence, id assignment, index updates, and parity sync needs.
- Metadata is valid JSON and aligns with the ADR content.

## Cloud-agent SDLC handoff

Use ADRs to support parity across SDLC artifacts. When the ADR is created from generated code, human edits, drift detection, or validation evidence, explicitly link the relevant upstream artifacts and request downstream indexing.

Default `next_skill_handoff` target:

```json
{
  "next_skill": "adr-indexer",
  "reason": "index the ADR, cross-link affected artifacts, and update the decision ledger",
  "inputs": ["adr.md", "adr_metadata.json", "work_order", "evidence_bundle"]
}
```

If the decision also affects memory, tests, pseudocode, schemas, or diagrams, include follow-up actions for `decision-tradeoff-ledger` and `parity-sync-manager`.
