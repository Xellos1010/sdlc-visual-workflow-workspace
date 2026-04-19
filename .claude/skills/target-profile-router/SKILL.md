---
name: target-profile-router
description: Maps a migration target to the correct Rust framework/runtime profile with constraints, crate recommendations, and idiom rules. Trigger on "choose framework for Rust port", "Axum vs Actix", "Tauri vs native", "target platform constraints", or before work-order-graph-builder. Produces a target profile that porters use as their framework constraint.
---

# Target Profile Router

Target selection is a one-way door. Get it right before porters start.

## Supported target profiles

### `terminal-tui` (for tui-repl subsystem)
- Runtime: tokio async
- TUI: ratatui + crossterm
- Layout: ratatui Layout constraints (replaces yoga-layout)
- Key handling: crossterm event loop
- Constraints: no React, no JSX, no DOM — pure terminal widget tree

### `cli-binary` (for command-surface subsystem)
- Runtime: tokio async
- CLI parsing: clap v4 (derive API)
- IPC: tokio channels or Unix sockets
- Constraints: no UI widgets, stateless per invocation

### `async-core` (for runtime-core and session-compaction)
- Runtime: tokio async
- Error handling: anyhow (application) + thiserror (library boundaries)
- Serialization: serde + serde_json
- Concurrency: tokio::sync (Mutex, RwLock, mpsc, broadcast)
- Constraints: no blocking calls on async threads; use spawn_blocking for fs-heavy ops

### `plugin-host` (for skills-and-plugins)
- Runtime: tokio async
- Dynamic loading: libloading or CDyLib convention (no WASM yet unless specified)
- Constraints: stable ABI boundary required; use C-compatible types at plugin boundary

### `mcp-server` (for mcp-integrations)
- Runtime: tokio async
- HTTP/SSE: axum + tower
- WebSocket: tokio-tungstenite
- JSON-RPC: manual or jsonrpc-core
- Constraints: all handlers must be Send + Sync

### `remote-agent` (for remote-connectivity)
- Runtime: tokio async
- TLS: rustls
- SSH: optional — ssh2 crate (not pure-Rust; flag as blocker if pure-Rust required)
- Constraints: connection lifecycle must be explicit; no implicit reconnect

## Output artifact

`migration/target-profile.json`

```json
{
  "subsystemProfiles": {
    "<subsystem>": {
      "profile": "<profile-name>",
      "runtime": "<tokio|std|...>",
      "keyDependencies": ["<crate@version>", ...],
      "idiomRules": ["<rule-1>", ...],
      "constraints": ["<constraint-1>", ...]
    }
  }
}
```

## Procedure

1. Read migration/gap-matrix.json and migration/target-map.json
2. For each subsystem: select the matching profile
3. Resolve any profile conflicts (e.g., subsystem spans two profiles → split or escalate)
4. Write target-profile.json
5. Flag any subsystems where the target profile has unresolved blockers
