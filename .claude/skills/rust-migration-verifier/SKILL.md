---
name: rust-migration-verifier
description: verify a Rust migration slice for correctness, behavioral parity, and evidence completeness against the original TypeScript source. checks compile, clippy, tests, integration, behavior snapshots, placeholder ledger, and IR regression. use whenever the user wants to confirm a Rust conversion is correct, needs to check parity before marking a slice done, asks whether the Rust implementation matches the TypeScript original, wants to know what evidence is still missing, or is about to close a migration work order. invoke even if the user just says "is this done" or "does this work" after a porting step.
---

# Rust Migration Verifier

Independent parity gate. Default to findings and gaps — not summaries.

## Verification sequence

Run in order. Report immediately on first failure.

```bash
cargo check --workspace
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```

Clippy warnings are failures — treat as errors.

## Evidence requirements

A slice passes only when ALL apply:

| evidence | required for |
|---|---|
| compile success | all slices |
| clippy clean | all slices |
| unit tests with assertions | all slices |
| integration tests | command, session, remote, plugin slices |
| behavior snapshots or terminal recordings | TUI, compaction, session recovery slices |
| placeholder ledger entries (not silent) | any `todo!()` or stub |
| IR regression check | any slice that modifies previously-converted behavior |

Missing evidence = **failed gate**, not a pass with caveats.

## Parity criteria by subsystem

### TUI / REPL
- alternate screen: enter on init, restore on exit AND on panic
- raw mode: enabled on start, disabled on exit AND on panic
- transcript fidelity: content matches TS output for same input sequence
- input event semantics: keyboard nav, search, selection, permission dialogs all handled
- background task channels: query, bridge, remote, notification do not block the render loop

### Session / compaction
- compact boundary metadata survives a resume cycle
- no transcript history lost at a compact boundary
- microcompact and session-memory paths produce identical state to TypeScript baseline

### Commands
- same flags, same output format, same exit codes as TS original
- env gating (feature flags) produces same branching behavior
- help text and error messages match

### Plugins / MCP / skills
- discovery order preserved
- trust checks enforced before execution
- permission callbacks fire before side effects
- reload behavior equivalent to TS dynamic loader

### Remote / direct / SSH
- reconnect triggers on transport drop
- session state reconciled after reconnect
- cancel propagates to pending tool calls
- SSH session lifecycle matches TS behavior

## Fail conditions

Fail the slice if any of these are true:
- behavior from the migration IR was dropped without an ADR
- a `todo!()` or stub exists with no ledger entry
- integration test coverage is zero for a command, service, or remote slice
- TUI or session slice has no snapshot evidence
- clippy emits warnings
- a new crate was added without a rationale in the work order or an ADR

## Output format

```
PASS|FAIL  <slice name or path>

evidence:
  ✓ compile
  ✓ clippy
  ✓ unit tests (N assertions)
  ✗ integration tests (missing)
  ✗ behavior snapshot (missing)

gaps:
  - <specific missing item>

placeholders:
  - <todo!() location>: <what is missing and what unblocks it>

next:
  - <what to do before retrying>
```

## Guardrails

- Stay independent of the implementation plan — disagree when evidence is absent
- Do not mark a slice verified until the ledger entries are updated
- Escalate when remote, session, compaction, plugin, or TUI behaviors were not exercised
- Reference files:
  - `.codex/skills/parity-verifier-rust/references/parity-criteria.md`
  - `.codex/skills/parity-verifier-rust/references/regression-checklist.md`
  - `.codex/skills/parity-verifier-rust/references/behavior-snapshot-guidance.md`
