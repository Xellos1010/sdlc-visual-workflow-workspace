# IDE Environment Spec

## Product role

The IDE environment is a **shell around the control plane**, not the source of truth. The source of truth remains:
- schemas,
- graph state,
- work orders,
- continuity,
- evidence,
- learning artifacts.

## Required surfaces

### 1. Graph canvas
- system map
- component map
- sequence and event views
- ownership and trust-boundary overlays
- complexity/principles overlays
- production telemetry overlays

### 2. Orchestration board
- active change requests
- work-order tree
- approval queue
- blocked items
- verification evidence
- handoff readiness

### 3. Code/workspace surface
- repository explorer
- diff review
- file-level work-order scope highlighting
- contract view for impacted APIs/events/schemas

### 4. Runtime/operations surface
- incident cockpit
- alerts and SLOs
- remediation proposals
- rollback status
- learning capture queue

### 5. Provider and adapter surface
- connected terminal agents
- model routing policies
- local/remote backend health
- adapter capabilities and failure notes

## Suggested architecture

### Phase 1
- terminal agent + browser dashboard
- optional VS Code companion extension

### Phase 2
- Theia-based product shell
- embedded graph canvas
- embedded orchestration board
- terminal adapter bridge panel
- work-order inspector and evidence viewer

## Non-negotiable IDE constraints

- the IDE may render and manipulate control-plane state, but not invent private hidden state;
- every action must resolve to typed artifacts;
- manual human edits are valid first-class operations and should be captured as evolution events;
- the system must keep working without the IDE present.
