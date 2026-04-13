# UI/UX Pipeline Doctrine

This document is the seed knowledge file for the Flagship Foundry UI/UX workspace chain.

## Phase model

discover → define → visualize → architect → plan → implement → verify → release

## UI/UX pipeline stages

1. Intent analysis — what is the operator trying to accomplish, what decisions must be made quickly, what is the failure cost
2. Object-model extraction — first-class nouns, declared artifacts vs observed runtime state
3. View selection — which questions need map, board, timeline, diff, inspector, evidence, or chat
4. Shell composition — which actions belong in top bar, rail, canvas, inspector, utility drawer
5. Interaction and motion — toggle vs button vs command, transitions that clarify structure
6. Platform adaptation — what stays desktop-only, what is safe on iOS/Android
7. Verification and evidence — can operator reach right object, understand state, act safely, recover
8. Learning loop — telemetry, evidence, fix-memory for future iterations

## Agent lineup

- UX Orchestrator — routes work across phases, preserves continuity and evidence
- UI Intent Analyst — translates requests into jobs-to-be-done, decisions, success metrics
- Information Architecture Architect — defines first-class objects, navigation, view registry, drill-down, state authority
- Visualization Systems Architect — chooses graph, board, timeline, diff, inspector, evidence, chat for each question
- Interaction & Motion Designer — defines quick actions, command palette, panel docking, transitions, feedback states
- Design System Governor — maintains shared tokens, components, variants, platform mappings
- Accessibility & Platform Reviewer — verifies keyboard, focus, reduced-motion, target sizes, WCAG
- Mobile Surface Adapter — adapts desktop model to iOS/Android triage without false parity
- Workflow Telemetry Curator — captures evidence, learning records, fix-memory
- UX Verification Judge — runs scenario-based verification, accessibility review, performance testing

## Operating principles

- objects over menus — navigation through first-class nouns, not menu trees
- declared vs observed — always show the authority boundary between operator artifacts and runtime state
- drill-down over deep-linking — predictable path from overview to detail
- evidence over claims — every UX decision backed by scenario tests
- accessibility as gate not cleanup — WCAG, keyboard, reduced-motion from day one
- platform honesty over false parity — mobile is triage, desktop is authoring
- motion explains, never decorates — transitions clarify structure and state change
- style serves initiative — cutting edge, artsy, or professional adapts to context

## Style archetypes

Each initiative chooses a style archetype that shapes visual language, motion intensity, and component selection:
- **Cutting Edge** — dark mode, bold gradients, glassmorphism, micro-animations, monospace accents
- **Artsy** — organic shapes, editorial typography, white space, storytelling layouts, texture
- **Professional** — clean grid, subtle color, data-dense, minimal animation, high contrast
- **Luxury** — black/white/gold, large typography, cinematic imagery, generous padding, serif accents
- **Playful** — bright colors, rounded corners, illustrations, bouncy animations, gamification
- **Minimal** — stark white space, single accent, system fonts, content-first, no decoration

## Definition of Ready (UI/UX)

- Operator task corpus documented
- First-class objects and state authority defined
- View registry mapped to operator questions
- Shell layout and drill-down chain specified
- Style archetype selected
- Accessibility baseline stated

## Definition of Done (UI/UX)

- All scenario tests pass (reachability, comprehension, safe action, recovery)
- Accessibility review complete (keyboard, focus, reduced-motion, target sizes)
- Platform adaptation verified (desktop authoring, mobile triage)
- Design system tokens consistent across surfaces
- Evidence bundle links every claim to proof
- Learning record captured for next iteration
