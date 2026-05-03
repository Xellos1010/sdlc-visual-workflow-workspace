# Team Lead Prompt — TypeScript → Rust Migration

## Environment
Ensure `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is set before launching:
```bash
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude
```
Or add it permanently to `~/.claude.json` under `env`.

---

## Objective

Port the **night-agent-runner** TypeScript/React/Ink CLI application to idiomatic Rust. The Rust workspace already exists at `apps/agent-runner-rust/` with six empty crates:
- `night-agent-runner-tui` — Ratatui/Crossterm UI layer
- `night-agent-runner-cli` — Clap command surface
- `night-agent-runner-core` — Tokio async runtime + session compaction
- `night-agent-runner-plugins` — Skill/plugin registry
- `night-agent-runner-integrations` — MCP client wrappers
- `night-agent-runner-remote` — TCP/SSH bridge and server

The TypeScript source lives at `apps/night-agent-runner/src/`. It is **read-only** — porters write only to the Rust crates.

---

## SDLC Context

Cycle: `discover → define → visualize → architect → plan → implement → verify → release → operate → diagnose → improve`
Current phase: **implement**
Continuity state: `.foundry/projects/ts-react-rust-migration/current-task.json`
Work orders: `.foundry/staging/ts-react-rust-migration/work-orders.md`

---

## Team Structure

Spawn the following 6 teammates in this order:

### 1. analyzer (subagent: ts-react-rust-analyzer, model: sonnet)
**Spawn immediately — no dependencies.**
**Scope**: All files under `apps/night-agent-runner/src/`
**Instructions**:
Spawn with this prompt:
> "You are the analyzer for the TypeScript → Rust migration initiative. Use the ts-react-rust-analyzer skill. Analyze every .ts and .tsx file under apps/night-agent-runner/src/. For each file, produce: subsystem classification (use the canonical vocabulary), runtime surfaces, IO contracts, migration risk level (low/medium/high), and rust_target crate name. When complete, save the full ledger to .foundry/projects/ts-react-rust-migration/migration-ledger.json and broadcast your findings summary to all teammates. Do not stop until 100% of files are analyzed."

### 2. porter-tui (subagent: rust-porter, model: sonnet)
**Spawn after analyzer broadcasts findings.**
**Scope**: `screens/`, `components/`, `ink/`, `hooks/`, `dialogLaunchers.tsx`, `interactiveHelpers.tsx`, `ink.ts`, `replLauncher.tsx` → `crates/night-agent-runner-tui/`
**Instructions**:
Spawn with this prompt:
> "You are porter-tui for the TypeScript → Rust migration. Use the rust-porter skill. Your job is to port the tui-repl subsystem from apps/night-agent-runner/src/ to the night-agent-runner-tui Rust crate using Ratatui + Crossterm. Wait for the analyzer to broadcast findings before starting. Read the migration ledger at .foundry/projects/ts-react-rust-migration/migration-ledger.json. Submit a porting plan to the lead for approval before writing any code. When your crate passes `cargo test -p night-agent-runner-tui`, message the verifier teammate to begin verification."

### 3. porter-cli (subagent: rust-porter, model: sonnet)
**Spawn after analyzer broadcasts findings.**
**Scope**: `commands/`, `commands.ts`, `entrypoints/` → `crates/night-agent-runner-cli/`
**Instructions**:
Spawn with this prompt:
> "You are porter-cli for the TypeScript → Rust migration. Use the rust-porter skill. Your job is to port the command-surface subsystem to the night-agent-runner-cli Rust crate using Clap v4 + Tokio. Wait for the analyzer to broadcast findings first. Read .foundry/projects/ts-react-rust-migration/migration-ledger.json. Submit a porting plan to the lead before writing code. When `cargo test -p night-agent-runner-cli` passes, message the verifier."

### 4. porter-core (subagent: rust-porter, model: sonnet)
**Spawn after analyzer broadcasts findings. This is the highest-risk work order.**
**Scope**: `QueryEngine.ts`, `query.ts`, `query/`, `assistant/`, `services/`, `state/`, `bootstrap/`, `context/`, `history.ts`, `tasks/`, `tools/` → `crates/night-agent-runner-core/`
**Instructions**:
Spawn with this prompt:
> "You are porter-core for the TypeScript → Rust migration. Use the rust-porter skill. Your job is to port the runtime-core and session-compaction subsystems to night-agent-runner-core using Tokio async. This is the highest-risk work order — the QueryEngine and session loop must preserve exact behavioral semantics. Start with contracts (types, traits), then implement incrementally. Wait for analyzer findings. Read the migration ledger. Your plan must include the incremental slice order (contracts → session state → query engine → compaction). Submit plan to lead for approval before coding. Message verifier when cargo test passes."

### 5. porter-extensions (subagent: rust-porter, model: sonnet)
**Spawn after analyzer broadcasts findings.**
**Scope**: `skills/`, `outputStyles/`, `bridge/`, `remote/`, `server/` → `crates/plugins/`, `integrations/`, `remote/`
**Instructions**:
Spawn with this prompt:
> "You are porter-extensions for the TypeScript → Rust migration. Use the rust-porter skill. You are porting three loosely-coupled extension subsystems: (1) skills/plugins → night-agent-runner-plugins (trait-based plugin registry), (2) MCP integrations → night-agent-runner-integrations (async client wrappers), (3) remote/bridge/server → night-agent-runner-remote (Tokio TCP/SSH). Port all three in a single work order since they share no internal state. Wait for analyzer findings. Submit a plan covering all three crates before coding. Message verifier when all three pass cargo test."

### 6. verifier (subagent: rust-migration-verifier, model: sonnet)
**Spawn immediately — verifies crates as they become available.**
**Scope**: `apps/agent-runner-rust/crates/`
**Instructions**:
Spawn with this prompt:
> "You are the verifier for the TypeScript → Rust migration. Use the rust-migration-verifier skill. You verify crates for behavioral parity as porters complete them — do not wait for all porters to finish. When a porter messages you that their crate is ready, run verification for that crate immediately. For each crate: check cargo test passes, run behavioral parity checks, report PASS or FAIL to the lead with specific failing assertions. When all six crates pass, save a verification report to .foundry/projects/ts-react-rust-migration/verification-report.md and tell the lead the acceptance gate is clear."

---

## Coordination Rules

1. **Sequencing**: analyzer runs first. Porter teammates must read the migration ledger before beginning. Verifier runs concurrently as each crate is ready.

2. **Plan approval**: porter-tui, porter-cli, porter-core, and porter-extensions must each submit a written plan before writing any code. Review each plan yourself. For porter-core specifically, only approve a plan that includes incremental slice order and defines the Rust trait boundaries for QueryEngine.

3. **Communication**: Require analyzer to broadcast findings to all teammates simultaneously when the ledger is complete. Porter teammates message the verifier directly (not through you) when their cargo tests pass.

4. **Task list**: Use the shared task list to track work order completion status. Each work order (WO-TSRM-01 through WO-TSRM-06) maps to a task.

5. **Blocked teammates**: If a porter gets stuck on a specific file due to Bun-specific or Ink-specific API surface that has no direct Rust equivalent, message them: "Use a stub implementation with a `// TODO: bun-compat` comment and continue. Flag it in the migration ledger."

6. **Continuity**: After each porter completes and verifier confirms PASS, update `.foundry/projects/ts-react-rust-migration/current-task.json` to reflect completed crates.

7. **Shutdown**: When all six crates are verified and WO-TSRM-DONE criteria are met, run the acceptance gate checklist yourself, then ask each teammate to shut down. Clean up the team only after all teammates have confirmed shutdown.

---

## Acceptance Gate (WO-TSRM-DONE)

Before declaring the initiative complete, verify all of the following:

- [ ] rust-migration-verifier PASS for all six crates (tui, cli, core, plugins, integrations, remote)
- [ ] `cargo test --workspace` passes in `apps/agent-runner-rust/`
- [ ] `pnpm exec nx run-many -t typecheck,test,build --projects=agent-runner-rust` passes
- [ ] `.foundry/projects/ts-react-rust-migration/migration-ledger.json` exists
- [ ] `.foundry/projects/ts-react-rust-migration/verification-report.md` exists
- [ ] `.foundry/projects/ts-react-rust-migration/current-task.json` updated to `sdlcPhase: release`

When all boxes are checked, report completion to the operator.
