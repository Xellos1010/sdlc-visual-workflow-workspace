# Exhaustive v1 Skill Inventory for Cloud Agent SDLC Lifecycle Management

This is the proposed v1 skill set for the Cloud Agent SDLC lifecycle manager. Some skills already exist in Foundry form and should be promoted, normalized, or recreated as Cloud Agent skills. Others are new skills needed to complete the orchestration pipeline.

## Invocation modes

- `required`: always available to lifecycle agents.
- `default-on`: invoked automatically when trigger conditions match.
- `default-off`: optional route; agent must justify invocation.
- `human-approved`: only invoked after human approval.

## Priority classes

- `P0`: needed for safe recurring automation.
- `P1`: needed for high-quality delivery.
- `P2`: specialized or optional.
- `P3`: future extension.

## Core orchestration skills

| # | Skill name | Priority | Mode | Purpose |
|---|---|---:|---|---|
| 1 | `cloud-agent-sdlc-orchestrator` | P0 | required | Master lifecycle router for repo, project, stage, cadence, skills, blockers, and output contracts. |
| 2 | `sdlc-phase-router` | P0 | required | Classify tasks into intake, discover, define, design, plan, implement, verify, integrate, release, operate. |
| 3 | `scheduler-cadence-runner` | P0 | required | Interpret hourly, four-hour, daily, weekly, and local 24/7 cadences into safe job behavior. |
| 4 | `model-router` | P0 | required | Choose model tier by risk, cost, context, action type, and verification need. |
| 5 | `connector-access-planner` | P0 | required | Decide when to use GitHub, Drive, MCP, local filesystem, browser, or no connector. |
| 6 | `tool-approval-governor` | P0 | required | Enforce approval boundaries for writes, deploys, destructive operations, external publication, and secrets. |
| 7 | `context-curator` | P0 | required | Build minimal context packs from repo state, docs, code, current-task, roadmap, locks, and evidence. |
| 8 | `work-order-dispatcher` | P0 | required | Select, queue, dispatch, pause, resume, and close work orders. |
| 9 | `agent-handoff-manager` | P0 | default-on | Produce and consume resumable handoffs when another agent takes over. |

## Memory, continuity, and coordination skills

| # | Skill name | Priority | Mode | Purpose |
|---|---|---:|---|---|
| 10 | `memory-continuity-manager` | P0 | required | Read/write durable agent memory, continuity files, and current work state. |
| 11 | `continuity-writer` | P0 | required | Patch `.foundry/projects/<slug>/current-task.json` without losing existing state. |
| 12 | `decision-ledger-writer` | P0 | required | Record decisions, options, chosen route, override status, and affected artifacts. |
| 13 | `file-lock-coordinator` | P0 | required | Create, validate, expire, and reconcile file/work-order locks for parallel execution. |
| 14 | `worktree-branch-manager` | P0 | default-on | Create/reuse ephemeral worktrees and branches from main or the active integration lane. |
| 15 | `pr-integration-governor` | P0 | required | Enforce one active PR per lane, consolidate work, and prevent sibling PR sprawl. |
| 16 | `branch-bloat-reconciler` | P0 | default-on | Find stale branches and safely delete only merged eligible agent branches. |
| 17 | `human-decision-escalator` | P0 | default-on | Open/update one issue with pasteable resume instructions when human input is needed. |
| 18 | `issue-triage-and-blocker-router` | P1 | default-on | Convert issues into blockers, work orders, decisions, or roadmap items. |

## Repository discovery and roadmap skills

| # | Skill name | Priority | Mode | Purpose |
|---|---|---:|---|---|
| 19 | `repository-intake-auditor` | P0 | default-on | First-pass audit of repo structure, scripts, CI, docs, workspaces, and runtime constraints. |
| 20 | `workspace-authority-resolver` | P0 | required | Establish source-of-truth order across docs, ADRs, schemas, continuity, code, issues, and PRs. |
| 21 | `knowledge-ingestion-curator` | P0 | default-on | Index docs, runbooks, diagrams, decisions, and prior work into retrievable memory. |
| 22 | `codebase-cartographer` | P0 | default-on | Map apps, packages, modules, components, dependencies, owners, and entry points. |
| 23 | `roadmap-feature-factory` | P0 | default-on | Turn audit findings and human intent into a feature roadmap and backlog. |
| 24 | `technical-debt-miner` | P1 | default-on | Identify refactors, quality debt, dependency drift, and maintainability issues. |
| 25 | `client-lane-manager` | P1 | default-on | Manage client overlays and active client feature lanes across multiple repositories. |
| 26 | `repo-event-to-draft-content` | P3 | human-approved | Draft release notes and blog outlines only from merged and verified work. |

## Define, requirements, and architecture skills

| # | Skill name | Priority | Mode | Purpose |
|---|---|---:|---|---|
| 27 | `intent-capture-compiler` | P0 | default-on | Convert human request into structured intent, constraints, assumptions, and success criteria. |
| 28 | `question-to-graph-compiler` | P1 | default-on | Convert Q&A into graph deltas, requirement objects, and work-order-ready state. |
| 29 | `requirements-contract-writer` | P0 | default-on | Produce testable requirement contracts and definition-of-ready checks. |
| 30 | `acceptance-criteria-generator` | P0 | default-on | Generate acceptance criteria, test expectations, and smoke requirements. |
| 31 | `adr-writer` | P1 | default-on | Produce architecture decision records with context, options, decision, consequences, rollback. |
| 32 | `architecture-boundary-planner` | P0 | default-on | Define module, crate, package, API, ownership, and runtime boundaries. |
| 33 | `interface-contract-schema-enforcer` | P0 | default-on | Create/validate schemas for APIs, adapters, events, work orders, and evidence. |
| 34 | `pseudocode-contract-compiler` | P1 | default-on | Convert design into pseudocode contracts suitable for language-specific implementation. |

## Optional visual diagramming skills, default off

| # | Skill name | Priority | Mode | Purpose |
|---|---|---:|---|---|
| 35 | `c4-diagram-generator` | P1 | default-off | Generate C4 context/container/component diagrams when system boundaries matter. |
| 36 | `uml-component-modeler` | P1 | default-off | Generate UML class/component/module diagrams for complex object/module structures. |
| 37 | `sequence-flow-generator` | P1 | default-off | Generate sequence diagrams for cross-service or user-flow interactions. |
| 38 | `state-machine-modeler` | P2 | default-off | Model lifecycle, async, workflow, UI, or job states. |
| 39 | `dataflow-event-modeler` | P1 | default-off | Model event-driven, queue, webhook, adapter, message, and integration flows. |
| 40 | `work-order-dag-visualizer` | P2 | default-off | Visualize dependencies, blockers, fan-out/fan-in, locks, and parallel work. |
| 41 | `blast-radius-graph-visualizer` | P2 | default-off | Visualize impacted modules, sibling patterns, and high-risk changes. |
| 42 | `memory-state-diagrammer` | P2 | default-off | Visualize continuity, locks, agent runs, evidence, and decision ledgers. |

## Planning and work-order skills

| # | Skill name | Priority | Mode | Purpose |
|---|---|---:|---|---|
| 43 | `scope-chunker` | P0 | required | Split work into bounded, file-scoped, independently verifiable work orders. |
| 44 | `parallel-work-planner` | P0 | default-on | Decide what can run concurrently without file or semantic conflicts. |
| 45 | `work-order-dag-resolver` | P0 | default-on | Resolve dependencies, circular references, status transitions, and queued/blocked state. |
| 46 | `risk-blast-radius-analyzer` | P0 | default-on | Analyze changed files through dependency graph, AST, and sibling-pattern risk. |
| 47 | `rollback-plan-writer` | P1 | default-on | Define rollback for each work order, feature, integration, and release. |
| 48 | `feature-flag-planner` | P1 | default-on | Recommend feature flags, dark launches, compatibility shims, and staged rollout controls. |

## Implementation skills

| # | Skill name | Priority | Mode | Purpose |
|---|---|---:|---|---|
| 49 | `conservative-code-builder` | P0 | default-on | Implement bounded changes with minimal blast radius and high evidence quality. |
| 50 | `typescript-react-builder` | P1 | default-on when detected | Implement TypeScript, React, Vite, Node, and frontend slices. |
| 51 | `rust-ownership-planner` | P1 | default-on for Rust | Plan ownership, borrowing, async boundaries, channels, and crate/module layout. |
| 52 | `typescript-to-rust-migration-coordinator` | P1 | default-on for TS->Rust | Coordinate analysis, boundary planning, porting, and verification for TypeScript to Rust. |
| 53 | `rust-porter` | P1 | default-on for Rust port | Port a bounded TS/Node/React/CLI slice to idiomatic Rust. |
| 54 | `adapter-integration-planner` | P1 | default-on | Integrate external APIs, SDKs, event adapters, messaging systems, and connectors. |
| 55 | `external-library-integration` | P1 | default-on | Add or upgrade external libraries with compatibility, security, and bundle impact checks. |
| 56 | `database-migration-planner` | P2 | default-on when DB detected | Plan schemas, migrations, rollback, data safety, and ORM integration. |
| 57 | `wordpress-gutenberg-migration` | P1 | default-on for WordPress | Convert HTML/React pages into Gutenberg-native blocks, patterns, templates, and tokens. |
| 58 | `mcp-tool-surface-builder` | P1 | default-on for MCP | Design and implement MCP tool/resource surfaces, approvals, and contracts. |
| 59 | `import-bridge-operator` | P1 | default-on for ChatGPT/Foundry artifacts | Validate, dry-run, import/export, route, stage, and activate external pipeline artifacts. |

## Verification and quality skills

| # | Skill name | Priority | Mode | Purpose |
|---|---|---:|---|---|
| 60 | `test-strategy-generator` | P0 | default-on | Generate unit/integration/e2e/smoke tests from requirements and architecture. |
| 61 | `smoke-test-builder` | P0 | default-on | Build and execute runtime smoke tests with explicit PASS/FAIL evidence. |
| 62 | `nx-monorepo-verifier` | P0 | default-on when Nx detected | Run affected, graph, build, lint, test, and workspace verification. |
| 63 | `ci-failure-diagnoser` | P0 | default-on | Diagnose failed CI/build/test runs and generate corrective work orders. |
| 64 | `security-reviewer` | P0 | default-on | Review auth, secrets, injection, dependencies, permissions, and unsafe tool writes. |
| 65 | `performance-observability-reviewer` | P1 | default-on | Review performance, logs, metrics, traces, spans, and alertability. |
| 66 | `accessibility-seo-quality-reviewer` | P1 | default-on for web | Review accessibility, SEO, metadata, redirects, and content safety. |
| 67 | `eval-experiment-runner` | P1 | default-on for agent/system changes | Define evals, holdout tests, trace grading, and experiment evidence. |
| 68 | `independent-verifier` | P0 | required before done | Verify claims independent of builder and block unsupported completion. |
| 69 | `trace-evidence-collector` | P0 | required | Record commands, outputs, diffs, errors, timestamps, SHA, and artifacts. |

## Release, learning, and operations skills

| # | Skill name | Priority | Mode | Purpose |
|---|---|---:|---|---|
| 70 | `release-readiness-governor` | P0 | default-on | Enforce release gates, rollback, changelog, and operator sign-off. |
| 71 | `handoff-generator` | P0 | default-on | Produce operator/developer handoff with state, evidence, blockers, and next steps. |
| 72 | `docs-release-agent` | P1 | default-on | Update docs, runbooks, release notes, ADR references, and docs indexes. |
| 73 | `fix-memory-curator` | P0 | default-on | Convert failures and fixes into durable fix-memory records. |
| 74 | `guardrail-promoter` | P1 | default-on | Promote repeated lessons into guardrails, checklists, evals, and skill updates. |
| 75 | `skill-registry-maintainer` | P0 | default-on | Maintain skill metadata, versions, triggers, dependencies, and default modes. |
| 76 | `cost-usage-governor` | P2 | default-on for scheduled agents | Track run cost, token usage, schedule frequency, model tiers, and stop conditions. |
| 77 | `local-24x7-runner` | P2 | human-approved | Operate local always-on agents with queueing, locking, crash recovery, and rate limits. |
| 78 | `cloud-agent-ops-sentinel` | P0 | required | Monitor scheduler health, overlapping runs, stale locks, and unsafe automation drift. |

## Minimal P0 skill bundle

To safely start recurring Cloud Agents, implement these first:

1. `cloud-agent-sdlc-orchestrator`
2. `sdlc-phase-router`
3. `scheduler-cadence-runner`
4. `memory-continuity-manager`
5. `continuity-writer`
6. `file-lock-coordinator`
7. `pr-integration-governor`
8. `repository-intake-auditor`
9. `workspace-authority-resolver`
10. `roadmap-feature-factory`
11. `scope-chunker`
12. `risk-blast-radius-analyzer`
13. `test-strategy-generator`
14. `independent-verifier`
15. `trace-evidence-collector`
16. `human-decision-escalator`
17. `branch-bloat-reconciler`
18. `cloud-agent-ops-sentinel`

## Skills already indicated by current Foundry artifacts

The connected repository state already references existing personas and skills including ADR writer, C4 diagram generator, continuity writer, define intent, evidence collector, handoff generator, model router, Nx verification, scope chunker, and SDLC phase router. These should be normalized into Cloud Agent skills rather than reinvented.

## Granular request-to-pseudocode-to-codegen skill chain addendum

The v2 addendum expands the SDLC into explicit chainable skills for request definition, blast-radius discovery, architecture insertion, abstractions/interfaces, IO schemas, type safety, pseudocode, memory lifecycle, Big-O assessment, code generation, ADRs, human engineer delta ingestion, and two-way parity synchronization.

See:

- `docs/granular-codegen-skill-chain.md`
- `docs/granular-skill-creation-prompts.md`
- `skills/granular-codegen-skill-registry-v2.yml`

Minimum P0 codegen bundle:

- `request-intake-normalizer`
- `objective-classifier`
- `problem-type-router`
- `authority-and-constraint-extractor`
- `domain-context-locator`
- `impacted-system-cartographer`
- `blast-radius-preflight-analyzer`
- `architecture-snapshot-reader`
- `insertion-point-locator`
- `abstraction-opportunity-finder`
- `contract-first-io-schema-writer`
- `data-model-type-system-designer`
- `pseudocode-spec-writer`
- `algorithm-decomposition-planner`
- `memory-lifecycle-analyzer`
- `complexity-notation-assessor`
- `pseudocode-review-verifier`
- `test-from-pseudocode-generator`
- `pseudocode-to-language-plan-compiler`
- `codegen-contract-builder`
- `code-from-pseudocode-generator`
- `type-safety-implementation-enforcer`
- `implementation-insertion-verifier`
- `generated-code-reviewer`
- `test-execution-verifier`
- `adr-draft-writer`
- `decision-tradeoff-ledger`
- `parity-sync-manager`
- `memory-continuity-manager`
