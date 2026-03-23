# Minimum Executable Slice

The minimum executable slice is the smallest runnable system that demonstrates the architecture without requiring a full IDE, agent runtime, or cloud backend.

## Goals

- prove the graph + work-order + runbook architecture;
- show how the ecosystem decomposes a multi-system request into bounded tasks;
- keep the provider and terminal environment swappable;
- make the first slice runnable from a terminal with Node only.

## Included capabilities

### 1. Typed change intake
A typed change request is accepted as JSON and normalized into an orchestration input.

### 2. Ecosystem planning
The ecosystem orchestrator decomposes the request into:
- one ecosystem-level impact order,
- one or more system plans,
- repo/component build orders,
- verification orders,
- handoff orders,
- learning orders.

### 3. Graph read + patch
A simple graph store supports node and edge upsert, property mutation, deletion, and summary inspection.

### 4. Catalog discovery
The control plane lists:
- runbooks,
- personas,
- providers,
- adapters,
- guardrail packs.

### 5. Incident-to-change translation
A telemetry or incident record can be transformed into a typed change request.

## Not yet included

- real model execution
- MCP tool invocation
- git/worktree execution
- vector retrieval or code graph indexing
- visual canvas or animated diagrams
- production auth, RBAC, tenancy, or persistence services
- independent verification executors

## Why this slice is correct

It validates the system's **shape** before its full implementation:
- contracts exist,
- work orders are typed,
- graph mutations are explicit,
- orchestration layers are separable,
- adapters are externalized,
- future providers can plug in without redesigning the core.

## Recommended next step after this slice

1. repository registration and code-graph ingestion
2. MCP-based tool envelope
3. real provider router
4. git/worktree-safe executor
5. independent verifier service
6. visualization layer
