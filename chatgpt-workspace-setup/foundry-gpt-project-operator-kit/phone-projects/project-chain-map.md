# Project Chain Map

## Flagship Foundry — Intake & Routing
- Folder: `01-foundry-intake-routing`
- Purpose: Turn a raw request into a bounded intent packet with Definition of Ready coverage.
- Phases: discover, define
- Outputs: change-request.md, intent-packet.md, impacted-systems-list.md, risk-register.md, dor-checklist.md, next-workspace.txt, foundry-import-manifest.json
- Next workspace: 02-foundry-architecture-studio

## Flagship Foundry — Architecture Studio
- Folder: `02-foundry-architecture-studio`
- Purpose: Produce pre-build architecture artifacts: diagrams, ADRs, contracts, schemas, and decomposition.
- Phases: visualize, architect
- Outputs: architecture-packet.md, c4-context.mmd, c4-container.mmd, system-sequence.mmd, trust-boundary.mmd, adr-001.md, contracts/*.json, component-uml.mmd, next-workspace.txt, foundry-import-manifest.json
- Next workspace: 03-foundry-workorder-factory

## Flagship Foundry — Work-Order Factory
- Folder: `03-foundry-workorder-factory`
- Purpose: Convert approved architecture into low-cost-model executable work orders with explicit scope, tests, schemas, and pseudocode.
- Phases: plan
- Outputs: work-order-batch.json, work-order-summary.md, dependency-graph.mmd, verification-plan.md, next-workspace.txt, foundry-import-manifest.json
- Next workspace: 04-foundry-verification-docs

## Flagship Foundry — Verification, Release & Learning
- Folder: `04-foundry-verification-docs`
- Purpose: Validate implementation claims, package evidence and documentation, and extract reusable learnings.
- Phases: verify, release, improve
- Outputs: verification-report.md, evidence-bundle.md, release-notes.md, handoff.md, learning-record.md, artifact-manifest.json, next-workspace.txt, foundry-import-manifest.json
- Next workspace: 05-foundry-import-relay

## Flagship Foundry — Import Relay
- Folder: `05-foundry-import-relay`
- Purpose: Prepare the final import bundle and operator instructions for updating the target ecosystem inside Foundry.
- Phases: release, improve
- Outputs: foundry-import-instructions.md, foundry-import-manifest.json, kb-update-plan.md, operator-checklist.md, final-deliverable.zip
- Next workspace: target Foundry workspace
