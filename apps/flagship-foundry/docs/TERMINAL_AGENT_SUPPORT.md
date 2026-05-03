# Terminal Agent Support

## Principle

Terminal environments are adapters around the same core contracts:
- change request
- work order
- graph patch
- evidence bundle
- continuity state
- fix memory

## Expected adapter responsibilities

Each terminal adapter should know how to:
- read a work order
- narrow file and artifact scope
- launch the target environment
- capture outputs as typed artifacts
- update continuity and evidence on completion

## Target environments

### Codex
Strong fit for parallel tasking, worktrees, MCP integration, and a single account across app/editor/terminal surfaces.

### Claude Code
Strong fit for local tool use and MCP-based tool extension. Useful as a high-signal interactive supervisor or focused executor.

### Gemini CLI
Useful as an open-source terminal agent with built-in tools and MCP support. Treat it as an adapter with some evolving MCP semantics.

### OpenClaw
Useful as a gateway-centric orchestrator and plugin/skill platform when you want long-lived sessions, remote nodes, or a broader assistant environment.

### Local OpenAI-compatible hosts
Use for inexpensive executors and repeatable microtasks.

## Adapter design rule

Never encode business logic in the adapter. Keep the adapter thin and keep the orchestration intelligence in the control plane.
