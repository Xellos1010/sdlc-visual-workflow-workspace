---
name: diagram-driven-migration
description: diagram-driven reverse engineering, artifact generation, and migration planning for codebases. use when analyzing an existing repository to extract architecture and pseudocode, generating C4/UML/sequence/state/DFD artifacts, planning a language or framework migration such as TypeScript/React to Rust, executing a diagram-driven TS→Rust conversion cycle with work orders and verification gates, or producing a reusable analysis packet for an agent orchestration dashboard. invoke at the start of any migration engagement before writing any implementation code.
---

# Diagram-Driven Migration

Turn a repository or system brief into a standardized analysis and migration packet. Follow this procedure exactly.

## Core rule

Artifacts before implementation claims.

The minimum artifact pack is defined in `diagram-driven-migration-foundry/references/artifact-contract.md`. Do not make any migration or porting claims until that contract is satisfied for the scope in question.

---

## Trigger conditions

Invoke this skill when:

- A user provides a source directory and asks for analysis, architecture extraction, or diagram generation
- A migration from TypeScript/React to Rust (or any language conversion) is requested
- A reusable execution packet is needed for hand-off to another agent or dashboard
- The user asks to plan, scope, or chunk a migration before implementation begins

Do not invoke this skill to write implementation code directly. Implementation is delegated to `/rust-porter` via work orders produced in Phase 7.

---

## Phase 1 — Intake and Repository Mapping

**Entry criteria**: source directory path provided.

1. Accept the source directory as the only required input.
2. Invoke `/repository-cartographer` on the source directory. This is the first action taken before any other analysis. Consume its outputs directly:
   - `code/module-graph.json` — inter-module dependency graph
   - `code/dependency-graph.json` — external dependency graph
   - `code/subsystem-map.json` — initial subsystem groupings
3. Read key files in this order: `package.json`, `tsconfig.json`, `README.md` or `README`, primary entry points (e.g., `src/index.ts`, `src/main.ts`, `main.rs`).
4. Identify: project name, declared purpose, runtime target (browser/node/bun/cli/server), primary language(s), dependency count, test framework presence.
5. Produce `project-intake.md` using the template at `diagram-driven-migration-foundry/assets/templates/project-intake-template.md`. Fill every section; mark unknown fields explicitly as `unknown`.
6. Run `diagram-driven-migration-foundry/scripts/validate_packet.py` against the output directory. Fix any reported gaps before proceeding to Phase 2.

**Exit criteria**: `project-intake.md` exists, `code/module-graph.json`, `code/dependency-graph.json`, and `code/subsystem-map.json` exist, and validation passes.

---

## Phase 2 — Analysis

**Entry criteria**: Phase 1 complete.

Run the following in parallel:

1. **If TypeScript or TSX source is detected**: invoke `/ts-react-rust-analyzer` on the full scope. Consume its output directly — do not re-derive what the analyzer produces.
2. Invoke `/pseudocode-ledger-writer` on all modules. Output: `code/pseudocode-ledger.md`. One entry per significant function or module with columns `name | signature | purpose | algorithm-summary | side-effects | dependencies`.
3. Invoke `/contract-inventory-builder` on all modules. Output: `contracts/io-contracts.json`. For each module boundary: input types, output types, side effects (network, disk, process, env), external calls.

If no TS/TSX source is present, skip `/ts-react-rust-analyzer` and run manual subsystem classification in its place: group files by runtime surface (CLI, server, data, UI, util, test) and assign each group a risk score (low/medium/high) based on async complexity, external IO, framework coupling, and test coverage.

Produce `code/subsystem-map.md` and `migration/keep-adapt-rewrite-defer.md`. Each subsystem must have a `migration_decision` of `keep` | `adapt` | `rewrite` | `defer` with rationale for every non-trivial decision.

**Exit criteria**: `code/pseudocode-ledger.md`, `contracts/io-contracts.json`, subsystem map, and KARD ledger exist with a decision for every identified subsystem.

---

## Phase 2.5 — Diagram Selection

**Entry criteria**: Phase 2 complete.

1. Invoke `/diagram-decision-matrix` on the analysis outputs. Pass: subsystem map, module graph, runtime target, language profile.
2. Consume its output to determine which diagram types to generate in Phase 3. The decision matrix selects from:
   - C4 context and container (always)
   - C4 component diagrams (per container with meaningful internals)
   - Runtime sequence diagrams (per significant interaction)
   - State machine diagrams (per stateful lifecycle or async state machine)
   - ERD (if persistence present)
   - DFD (if data-movement is the primary concern)
   - Screen flow (if an operator-facing UI surface exists)
3. Do not generate any diagram type that the decision matrix excludes for this system.

**Exit criteria**: `/diagram-decision-matrix` output consumed. Diagram type set determined for Phase 3.

---

## Phase 3 — Diagram Synthesis

**Entry criteria**: Phase 2.5 complete.

Invoke the following based on the diagram-decision-matrix output:

1. Invoke `/c4-synthesizer` to produce:
   - `architecture/c4-context.mmd` — external actors, external systems, system boundary
   - `architecture/c4-container.mmd` — deployable units, data stores, primary technology choices
   - `architecture/c4-component-<name>.mmd` for any container with meaningful internal parts (if selected)
2. Invoke `/runtime-sequence-synthesizer` for each significant runtime interaction where selected. Output: `behavior/sequence/<name>.mmd`.
3. Invoke `/state-machine-synthesizer` for any stateful lifecycle or async state machine where selected. Output: `behavior/state/<name>.mmd`.
4. Produce remaining selected diagrams (`code/erd.mmd`, `code/dfd.mmd`, `behavior/screen-flow.mmd`) as applicable.

Every Mermaid file must be valid Mermaid syntax. Do not produce partial or placeholder diagrams — omit a diagram type entirely rather than emit invalid syntax.

**Exit criteria**: `architecture/c4-context.mmd` and `architecture/c4-container.mmd` exist and are valid. All decision-matrix-selected additional diagrams are present.

---

## Phase 4 — Artifact Production

**Entry criteria**: Phase 3 complete.

1. **Artifact manifest**: produce `artifact-manifest.json`. List every artifact file, its type, its source phase, and its status (`complete` | `partial` | `missing`).
2. Validate the full packet against `diagram-driven-migration-foundry/references/artifact-contract.md`. Every required file must be present and `complete`. Resolve all `missing` entries before proceeding.

**Stop here** if the user requested analysis only and no migration. Deliver the packet and exit.

**Exit criteria**: all artifact-contract required files present and manifest status is `complete` for each. Validation passes.

---

## Phase 5 — Migration Planning

**Condition**: proceed only if migration was requested.

**Entry criteria**: Phase 4 complete.

Run in this order:

1. Invoke `/dependency-gap-researcher` on `contracts/io-contracts.json` and `code/dependency-graph.json`. Output: `migration/gap-matrix.json`. For each source subsystem: list dependencies, classify each as `available-in-rust` | `partial` | `missing` | `not-applicable`. Record the Rust crate or alternative where applicable.
2. Invoke `/migration-map-builder` using gap-matrix.json and subsystem map. Output: `migration/target-map.json`. Map each source file (or subsystem) to its target Rust crate path, module path, and migration decision. Format: `{ "source": "src/foo.ts", "rust_target": "crates/foo/src/lib.rs", "decision": "adapt", "rationale": "..." }`.
3. In parallel: invoke `/target-profile-router` to produce `migration/target-profile.json` (runtime target, crate topology, async runtime selection, feature flags). Invoke `/parity-verifier-planner` to produce `verify/verification-plan.md` before any porting begins. The verification plan declares parity criteria, test strategy, and acceptable evidence per slice.

Apply `diagram-driven-migration-foundry/references/foundry-alignment.md` alignment rules: use `discover/define/visualize/architect` sequencing, keep continuity state machine-readable, require an analyzer gate before any porting begins.

Record migration risks explicitly. Distinguish fact from inference in all risk statements.

**Exit criteria**: `migration/gap-matrix.json`, `migration/target-map.json`, `migration/target-profile.json`, and `verify/verification-plan.md` exist and cover all in-scope subsystems.

---

## Phase 6 — Work Order Generation

**Entry criteria**: Phase 5 complete (or Phase 4 if analysis-only work orders are needed).

1. Invoke `/work-order-graph-builder`. Pass: `migration/target-map.json` and `migration/target-profile.json`. These inputs are required — do not invoke without them.
2. Each work order must declare:
   - `scope`: exact files or module boundary
   - `objective`: observable behavior to achieve or preserve
   - `dependencies`: prior work orders that must complete first
   - `acceptance_criteria`: testable conditions for done
   - `verifier`: which agent or tool validates (`/rust-migration-verifier` for porting slices)
3. Work order types: `research` | `plan` | `implement` | `verify`. Keep them distinct — do not combine planning and implementation in one work order.
4. Produce `execution/work-order-graph.md`. Include a Mermaid dependency graph showing execution order.
5. Work orders for porting slices must reference the source subsystem entry in `migration/target-map.json`.

**Exit criteria**: `execution/work-order-graph.md` exists. Every `implement` work order has a corresponding `verify` work order with `/rust-migration-verifier` as verifier.

---

## Phase 7 — TS→Rust Execution

**Condition**: proceed only when work orders exist AND user explicitly confirms execution should begin.

**Entry criteria**: Phase 6 complete. User confirmation received.

For each `implement` work order, in dependency order:

1. Invoke `/rust-porter` for the declared scope slice. Pass: source file(s), `io-contracts.json` entries for those files, migration decision from `target-map.json`.
2. `/rust-porter` must not begin without prior `/ts-react-rust-analyzer` output for the slice. If analysis is missing for a slice, run `/ts-react-rust-analyzer` on that slice before invoking `/rust-porter`.
3. After `/rust-porter` completes the slice: immediately invoke `/rust-migration-verifier`. Do not proceed to the next slice until verification passes or the failure is recorded with a blocking reason.
4. Track parity evidence for each slice in `verify/<slice-name>-evidence.md`. Record: test results, parity checks, cargo check output, any known gaps.
5. Update `artifact-manifest.json` after each slice to reflect new status.

**Guardrails during execution**:
- Never claim a slice is done without `/rust-migration-verifier` evidence.
- TUI/fullscreen Ink/React slices: escalate to `rust-tui-runtime-replacement`, do not route through `/rust-porter`.
- New Rust crates introduced require rationale recorded in `execution/work-order-graph.md` or an ADR.

**Exit criteria**: all `implement` work orders have status `verified` or `blocked` (with recorded blocker). No slice is left in `in-progress`.

---

## Phase 8 — Evidence Bundle

**Entry criteria**: Phase 7 complete (or Phase 4 for analysis-only engagements).

1. Invoke `/evidence-packer` on the output directory. It collects test result files, parity check outputs, `cargo check` logs, and artifact validation outputs into the `evidence/` directory.
2. Produce `release/handoff.md`. Sections: scope summary, artifact list with file paths, migration decisions and rationale, open blockers, next steps, verifier sign-off checklist.
3. Update `artifact-manifest.json` to final state. Every file listed must exist on disk.
4. Run `diagram-driven-migration-foundry/scripts/validate_packet.py` one final time. Packet is releasable only after this passes.

**Exit criteria**: `release/handoff.md` exists. `validate_packet.py` passes. `artifact-manifest.json` status is `complete` for all required files.

---

## Execution sequence

The canonical pipeline order is:

1. `/repository-cartographer` — maps the repo before any analysis
2. Parallel: `/pseudocode-ledger-writer`, `/contract-inventory-builder`, `/ts-react-rust-analyzer` (if TS/TSX present)
3. `/diagram-decision-matrix` → routes to `/c4-synthesizer`, `/runtime-sequence-synthesizer`, `/state-machine-synthesizer` based on output
4. `/dependency-gap-researcher` (parallel-safe once Phase 2 outputs exist)
5. `/migration-map-builder`
6. Parallel: `/target-profile-router`, `/parity-verifier-planner`
7. `/work-order-graph-builder`
8. Per slice in dependency order: `/rust-porter` → `/rust-migration-verifier`
9. `/evidence-packer`

---

## Packet structure

Standard output directory layout:

```text
<slug>/
  project-intake.md
  artifact-manifest.json
  architecture/
    c4-context.mmd
    c4-container.mmd
    c4-component-<name>.mmd       (if applicable)
  behavior/
    sequence/
      <name>.mmd                  (per significant runtime interaction)
    state/
      <name>.mmd                  (if stateful lifecycle present)
    screen-flow.mmd               (if UI surface present)
  code/
    module-graph.json
    dependency-graph.json
    subsystem-map.json
    subsystem-map.md
    pseudocode-ledger.md
    erd.mmd                       (if persistence present)
    dfd.mmd                       (if data-movement focus)
  contracts/
    io-contracts.json
  migration/
    keep-adapt-rewrite-defer.md
    gap-matrix.json               (migrations only)
    target-map.json               (migrations only)
    target-profile.json           (migrations only)
  execution/
    work-order-graph.md
  verify/
    verification-plan.md
    <slice-name>-evidence.md      (per ported slice)
  evidence/
    (test results, cargo logs, parity checks — packed by /evidence-packer)
  release/
    handoff.md
```

---

## Decision tree

1. **Existing codebase to understand?**
   - Run Phases 1–4
   - Stop after Phase 4 if analysis only was requested
   - Deliver packet

2. **Migration or conversion requested?**
   - Run Phases 1–6 (analysis + planning + work orders)
   - Confirm with user before beginning Phase 7
   - Run Phase 7 slice-by-slice with verification gates
   - Complete Phase 8

3. **Dashboard or operating model requested?**
   - Run Phases 1–4 for analysis artifacts
   - Add screen-flow and wireframe diagrams in Phase 3
   - Produce work orders in Phase 6 for dashboard implementation
   - Do not execute implementation without explicit confirmation

---

## References

- `diagram-driven-migration-foundry/references/diagram-catalog.md` — diagram types and selection rules
- `diagram-driven-migration-foundry/references/artifact-contract.md` — minimum packet shape and quality rules
- `diagram-driven-migration-foundry/references/agent-personas.md` — role and mindset guidance
- `diagram-driven-migration-foundry/references/knowledge-base-design.md` — what knowledge to retrieve and store
- `diagram-driven-migration-foundry/references/foundry-alignment.md` — alignment to Foundry-style SDLC, work orders, and team-launch artifacts
