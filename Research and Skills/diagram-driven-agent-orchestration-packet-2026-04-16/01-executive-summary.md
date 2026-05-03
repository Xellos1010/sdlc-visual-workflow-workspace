# Executive Summary

## Product thesis

Build an **open, diagram-driven agent orchestration platform** that can reverse-engineer a source repository, synthesize multi-view architectural artifacts, extract pseudocode and contracts, research migration gaps, generate bounded work orders, coordinate agent teams, and verify parity after conversion.

## What you found that matters

Software Ideas Modeler proves four things:

1. A **model-backed repository** is more useful than disconnected drawings.
2. Reverse engineering + source-code generation + reusable templates create a powerful software-analysis loop.
3. Multiple diagram families are necessary because one visualization cannot answer every architecture question.
4. A collaboration server with a shared repository and task layer materially improves team coordination.

## What your product should do differently

Your product should preserve those strengths while replacing the proprietary desktop-center-of-gravity with an **AI-native open artifact core**:

- Canonical artifacts in Markdown, JSON, Mermaid, PlantUML, JSON Schema, OpenAPI, and optional DOT/GraphML.
- Multi-model runner support: Claude, Codex, Cursor, local executors, and future custom agents.
- First-class pseudocode, migration ledgers, evidence bundles, verifier outputs, and work-order graphs.
- Web dashboard + workstation agent runner + collaboration server rather than a Windows-only modeling center.
- Explicit separation between **declared design**, **generated code**, **runtime evidence**, and **approval state**.

## Core user promise

> “Give the system a repo or problem brief, and it returns a reproducible packet: architecture, diagrams, pseudocode, dependency gaps, migration plan, agent assignments, verification criteria, and a package ready for execution.”

## MVP scope

### Must ship in MVP

- Repo ingestion and intermediate representation
- Artifact contract and diagram decision matrix
- Auto-generated: dependency graph, module graph, call graph, class/package candidates, ERD candidates
- AI-curated: C4 context/container/component, sequence, state, DFD, migration map, work orders
- Pseudocode ledger per file / module / exported function
- Agent topology and launch artifacts
- Dashboard MVP with architecture, migration, execution, and evidence views
- Collaboration-ready server API and workspace storage

### Can wait until later

- Full diagram editor parity with desktop CASE tools
- Direct code generation for every target language/framework
- Rich enterprise notation authoring beyond the most valuable views
- Offline viewer parity with all future web features

## Pilot

Use **TypeScript/React → Rust** as the proving use case because it forces the system to handle UI structure, async runtime behavior, data contracts, framework translation, and behavioral parity verification.
