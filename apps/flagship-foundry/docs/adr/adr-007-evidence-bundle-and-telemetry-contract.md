# ADR-007: Define Evidence Bundle and Telemetry Contract

## Status
proposed

## Date
2026-03-23

## Context
`WO-FF-007` sits in `M3` after the control-plane trust decision in ADR-006 and alongside the operational reliability and observability work described in the gap-analysis intent.

Foundry already has:
- an evidence-bundle schema at `flagship-foundry-work/schemas/evidence-bundle.schema.json`
- bundle assembly logic at `flagship-foundry-work/packages/core/src/evidence-bundle.mjs`
- run state at `flagship-foundry-work/packages/core/src/runs.mjs`
- richer run timeline semantics at `flagship-foundry-work/schemas/run-timeline.schema.json`
- observability guardrails at `flagship-foundry-work/guardrails/telemetry-and-observability.json`
- telemetry-oriented runbook and SME outputs under `flagship-foundry-work/runbooks/` and `flagship-foundry-work/state/ecosystems/web-automation-workspace/profiles/`

The current evidence bundle is verifier-friendly but minimal. It captures task status, verification results, and evidence artifacts, but it does not yet define how telemetry signals correlate to the same run, task, plan, and adapter. `M3` needs one contract so an independent verifier can answer three questions deterministically: what ran, what passed, and what runtime signals changed.

## Options Considered

### Option A: Keep evidence bundles minimal and leave telemetry separate
**Description**: Preserve the current evidence bundle shape and rely on ad hoc logs or manual telemetry lookup.  
**Pros**: Minimal schema change.  
**Cons**: Weak diagnosability, poor verifier ergonomics, and no deterministic correlation for incidents.

### Option B: Embed all telemetry payloads directly into the evidence bundle
**Description**: Make the bundle a single artifact that contains both verification and raw telemetry data.  
**Pros**: One file per run, easy offline review.  
**Cons**: Large payloads, noisy reviewer experience, and poor separation between summary evidence and raw signal streams.

### Option C: Use one correlated contract with summary evidence plus telemetry references
**Description**: Keep evidence bundles concise and verifier-oriented while requiring telemetry records to share stable correlation keys and referenceable artifacts.  
**Pros**: Balances readability, diagnosability, and storage discipline.  
**Cons**: Requires stronger correlation rules and artifact-generation discipline.

## Decision
Choose **Option C**.

Contract policy:
- `flagship-foundry-work/schemas/evidence-bundle.schema.json` remains the canonical verifier-facing summary contract.
- Detailed execution and verification timing remains anchored in the run and run-timeline artifacts.
- Telemetry data is linked to the evidence bundle by reference rather than embedded wholesale.

Correlation requirements:
- Every evidence summary and telemetry artifact must carry `runId`.
- Task-scoped records must also carry `taskId`.
- Run-correlated artifacts must carry `planId`, `ecosystemId`, and `adapterId` when available.
- Timestamps must be preserved in machine-readable form for before/after comparison and incident reconstruction.

Verifier requirements:
- The bundle must summarize verification outcomes and point to the produced evidence artifacts.
- Incident-derived or telemetry-driven work must include before/after telemetry references.
- When a fix-memory record is produced, the evidence model must point to it so learning artifacts remain tied to the originating run.

Milestone alignment:
- `WO-FF-007` exits only when an independent verifier can reconstruct the execution path from run state, evidence bundle, and telemetry references without relying on chat history or operator memory.
- `M4` release decisions may only consume evidence that conforms to this correlation model.

## Consequences

### Positive
- Gives the verifier a deterministic contract for operational and release sign-off.
- Preserves concise review artifacts while keeping deep telemetry available.
- Supports incident analysis, fix-memory generation, and release evidence reuse.

### Negative
- Adds correlation-field discipline across execution, verification, and telemetry producers.
- Requires schema and implementation changes in more than one artifact family.

### Risks
- Partial adoption could create mixed bundles where some tasks are fully correlated and others are not.
- If telemetry references are not retained long enough, evidence bundles may degrade over time.
- Over-collecting telemetry could produce noise unless the contract distinguishes required summaries from optional detail.

## References
- `.cursor/plans/foundry-gap-analysis-intent_d20ed327.plan.md`
- `apps/flagship-foundry/README.md`
- `apps/flagship-foundry/schemas/evidence-bundle.schema.json`
- `apps/flagship-foundry/schemas/run-timeline.schema.json`
- `apps/flagship-foundry/packages/core/src/evidence-bundle.mjs`
- `apps/flagship-foundry/packages/core/src/runs.mjs`
- `apps/flagship-foundry/guardrails/telemetry-and-observability.json`
- `apps/flagship-foundry/runbooks/telemetry-driven-improvement.runbook.json`
- `apps/flagship-foundry/personas/independent-verifier.json`
- `apps/flagship-foundry/state/ecosystems/web-automation-workspace/profiles/sme-web-automation-workspace-telemetry-observability.json`
