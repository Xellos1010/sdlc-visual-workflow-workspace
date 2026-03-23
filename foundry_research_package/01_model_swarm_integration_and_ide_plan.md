# Model Swarm Integration and IDE Plan

_Date: 2026-03-22_

## Executive summary

This document defines how Foundry should integrate external model providers into a role-based swarm and how the first visual-to-code IDE experience should work.

The recommended first-wave model stack is:

1. **Qwen3-Coder** for local and SSH-tunneled low-cost execution
2. **MiniMax M2.5** for specification writing, architecture, and decomposition
3. **Kimi K2.5** for multimodal UI, visual-to-code, and swarm-style parallel specialist work
4. **ByteDance Seed2.0** as an alternate multimodal GUI and long-horizon agent lane
5. **HUMO AI** excluded from the core coding/runtime path because it is positioned as a media-generation experience rather than a coding-agent platform

## Recommended role map

### Specifier lane
- Owns requirement intake
- Produces capability statements, constraints, acceptance criteria, and risk posture
- Default model lane: MiniMax M2.5

### Architecture lane
- Produces system, component, state, URL, flow, telemetry, and deployment diagrams
- Produces executable PRD shards
- Default model lane: MiniMax M2.5

### Visual coding lane
- Translates screenshots, rough layouts, and interaction intent into UI artifacts and front-end plans
- Default model lane: Kimi K2.5 or Seed2.0

### Builder lane
- Executes bounded, deterministic, file-scoped work orders
- Default model lane: local/SSH Qwen3-Coder

### Adversary lane
- Challenges the design before code starts
- Looks for hidden coupling, blast radius, operational risk, and missing verification
- Default model lane: separate provider from Builder

### Verifier lane
- Runs independent review and attempts to falsify completion claims
- Default model lane: separate provider from Builder and preferably separate from Adversary

## Why these models

### Qwen3-Coder
Qwen's official open development stack currently centers on **Qwen3**, **Qwen3-Coder**, **Qwen-Agent**, and **qwen-code**. This is the most natural local execution lane because the coding line is explicitly positioned for agentic coding and local development. It is the best match for the cheap deterministic execution path inside Foundry.

### MiniMax M2.5
MiniMax M2.5 is the strongest direct fit for the upstream specification layer because its public positioning emphasizes coding, agentic tool use, office-work outputs, search, and a tendency toward specification and decomposition before implementation. This aligns with Foundry's requirement-first, diagram-first, schema-first approach.

### Kimi K2.5
Kimi K2.5 is a strong multimodal visual-coding lane. Its official positioning emphasizes visual coding, image-to-code, multimodal understanding, and an agent swarm mode that can coordinate many specialist workers. That makes it a good fit for UI interpretation, design system extraction, and visual-to-code assistance.

### Seed2.0
Seed2.0 is a good alternate multimodal lane because the official materials emphasize long-horizon agent performance, multimodal visual understanding, and image-to-web-page generation. It is useful when Foundry needs a second multimodal viewpoint in consensus or fallback mode.

### HUMO AI
HUMO AI should not be treated as a core coding-agent lane for the first architecture pass. It is not currently the best fit for the Foundry execution and orchestration centerline.

## Swarm and consensus pattern

Consensus should not be simple majority voting. It should be structured, role-based convergence.

Recommended sequence:

1. **Specifier** proposes requirement pack
2. **Architect** emits first design and diagram set
3. **Blast-radius analyst** expands affected systems, mirrored modules, and similar patterns
4. **Adversary** argues against the design
5. **Verifier** checks completeness of requirement coverage and evidence plan
6. **Human or auto-approval policy** decides whether the shard becomes executable
7. **Builder** receives a bounded work order only after the above are satisfied

Each role writes structured outputs back into Foundry's graph and schema layer.

## IDE direction

The first IDE slice should be a toggleable split-view environment:

- Left pane: diagram/graph/focus view
- Right pane: code editor
- Clicking a visual node focuses the mirrored file
- Clicking a file highlights the visual node, route, or system impact trail
- Controls: approve, start, pause, resume, stop
- Optional debate replay: show architect vs adversary vs verifier notes before execution

## Immediate implementation order

1. Add model-provider registry to Foundry
2. Add model role policy (which role can use which provider)
3. Add model-gateway normalization layer
4. Add consensus orchestration pipeline
5. Add Cursor-first split-view mirrored focus surface
6. Add SSH-tunneled local execution lane for Qwen3-Coder
7. Add second multimodal lane for Kimi K2.5 or Seed2.0

## Notes on naming and verification

A prior shorthand in the conversation referred to "Qwen 3.5" and "Doubao 2". For documentation and implementation, the verified provider names should be normalized to:

- **Qwen3 / Qwen3-Coder**
- **Seed2.0** (with note that Seed1.5 is labeled Doubao-1.5-pro in the official models catalog)

## Reference sources

- Qwen official GitHub organization and repositories
- Kimi K2.5 official model page and blog
- MiniMax M2.5 official launch page
- ByteDance Seed official models and Seed2.0 pages
