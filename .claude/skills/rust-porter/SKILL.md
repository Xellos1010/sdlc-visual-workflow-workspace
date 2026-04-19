---
name: rust-porter
description: port a bounded TypeScript, TSX, React, Ink, Bun, Node, CLI, plugin, MCP, session, compaction, or remote slice to idiomatic Rust using behavior-first patterns, tokio, serde, tracing, ratatui, and crossterm. use whenever the user asks to convert, port, rewrite, or translate any specific TypeScript file or module to Rust, or wants to know how to implement the Rust equivalent of a TS/React/Ink pattern. also invoke when the user has a migration analysis ready and wants to start writing Rust code. do NOT use for screens/REPL.tsx or fullscreen Ink/React terminal flows — use rust-tui-runtime-replacement for those.
---

# Rust Porter

Port a bounded slice. Start from observable behavior and IO contracts — not file shape.

## Before starting

Run `$ts-react-rust-analyzer` on the files if no analysis exists. You need:
- subsystem + runtime surfaces
- IO contracts
- migration decision (keep / adapt / defer / drop)
- placeholder requirements

## Default Cargo dependencies

```toml
tokio       = { version = "1", features = ["full"] }
serde       = { version = "1", features = ["derive"] }
serde_json  = "1"
tracing     = "0.1"
anyhow      = "1"
```

Add only when the behavior requires it:

| need | crate | condition |
|---|---|---|
| terminal UX | ratatui + crossterm | any TUI slice — use `$rust-tui-runtime-replacement` |
| HTTP | reqwest | API calls, polling, uploads |
| WebSocket | tokio-tungstenite | bidirectional remote session transport |
| SSE | reqwest-eventsource | only if manual streaming is noisy |
| file watching | notify | plugin, skill, or sync file watch behavior |
| process exec | tokio::process (std) | no extra crate needed |
| SSH | russh or async-ssh2-tokio | SSH session transport |
| OpenTelemetry | tracing-opentelemetry | when otel export is required |
| async cache | moka | only if shared async eviction needed |

Every non-default crate needs a rationale in the work order or an ADR.

## Decision-to-action map

| decision | action |
|---|---|
| keep | direct port — typed structs/enums, same logic, unit tests |
| adapt | new Rust model with same observable behavior |
| defer | compile-safe stub + ledger entry recording blocker and owner |
| drop | delete with ADR approval recorded |

## Adapt sequence

When behavior must be preserved but framework internals cannot carry over:

1. **Name the observable behavior** — what it does from outside (inputs, outputs, side effects)
2. **Model the Rust data** — state structs, event enums, error types
3. **Define async boundaries** — which tokio tasks own which work; which channels carry which messages
4. **Implement** — tokio tasks, channels, serde types
5. **Test** — verify behavior not internals; cover side effects and error paths

## Subsystem guides (load only what matches)

- **TUI/REPL**: use `$rust-tui-runtime-replacement` — do not use this skill for React/Ink UI
- **plugins/MCP**: `.codex/skills/rust-porting-playbook/references/plugins-and-mcp.md`
- **session/compaction/remote**: `.codex/skills/rust-porting-playbook/references/session-and-remote.md`
- **runtime/state/QueryEngine**: `.codex/skills/rust-porting-playbook/references/runtime-and-state.md`
- **workspace layout**: `.codex/skills/rust-porting-playbook/references/workspace-layout.md`

## Placeholder rules

A placeholder must:
- compile cleanly
- panic loudly when invoked (`todo!("reason: what is missing and what unblocks it")`)
- have a matching ledger entry with: missing behavior, blocker, owner

Never let a placeholder silently succeed.

## Output per slice

- Rust file(s) at the declared `rust_target` path
- Unit tests in the same file or adjacent `tests/` dir
- Updated migration ledger entry (`status`, `verification_status`, `evidence_paths`)
- Any new placeholder entries

Verify with `cargo check --workspace` before declaring the slice done.

## Guardrails

- Behavior and IO contracts before architecture cleanup
- Do not mirror React or Ink component trees in Rust
- Do not port commands without their runtime deps, permission model, and session semantics
- TUI slices → escalate to `$rust-tui-runtime-replacement`
- New crate → rationale required in work order or ADR
- Dep replacement reference: `.codex/skills/rust-porting-playbook/references/dependency-replacement-matrix.csv`
