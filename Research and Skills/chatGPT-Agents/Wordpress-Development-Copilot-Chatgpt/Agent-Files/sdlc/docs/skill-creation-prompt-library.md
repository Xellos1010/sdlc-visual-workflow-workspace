# Skill Creation Prompt Library

Use these prompts to create Cloud Agent skills. Each prompt is designed to be pasted into ChatGPT with the Skill Creator workflow.

## Master skill creation prompt template

```text
Create a ChatGPT skill named `<skill-name>`.

Purpose:
<one or two sentence purpose>

Use when:
<trigger conditions>

Expected inputs:
- repository or project context
- current continuity state
- user request or scheduled task payload
- relevant connector access, if available

Expected outputs:
- structured markdown summary
- machine-readable JSON/YAML where applicable
- updated state patch recommendations
- blockers, evidence, and next actions

Connector expectations:
- Use GitHub for repository, issue, PR, branch, and CI context when available.
- Use Google Drive or uploaded files for SDLC docs and source-of-truth artifacts when available.
- Use MCP/local filesystem only when explicitly available.
- Never assume access that has not been provided.

Required behavior:
- Follow the Cloud Agent SDLC bible.
- Read continuity state before planning.
- Preserve one active PR per lane.
- Use file locks for parallel work.
- Record evidence before marking done.
- Escalate human decisions through a single issue with pasteable resume instructions.
- Do not merge, deploy, publish, or delete ambiguous branches without explicit approval.

Package the skill as `skill.zip` when complete.
```

## P0 skill creation prompts

### 1. cloud-agent-sdlc-orchestrator

```text
Create a ChatGPT skill named `cloud-agent-sdlc-orchestrator`.

Purpose: Route repository work through a strict SDLC lifecycle for Cloud Agents running on recurring schedules or operator prompts.

Use when the agent must decide which SDLC phase applies, which skills to invoke, what memory to read/write, what PR or branch lane to use, whether work is blocked, and what output contract applies.

Expected inputs: repository name, task payload, cadence, current-task.json, active PR/issue state, available skills, and connector availability.

Expected outputs: selected lifecycle stage, invoked skills, memory reads/writes, allowed actions, blocked actions, next work order, and operator summary.

Required behavior: enforce trunk-centered overlays, one active PR per lane, status patching, evidence before completion, human decision escalation, and default-off diagramming.
```

### 2. sdlc-phase-router

```text
Create a ChatGPT skill named `sdlc-phase-router`.

Purpose: Classify work into intake, discover, define, design, plan, implement, verify, integrate, release, or operate.

Use when a user request, issue, PR, scheduled job, repo event, or work order must be mapped to an SDLC stage.

Expected outputs: phase id, lifecycle stage, phase gate requirements, required skills, blocked prerequisites, and next allowed action.
```

### 3. scheduler-cadence-runner

```text
Create a ChatGPT skill named `scheduler-cadence-runner`.

Purpose: Convert every-1-hour, every-4-hours, daily, weekly, and local 24/7 schedules into safe lifecycle behavior.

Use when an agent is invoked by a recurring task and must decide whether to continue work, validate work, reconcile repository state, or pause due to locks or blockers.

Expected outputs: cadence classification, idempotency key, max runtime, allowed mutations, required state updates, and overlap handling.
```

### 4. memory-continuity-manager

```text
Create a ChatGPT skill named `memory-continuity-manager`.

Purpose: Manage durable working memory for cloud agents so any replacement agent can resume accurately.

Use when reading, updating, summarizing, reconciling, or repairing `.foundry/projects/<slug>/current-task.json`, work-order state, locks, agent runs, decision ledgers, evidence, or fix memories.

Expected outputs: memory read plan, memory patch, stale/missing state report, next agent handoff, and state consistency verdict.
```

### 5. continuity-writer

```text
Create a ChatGPT skill named `continuity-writer`.

Purpose: Patch project continuity files without overwriting current work state or losing artifacts.

Use when a run changes stage, status, active branch, active PR, blockers, work orders, evidence, locks, or next action.

Expected outputs: JSON patch-style summary, updated fields, preserved fields, conflict warnings, and validation checklist.
```

### 6. file-lock-coordinator

```text
Create a ChatGPT skill named `file-lock-coordinator`.

Purpose: Prevent parallel agent collisions by assigning, validating, expiring, and reconciling file and work-order locks.

Use before implementation, branch edits, worktree creation, or parallel work assignment.

Expected outputs: lock acquisition plan, blocked files, compatible parallel work, lock expiry, stale lock handling, and release instructions.
```

### 7. pr-integration-governor

```text
Create a ChatGPT skill named `pr-integration-governor`.

Purpose: Enforce one active integration PR per feature/client lane and consolidate work into that PR.

Use when checking open PRs, creating or updating an active PR, detecting duplicates, reconciling branch state, or preparing merge readiness.

Expected outputs: active PR verdict, duplicate PR handling, consolidation plan, merge-readiness blockers, and next PR action.
```

### 8. repository-intake-auditor

```text
Create a ChatGPT skill named `repository-intake-auditor`.

Purpose: Audit a repository at the start of a lifecycle to identify structure, systems, commands, docs, state files, risks, and roadmap opportunities.

Use when onboarding a new repository, refreshing a roadmap, diagnosing unknown codebases, or preparing a Cloud Agent for recurring work.

Expected outputs: repo map, docs map, build/test commands, architecture summary, risk list, candidate features, and missing inputs.
```

### 9. workspace-authority-resolver

```text
Create a ChatGPT skill named `workspace-authority-resolver`.

Purpose: Determine the source-of-truth hierarchy across code, schemas, ADRs, docs, runbooks, continuity files, issues, PRs, and external Drive artifacts.

Use when imported docs, repo state, and current task state disagree.

Expected outputs: authority stack, conflict report, canonical source, derived mirrors, and repair plan.
```

### 10. roadmap-feature-factory

```text
Create a ChatGPT skill named `roadmap-feature-factory`.

Purpose: Convert repo audits, human goals, issues, and validation gaps into a prioritized feature roadmap.

Use after discovery, daily reconciliation, or when a project has no remaining scoped feature work.

Expected outputs: roadmap items, priority, dependency graph, acceptance criteria, work-order candidates, and unscoped human decisions.
```

### 11. scope-chunker

```text
Create a ChatGPT skill named `scope-chunker`.

Purpose: Convert requirements and roadmap items into bounded, independently verifiable work orders with file scopes, commands, dependencies, and rollback notes.

Use before implementation and before parallel dispatch.

Expected outputs: work-order DAG, file scopes, model/persona assignment, acceptance criteria, validation plan, approval requirements, and lock plan.
```

### 12. risk-blast-radius-analyzer

```text
Create a ChatGPT skill named `risk-blast-radius-analyzer`.

Purpose: Analyze changed or proposed files for direct dependencies, sibling patterns, interface impact, shared contracts, and hidden breakage risk.

Use before implementation of shared files, after any diff, and before merge readiness.

Expected outputs: changed files, impacted modules, similar modules, risk score, required checks, blocked merge reasons, and visual graph request flag.
```

### 13. test-strategy-generator

```text
Create a ChatGPT skill named `test-strategy-generator`.

Purpose: Generate validation plans from requirements, architecture contracts, pseudocode, and changed files.

Use during planning, implementation, verification, and when a runtime blocker or failing CI is discovered.

Expected outputs: unit/integration/e2e/smoke test plan, commands, fixtures, pass criteria, gaps, and evidence requirements.
```

### 14. independent-verifier

```text
Create a ChatGPT skill named `independent-verifier`.

Purpose: Verify completed work without trusting the builder's claims.

Use before marking a work order, feature, PR, or release as done.

Expected outputs: claim list, evidence check, failed/missing claims, verification commands, risk verdict, and done/not-done status.
```

### 15. trace-evidence-collector

```text
Create a ChatGPT skill named `trace-evidence-collector`.

Purpose: Produce evidence bundles for agent runs, commands, diffs, tests, failures, decisions, and artifacts.

Use after every meaningful implementation, verification, reconciliation, or import/export run.

Expected outputs: evidence bundle path, command log, SHA, changed files, stdout/stderr summary, result, residual risk, and linked work order.
```

### 16. human-decision-escalator

```text
Create a ChatGPT skill named `human-decision-escalator`.

Purpose: Convert unresolved human decisions into a single actionable issue with pasteable resume instructions.

Use when the agent cannot safely decide due to business, design, compliance, production, external publication, or destructive-operation ambiguity.

Expected outputs: issue title/body, decision options, risks, recommendation, affected files, rollback path, and resume command text.
```

### 17. branch-bloat-reconciler

```text
Create a ChatGPT skill named `branch-bloat-reconciler`.

Purpose: Reconcile branches and remove safe-to-delete merged agent branches without losing work.

Use during daily or weekly reconciliation.

Expected outputs: branch inventory, open PR references, safe deletions, recommended deletions, protected branches, stale lock interactions, and operator summary.
```

### 18. cloud-agent-ops-sentinel

```text
Create a ChatGPT skill named `cloud-agent-ops-sentinel`.

Purpose: Monitor the health and safety of recurring Cloud Agent operations.

Use during every scheduled run and daily reconciliation to detect overlapping jobs, stale locks, cost drift, repeated failures, disabled connectors, and unsafe automation drift.

Expected outputs: ops health status, stop conditions, stale run report, concurrency risk, cost/rate risk, and recovery action.
```

## P1/P2/P3 skill creation prompt shorthand

Use the master prompt template and substitute the following purpose/trigger pairs.

| Skill | Purpose | Trigger |
|---|---|---|
| `connector-access-planner` | Plan safe use of GitHub, Drive, MCP, filesystem, browser, and local tools. | Any task requiring connected sources or tool access. |
| `context-curator` | Build minimal high-signal context packs for a work order. | Before planning, implementation, verification, or handoff. |
| `agent-handoff-manager` | Create/consume resumable handoffs between agents. | Agent switch, pause, blocked state, or long-running run. |
| `decision-ledger-writer` | Record decisions and overrides. | Any decision with options or risk. |
| `worktree-branch-manager` | Manage ephemeral worktrees/branches. | Before implementation or PR updates. |
| `issue-triage-and-blocker-router` | Classify issues into roadmap, blocker, defect, or decision. | Issue review or daily reconciliation. |
| `knowledge-ingestion-curator` | Index docs, runbooks, diagrams, and prior work. | Repo onboarding, daily/weekly KB refresh. |
| `codebase-cartographer` | Map apps, packages, modules, components, dependencies. | Discovery, blast-radius, onboarding. |
| `technical-debt-miner` | Identify maintainability and modernization opportunities. | Hourly improvement and daily roadmap refresh. |
| `client-lane-manager` | Manage client overlays and client-specific lanes. | Multi-client repos or client feature work. |
| `repo-event-to-draft-content` | Draft content from verified releases. | Post-merge release notes or blog outline. |
| `intent-capture-compiler` | Convert user intent into structured requirements. | New feature, project, migration, or integration. |
| `question-to-graph-compiler` | Convert Q&A into graph deltas. | Interactive intake or ambiguous requirements. |
| `requirements-contract-writer` | Create testable requirements. | After intent capture. |
| `acceptance-criteria-generator` | Create acceptance/smoke criteria. | Before planning or testing. |
| `adr-writer` | Write ADRs. | Architecture choices or conflict resolution. |
| `architecture-boundary-planner` | Define module/package/crate/API boundaries. | Design and migration planning. |
| `interface-contract-schema-enforcer` | Create and validate schemas/contracts. | API, event, adapter, or work-order schemas. |
| `pseudocode-contract-compiler` | Compile designs to pseudocode. | Before implementation or porting. |
| `c4-diagram-generator` | Create C4 diagrams. | Optional, default-off, system boundary questions. |
| `uml-component-modeler` | Create UML diagrams. | Optional, default-off, module/class ownership. |
| `sequence-flow-generator` | Create sequence diagrams. | Optional, default-off, interactions/protocols. |
| `state-machine-modeler` | Create state machines. | Optional, default-off, lifecycle/async states. |
| `dataflow-event-modeler` | Create data/event flow diagrams. | Optional, default-off, event-driven systems. |
| `work-order-dag-visualizer` | Visualize work-order dependency DAGs. | Optional, default-off, parallel planning. |
| `blast-radius-graph-visualizer` | Visualize impact graph. | Optional, default-off, high-risk shared changes. |
| `memory-state-diagrammer` | Visualize memory/lock/evidence state. | Optional, default-off, onboarding/diagnosis. |
| `parallel-work-planner` | Plan safe parallel execution. | Before fan-out to multiple agents. |
| `work-order-dag-resolver` | Resolve dependencies/statuses. | During planning and reconciliation. |
| `rollback-plan-writer` | Write rollback plans. | Any change with release or migration risk. |
| `feature-flag-planner` | Plan flags/staged rollout. | Risky or user-facing features. |
| `conservative-code-builder` | Implement bounded changes. | Default builder route. |
| `typescript-react-builder` | Implement TS/React work. | TS/React repos. |
| `rust-ownership-planner` | Plan Rust ownership/lifetimes. | Rust or TS->Rust work. |
| `typescript-to-rust-migration-coordinator` | Coordinate TS->Rust migration. | TS->Rust projects. |
| `rust-porter` | Port bounded slices to Rust. | After analysis/planning. |
| `adapter-integration-planner` | Plan external adapters. | APIs, webhooks, messaging. |
| `external-library-integration` | Integrate/upgrade libraries. | Dependency changes. |
| `database-migration-planner` | Plan database migrations. | DB schema/data changes. |
| `wordpress-gutenberg-migration` | Modernize WordPress/Gutenberg work. | WP/theme/plugin/client migrations. |
| `mcp-tool-surface-builder` | Build MCP tool/resource surfaces. | MCP integration. |
| `import-bridge-operator` | Import/export external pipeline artifacts. | ChatGPT workspace/Foundry artifact bridge. |
| `smoke-test-builder` | Build runtime smoke tests. | Runtime validation. |
| `nx-monorepo-verifier` | Verify Nx workspace. | Nx repos. |
| `ci-failure-diagnoser` | Diagnose CI failures. | Failed checks. |
| `security-reviewer` | Security review. | Auth, secrets, dependencies, writes. |
| `performance-observability-reviewer` | Performance and observability review. | Shared/runtime/performance work. |
| `accessibility-seo-quality-reviewer` | A11y/SEO review. | Web/client-facing work. |
| `eval-experiment-runner` | Run evals/experiments. | Agent or system behavior changes. |
| `release-readiness-governor` | Release gate review. | Pre-release. |
| `handoff-generator` | Handoff docs. | End of task, pause, blocked state. |
| `docs-release-agent` | Docs/release updates. | Release or docs state changes. |
| `fix-memory-curator` | Fix-memory records. | Bug fixes/failures. |
| `guardrail-promoter` | Promote lessons to guardrails. | Daily/weekly learning. |
| `skill-registry-maintainer` | Maintain skill registry. | Skill additions/updates. |
| `cost-usage-governor` | Track schedule/model cost. | Recurring agents. |
| `local-24x7-runner` | Local continuous runner. | Local daemon/always-on plans. |

## Granular pseudocode/codegen prompts

The granular prompts have been split into `docs/granular-skill-creation-prompts.md` to keep this library navigable. Use that file for skills that define request classification, blast radius, architecture insertion points, IO schemas, pseudocode, memory lifecycle, Big-O assessment, code generation, ADR writing, human engineer delta ingestion, and two-way parity synchronization.
