# Work Orders — TypeScript → Rust Migration
Initiative: `ts-react-rust-migration`
Phase: `implement`
Generated: 2026-04-16

---

## Work Order: WO-TSRM-01
- **Initiative**: TypeScript → Rust Migration
- **Lifecycle Stage**: implement (analysis pre-phase)
- **Agent Role**: analyzer
- **Subagent Type**: ts-react-rust-analyzer
- **Model**: sonnet
- **Scope**: `apps/night-agent-runner/src/` (all files)
- **Depends On**: none — starts immediately
- **Objective**: Produce a complete per-file migration analysis for every TypeScript source file in scope. Classify each file by subsystem, document IO contracts, assign migration risk level (low/medium/high), and confirm the recommended Rust target crate.
- **Acceptance Criteria**:
  - [ ] Every .ts/.tsx file in `apps/night-agent-runner/src/` is classified into one of the seven canonical subsystems
  - [ ] Each file has: subsystem, runtime surfaces, IO contracts, migration risk, rust_target crate
  - [ ] High-risk files (async state machines, Ink render trees, bun-specific features) are flagged with notes
  - [ ] Findings broadcast to all teammates via team message before any porter begins
  - [ ] Migration ledger saved to `.foundry/projects/ts-react-rust-migration/migration-ledger.json`
- **Verification**:
  - Check `.foundry/projects/ts-react-rust-migration/migration-ledger.json` exists and is non-empty
  - Confirm file count matches `find apps/night-agent-runner/src -name "*.ts" -o -name "*.tsx" | wc -l`
- **Plan Approval Required**: no
- **Output Artifact**: `.foundry/projects/ts-react-rust-migration/migration-ledger.json`

---

## Work Order: WO-TSRM-02
- **Initiative**: TypeScript → Rust Migration
- **Lifecycle Stage**: implement
- **Agent Role**: porter-tui
- **Subagent Type**: rust-porter
- **Model**: sonnet
- **Scope**:
  - Source: `apps/night-agent-runner/src/screens/`, `components/`, `ink/`, `hooks/`, `dialogLaunchers.tsx`, `interactiveHelpers.tsx`, `ink.ts`, `replLauncher.tsx`
  - Target: `apps/agent-runner-rust/crates/night-agent-runner-tui/`
- **Depends On**: WO-TSRM-01 (analyzer findings must be broadcast first)
- **Objective**: Port the tui-repl subsystem to idiomatic Rust using Ratatui for layout/rendering and Crossterm for terminal I/O. Preserve all user-facing interactions and keyboard bindings.
- **Acceptance Criteria**:
  - [ ] All screens have Ratatui Widget equivalents in night-agent-runner-tui
  - [ ] Ink component tree converted to Ratatui layout system
  - [ ] Hooks pattern replaced with Rust event loop (tokio::select or mpsc channels)
  - [ ] `cargo test` passes for night-agent-runner-tui
  - [ ] rust-migration-verifier reports PASS for tui crate
- **Verification**:
  - `cargo test -p night-agent-runner-tui`
  - `cargo check -p night-agent-runner-tui`
- **Plan Approval Required**: yes — submit plan to lead before any file writes
- **Rollback Notes**: Rust crate is additive; TS source is read-only. Nothing to roll back on TS side.

---

## Work Order: WO-TSRM-03
- **Initiative**: TypeScript → Rust Migration
- **Lifecycle Stage**: implement
- **Agent Role**: porter-cli
- **Subagent Type**: rust-porter
- **Model**: sonnet
- **Scope**:
  - Source: `apps/night-agent-runner/src/commands/`, `commands.ts`, `entrypoints/`
  - Target: `apps/agent-runner-rust/crates/night-agent-runner-cli/`
- **Depends On**: WO-TSRM-01 (analyzer findings must be broadcast first)
- **Objective**: Port the command-surface subsystem to Clap v4 with Tokio async runtime. Map every CLI command and flag to a Clap subcommand with identical interface contracts.
- **Acceptance Criteria**:
  - [ ] All commands from `commands.ts` have Clap subcommand equivalents
  - [ ] Entry points (main, dev, prod variants) are ported to `main.rs` in night-agent-runner-cli
  - [ ] `cargo test` passes for night-agent-runner-cli
  - [ ] rust-migration-verifier reports PASS for cli crate
- **Verification**:
  - `cargo test -p night-agent-runner-cli`
  - `cargo check -p night-agent-runner-cli`
- **Plan Approval Required**: yes
- **Rollback Notes**: Additive only.

---

## Work Order: WO-TSRM-04
- **Initiative**: TypeScript → Rust Migration
- **Lifecycle Stage**: implement
- **Agent Role**: porter-core
- **Subagent Type**: rust-porter
- **Model**: sonnet
- **Scope**:
  - Source: `QueryEngine.ts`, `query.ts`, `query/`, `assistant/`, `services/`, `state/`, `bootstrap/`, `context/`, `history.ts`, `tasks/`, `tools/`
  - Target: `apps/agent-runner-rust/crates/night-agent-runner-core/`
- **Depends On**: WO-TSRM-01 (analyzer findings must be broadcast first)
- **Objective**: Port the runtime-core and session-compaction subsystems. This is the highest-risk work order — the QueryEngine, async session loop, and compaction pipeline must preserve exact behavioral semantics. Port incrementally: contracts first, then implementation, then tests.
- **Acceptance Criteria**:
  - [ ] QueryEngine Rust equivalent handles the same query lifecycle (stream, buffer, complete)
  - [ ] Session state (history, context, cost-tracker) round-trips through JSON correctly
  - [ ] Compaction pipeline produces equivalent output for known inputs
  - [ ] `cargo test` passes for night-agent-runner-core
  - [ ] rust-migration-verifier reports PASS for core crate
- **Verification**:
  - `cargo test -p night-agent-runner-core`
  - `cargo check -p night-agent-runner-core`
- **Plan Approval Required**: yes — this is the highest-risk order; plan must include incremental slice order
- **Rollback Notes**: Additive only. Core crate starts empty.

---

## Work Order: WO-TSRM-05
- **Initiative**: TypeScript → Rust Migration
- **Lifecycle Stage**: implement
- **Agent Role**: porter-extensions
- **Subagent Type**: rust-porter
- **Model**: sonnet
- **Scope**:
  - Source: `skills/`, `outputStyles/`, `bridge/`, `remote/`, `server/`
  - Target: `night-agent-runner-plugins/`, `night-agent-runner-integrations/`, `night-agent-runner-remote/`
- **Depends On**: WO-TSRM-01 (analyzer findings must be broadcast first)
- **Objective**: Port the three extension subsystems in a single work order (they are loosely coupled and share no internal state). Skills/plugins → trait-based plugin registry in Rust. MCP integrations → async client wrappers. Remote/bridge → Tokio TCP/SSH handlers.
- **Acceptance Criteria**:
  - [ ] Plugin trait defined and at least one skill implemented as a PluginImpl
  - [ ] MCP integration client connects and exchanges messages
  - [ ] Remote bridge and SSH mode handlers compile and pass basic connectivity tests
  - [ ] `cargo test` passes for all three crates
  - [ ] rust-migration-verifier reports PASS for plugins, integrations, remote crates
- **Verification**:
  - `cargo test -p night-agent-runner-plugins -p night-agent-runner-integrations -p night-agent-runner-remote`
- **Plan Approval Required**: yes
- **Rollback Notes**: Additive only.

---

## Work Order: WO-TSRM-06
- **Initiative**: TypeScript → Rust Migration
- **Lifecycle Stage**: verify
- **Agent Role**: verifier
- **Subagent Type**: rust-migration-verifier
- **Model**: sonnet
- **Scope**: `apps/agent-runner-rust/crates/`
- **Depends On**: progressively — claim crate verification task as each porter reports completion
- **Objective**: Verify each ported crate for behavioral parity as it becomes available. Do not wait for all porters to finish — verify incrementally. File verification reports to the lead and block the acceptance gate until all six crates pass.
- **Acceptance Criteria**:
  - [ ] rust-migration-verifier PASS for: night-agent-runner-tui
  - [ ] rust-migration-verifier PASS for: night-agent-runner-cli
  - [ ] rust-migration-verifier PASS for: night-agent-runner-core
  - [ ] rust-migration-verifier PASS for: night-agent-runner-plugins
  - [ ] rust-migration-verifier PASS for: night-agent-runner-integrations
  - [ ] rust-migration-verifier PASS for: night-agent-runner-remote
  - [ ] Verification report saved to `.foundry/projects/ts-react-rust-migration/verification-report.md`
- **Verification**:
  - `cargo test --workspace` in `apps/agent-runner-rust/`
  - `pnpm exec nx run agent-runner-rust:build`
- **Plan Approval Required**: no

---

## Work Order: WO-TSRM-DONE (Acceptance Gate)
- **Agent Role**: lead
- **Lifecycle Stage**: verify → release
- **Objective**: Confirm all acceptance criteria are met across all work orders. Run final Nx verification pipeline.
- **Acceptance Criteria** (all must be met):
  - [ ] WO-TSRM-01 through WO-TSRM-06 status: complete
  - [ ] `pnpm exec nx run-many -t typecheck,test,build --projects=agent-runner-rust` — all pass
  - [ ] `cargo test --workspace` in apps/agent-runner-rust — all pass
  - [ ] Migration ledger exists at `.foundry/projects/ts-react-rust-migration/migration-ledger.json`
  - [ ] Verification report exists at `.foundry/projects/ts-react-rust-migration/verification-report.md`
  - [ ] Update `.foundry/projects/ts-react-rust-migration/current-task.json` → `sdlcPhase: release`
