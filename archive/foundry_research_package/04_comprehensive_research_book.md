# Foundry Research Book

_Subtitle: A consolidated research book for the graph-native SDLC operating environment, runtime integration strategy, model swarm architecture, and visual-to-code IDE direction._

_Date: 2026-03-22_

## Preface

This book consolidates the most important research, design conclusions, and implementation direction developed across this chat.

It is intended to be the starting document for:
- building the Foundry ecosystem
- guiding future implementation and research
- onboarding future agents and collaborators
- preserving the major architectural decisions already made

This edition is built from the still-available uploads, the artifacts produced in the chat, and current official public sources. Some earlier uploaded files expired before regeneration, so any sections that would have depended on them were reconstructed from the surviving material and the established design record in the conversation.

---

## Part I — North Star

### 1. What Foundry is meant to become

Foundry is not just a coding assistant, prompt layer, or diagramming app. The design direction established in the chat is that Foundry should become a **graph-native SDLC operating environment** that turns requirements, architecture, execution, verification, deployment, telemetry, and learning into one connected system.

The long-range goal is to let a human stay in the requirement and design space while increasingly cheaper and more specialized agent lanes execute low-cost work only after the design has been structured, visualized, verified, and approved.

That implies a strict hierarchy:

1. Human intent and approval
2. Requirement decomposition
3. Graph and schema generation
4. Diagram generation and drill-down
5. Blast-radius and adversarial review
6. Executable PRD shards
7. Low-cost, bounded execution
8. Independent verification
9. Learning and memory promotion

### 2. The central design principle

The clearest conceptual bridge in the chat was this:

**Diagrams are not passive documentation; they are executable indexes into design intent.**

This means every node and edge in the system graph should anchor:
- specification scope
- dependency scope
- blast-radius scope
- execution scope
- verification scope
- learning scope

That is what makes “forward-to-back and back-to-forward” reasoning possible.

---

## Part II — Foundry as the Definition Brain

### 3. Why Foundry stays above the runtimes

One of the strongest repeated conclusions was that Foundry must remain above Ralph, Claude Code, Cursor, Codex, OpenClaw, or any specific model surface.

Foundry owns:
- requirement capture
- ontology and graph structure
- diagrams
- schema generation
- approval policies
- role-based consensus
- runtime routing
- continuity and evidence
- learning promotion

The runtimes below it are replaceable.

### 4. The graph-native SDLC model

The chat repeatedly converged on a graph-centric worldview. The graph must be able to represent:
- ecosystems
- systems
- components
- modules
- routes and URLs
- UI surfaces
- state transitions
- deployment units
- telemetry signals
- owners and approvals
- tests and evidence
- knowledge packs and principle packs

The graph is the canonical model. Diagrams are rendered views. PRD shards are graph-bound contracts. Work orders are graph-targeted actions.

### 5. Why requirements must become executable PRD shards

The target workflow is not “ask an agent to build a feature.” It is:

1. define requirement
2. structure requirement
3. generate diagrams
4. generate schemas
5. run adversarial review
6. run blast-radius review
7. run verifier review
8. approve or reject
9. only then emit executable PRD shards

This is what makes low-cost execution viable.

---

## Part III — Workspace Import, Scaffolding, and Knowledge Enrichment

### 6. Existing ecosystems must be first-class citizens

A major direction in the chat was that Foundry should not assume greenfield work. It must initialize from existing ecosystems and build order from whatever already exists.

That means the import pipeline should:
- inspect current repositories and monorepos
- infer systems and boundaries
- ingest rules, configs, diagrams, task-state files, and handoff docs
- derive current design patterns even when the human has not explicitly documented them
- generate gap analysis where structure or knowledge is missing

### 7. Nx monorepos first, but not only Nx

The first implementation target should support Nx monorepos well because they already provide valuable structure. But Foundry must also extrapolate into:
- polyrepos
- mixed repos
- poorly defined repos
- partially documented workspaces

The chat made it clear that Foundry must add order and intention where definition is missing.

### 8. The knowledge plane

Another strong requirement was that Foundry needs a real knowledge plane, not a loose pile of prompts or notes.

The knowledge plane should contain:
- domain packs
- framework packs
- deployment platform packs
- principle packs
- prompt/skill seeds
- runtime-specific rules
- fix memory records
- observability and deployment knowledge
- advanced topic cards and term cards

The ingestion pattern should be versioned and reproducible:
- register source
- scrape/extract/normalize
- split into structured cards
- tag and relate into the graph
- expose through role-specific retrieval
- compute knowledge gaps against the current workspace and target scope

---

## Part IV — Runtime Integration Strategy

### 9. MCP as the interoperability spine

The best connective tissue established in the chat is MCP.

MCP gives Foundry a stable way to expose:
- tools
- resources
- prompts

This lets the same Foundry control plane be consumed by:
- Claude Code
- Cursor
- Codex
- future wrappers for OpenClaw or similar tools
- internal orchestration services

### 10. Ralph's correct role

The research concluded that Ralph is not the right top-level requirement compiler. Ralph is strongest below the executable-shard boundary.

Ralph should be used for:
- repeated small-task execution
- fresh-context loops
- progress tracking
- PRD shard iteration
- evidence update and resumption

Foundry should feed Ralph fully structured work.

### 11. Claude Code's role

Claude Code is the best high-context planning and review runtime because it supports:
- project-scoped subagents
- hooks
- MCP integration
- separate context windows for specialists

It is especially strong for architect, adversary, and verifier roles.

### 12. Cursor's role

Cursor is the most natural first operator cockpit because of:
- IDE-native context
- rules and skills model
- background agents
- remote environment support
- branch-based handoff

This makes it the best place to build the first visual-to-code mirrored workflow.

### 13. Codex's role

Codex is the bounded executor/verifier lane. It is strongest when:
- tasks are file-scoped
- approvals are explicit
- sandboxing matters
- independent verification is required

### 14. OpenClaw's role

OpenClaw should be treated as an optional plugin runtime. It should only participate through a stable adapter contract so it does not distort Foundry's core architecture.

---

## Part V — Model Investigation

### 15. The model lanes you need

The model investigation focused on finding providers that fit distinct roles rather than chasing one universal best model.

The first-wave role map is:
- MiniMax M2.5: specifier and architect
- Kimi K2.5: multimodal UI specialist and visual coding lane
- Qwen3-Coder: local or SSH-tunneled low-cost builder lane
- Seed2.0: alternate multimodal lane
- Separate verifier lane: different provider from the builder

### 16. Qwen

The shorthand "Qwen 3.5" was not verified from current official sources. The verified current public line is Qwen3 / Qwen3-Coder.

This is an important normalization because implementation must use names and APIs that actually exist.

Qwen3-Coder is the best fit for the cheap execution lane because it is explicitly positioned for agentic coding and local development.

### 17. Kimi K2.5

Kimi K2.5 stood out as the best fit for:
- visual coding
- multimodal UI interpretation
- image-to-code
- swarm-style specialist coordination

It is useful for the visual side of the IDE and for multimodal spec refinement.

### 18. MiniMax M2.5

MiniMax M2.5 was the strongest fit for upstream specification because its public positioning emphasizes:
- coding
- tool use
- long-form work products
- specification-oriented outputs

This matches Foundry's “structure before execution” philosophy.

### 19. Seed2.0

Seed2.0 is a strong alternate multimodal lane. It is useful as:
- a second multimodal perspective in consensus
- a GUI/image-to-web-page specialist
- a long-horizon multimodal agent lane

### 20. HUMO AI

HUMO AI is not recommended as a core coding or runtime lane for the first implementation path.

---

## Part VI — The Visual-to-Code IDE

### 21. The desired operator experience

The final desired environment is not just a code editor with an assistant sidebar. It is a toggleable visual-to-code system.

The first slice should provide:
- graph or diagram pane
- code pane
- mirrored focus between them
- impact trail highlighting
- controls for approve, start, pause, stop

### 22. Mirrored focus

Mirrored focus is the most critical first UX primitive.

When the user clicks:
- a system, the IDE should focus the relevant files and diagrams
- a component, the IDE should focus routes, modules, tests, and telemetry
- a file, the IDE should highlight the matching visual nodes and impacted requirement shards

This is the concrete manifestation of the graph-as-index principle.

### 23. Visual drill-down and drill-up

The user explicitly called out a conceptual need to drill down and back up:
- from requirement to system to component to function
- from function to route to flow to component to system to requirement

This is the right target.

It should support:
- forward reasoning
- backward reasoning
- focus scopes
- debate overlays before execution

---

## Part VII — Consensus and Adversarial Review

### 24. Why consensus cannot be naive voting

A major conclusion of the chat was that multi-agent consensus should not be simple majority voting.

Instead, it must be structured by role:
- Specifier proposes
- Architect designs
- Blast-radius analyst expands
- Adversary attacks
- Verifier checks completeness and evidence plan
- Human or policy approves
- Builder executes only after all above pass

### 25. The adversarial loop

Before code starts, Foundry should run a fixed review cycle that records:
- proposed design
- challenge statements
- compromise or revision
- blast-radius expansion
- verification strategy
- approval outcome

That means future agents are not guessing what tradeoffs were already considered.

---

## Part VIII — Local Model and SSH-Tunneled Execution

### 26. Why the low-cost lane matters

The entire architecture aims to make many execution tasks cheap by moving complexity upward into structured requirements, diagrams, schemas, and reviews.

That means a local or tunneled model lane matters.

### 27. The right pattern

The recommended pattern is:
- remote host runs Qwen3-Coder on an OpenAI-compatible endpoint
- SSH tunnel forwards it locally
- Foundry's model gateway normalizes it
- low-cost deterministic tasks route there automatically

This should not be exposed directly to each runtime. It should sit behind a shared model-gateway abstraction.

---

## Part IX — Implementation Plan

### 28. The immediate sequence

The chat converged on a sensible build order.

1. Foundry provider registry
2. model gateway
3. role policy
4. consensus orchestration
5. Cursor-first visual-to-code slice
6. Qwen3-Coder local lane
7. second multimodal lane
8. deeper runtime adapters

### 29. What success looks like

You know the architecture is working when:
- requirements become structured PRD shards
- the visual pane and code pane stay in sync
- blast radius catches sibling behavior before coding starts
- low-cost agents can execute bounded work with low hallucination risk
- verification is independent
- learnings become rule, skill, test, or memory artifacts automatically

---

## Part X — Risks and Open Questions

### 30. Expired inputs

Some uploaded files from earlier in the conversation expired before this package was regenerated. This edition therefore reconstructs the full research record from:
- still-available local uploads
- previously established design conclusions in the chat
- current official public verification sources

### 31. Open questions for the next pass

- Which real first runtime should be wired first: Claude Code or Codex?
- Which visual pane technology should power the first graph experience?
- What should the provider fallback tree be when the preferred lane is unavailable?
- Which knowledge domains should be considered mandatory at day one vs gradually introduced?
- How aggressive should the auto-approval policy be for low-risk work?

---

## Closing statement

The core vision is now coherent:

- Foundry defines
- the graph organizes
- consensus challenges
- runtime adapters execute
- verification checks
- learning promotes
- the IDE lets you see all of it as one system

That is the right foundation for a genuinely new development environment rather than another prompt-driven shell.
