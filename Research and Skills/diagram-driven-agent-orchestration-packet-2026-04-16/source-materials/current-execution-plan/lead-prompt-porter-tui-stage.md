# Team Lead Prompt — Stage 2: Port TUI Layer
Pipeline: ts-react-rust-migration | Stage 2 of 6

## Prerequisite
Stage 1 (analysis) must be complete. Read `.foundry/projects/ts-react-rust-migration/migration-ledger.json` and confirm tui-repl entries exist before spawning.

## Objective
Port the tui-repl subsystem from `apps/night-agent-runner/src/` to `apps/agent-runner-rust/crates/night-agent-runner-tui/`. The TS source is read-only. 4 porter teammates own non-overlapping file sets and write to separate submodules of the tui crate.

## Team Structure

Spawn all 4 teammates simultaneously.

### 1. porter-screens (subagent: rust-porter, model: sonnet)
> "Use the rust-porter skill. Port all screen files from apps/night-agent-runner/src/screens/ to night-agent-runner-tui/src/screens/ using Ratatui. Read the migration ledger at .foundry/projects/ts-react-rust-migration/migration-ledger.json for tui-repl entries in screens/. Submit your porting plan to the lead before writing any code. The plan must list each screen file, its Widget equivalent name, and its state struct. When cargo test passes for your slice, message the lead."

### 2. porter-components (subagent: rust-porter, model: sonnet)
> "Use the rust-porter skill. Port all component files from apps/night-agent-runner/src/components/ to night-agent-runner-tui/src/components/ using Ratatui Widget + StatefulWidget traits. Read the migration ledger. Submit plan to lead first. When your cargo tests pass, message the lead."

### 3. porter-ink-hooks (subagent: rust-porter, model: sonnet)
> "Use the rust-porter skill. Port the Ink render layer and React hooks from apps/night-agent-runner/src/ink/, hooks/, ink.ts, replLauncher.tsx to night-agent-runner-tui/src/runtime/. This replaces the React/Ink render loop with a Tokio event loop + Crossterm terminal driver. Key pattern: React useState/useEffect hooks → tokio::sync::watch channels or mpsc. Ink render → Ratatui draw cycle. Read the migration ledger. Submit plan to lead — plan must define the event loop architecture and channel topology. When tests pass, message lead."

### 4. porter-dialogs (subagent: rust-porter, model: sonnet)
> "Use the rust-porter skill. Port dialogLaunchers.tsx and interactiveHelpers.tsx from apps/night-agent-runner/src/ to night-agent-runner-tui/src/dialogs/. These are modal overlays — implement as Ratatui Popup/Clear + StatefulWidget. Read migration ledger. Submit plan to lead. Message lead when tests pass."

## Coordination

1. Before spawning: verify `migration-ledger.json` is complete for tui-repl subsystem.
2. Spawn all 4 simultaneously — their Rust output modules don't overlap.
3. Review and approve each porter's plan before they write code. Reject plans that don't define clear module boundaries or that propose touching each other's scope.
4. As each porter completes, note which tui submodule is done.
5. When all 4 message completion, run: `cargo test -p night-agent-runner-tui` yourself to confirm integration.
6. Update pipeline.json stage 2 → complete, then clean up team.

## Plan Approval Criteria
Approve a plan if it:
- Lists each source file and its Rust equivalent
- Defines the Rust module structure (file path in crate)
- Specifies which Ratatui traits are implemented
- Does not touch files owned by another teammate

Reject if it modifies the TS source or proposes sharing a module with another porter.

## Acceptance Gate
- [ ] `cargo test -p night-agent-runner-tui` passes
- [ ] `cargo check -p night-agent-runner-tui` passes
- [ ] All 4 porters have completed
