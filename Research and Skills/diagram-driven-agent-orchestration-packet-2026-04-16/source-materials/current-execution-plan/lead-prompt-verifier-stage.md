# Team Lead Prompt — Stage 6: Behavioral Parity Verification
Pipeline: ts-react-rust-migration | Stage 6 of 6

## Prerequisite
All of stages 2–5 (porter teams) must be complete. Confirm all 6 crates have passing cargo tests before spawning.

## Objective
Run behavioral parity verification across all 6 Rust crates simultaneously. Each verifier teammate owns one crate and produces a PASS/FAIL verdict with evidence. You aggregate results into a final report.

## Pre-spawn Checks
Before spawning, run yourself:
```bash
cd apps/agent-runner-rust && cargo test --workspace 2>&1 | tail -20
```
If any crate fails cargo test, do not spawn its verifier — message the operator with the failing crate and error.

## Team Structure

Spawn all 6 simultaneously (for any crate that passed cargo test above).

### 1. verifier-tui (subagent: rust-migration-verifier, model: sonnet)
> "Use the rust-migration-verifier skill. Verify night-agent-runner-tui for behavioral parity with the tui-repl TypeScript subsystem. Source TS files: apps/night-agent-runner/src/screens/, components/, ink/, hooks/. Rust target: apps/agent-runner-rust/crates/night-agent-runner-tui/. Check: all screens have Ratatui Widget equivalents, render logic preserved, state management correct. Read .foundry/projects/ts-react-rust-migration/migration-ledger.json for tui-repl entries. Report PASS or FAIL to the lead with specific findings. Save your verdict to .foundry/projects/ts-react-rust-migration/verifier-results/tui.json."

### 2. verifier-cli (subagent: rust-migration-verifier, model: sonnet)
> "Use the rust-migration-verifier skill. Verify night-agent-runner-cli for behavioral parity with the command-surface TypeScript subsystem. Source: apps/night-agent-runner/src/commands/. Rust target: apps/agent-runner-rust/crates/night-agent-runner-cli/. Check: all commands have Clap equivalents, argument parsing identical, async dispatch correct. Read migration ledger for command-surface entries. Save verdict to .foundry/projects/ts-react-rust-migration/verifier-results/cli.json."

### 3. verifier-core (subagent: rust-migration-verifier, model: sonnet)
> "Use the rust-migration-verifier skill. Verify night-agent-runner-core for behavioral parity. This is the highest-stakes verification — focus on: (1) QueryEngine stream lifecycle matches TS original, (2) session state serializes/deserializes correctly, (3) compaction pipeline produces equivalent output for known inputs. Source: QueryEngine.ts, state/, bootstrap/. Rust target: apps/agent-runner-rust/crates/night-agent-runner-core/. Read migration ledger. Save verdict to .foundry/projects/ts-react-rust-migration/verifier-results/core.json."

### 4. verifier-plugins (subagent: rust-migration-verifier, model: sonnet)
> "Use the rust-migration-verifier skill. Verify night-agent-runner-plugins for behavioral parity. Check: Plugin trait covers all skills, skill execute() methods produce equivalent output, output formatters match. Source: apps/night-agent-runner/src/skills/. Rust target: apps/agent-runner-rust/crates/night-agent-runner-plugins/. Save verdict to .foundry/projects/ts-react-rust-migration/verifier-results/plugins.json."

### 5. verifier-integrations (subagent: rust-migration-verifier, model: sonnet)
> "Use the rust-migration-verifier skill. Verify night-agent-runner-integrations for behavioral parity. Check: MCP message serialization is wire-compatible, client request/response lifecycle matches, error handling equivalent. Source: apps/night-agent-runner/src/bridge/. Rust target: apps/agent-runner-rust/crates/night-agent-runner-integrations/. Save verdict to .foundry/projects/ts-react-rust-migration/verifier-results/integrations.json."

### 6. verifier-remote (subagent: rust-migration-verifier, model: sonnet)
> "Use the rust-migration-verifier skill. Verify night-agent-runner-remote for behavioral parity. Check: TCP server accepts connections correctly, WebSocket protocol compliance, SSH tunnel lifecycle, upstream proxy routing. Source: apps/night-agent-runner/src/remote/, server/. Rust target: apps/agent-runner-rust/crates/night-agent-runner-remote/. Save verdict to .foundry/projects/ts-react-rust-migration/verifier-results/remote.json."

## Coordination

1. Create results dir: `mkdir -p .foundry/projects/ts-react-rust-migration/verifier-results/`
2. Spawn all 6 simultaneously.
3. As each reports back, record PASS or FAIL and any failing assertions.
4. For any FAIL: message the operator with crate name, verifier verdict JSON, and specific failures. Do not auto-fix — escalate to operator.
5. When all 6 report PASS, aggregate results into verification-report.md.

## Final Report Template
Write to `.foundry/projects/ts-react-rust-migration/verification-report.md`:
```markdown
# Verification Report — TS→Rust Migration
Date: <ISO date>

## Summary
| Crate | Verdict | Notes |
|-------|---------|-------|
| night-agent-runner-tui | PASS/FAIL | ... |
...

## Acceptance Gate Results
- [ ] cargo test --workspace: <pass/fail>
- [ ] pnpm exec nx run-many -t typecheck,test,build --projects=agent-runner-rust: <pass/fail>
- [ ] All 6 crates PASS: yes/no
```

Then run the Nx acceptance gate yourself:
```bash
cd monorepo && pnpm exec nx run-many -t typecheck,test,build --projects=agent-runner-rust
```

## Acceptance Gate
- [ ] All 6 verifier-results/*.json exist with verdict: PASS
- [ ] `cargo test --workspace` passes
- [ ] `pnpm exec nx run-many -t typecheck,test,build --projects=agent-runner-rust` passes
- [ ] verification-report.md written
- [ ] Update `.foundry/staging/ts-react-rust-migration/pipeline.json` stage 6 → complete
- [ ] Update `.foundry/projects/ts-react-rust-migration/current-task.json` → sdlcPhase: release
