---
name: ts-react-rust-analyzer
description: "Pre-migration analysis for TypeScript/TSX→Rust. Trigger on ANY of these: migration risk for a .ts/.tsx file, keep-vs-adapt decision, 'what subsystem does X belong to', 'what crate should it live in', IO contract or side-effect analysis before porting, TS dependency mapping before starting a Rust port. Also trigger when user says 'before porting', 'before writing the Rust version', 'before i write the serde/tokio equivalent', or asks what a TS module does in migration context. Produces: subsystem classification (tui-repl / command-surface / skills-and-plugins / mcp-integrations / remote-connectivity / session-compaction / runtime-core), runtime surfaces, migration risk score, rust_target crate, migration_decision (keep/adapt/rewrite/deferred). Analysis gate — always runs before any porting work, even if user says 'just port X to Rust'."
---

# TS React Rust Analyzer

Analyze source before any migration work. Output structured facts about behavior and contracts — not a Rust implementation.

## Canonical vocabulary — use EXACTLY these names

**Subsystem names** (use verbatim in output — do not paraphrase):

| subsystem | source patterns |
|---|---|
| `tui-repl` | `screens/`, `components/`, `ink/`, `hooks/`, `*.tsx` |
| `command-surface` | `commands/`, `commands.ts`, `cli/handlers/`, `cli/`, `entrypoints/` |
| `skills-and-plugins` | `skills/`, `outputStyles/` |
| `mcp-integrations` | `services/mcp/`, `commands/mcp/` |
| `remote-connectivity` | `bridge/`, `remote/`, `ssh/`, `server/` |
| `session-compaction` | `services/compact/`, `state/`, `bootstrap/` |
| `runtime-core` | `QueryEngine.ts`, `query.ts`, `assistant/`, `services/tools/` |

**Target crate names** (use verbatim — the crate name matters for work orders and the ledger):

| subsystem | rust_target crate |
|---|---|
| `tui-repl` | `night-agent-runner-tui` |
| `command-surface` | `night-agent-runner-cli` |
| `skills-and-plugins` | `night-agent-runner-plugins` |
| `mcp-integrations` | `night-agent-runner-integrations` |
| `remote-connectivity` | `night-agent-runner-remote` |
| `session-compaction` | `night-agent-runner-core` |
| `runtime-core` | `night-agent-runner-core` |

**Runtime surface names** (use verbatim — pick all that apply):

`bun-feature-gate` `react-ui` `ink-ui` `command-registry` `skill-loader` `plugin-marketplace` `mcp-integration` `compaction` `session-recovery` `remote-mode` `direct-connect` `ssh-mode` `process-exec` `filesystem` `telemetry` `streaming-queue`

**IO contract names** (use verbatim):

`filesystem-read` `filesystem-write` `process-spawn` `http-request` `websocket-transport` `sse-transport` `terminal-input` `terminal-output` `mcp` `remote-session` `environment-gate`

**Migration decision values** (pick exactly one):

`keep` · `adapt` · `defer` · `drop`

---

## Output per file or module

| field | value |
|---|---|
| subsystem | one of the subsystem names above |
| runtime_surfaces | list from the surface names above |
| io_contracts | list from the IO contract names above |
| migration_risk | low / medium / high / critical + reasons |
| rust_target | `<crate>::<module::path>` using the crate table above |
| migration_decision | keep / adapt / defer / drop |

For a single file: inline table.
For a module or subsystem: one-row-per-file markdown table.
For full project scope: delegate to `.codex/skills/ts-react-cli-source-analyzer/scripts/extract_runner_ir.py`.

---

## Risk scoring

Score 5 for `screens/REPL.tsx`. Score 1 each for: `ink-ui`, `compaction`, `session-recovery`, `remote-mode`, `direct-connect`, `ssh-mode`, `plugin-marketplace`, `skill-loader`, `mcp-integration`. Score 2 if file >600 lines.

- ≥ 7 → **critical**
- ≥ 4 → **high**
- ≥ 2 → **medium**
- else → **low**

---

## Migration decision rules

- `keep` — pure data/parsing/utility, no framework lock-in
- `adapt` — must preserve observable behavior but React/Ink/Bun internals cannot carry over; default for any file with `react-ui`, `ink-ui`, `bun-feature-gate`, `compaction`, `session-recovery`, `remote-mode`, `plugin-marketplace`, `skill-loader`, or `mcp-integration`
- `defer` — blocked on upstream subsystem; record what blocks it
- `drop` — explicitly non-goal with ADR approval

---

## Dependency replacement quick-ref

See `references/dep-replacements.md` for the full table. Key entries:

| TypeScript | Rust | notes |
|---|---|---|
| React + Ink | ratatui + crossterm | adapt — behavior not component shape |
| `bun:bundle feature()` | cargo features | replace |
| `fs/promises` | `tokio::fs` | replace |
| `child_process` / `execa` | `tokio::process::Command` | replace |
| `WebSocketTransport` | `tokio-tungstenite` | replace |
| `@anthropic-ai/sdk` | `reqwest` + `serde` typed wrapper | adapt |
| `@modelcontextprotocol/sdk` | typed `serde` + `tokio` protocol layer | adapt |
| skills loader / plugin manifests | `serde` manifest parsing + registry traits | adapt |

---

## Guardrails

- Use the canonical names above — downstream work orders, ledger, and IR all key off them
- Analyze behavior and runtime contracts — not file shape
- Flag `REPL.tsx`, `QueryEngine.ts`, compaction, remote, and plugin surfaces as priority-1
- Skip `node_modules/`, `dist/`, `build/`, test fixtures
- Do not emit Rust code in this step — analysis and decision only
- If scope is unclear, analyze the highest-risk file first and ask before expanding
