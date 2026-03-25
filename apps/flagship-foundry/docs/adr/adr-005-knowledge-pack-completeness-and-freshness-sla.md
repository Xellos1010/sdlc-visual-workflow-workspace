# ADR-005: Define Knowledge-Pack Completeness and Freshness SLA

## Status
accepted

## Date
2026-03-23

## Context
`WO-FF-005` is the knowledge-coverage work order in milestone `M2`, following the authority decisions in ADR-001 and the drift rules in ADR-003.

The repository already has:
- a pack contract at `flagship-foundry-work/schemas/knowledge-pack.schema.json`
- knowledge-state manifests under `flagship-foundry-work/state/knowledge/`
- a coverage report at `flagship-foundry-work/state/knowledge/foundry-foundational-docs/coverage-report.md`
- source lineage and versions at `flagship-foundry-work/state/knowledge/foundry-foundational-docs/manifest.json`
- SME profile outputs that depend on pack quality under `flagship-foundry-work/state/ecosystems/web-automation-workspace/profiles/`

What is missing is a decision for when a pack is considered complete enough and fresh enough to unblock later work. Document counts alone do not tell the team whether a pack has the required lineage, downstream links, or refresh cadence. `M2` needs an explicit SLA so `WO-FF-005` can exit with objective criteria and so `M3` and `M4` do not consume stale pack inputs.

## Options Considered

### Option A: Best-effort pack growth with no formal SLA
**Description**: Keep adding documents and coverage reports, but leave completeness and refresh timing to operator judgment.  
**Pros**: Lowest process overhead.  
**Cons**: No objective exit criteria, high drift risk, and later milestones cannot reliably know whether pack inputs are current.

### Option B: One global repository-wide SLA for every pack
**Description**: Apply one uniform completeness rule and one uniform refresh window to all packs.  
**Pros**: Simple to explain and automate.  
**Cons**: Treats high-churn and low-churn packs the same, over-constrains archival/reference packs, and under-specifies milestone-critical packs.

### Option C: Tiered SLA by pack criticality and downstream linkage
**Description**: Define completeness using canonical contract plus lineage and linkage, and define freshness windows by milestone relevance.  
**Pros**: Aligns to `M2` through `M4`, supports objective verification, and focuses operational effort on packs that actually gate work orders.  
**Cons**: Requires pack classification and waiver handling.

## Decision
Choose **Option C**.

Completeness policy:
- A knowledge pack is complete only when its canonical contract is defined by `flagship-foundry-work/schemas/knowledge-pack.schema.json`.
- The pack must have source lineage recorded in a knowledge manifest such as `flagship-foundry-work/state/knowledge/foundry-foundational-docs/manifest.json`.
- The pack must appear in a generated coverage artifact such as `flagship-foundry-work/state/knowledge/foundry-foundational-docs/coverage-report.md`.
- If the pack is used to drive personas, runbooks, or guardrails for active work, the corresponding downstream artifacts must resolve from canonical Foundry assets rather than ad hoc notes.

Freshness policy:
- Packs directly supporting the active milestone are **critical** and must be refreshed within 14 days of source-version change or before milestone exit, whichever comes first.
- Packs required for the next planned milestone are **important** and must be refreshed within 30 days.
- Reference-only packs may exceed these windows only if they are not referenced by active work orders or gate logic.

Milestone alignment:
- `M2` exit for `WO-FF-005` requires all packs that directly support knowledge coverage, environment parity, verification, or observability work to meet the completeness rules above.
- `M3` and `M4` may consume only packs that are complete and not past SLA, unless an explicit waiver is recorded in the active plan or approval artifacts.

## Consequences

### Positive
- Gives `WO-FF-005` an objective definition of done.
- Makes later milestone inputs auditable through manifests and coverage reports.
- Reduces the risk that stale documentation silently feeds planning, verification, or operations.

### Negative
- Introduces pack classification and waiver-management work.
- Some packs that appear large by document count may still fail completeness because their linkage is weak.

### Risks
- Overly strict freshness windows could slow milestone closure if source refresh automation is incomplete.
- Weak downstream linkage checks could still allow apparently complete packs that do not materially help planning.
- Teams may optimize for document counts unless completeness checks emphasize lineage and linkage over volume.

## Acceptance Notes
- `WO-FF-005` implements tier-aligned completeness and freshness checks in `packages/core/src/gap-analysis.mjs`.
- Knowledge-base outputs now stamp SLA authority and freshness policy from ADR-005 under ADR-001 authority constraints.
- Canonical downstream linkage for active packs is enforced through SME profile `knowledgePackIds` references.

## References
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/.cursor/plans/foundry-gap-analysis-intent_d20ed327.plan.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/docs/adr/README.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/docs/adr/ADR_DECISION_PACKET_PREBUILD.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/docs/adr/NEXT_AGENT_EXECUTION_STEPS.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/schemas/knowledge-pack.schema.json`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/state/knowledge/foundry-foundational-docs/coverage-report.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/state/knowledge/foundry-foundational-docs/manifest.json`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/state/ecosystems/web-automation-workspace/profiles/sme-web-automation-workspace-knowledge-ingestion-and-rag.json`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/state/ecosystems/web-automation-workspace/profiles/sme-web-automation-workspace-environment-parity-and-tooling.json`
