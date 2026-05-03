# Operator Walkthrough — Your Example Goal

## Goal
When a pipeline step is completed and verified, generate the artifacts needed to update pipeline requirements in the target ecosystem and prepare import instructions back into Foundry.

## Recommended order

### Project 01 — Intake & Routing
Use this to turn the raw request into:
- change-request.md
- intent-packet.md
- risk-register.md
- impacted-systems-list.md
- dor-checklist.md

### Project 02 — Architecture Studio
Upload the Project 01 outputs and generate:
- C4 diagrams
- impacted systems diagram
- trust-boundary diagram
- ADRs
- expected output diagram
- UML sequence/component diagrams
- contracts and schemas
- decomposition plan

### Project 03 — Work-Order Factory
Upload the Project 02 outputs and generate:
- work-order-batch.json
- dependency graph
- verifier work orders
- docs and learning work orders
Each work order must include:
- module/component target
- hierarchy/path
- tests to create first
- input/output schemas
- pseudocode
- framework requirements
- verification commands

### Project 04 — Verification, Release & Learning
Use this after implementation has been executed elsewhere.
Generate:
- verification report
- evidence bundle
- release notes
- handoff
- learning record
- artifact manifest

### Project 05 — Import Relay
Use this to produce:
- foundry-import-manifest.json
- foundry-import-instructions.md
- kb-update-plan.md
- final-deliverable.zip

## KB timing rule
- Read KB before planning and architecture
- Write KB only after verification or diagnosis confirms reusable learning
