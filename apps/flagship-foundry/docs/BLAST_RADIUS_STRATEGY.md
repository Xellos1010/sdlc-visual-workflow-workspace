# Blast Radius Strategy

Your stated pain is real: plans can sound complete while silently skipping sibling surfaces, shared patterns, or parallel systems.

Foundry addresses that with six blast-radius layers:

1. **Direct dependency graph** - imports, path aliases, and project references.
2. **Shared pattern graph** - same tags, same platform, same framework, same rule packs.
3. **Capability lineage** - service worker, content, side panel, popup, telemetry, storage, permissions, and other surfaced capabilities.
4. **Governance coupling** - if a rule pack, runbook, or contract changes, all governed projects are candidate impacts.
5. **Environment coupling** - if shared Cursor, Codex, Claude Code, or MCP doctrine changes, related workflows and adapters are candidate impacts.
6. **Operational evidence** - telemetry and defect clusters expand impact beyond current code touch points.

## Current minimum slice

- `packages/core/src/blast-radius.mjs` calculates the scored impact set.
- `packages/core/src/focus-views.mjs` turns a query into a drilldown Mermaid diagram.
- risky plans can now insert adversarial challenge and reconciliation rounds before implementation.

For MV3 ecosystems specifically, any service-worker change should review content scripts, popup, side panel, storage, permissions, and messaging contracts before execution proceeds.
