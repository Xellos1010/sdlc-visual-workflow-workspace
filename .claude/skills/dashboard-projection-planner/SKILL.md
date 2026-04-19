---
name: dashboard-projection-planner
description: Designs the operator dashboard shell, views, drill-down chain, and interaction model for an agent orchestration or migration monitoring surface. Trigger on "design dashboard UI/UX", "define the God View", "what should the operator see", "dashboard for migration", or during the visualize/architect phase. Produces architecture/dashboard-shell.md and diagrams/dashboard-shell.mmd.
---

# Dashboard Projection Planner

Operator-first. Information scent before information density.

## Mindset

Dashboard UX Architect: what does the operator need to know right now, and how do they get to the next level of detail? Start from operator tasks, not from the data model.

## Output artifacts

| Artifact | Path |
|---|---|
| Dashboard shell spec | `architecture/dashboard-shell.md` |
| Shell wireframe | `diagrams/dashboard-shell.mmd` (flowchart) |
| View inventory | `architecture/view-inventory.json` |

## View inventory schema

```json
{
  "views": [
    {
      "id": "<view-id>",
      "name": "<display name>",
      "mode": "primary | inspector | drill-down | modal",
      "trigger": "<what operator action reveals this view>",
      "primaryObjects": ["<object type>", ...],
      "keyActions": ["<action-1>", ...],
      "drillsInto": ["<view-id>", ...],
      "evidencePanel": true
    }
  ]
}
```

## Standard view set for agent orchestration dashboard

### God View (primary)
- Pipeline stage status (all stages, color-coded)
- Active agent count and health
- Work queue depth and velocity
- Evidence gate status
- Quick action: assign, pause, resume, inspect

### Initiative Inspector (inspector)
- Initiative metadata and current phase
- Agent roster and per-agent status
- Artifact manifest (links to evidence, diagrams, ledgers)
- Work order graph (DAG view)

### Work Order Drill-down (drill-down)
- Single work order: objective, scope, acceptance criteria
- Agent assigned, model, elapsed time
- Output artifacts and evidence links
- Verdict (pending/pass/fail)

### Artifact Viewer (inspector)
- Diagram render (C4, sequence, state)
- Ledger reader (pseudocode, gap matrix, target map)
- Diff view (source vs target)

### Evidence Panel (modal)
- Verification check list and verdicts
- Artifact status (present/missing/stale)
- Acceptance gate status
- Gaps list

## Interaction rules

- Every primary object must be clickable to its inspector
- Navigation: breadcrumb trail, back button always present
- Actions: separated from navigation (distinct visual zone)
- Evidence panel: accessible from any view without losing current position
- Status colors: green=pass, amber=in-progress, red=fail/blocked, grey=pending

## Procedure

1. Identify primary objects from the initiative's artifact contract
2. Define the drill-down chain: God View → Initiative → Work Order → Artifact → Evidence
3. Map operator tasks to view actions
4. Write dashboard-shell.md (narrative spec + rationale)
5. Write dashboard-shell.mmd (flowchart of navigation graph)
6. Write view-inventory.json

## Quality gates

- [ ] Every primary object has an inspector view
- [ ] drill-down chain is complete (no dead ends)
- [ ] Every view has at least one keyAction
- [ ] dashboard-shell.mmd renders valid Mermaid
