# Software Ideas Modeler Analysis → Product Translation

## Official product snapshot to anchor the design

Software Ideas Modeler currently presents itself as a diagramming CASE tool for software design and analysis with support for UML, SysML, BPMN, ArchiMate, ERD, flowcharts, user stories, and wireframing. The homepage says the current version is **15.31**, released **April 13, 2026**, and highlights software architecture, reverse engineering from code, source-code generation, requirement capture, UX wireframing, business process modeling, system analysis, and enterprise architecture. It also says the product supports **110+ diagrams**. The collaboration product, **Software Ideas Server 14.93**, adds user cooperation, a global repository, and tasks. The **Viewer 15.31** can open `.simp` projects and display UML, ERD, BPMN, SysML, ArchiMate, wireframes, flowcharts, and other diagrams.

## What to borrow directly

| Capability in Software Ideas Modeler | Why it matters | Product equivalent you should build |
|---|---|---|
| Model-backed project, not isolated drawings | Lets multiple diagrams represent the same underlying system | Canonical intermediate representation (IR) + artifact graph |
| Reverse engineering from source code | Accelerates understanding of existing systems | Parser adapters + symbol graph + dependency extraction |
| Code generation from diagrams | Makes design actionable | Pseudocode-to-target generator + template-driven output |
| Custom source-code templates | Enables framework- and language-specific generation | Template profiles for Rust, TS, React, Axum, Tauri, etc. |
| Multi-notation support | Different audiences need different views | Diagram decision matrix + per-audience renderers |
| Server with repository and tasks | Allows collaborative execution and review | Collaboration server + task graph + approval queue |
| Viewer for project files | Makes artifacts consumable by non-authors | Web read-only projection surfaces + portable export pack |
| Documentation and glossary modules | Improves shared understanding | Knowledge bases + glossary + evidence bundles |

## What to change for your product

### Do not make `.simp` or any proprietary file the source of truth

Use open formats as canonical artifacts. Diagrams should be projections over a shared model and shared evidence rather than the only place where truth lives.

### Do not make desktop authoring the center of gravity

A workstation agent runner is valuable, but your system should be **web-addressable first** and **runner-capable locally**.

### Add AI-native artifacts that CASE tools do not natively emphasize

Your system needs these first-class objects:

- pseudocode ledger
- IO contract inventory
- dependency gap matrix
- target platform profile
- migration mapping ledger
- work-order graph
- verifier evidence bundle
- run/session projection
- approval and continuity state

### Separate model layers explicitly

1. **Observed source** — facts extracted from code, config, docs, and tests
2. **Declared design** — architecture decisions, diagrams, contracts, pseudocode
3. **Target design** — intended end-state architecture and migration mapping
4. **Execution state** — tasks, runs, approvals, verifier verdicts
5. **Evidence state** — logs, snapshots, checks, parity reports

## Recommended open stack

### Canonical artifact formats

- Markdown for readable packets
- JSON for structured machine-readable ledgers
- Mermaid for fast browser-native diagrams
- PlantUML for denser UML and wireframe-style rendering when needed
- JSON Schema / OpenAPI / AsyncAPI for contracts
- DOT / GraphML optionally for heavier graph tooling

### Interface surfaces

- Web dashboard for read, inspect, compare, approve, and monitor
- Local runner for parser access, repository operations, and heavier analysis jobs
- Collaboration server for shared projects, artifacts, work orders, approvals, and evidence

### Product stance

Build a system inspired by CASE tooling, but optimized for **AI workflows**, **versionable artifacts**, **cross-platform execution**, and **team-scale migration planning**.
