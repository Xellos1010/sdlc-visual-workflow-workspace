# ADR-008: Define Runtime Adapter Isolation and Rollback Boundary

## Status
accepted

## Date
2026-03-23

## Context
`WO-FF-008` is the real-execution hardening work order in `M3`. It follows the security baseline in ADR-006 and depends on evidence discipline so real runs can be rolled back safely.

The repository already shows an execution direction:
- `flagship-foundry-work/packages/core/src/run-executor.mjs` creates per-run work directories under `state/run-workspaces/`
- `flagship-foundry-work/packages/core/src/runs.mjs` supports `start`, `pause`, `resume`, `stop`, `complete`, and `fail`
- `flagship-foundry-work/packages/runtime-adapters/src/registry.mjs` defines adapter identities
- `flagship-foundry-work/README.md` documents `adapter:local-shell` for execute mode and `GET /runs/:id/evidence-bundle`
- `flagship-foundry-work/configs/approval-policies/default.json` preserves manual approval by default

What is still missing is an explicit architectural rule for adapter isolation and rollback. Without it, a real adapter could bypass the intended safety boundary, mutate canonical assets directly, or leave the team without a clean rollback point when an execution fails.

## Options Considered

### Option A: Allow adapters to execute directly against the workspace root
**Description**: Let each adapter decide its own working directory and rollback behavior.  
**Pros**: Lowest friction for adapter authors.  
**Cons**: High blast radius, inconsistent rollback semantics, and weak auditability.

### Option B: Require full container or VM sandboxing for every adapter from day one
**Description**: Only allow execution in heavyweight isolated sandboxes.  
**Pros**: Strong isolation posture.  
**Cons**: High implementation cost, slow path to first production-safe adapter, and likely over-engineered for current maturity.

### Option C: Use a bounded adapter contract with per-run isolation and explicit rollback boundary
**Description**: Every execute-mode adapter runs inside a run-scoped boundary and must preserve state, evidence, and approvals needed for rollback.  
**Pros**: Strong enough for `M3`, consistent with current implementation direction, and practical for incremental adapter expansion.  
**Cons**: Requires clear policy enforcement and future adapter conformance work.

## Decision
Choose **Option C**.

Isolation policy:
- Execute-mode adapters must operate through a registered adapter identity and run contract.
- The default execution boundary is a run-scoped working directory such as `flagship-foundry-work/state/run-workspaces/<run-id>/`.
- Evidence output must be written to state artifacts, not hidden in transient process output only.
- Adapters must not treat canonical docs, schemas, or source trees as writable by default.

Rollback policy:
- The rollback boundary is the run instance, its task states, and its isolated workspace.
- `pause` and `stop` remain first-class rollback controls for halting execution without destroying evidence.
- Failed or stopped runs preserve approvals, task status, and evidence artifacts for diagnosis.
- Any adapter capability that writes outside the isolated run boundary requires explicit approval and separate policy treatment before promotion to default use.

Promotion policy:
- `adapter:dry-run` remains the default baseline for broad planning flows.
- `adapter:local-shell` is the first production-safe real adapter path only if it satisfies isolation, evidence, and rollback requirements.
- Future adapters may be added only if they honor the same contract and do not weaken the rollback boundary.

## Consequences

### Positive
- Gives `WO-FF-008` a concrete safety boundary that matches the repository’s current execution design.
- Preserves evidence for diagnosis instead of trading rollback for cleanup.
- Makes adapter behavior more consistent across local and future runtimes.

### Negative
- Adapter authors must implement to a stricter contract.
- Some useful direct-host capabilities will remain gated behind approval and policy work.

### Risks
- If the isolated working directory is treated as sufficient without stronger policy checks, adapters may still reach outside the boundary through spawned commands.
- Weak evidence capture could make stopped runs hard to diagnose even if isolation is correct.
- Future non-shell adapters may need additional isolation mechanisms beyond the current run-workspace model.

## DoD Indicators
- [x] Run records include run-scoped isolation contract and rollback boundary metadata.
- [x] Executor persists per-task evidence in run workspace and records verification artifacts.
- [x] `pause` and `stop` transitions preserve rollback timeline/evidence context.
- [x] Default policy and guardrails prohibit default writes outside run-scoped workspace.
- [x] Tests cover isolation metadata and rollback semantics.

## References
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/.cursor/plans/foundry-gap-analysis-intent_d20ed327.plan.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/README.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/packages/core/src/run-executor.mjs`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/packages/core/src/runs.mjs`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/packages/runtime-adapters/src/registry.mjs`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/schemas/run.schema.json`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/schemas/run-timeline.schema.json`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/configs/approval-policies/default.json`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/guardrails/terminal-agent-adapters.json`
