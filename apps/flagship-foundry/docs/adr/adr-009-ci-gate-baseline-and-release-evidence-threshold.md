# ADR-009: Set CI Gate Baseline and Release Evidence Threshold

## Status
accepted

## Date
2026-03-23

## Context
`WO-FF-009` is the `M4` industrialization work order for CI and release gating. It depends on the evidence and runtime hardening completed in `M2` and `M3`.

Today the repository has:
- a minimum milestone verification note in `flagship-foundry-work/docs/adr/NEXT_AGENT_EXECUTION_STEPS.md` that points to `cd flagship-foundry-work && npm test`
- executable sample scripts in `flagship-foundry-work/package.json`
- API endpoints and run evidence concepts documented in `flagship-foundry-work/README.md`
- evidence and run schemas under `flagship-foundry-work/schemas/`

What it does not yet have is a repository-owned CI baseline and a release threshold that says exactly how much automated evidence is enough to declare a change releasable. Without that decision, later milestones risk falling back to manual judgment or inconsistent gate depth.

## Options Considered

### Option A: Manual sign-off with advisory automation
**Description**: Keep tests and scripts available, but let operators decide what to run and whether release evidence is sufficient.  
**Pros**: Minimal setup effort.  
**Cons**: Inconsistent release quality, poor auditability, and weak protection against regressions.

### Option B: Full enterprise-grade gate stack from day one
**Description**: Require a comprehensive pipeline immediately, including every desired quality, security, and release artifact.  
**Pros**: Strong long-term posture.  
**Cons**: High initial cost and likely blocks `M4` on tooling that does not yet exist in the repository.

### Option C: Staged CI baseline with explicit blocking release evidence
**Description**: Define a blocking minimum gate set now, expand it as tooling lands, and require evidence-backed sign-off for release readiness.  
**Pros**: Practical for current maturity, aligns with milestone sequencing, and prevents "green by anecdote."  
**Cons**: Requires careful distinction between current blocking gates and planned future gates.

## Decision
Choose **Option C**.

CI baseline policy:
- `WO-FF-009` must introduce repository-owned automated gates rather than relying on operator memory.
- The blocking baseline must include the currently supported automated test surface, beginning with `npm test`.
- The blocking baseline must also include at least one targeted workflow that exercises the changed surface using existing repository commands or APIs, rather than unit tests alone.
- Gate results must be preserved as evidence artifacts that can be attached to milestone and release sign-off.

Release evidence threshold:
- A release candidate is not release-ready unless it has current automated gate results plus a corresponding evidence bundle or equivalent run-linked evidence for the changed scope.
- `M4` decisions must consume `M2` and `M3` evidence, not just the current pipeline run, because runtime hardening and telemetry contracts are prerequisite quality signals.
- If required categories such as dependency or SBOM evidence are not yet automated, they must remain explicit blockers or approved waivers. They must not be treated as silent future work.

Operational rule:
- CI status is necessary but not sufficient; release readiness requires both passing automation and evidence that the independent verifier can inspect.
- The threshold for production-style release is evidence-backed completion, not only successful command exit codes.

## Consequences

### Positive
- Gives `WO-FF-009` a realistic but enforceable starting point.
- Keeps the team from confusing "some tests ran" with "release evidence exists."
- Allows the CI system to mature incrementally without losing architectural discipline.

### Negative
- Teams must define and maintain targeted workflow checks in addition to the generic test command.
- Some releases may be delayed until evidence retention and upload are automated cleanly.

### Risks
- If the baseline remains too shallow for too long, the repository may have formal CI without meaningful protection.
- If waivers are easy to grant, evidence thresholds may erode in practice.
- If evidence artifacts are produced but not retained, release audits may become non-reproducible.

## References
- `.cursor/plans/foundry-gap-analysis-intent_d20ed327.plan.md`
- `apps/flagship-foundry/docs/adr/README.md`
- `apps/flagship-foundry/docs/adr/NEXT_AGENT_EXECUTION_STEPS.md`
- `apps/flagship-foundry/package.json`
- `apps/flagship-foundry/README.md`
- `apps/flagship-foundry/schemas/evidence-bundle.schema.json`
- `apps/flagship-foundry/schemas/run-timeline.schema.json`
- `apps/flagship-foundry/runbooks/feature-delivery.runbook.json`
- `apps/flagship-foundry/personas/independent-verifier.json`
- `apps/flagship-foundry/state/ecosystems/web-automation-workspace/profiles/sme-web-automation-workspace-verification-and-quality-gates.json`
