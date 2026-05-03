# Dependency Replacement Reference

Canonical table: `.codex/skills/rust-porting-playbook/references/dependency-replacement-matrix.csv`

This is a reading aid. The CSV is authoritative.

## Key replacements by category

### UI / terminal
| TypeScript | Rust | notes |
|---|---|---|
| React function components + hooks | explicit state + reducers + ratatui render | preserve behavior not component shape |
| Ink Box/Text/useInput/useStdin | ratatui widgets + crossterm events | keep raw mode and alt-screen cleanup explicit |
| chalk + figures + strip-ansi | ratatui style spans + unicode-width | move styling into renderer layer |

### Async / process
| TypeScript | Rust | notes |
|---|---|---|
| fs/promises, fs | tokio::fs (async paths) / std::fs (startup, tests) | |
| child_process, execFile, spawnSync | tokio::process::Command | preserve cancel semantics |
| execa | tokio::process helpers | add small local helpers first |
| AbortController | tokio task handles + cancellation tokens | add tokio-util only if plain handles prove insufficient |

### Network / transport
| TypeScript | Rust | notes |
|---|---|---|
| axios / undici / fetch | reqwest | one HTTP client only |
| WebSocketTransport | tokio-tungstenite | reconnect policy in application code |
| SSETransport / EventSource | streamed reqwest or reqwest-eventsource | justify reqwest-eventsource only if manual streaming is noisy |
| Node streams + event emitters | tokio channels + Stream | prefer mpsc/watch/broadcast by fan-out needs |

### Schema / integration
| TypeScript | Rust | notes |
|---|---|---|
| zod | serde + validator or manual checks | prefer manual when rules are simple |
| @anthropic-ai/sdk | reqwest + serde typed wrapper | do not let SDK shapes leak workspace-wide |
| @modelcontextprotocol/sdk | serde + tokio typed protocol layer | split DTOs from transport |
| skills loader + plugin manifests | serde manifest parsing + registry traits | preserve discovery order and trust checks |
| @opentelemetry sdk | tracing + tracing-opentelemetry | tracing is default even if otel export is optional |
| lru-cache | std collections or moka | justify moka only for shared async cache |
| chokidar | notify | for file watching in plugin/sync flows |

### Build / runtime gating
| TypeScript | Rust | notes |
|---|---|---|
| bun:bundle feature() | cargo features | keep feature names stable where user-visible |
| process.env.X / Bun.env.X | std::env::var | validate at startup boundary |
