# Research Writeup: Foundry, Runtime Integration, Model Swarms, and the Visual-to-Code IDE

_Date: 2026-03-22_

## Purpose

This writeup consolidates the research performed in this chat on:

- Foundry as a graph-native SDLC operating environment
- Workspace import, scaffolding, and knowledge-base enrichment
- Multi-runtime integration across Ralph, Claude Code, Cursor, Codex, OpenClaw, and local model lanes
- MCP as the interoperability spine
- Role-based consensus swarms
- Model provider selection for specification, adversarial review, verification, and deterministic execution
- The first visual-to-code IDE slice with mirrored file focus

## 1. Foundry's role in the architecture

The strongest recurring conclusion in the chat was that Foundry should be the **definition and governance brain**, not merely an execution wrapper.

Foundry owns:
- requirement capture
- graph and ontology
- diagrams and visual drill-down
- schema generation
- approval policies
- blast-radius analysis
- knowledge packs
- principle enforcement
- continuity and evidence

Execution runtimes sit below this layer.

## 2. Why MCP is the right connective tissue

Model Context Protocol (MCP) emerged as the best protocol boundary because it standardizes tools, resources, and prompts over a common host/server pattern. This allows Foundry to expose its capabilities consistently to Claude Code, Cursor, Codex, and any future runtime wrapped behind the same contract.

## 3. Runtime roles

### Ralph
Ralph fits best as the execution persistence loop for already-sharded work, not as the top-level requirements engine. Its strength is repeated, fresh-context execution against small PRD shards and progress files.

### Claude Code
Claude Code is strongest as a high-context planning and review runtime because of its project-level subagents, hooks, and MCP integration patterns.

### Cursor
Cursor is the best current operator cockpit because of its interactive rules, background agents, branch-based remote work, and IDE-native operator experience.

### Codex
Codex is the strongest bounded executor/verifier surface when you want disciplined work in well-defined approval and sandbox envelopes.

### OpenClaw
OpenClaw should be treated as an optional runtime plugin behind the same adapter interface, not as the architectural center of the system.

## 4. Workspace import and scaffolding

A major thread in the chat was building Foundry around real ecosystems, not greenfield demos.

The import/scaffolding work led to these principles:

- support existing Nx monorepos first
- infer systems, components, diagrams, rules, and platform surfaces from the current workspace
- scaffold `.foundry`, `.cursor`, `.codex`, and `.claude` artifacts into the project over time
- treat existing diagrams, continuity files, and rules as first-class signals
- detect mirrored functionality and likely blast radius before agents claim completion

## 5. Knowledge-base architecture

Another major theme was that Foundry needs a real **knowledge plane**, not scattered prompts.

The knowledge plane should manage:
- foundational domain packs (architecture, CS, UI/UX, networking, data engineering, security, observability, cloud, etc.)
- framework packs
- deployment platform packs
- principle packs
- skill seeds
- runtime-specific operating rules
- fix memory and learning records
- gap analysis against the current workspace

The recommended ingestion pattern is:
- versioned source registry
- normalized extracted documents
- concept / principle / term cards
- graph linking between concepts and systems
- gap analysis against desired coverage

## 6. Role-based consensus swarms

A crucial conceptual shift in the chat was moving away from a single agent or simple sequential delegation.

The recommended swarm is role-based:
- Specifier
- Architect
- Blast-radius analyst
- Adversary
- Verifier
- Builder

The goal is not voting. The goal is structured convergence, where every executable PRD shard is challenged before code starts.

## 7. Model investigation conclusions

The model research produced a pragmatic first-wave stack.

### Qwen
The verified current public line is Qwen3 / Qwen3-Coder rather than an official verified "Qwen 3.5" release. Qwen3-Coder is the right low-cost execution lane, especially when hosted locally or behind an SSH tunnel.

### Kimi K2.5
Kimi K2.5 is the strongest fit for multimodal visual coding, UI interpretation, and swarm-style specialist work.

### MiniMax M2.5
MiniMax M2.5 is the best upstream specification lane due to its public emphasis on coding, tool use, and specification-oriented workflows.

### Seed2.0
Seed2.0 is the strongest alternate multimodal lane for image-to-web-page and long-horizon multimodal agent tasks.

### HUMO AI
HUMO AI is not recommended for the core coding-agent path.

## 8. The IDE direction

The desired IDE was repeatedly clarified as a **toggleable visual-to-code ecosystem**.

The most concrete first slice is:
- split layout
- graph/diagram/focus pane on one screen
- code pane on another screen or toggle surface
- clicking a visual node focuses the mirrored file
- clicking a file highlights the corresponding node and impact trail
- overlay controls for approve, start, pause, stop

This is best delivered first in Cursor because it is already a living code editor environment and can host the first control-pane experience.

## 9. The forward/backward traceability pattern

One of the most important conceptual bridges in the chat was that diagrams are not just documentation. They are **indexes into design intent and execution**.

So Foundry should support both directions:

### Forward
Requirement -> PRD -> system -> component -> flow -> route/state -> code scaffold

### Backward
Function/file/component -> flow -> system -> requirement -> PRD shard update

This is what makes mirrored focus and blast-radius review work.

## 10. Recommended next implementation steps

1. Finalize Foundry's model-provider registry and role policy
2. Stand up a model gateway with normalized provider contracts
3. Wire in a local/SSH Qwen3-Coder lane
4. Add MiniMax M2.5 as the default specifier/architect lane
5. Add Kimi K2.5 and Seed2.0 as multimodal UI lanes
6. Build the Cursor split-view mirrored focus prototype
7. Keep Ralph below the executable-shard boundary

## 11. Caveats

Some earlier uploaded files from the conversation expired before this package was rebuilt. The writeup and book therefore rely on:
- the still-available uploaded files
- the content already established in the chat
- current official public sources used to verify provider and runtime facts

## 12. Conclusion

The path forward is now well defined:

- Foundry remains the graph-native definition and governance brain
- Runtime environments become interchangeable execution lanes
- Role-based consensus prevents shallow completion claims
- The IDE becomes a visual-to-code operating surface rather than just another prompt box
- Low-cost execution becomes possible only after structure, schema, diagrams, and approval are in place
