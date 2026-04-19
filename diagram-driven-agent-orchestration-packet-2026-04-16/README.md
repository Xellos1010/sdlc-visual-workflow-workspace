# Diagram-Driven Agent Orchestration Packet

This packet turns the capability pattern you found in Software Ideas Modeler into an open, AI-native product plan for a **diagram-driven agent orchestration dashboard**.

The packet is designed to extend your existing Foundry doctrine rather than replace it. It treats diagrams, pseudocode, contracts, work orders, evidence, and verification as first-class artifacts. It also includes a reusable ChatGPT Skill package so an AI can be given an analysis assignment and produce the same artifact pack repeatedly.

## What is inside

- `01-executive-summary.md` — the shortest path to the product thesis
- `02-software-ideas-modeler-analysis.md` — what to borrow from Software Ideas Modeler and what to re-implement differently
- `03-diagram-catalog.md` — acronyms, diagram families, purposes, and where they fit in your vision
- `04-product-architecture.md` — recommended system architecture for the product
- `05-agent-personas.md` — specialized agent personalities
- `06-skills-matrix.md` — skill definitions the system should expose
- `07-knowledge-base-blueprint.md` — the knowledge bases and update rules
- `08-artifact-contract.md` — mandatory outputs for every analysis / migration initiative
- `09-dashboard-ux.md` — the “God View” dashboard information architecture
- `10-execution-roadmap.md` — phased build plan
- `machine/` — machine-readable manifests, team config, pipeline, prompts, and structured packs
- `diagrams/` — Mermaid source files for key architecture and workflow views
- `source-materials/` — copies of the current execution-plan artifacts you uploaded
- `skill-source/diagram-driven-migration-foundry/` — the build-ready ChatGPT Skill source
- `skill.zip` — packaged ChatGPT Skill deliverable

## How to use this packet

1. Read `01-executive-summary.md` and `02-software-ideas-modeler-analysis.md`.
2. Read `03-diagram-catalog.md` before designing the modeling pipeline.
3. Use `machine/team-config.json`, `machine/pipeline.json`, `machine/lead-prompt.md`, and `11-work-orders.md` as the basis for execution.
4. Upload `skill.zip` to Skills, or unpack `skill-source/diagram-driven-migration-foundry/` and iterate.
5. Run the pilot workflow against a TypeScript/React codebase and generate the required artifacts before attempting a Rust port.

## Deliverable stance

The product should be **model-backed**, **artifact-first**, **agent-orchestrated**, **web-addressable**, and **workstation-capable**. Your canonical truth should be open text and structured data, not a proprietary binary project file.
