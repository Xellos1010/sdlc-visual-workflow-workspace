# Import to Foundry Instructions

Use `foundry-import-manifest.json` from this workspace.

## Import now
This is the final relay workspace. Import all pre-implementation artifacts now:
- intent-packet.md
- object-model.md, state-authority-matrix.md
- view-registry.json, screen-map.md, drill-down-chain.md
- ADRs, diagrams
- interaction-contract.md, motion-spec.md, design-tokens.json
- work-order-batch.json, dependency-graph.mmd
- verification-plan.md

## Import after verification
- evidence-bundle.md, evidence-bundle.json
- scenario-verdicts.md, accessibility-report.md
- release-notes.md, learning-record.md
- handoff.md, telemetry-map.md

## Authority rule
When conflicts exist, prefer the highest-authority artifact available:
charter → continuity → ADRs → diagrams → contracts/schemas → work orders → code → evidence → operational docs
