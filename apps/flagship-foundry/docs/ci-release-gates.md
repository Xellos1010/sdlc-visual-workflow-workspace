# CI baseline and release evidence threshold (ADR-009)

This document is the operator-facing definition of **blocking automation** and **release evidence** for Flagship Foundry under [adr-009-ci-gate-baseline-and-release-evidence-threshold.md](adr/adr-009-ci-gate-baseline-and-release-evidence-threshold.md).

## Blocking CI baseline (minimum)

When this repository is hosted on GitHub, the workflow **`.github/workflows/flagship-foundry-ci.yml`** (repo root) runs on changes under `flagship-foundry-work/`.

| Gate | Command | Purpose |
| --- | --- | --- |
| **1** | `npm test` (from `flagship-foundry-work/`) | Full automated test surface (`node --test`). |
| **2** | `npm run ci:targeted` | Non-unit path: orchestrator CLI `visualize` against the sample workspace (imports graph pipeline). |

Local parity (run before push):

```bash
cd flagship-foundry-work
npm install
npm test
npm run ci:targeted
```

## Inspectable evidence

- **CI green status** is necessary but **not sufficient** for production-style release (ADR-009).
- Each workflow run produces an artifact **`flagship-foundry-ci-gates-<run_id>`** containing `ci-gate-evidence.txt` with repository, run URL, commit SHA, and gate labels. Attach or reference this for milestone sign-off.
- **Release readiness** also requires evidence that **M2** (classification, parity policy, knowledge/gap signals) and **M3** (auth boundary, telemetry correlation, adapter isolation) quality signals remain satisfied for the change scope—typically by referencing prior verifier packets, evidence bundles, or run-linked artifacts, not only the latest green CI run.

## Waivers and future gates

Categories not yet automated (for example SBOM or dependency CVE gates) remain **explicit blockers** or **documented waivers** per ADR-009—they must not be treated as silent future work.

## Related

- [source-of-truth-matrix.md](source-of-truth-matrix.md) — artifact authority
- [REPOSITORY_LAYOUT.md](REPOSITORY_LAYOUT.md) — canonical app root
- [NEXT_AGENT_EXECUTION_STEPS.md](adr/NEXT_AGENT_EXECUTION_STEPS.md) — agent verification playbook
- [rollout-rollback-incident-model.md](rollout-rollback-incident-model.md) — go/no-go and operational linkage (ADR-010)
