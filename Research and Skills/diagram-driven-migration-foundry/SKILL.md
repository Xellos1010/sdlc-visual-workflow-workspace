---
name: diagram-driven-migration-foundry
description: diagram-driven reverse engineering, artifact generation, and migration planning for codebases. use when chatgpt needs to analyze an existing repository, extract architecture and pseudocode, generate uml/c4/flow/data artifacts, plan a language or framework conversion such as typescript/react to rust, define agent personalities and work orders, or package a reusable execution packet for an agent orchestration dashboard.
---

# Diagram Driven Migration Foundry

Use this skill to turn a repository or system brief into a **standardized analysis and migration packet**.

## Core rule

Always make artifacts before making implementation claims.

The minimum artifact pack is defined in `references/artifact-contract.md`.
Use `references/diagram-catalog.md` to choose the right views.
Use `references/agent-personas.md` to choose who should do the work.
Use `references/knowledge-base-design.md` to decide what knowledge must be retrieved or generated.
Use `references/foundry-alignment.md` when the work needs to align to a Foundry-style SDLC and team-launch flow.

## Workflow decision tree

1. **Existing codebase to understand?**
   - build the repo map
   - extract pseudocode and contracts
   - generate the selected diagrams
   - stop if the user only asked for analysis

2. **Migration or conversion requested?**
   - do the analysis flow first
   - generate a gap matrix and keep/adapt/rewrite/defer ledger
   - map source modules to target crates/modules/services
   - generate work orders and verification gates

3. **Dashboard or operating model requested?**
   - define first-class objects
   - define the shell, views, drill-down chain, and evidence model
   - generate architecture + UX artifacts before implementation tasks

## Mandatory outputs

Always produce these artifacts unless the user explicitly narrows the request:

- intake summary
- artifact manifest
- repo/module/dependency map
- pseudocode ledger
- contract inventory
- selected architecture/behavior diagrams
- work-order graph
- verification plan
- handoff/evidence bundle

For migrations, also produce:

- dependency gap matrix
- target mapping ledger
- keep/adapt/rewrite/defer decisions
- parity criteria

## Diagram selection rules

- Use C4 context + container for every non-trivial system.
- Use component diagrams when a container has meaningful internal parts.
- Use code/class diagrams only for critical or complex components; prefer automated generation.
- Use sequence diagrams for runtime interactions.
- Use state machines when there is lifecycle or async state.
- Use ERD when persistence matters.
- Use DFD when data movement matters more than control flow.
- Use wireframes/screen flows/user journeys when operators need a UI surface.

## Work-order rules

- One work order per bounded, independently verifiable slice.
- Explicitly declare scope, objective, dependencies, acceptance criteria, and verifier.
- Keep research, planning, implementation, and verification distinct.

## Packaging workflow

1. Run `scripts/init_project_packet.py` to scaffold a packet directory.
2. Fill the packet using the artifact contract and templates.
3. Run `scripts/validate_packet.py` against the output directory.
4. Package or hand off only after validation passes.

## Output structure

Use this default structure unless the user has a stricter schema:

```text
<slug>/
  project-intake.md
  artifact-manifest.json
  architecture/
  behavior/
  code/
  contracts/
  migration/
  execution/
  verify/
  evidence/
  release/
```

## References

- `references/diagram-catalog.md` — which diagrams exist and when to use them
- `references/artifact-contract.md` — minimum packet shape
- `references/agent-personas.md` — role and mindset guidance
- `references/knowledge-base-design.md` — what knowledge to retrieve and store
- `references/foundry-alignment.md` — how to align to Foundry-style SDLC, work orders, and team-launch artifacts

## Assets

Use the templates in `assets/templates/` when scaffolding output packets.
