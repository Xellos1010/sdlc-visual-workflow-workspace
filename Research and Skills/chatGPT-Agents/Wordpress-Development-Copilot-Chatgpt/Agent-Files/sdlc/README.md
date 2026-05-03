# Cloud Agent SDLC Lifecycle Management Packet

This packet consolidates the agentic SDLC operating model into a reusable Cloud Agent skill pipeline.

## Included

- `docs/cloud-agent-sdlc-bible.md` - executable SDLC lifecycle management bible.
- `docs/skill-inventory.md` - exhaustive v1 skill list and invocation map.
- `docs/skill-creation-prompt-library.md` - paste-ready creation prompts for every proposed skill.
- `docs/onboarding-new-agentic-developers.md` - onboarding guide for new cloud/local agents.
- `schedules/cloud-agent-scheduled-tasks.yml` - 1-hour, 4-hour, and daily recurring task definitions.
- `schemas/*.json` - canonical state, work-order, lock, memory, decision, evidence, roadmap, and skill registry schemas.
- `diagrams/*.mmd` - optional Mermaid diagrams, default-off in the skill pipeline.
- `templates/*.md` - reusable human decision, evidence, PR, release, and handoff templates.
- `review-notes/sources-reviewed.md` - review scope and limitations.

## Core doctrine

1. Main remains the canonical trunk.
2. Clients/products live as overlays and project state, not permanent Git branches.
3. Agents execute bounded work orders in ephemeral worktrees/branches.
4. One active integration PR exists per feature/client lane.
5. Every meaningful run updates continuity memory or records why no update was required.
6. Human decisions become one GitHub issue with pasteable resume instructions.
7. Visual diagramming is available as an optional path and defaults to off.
8. Runtime validation and evidence precede merge, release, and publication.

## Granular code-generation SDLC addendum

This packet now includes an explicit request-to-pseudocode-to-codegen-to-parity skill chain for standardized Cloud Agent development workflows.

New files:

- `docs/granular-codegen-skill-chain.md`
- `docs/granular-skill-creation-prompts.md`
- `skills/granular-codegen-skill-registry-v2.yml`
- `schemas/request-envelope.schema.json`
- `schemas/objective-classification.schema.json`
- `schemas/architecture-snapshot.schema.json`
- `schemas/insertion-point-map.schema.json`
- `schemas/io-contract.schema.json`
- `schemas/pseudocode-contract.schema.json`
- `schemas/memory-lifecycle-report.schema.json`
- `schemas/complexity-assessment.schema.json`
- `schemas/codegen-plan.schema.json`
- `schemas/adr-record.schema.json`
- `schemas/parity-report.schema.json`
- `diagrams/pseudocode-codegen-chain.mmd`
- `diagrams/two-way-parity-sync.mmd`
- `diagrams/memory-lifecycle-analysis.mmd`
