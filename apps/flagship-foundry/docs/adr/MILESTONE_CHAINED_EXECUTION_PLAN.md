# Milestone Chained Execution Plan (Flagship Foundry Gap Closure)

**Intent:** `.cursor/plans/foundry-gap-analysis-intent_d20ed327.plan.md`  
**Decision packet:** `flagship-foundry-work/docs/adr/ADR_DECISION_PACKET_PREBUILD.md`  
**Baseline verification:** `flagship-foundry-work/docs/adr/NEXT_AGENT_EXECUTION_STEPS.md`

## 1) M1 Scope Lock

| Item | Value |
| --- | --- |
| **Milestone** | M1 Foundation (Epic A ownership + Epic C continuity contracts) |
| **Work orders** | `WO-FF-001`, `WO-FF-002` |
| **ADR gates** | `WO-FF-001`: ADR-001, ADR-003; `WO-FF-002`: ADR-002 |
| **Out of scope for M1** | Drift automation, parity merge implementation, control-plane auth code, CI pipeline files, knowledge ingestion changes, destructive archive cleanup |

### WO-FF-001 — Source-of-truth matrix and policy links (ADR-001, ADR-003)

| Action | Path |
| --- | --- |
| **Create** | `flagship-foundry-work/docs/source-of-truth-matrix.md` |
| **Modify** | `flagship-foundry-work/docs/REPOSITORY_LAYOUT.md` |
| **Modify** | `flagship-foundry-work/README.md` |

Scope rule: no additional files unless verifier finds a broken internal link requiring a one-line fix in one of the listed files.

### WO-FF-002 — Continuity contract + bootstrap path (ADR-002)

| Action | Path |
| --- | --- |
| **Modify** | `flagship-foundry-work/schemas/continuity-state.schema.json` |
| **Modify** | `flagship-foundry-work/packages/core/src/continuity.mjs` |
| **Modify** | `flagship-foundry-work/tests/continuity.test.mjs` |
| **Create** | `.codex/projects/flagship-foundry/current-task.json` |
| **Create** | `.codex/projects/flagship-foundry/SDLC_CHARTER.md` |

Locked project id: `flagship-foundry`.

### M1 Closure Notes (Current Status)

- `WO-FF-001` is complete and verified.
  - ADR compliance: ADR-001 and ADR-003.
  - Verification evidence: `cd flagship-foundry-work && npm test` passed.
- `WO-FF-002` is complete and verified.
  - ADR compliance: ADR-002.
  - Verification evidence: verifier approved `WO-FF-002` with `cd flagship-foundry-work && npm test` passing.
- M1 is **fully closed** (`WO-FF-001` + `WO-FF-002` complete and independently verified).
- Next milestone entrypoint is M2 starting with `WO-FF-003`, followed by `WO-FF-004` and `WO-FF-005` per chained sequence.

### M2 Progress Notes (Current Status)

- `WO-FF-003` is complete and verified.
  - ADR compliance: ADR-001 and ADR-003.
  - Verification evidence: verifier approved `WO-FF-003` with `cd flagship-foundry-work && npm test` passing.
- `WO-FF-004` is complete and verified.
  - ADR compliance: ADR-004.
  - Verification evidence: verifier approved `WO-FF-004` with `cd flagship-foundry-work && npm test` passing under strict allowlist policy.
- `WO-FF-005` is complete and verified.
  - ADR compliance: ADR-001 + ADR-005 DoD indicators.
  - Verification evidence: verifier PASS for `WO-FF-005` with M2 DoD indicators green.
- M2 is **fully closed** (`WO-FF-003` + `WO-FF-004` + `WO-FF-005` complete and independently verified).
- Next milestone entrypoint is M3 starting with `WO-FF-006`, followed by `WO-FF-007` and `WO-FF-008` per chained sequence.

### M3 Progress Notes (Current Status)

- `WO-FF-006` is complete and verified.
  - ADR compliance: ADR-006.
  - Verification evidence: verifier PASS for `WO-FF-006` with `cd flagship-foundry-work && npm test` passing.
- `WO-FF-007` is complete and verified.
  - ADR compliance: ADR-006 + ADR-002 + ADR-007 DoD indicators.
  - Verification evidence: verifier PASS for `WO-FF-007` with `cd flagship-foundry-work && npm test` passing.
- `WO-FF-008` is complete and verified.
  - ADR compliance: ADR-006 + ADR-002 + ADR-008 DoD indicators.
  - Verification evidence: verifier PASS after strict containment remediation for external writes by spawned local-shell commands.
- M3 is **fully closed** (`WO-FF-006` + `WO-FF-007` + `WO-FF-008` complete and independently verified).
- Next milestone entrypoint is M4 starting with `WO-FF-009`, followed by `WO-FF-010` per chained sequence.

## 2) Command Set (Repo Reality)

Primary gate for all milestones:

```bash
cd flagship-foundry-work && npm test
```

Nx is conditional only (run only if `nx.json` exists at workspace root):

```bash
pnpm exec nx affected -t lint,test,build --parallel
```

## 3) Block / Hold Conditions

| Condition | Effect |
| --- | --- |
| Active WO blocker ADR is not accepted | Hold implementation until approval is recorded |
| `npm test` fails in `flagship-foundry-work` | Hold milestone closure; fix or rollback |
| Schema vs `.codex/.../current-task.json` mismatch without mapping | Hold WO-FF-002; do not start M2 |
| ADR-007 / 008 / 009 / 010 still proposed at corresponding milestones | Hold corresponding WO until accepted or waived |
| Destructive cleanup attempted before ADR-003 conditions | Block and trigger rollback checkpoint |

## 4) Rollback Checkpoints

| Checkpoint | Restore action |
| --- | --- |
| After WO-FF-001 | Revert docs-only commit set |
| After WO-FF-002 | Revert schema + continuity code + tests + `.codex/projects/flagship-foundry/*` together |
| Per milestone | Tag/branch at start; revert milestone merge if gate fails post-merge |
| Schema upgrade | Snapshot `current-task.json` before tightening schema; restore snapshot on rollback |

## 5) Chained End-to-End Sequence

Legend: Agent = primary owner; Gate = DoR/DoD/quality gate; Depends = hard prerequisites; Verifier = independent checkpoint.

### Phase 0 — Preflight

| Step | Agent | Gate | Depends | Verifier checkpoint |
| --- | --- | --- | --- | --- |
| P0.1 Decision packet validation | Orchestrator | Blocker ADRs accepted | Intent + ADR packet | Approval records complete |
| P0.2 M1 scope lock | Orchestrator | M1 scope frozen | P0.1 | File list matches WO-FF-001/002 only |
| P0.3 Branch safety setup | Orchestrator | Branch/tag strategy set | P0.2 | Branch recorded for traceability |

### Milestone 1 — Foundation (`WO-FF-001`, `WO-FF-002`)

| Step | Agent | Gate | Depends | Verifier checkpoint |
| --- | --- | --- | --- | --- |
| M1.1 Implement WO-FF-001 | Builder | ADR-001 + ADR-003 reflected | Preflight | Matrix includes classes + sync direction |
| M1.2 Implement WO-FF-002 | Builder | ADR-002 contract/instance split | M1.1 (or parallel if no file conflict) | Instance + schema alignment; tests green |
| M1.3 Verify M1 | Verifier | M1 DoD | M1.1-M1.2 | `cd flagship-foundry-work && npm test` |
| M1.4 Close M1 | Docs-release-agent | Handoff + continuity update | M1.3 | Next command set/done criteria prepared for M2 |

Rollup gate: `npm test` green and scope contained to locked M1 files.

### Milestone 2 — Convergence (`WO-FF-003`, `WO-FF-004`, `WO-FF-005`)

| Step | Agent | Gate | Depends | Verifier checkpoint |
| --- | --- | --- | --- | --- |
| M2.1 WO-FF-003 | Builder | ADR-001 + ADR-003 | M1 closure | No destructive cleanup; drift policy conforms |
| M2.2 WO-FF-004 | Builder | ADR-004 | M2.1 or parallel if disjoint files | Merge/diff policy enforced |
| M2.3 WO-FF-005 | Builder | ADR-001 + ADR-005 | M1 closure | Completeness/freshness evidence present |
| M2.4 Verify M2 | Verifier | M2 DoD | M2.1-M2.3 | `npm test` + WO-specific checks |
| M2.5 Close M2 | Docs-release-agent | Handoff + continuity update | M2.4 | M3 next commands prepared |

Current chain status: `M2.1 (WO-FF-003)` verified complete; `M2.2 (WO-FF-004)` verified complete; `M2.3 (WO-FF-005)` verified complete; `M3.1 (WO-FF-006)` verified complete; `M3.2 (WO-FF-007)` verified complete; `M3.3 (WO-FF-008)` verified complete; `M4.1 (WO-FF-009)` implementation landed (`.github/workflows/flagship-foundry-ci.yml`, `ci:targeted`, `docs/ci-release-gates.md`); **pending independent verifier PASS** before M4.2; active lane is `M4.1 (WO-FF-009)`.

### Milestone 3 — Production Core (`WO-FF-006`, `WO-FF-007`, `WO-FF-008`)

| Step | Agent | Gate | Depends | Verifier checkpoint |
| --- | --- | --- | --- | --- |
| M3.1 WO-FF-006 | Builder | ADR-006 | M2 closure | Trust boundary/auth behavior validated |
| M3.2 WO-FF-007 | Builder | ADR-006 + ADR-002 + ADR-007 | M3.1 | Evidence/telemetry correlation validated |
| M3.3 WO-FF-008 | Builder | ADR-006 + ADR-002 + ADR-008 | M3.2 verifier PASS | Adapter isolation + rollback boundary validated |
| M3.4 Verify M3 | Verifier | M3 DoD | M3.1-M3.3 | Independent evidence-backed pass/fail |
| M3.5 Close M3 | Docs-release-agent | Handoff + continuity update | M3.4 | M4 next commands prepared |

Hold rule: promote ADR-007 and ADR-008 to accepted (or explicit waiver) before M3 DoD completion.

### Milestone 4 — Industrialization (`WO-FF-009`, `WO-FF-010`)

| Step | Agent | Gate | Depends | Verifier checkpoint |
| --- | --- | --- | --- | --- |
| M4.1 WO-FF-009 | Builder | ADR-001 + ADR-004 + ADR-006 + ADR-009 | M3 closure | CI baseline and release-evidence thresholds validated |
| M4.2 WO-FF-010 | Docs-release-agent (primary) | ADR-001 + ADR-003 + ADR-006 + ADR-010 | M4.1 | Rollout/rollback/incident model linked to state/evidence |
| M4.3 Verify M4 | Verifier | Program DoD | M4.1-M4.2 | CI (if configured), `npm test`, final evidence |
| M4.4 Final closure | Orchestrator + Docs-release-agent | Epic J completion | M4.3 | Final sign-off + continuity completion |

Hold rule: ADR-009 and ADR-010 accepted (or explicit waiver) before final closure.

### M4 Progress Notes (Current Status)

- `WO-FF-009` is complete and verified (local gates).
  - ADR compliance: ADR-001 + ADR-004 + ADR-006 + ADR-009.
  - Deliverables: repo-root `.github/workflows/flagship-foundry-ci.yml` (`npm test` + `npm run ci:targeted` + evidence artifact), `package.json` `ci:targeted`, `docs/ci-release-gates.md`, matrix/README/REPOSITORY_LAYOUT updates, ADR-009 **accepted**.
  - Verification evidence: `cd flagship-foundry-work && npm test` passed (60 tests); `npm run ci:targeted` passed; workflow defines two gates + `actions/upload-artifact` for `ci-gate-evidence.txt`. **GitHub-hosted run** should be confirmed when the repo is connected to Actions.
- `WO-FF-010` is complete and verified (documentation + ADR acceptance).
  - ADR compliance: ADR-001 + ADR-003 + ADR-006 + ADR-010.
  - Deliverables: `docs/rollout-rollback-incident-model.md`, ADR-010 **accepted**, decision packet + README/REPOSITORY_LAYOUT/matrix pointers.
- **M4 is fully closed** (`WO-FF-009` + `WO-FF-010` complete). Program gap-closure gate chain is satisfied pending any final independent verifier sign-off on the evidence summary above.

## 6) Work-Order to ADR Map

| WO | ADRs | Milestone |
| --- | --- | --- |
| WO-FF-001 | 001, 003 | M1 |
| WO-FF-002 | 002 | M1 |
| WO-FF-003 | 001, 003 | M2 |
| WO-FF-004 | 004 | M2 |
| WO-FF-005 | 001 (+ 005 for DoD) | M2 |
| WO-FF-006 | 006 | M3 |
| WO-FF-007 | 006, 002 (+ 007 for DoD) | M3 |
| WO-FF-008 | 006, 002 (+ 008 for DoD) | M3 |
| WO-FF-009 | 001, 004, 006, 009 (+ 009 for DoD) | M4 |
| WO-FF-010 | 001, 003, 006, 010 (+ 010 for DoD) | M4 |

## 7) Agent Roles Summary

| Phase | Primary | Support |
| --- | --- | --- |
| Preflight and plan lock | Orchestrator | - |
| Implementation | Builder | - |
| Verification and evidence | Verifier | - |
| Milestone closure and handoff | Docs-release-agent | Verifier for operational completeness |
