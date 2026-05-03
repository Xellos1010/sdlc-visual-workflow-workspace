# Stage Input/Output Matrix

## Stage 1 — Intake & Routing

### Operator goal
Turn a raw request into a bounded intent packet with Definition of Ready coverage.

### Minimum inputs
- target ecosystem name
- one-sentence business outcome
- current pipeline step or completed step to update
- known constraints
- success criteria
- rollback idea
- current repo or module area
- existing pipeline requirement source, if known

### Recommended files to upload
- change request
- current pipeline requirements
- repo topology or module tree
- target ecosystem charter or manifest
- coding/framework standards
- existing ADR index
- any current diagrams or contracts

### Expected outputs
- `intent-packet.md`
- `definition-of-ready-checklist.md`
- `impacted-systems-list.md`
- `risks-and-rollback.md`
- `open-questions.md` or `ready-for-architecture.md`
- `artifact-manifest.json`
- `foundry-import-manifest.json`
- `next-workspace.txt`

## Stage 2 — Architecture Studio

### Operator goal
Produce all pre-build design artifacts required to create scoped work orders.

### Required inputs
- stage 1 output bundle
- current contracts/schemas
- existing ADRs
- target system topology
- framework constraints
- performance/security requirements

### Recommended files to upload
- prior intent packet
- system maps and service inventory
- current OpenAPI / AsyncAPI / JSON Schemas
- current ADRs
- target ecosystem docs
- repo rules / module boundaries

### Expected outputs
- `system-impact-statement.md`
- `c4-context.mmd`
- `c4-container.mmd`
- `trust-boundaries.mmd`
- `expected-output-sequence.mmd`
- `component-change-uml.mmd`
- `adr-001-<title>.md` (and more as needed)
- `contracts/` schemas
- `function-io-schemas/` schemas
- `decomposition-plan.md`
- `artifact-manifest.json`
- `foundry-import-manifest.json`
- `next-workspace.txt`

## Stage 3 — Work-Order Factory

### Operator goal
Turn architecture into low-cost-model executable work orders.

### Required inputs
- stage 2 output bundle
- repo hierarchy / folder structure
- framework implementation rules
- testing standards
- file placement conventions
- any provider/model routing rules

### Recommended files to upload
- approved architecture bundle
- module boundary rules
- framework standards
- testing standards
- naming/path conventions
- model routing policy

### Expected outputs
- `work-order-batch.json`
- `dependency-graph.mmd`
- `parallel-execution-groups.md`
- `work-orders/wo-*.yaml`
- `verification-work-orders/wo-*.yaml`
- `docs-work-orders/wo-*.yaml`
- `learning-work-orders/wo-*.yaml`
- `artifact-manifest.json`
- `foundry-import-manifest.json`
- `next-workspace.txt`

Every implementation work order should include:
- module/component target
- file hierarchy path
- tests to write first
- UML reference
- function-by-function pseudocode
- input/output schemas
- framework requirements
- performance/security constraints
- acceptance criteria
- verification commands

## Stage 4 — Verification & Release

### Operator goal
Validate execution, produce evidence, then generate release, handoff, and learning artifacts.

### Required inputs
- builder output bundle
- work-order batch
- acceptance criteria
- verification plan
- test/build results
- changed file list

### Recommended files to upload
- work-order files
- builder result bundle
- test/build logs
- generated contracts
- diagrams/ADRs for comparison
- prior continuity state if available

### Expected outputs
- `verification-report.md`
- `evidence-bundle.md` or `.json`
- `criteria-verdict-table.md`
- `release-notes.md`
- `handoff.md`
- `continuity-patch.json`
- `learning-record.md`
- `artifact-manifest.json`
- `foundry-import-manifest.json`
- `next-workspace.txt`

## Stage 5 — Import Relay

### Operator goal
Prepare import instructions and import manifests for the Foundry workspace.

### Required inputs
- approved pre-build artifacts
- approved post-verification artifacts
- target foundry workspace or ecosystem path
- import ordering rules

### Expected outputs
- `pre-implementation-import-manifest.json`
- `post-verification-import-manifest.json`
- `import-order.md`
- `foundry-copy-map.md`
- `artifact-manifest.json`
- `next-workspace.txt`

## Shared rule

If the chat surface can create multiple files, request a zip bundle plus `artifact-manifest.json`.
If it cannot, request one markdown bundle plus `artifact-manifest.json` and a file index.
