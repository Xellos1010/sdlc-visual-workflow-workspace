# Dashboard UX — “God View”

## UX objective

The dashboard must let a user answer five questions quickly:

1. What exists?
2. What is changing?
3. What is blocked?
4. What should run next?
5. What evidence proves the current state?

## Core shell

- **Top bar**: workspace, global search, command palette, approvals, alerts, run status
- **Left rail**: Overview, Architecture, Behavior, Migration, Work Orders, Evidence, Settings
- **Center canvas**: primary selected view
- **Right inspector**: selected node/module/work-order details and valid actions
- **Bottom drawer**: logs, chat, evidence, verifier notes, continuity

## Core views

### Overview
- ecosystem map
- project health strip
- recent runs
- approvals awaiting action

### Architecture
- C4 context/container/component
- package/component drill-down
- dependency overlays

### Behavior
- sequence diagrams
- state machines
- activity / flow views

### Migration
- keep/adapt/rewrite/defer board
- target mapping
- gap matrix and risk flags
- source ↔ target side-by-side diff intent

### Work Orders
- kanban / dependency DAG
- agent assignments
- acceptance criteria

### Evidence
- verifier verdicts
- build/test history
- snapshots and handoffs

## Required interactions

- saved layouts: Architect / Migrator / Operator / Verifier
- drill-down path: ecosystem → subsystem → module → pseudocode → work order → evidence
- compare mode: source vs target, current vs proposed, run A vs run B
- dock/undock panels
- keyboard command palette
- fit-to-selection and mini-map for large graphs

## Panel priorities

- Canvas is for navigation and comprehension.
- Inspector is for meaning and actions.
- Drawer is for evidence and execution detail.

## Rule of restraint

The graph is not the only control plane. It is the **overview surface**. High-risk actions should happen through explicit forms, buttons, approvals, or work-order actions.
