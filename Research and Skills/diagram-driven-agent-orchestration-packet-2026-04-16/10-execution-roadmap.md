# Execution Roadmap

## Phase 0 — Foundation (1–2 weeks)

### Deliverables
- glossary and modeling doctrine
- artifact contract
- canonical IR schema
- first-stage team config and work orders
- packaged skill

### Acceptance gate
- artifact contract approved
- skill package validated
- first pilot scope selected

## Phase 1 — Reverse Engineering Engine (2–4 weeks)

### Deliverables
- repo ingestion pipeline
- symbol graph extraction
- dependency/module/call graphs
- pseudocode ledger generator
- contract inventory generator

### Acceptance gate
- pilot repo produces complete base packet
- extracted facts are repeatable across reruns

## Phase 2 — Diagram Synthesis + Migration Planning (2–4 weeks)

### Deliverables
- C4 generation flow
- sequence/state/DFD synthesis flow
- migration gap matrix
- keep/adapt/rewrite/defer planner
- target mapping profiles

### Acceptance gate
- TS/React → Rust pilot packet reviewed and approved

## Phase 3 — Dashboard MVP (3–6 weeks)

### Deliverables
- shell layout
- architecture/migration/work-order/evidence views
- inspector and bottom drawer
- saved layouts and command palette

### Acceptance gate
- operator can go from system map to pseudocode to work order in <= 3 interactions

## Phase 4 — Collaboration Server (3–5 weeks)

### Deliverables
- shared project registry
- artifact manifests
- run and evidence storage
- approvals and assignments
- multi-user access model

### Acceptance gate
- two users can review the same project and see synchronized artifact state

## Phase 5 — Code Generation / Porting / Verification (4–8 weeks)

### Deliverables
- template-driven target emitters
- work-order execution adapters
- parity verification harness
- release/handoff packaging

### Acceptance gate
- pilot TS→Rust execution passes declared verification matrix

## Phase 6 — Productization

### Deliverables
- pricing/packaging strategy
- onboarding flows
- workspace import/export
- docs and demos

### Acceptance gate
- external user can onboard and run one bounded analysis without founder intervention
