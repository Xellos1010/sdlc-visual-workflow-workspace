# Skills Matrix

Your platform should support both **existing Foundry skills** and **new diagram-driven analysis skills**.

## Existing skills to retain and integrate

| Skill | Why it stays |
|---|---|
| `agent-team-builder` | turns a scoped initiative into team configs, work orders, prompts |
| `agent-team-launcher` | launches or resumes configured initiatives |
| `define-intent` | front-loads discovery and architecture intent |
| `scope-chunker` | converts approved intent into bounded work orders |
| `model-router` | maps work to model tiers/providers |
| `sdlc-phase-router` | binds work to the correct lifecycle phase |
| `ts-react-rust-analyzer` | a proven analysis gate for TS → Rust migration |

## New skills to add

| Skill | Trigger | Outputs |
|---|---|---|
| `repository-cartographer` | “map this repo”, “reverse engineer codebase”, “show architecture” | symbol graph, module graph, subsystem classification |
| `pseudocode-ledger-writer` | “extract pseudocode”, “normalize logic before migration” | function/module pseudocode ledger |
| `diagram-decision-matrix` | “which diagrams should we generate?” | selected diagram set with rationale |
| `c4-synthesizer` | “show system/container/component views” | C4 diagrams and descriptions |
| `runtime-sequence-synthesizer` | “show how runtime flow works” | sequence and timing diagrams |
| `state-machine-synthesizer` | “explain lifecycle/state transitions” | state-machine diagrams |
| `contract-inventory-builder` | “extract APIs/types/contracts” | IO contracts, schema map |
| `dependency-gap-researcher` | “what blocks migration?” | dependency gap matrix, risky libraries |
| `migration-map-builder` | “plan TS/React to Rust”, “map source to target” | keep/adapt/rewrite/defer ledger |
| `target-profile-router` | “generate for Axum/Tauri/Leptos/etc.” | target platform constraints and profiles |
| `work-order-graph-builder` | “split this initiative for agents” | work-order DAG and team config |
| `dashboard-projection-planner` | “design the orchestration dashboard” | screens, panels, modes, inspectors |
| `parity-verifier-planner` | “define parity checks” | verification matrix and acceptance gate |
| `evidence-packer` | “package findings”, “handoff this initiative” | zipped evidence / release / handoff bundle |

## Minimum skill stack for the first pilot

1. repository-cartographer
2. pseudocode-ledger-writer
3. contract-inventory-builder
4. diagram-decision-matrix
5. c4-synthesizer
6. dependency-gap-researcher
7. migration-map-builder
8. work-order-graph-builder
9. parity-verifier-planner
10. evidence-packer
