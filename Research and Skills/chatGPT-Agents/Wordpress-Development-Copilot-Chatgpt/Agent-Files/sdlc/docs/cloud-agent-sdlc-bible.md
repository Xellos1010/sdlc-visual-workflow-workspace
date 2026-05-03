# Cloud Agent SDLC Lifecycle Management Bible

## 0. Purpose

This document defines the operating system for Cloud Agents that manage software development across multiple repositories. It converts the SDLC into reusable skills, strict phase gates, working-memory contracts, work-order locks, Git/PR rules, and recurring scheduled tasks.

The objective is not to make one agent write code continuously. The objective is to build a typed, observable, resumable SDLC control plane where multiple agents can diagnose, design, implement, verify, reconcile, and learn without branch sprawl or invisible coupling.

## 1. North-star architecture

The SDLC control plane is a graph-driven system. Every repo, project, feature, component, work order, agent, skill, artifact, decision, lock, test, evidence bundle, issue, PR, and fix-memory is represented as state. Agents do not rely on private context alone; they read and write durable continuity files.

Core graph entities:

- `Repository`
- `Project`
- `ClientOverlay`
- `System`
- `Component`
- `Interface`
- `Adapter`
- `Feature`
- `RoadmapItem`
- `WorkOrder`
- `FileLock`
- `AgentRun`
- `AgentMemory`
- `DecisionLedgerEntry`
- `HumanDecisionIssue`
- `EvidenceBundle`
- `FixMemory`
- `ReleaseArtifact`
- `Skill`
- `Persona`
- `Guardrail`

## 2. Lifecycle stages

Every task must be routed to exactly one lifecycle stage.

| Stage | Purpose | Required outputs | Hard gate |
|---|---|---|---|
| 0. Intake | Capture repo, project, human intent, constraints, target environment | intent packet, source list, authority stack | no execution until scope exists |
| 1. Discover | Audit existing codebase, docs, branches, PRs, issues, CI, architecture | repo inventory, component map, risks | no planning from uninspected assumptions |
| 2. Define | Convert intent into requirements, unknowns, acceptance criteria | requirements contract, decision ledger | no design until unknowns are classified |
| 3. Design | Produce architecture, C4/UML/dataflow only if useful, contracts, schemas | ADRs, interface contracts, optional diagrams | diagrams must compile to contracts or work orders |
| 4. Plan | Chunk work into bounded work orders and locks | roadmap, work-order DAG, lock plan | no implementation until file scopes and tests exist |
| 5. Implement | Execute one bounded work order or one active PR improvement | code/docs changes, status patch | no sibling PR for same lane |
| 6. Verify | Run tests, static checks, smoke checks, blast-radius analysis | evidence bundle, test logs, risk report | no completion without evidence |
| 7. Integrate | Consolidate active work into one PR, resolve conflicts, update status | PR summary, merge readiness report | no merge without gates and approval |
| 8. Release | Produce release/handoff/rollback materials | release notes, handoff, rollback | no external publication from unmerged work |
| 9. Operate | Scheduled audits, branch cleanup, learning, roadmap refresh | daily summary, fix-memory, new roadmap items | destructive cleanup stays conservative |

## 3. Branch and PR doctrine

### 3.1 Branch identities

Product identity must not be modeled as a long-lived branch. Use directories, project overlays, configuration, manifests, and continuity files.

Recommended topology:

| Layer | Represents | Lifetime |
|---|---|---|
| `main` | canonical trunk and shared platform | permanent |
| `projects/<client>` / `.foundry/projects/<client>` | client/product overlay and state | permanent |
| `agent/<repo>/<feature>` or `wo/<project>/<slice>` | bounded work-order branch | ephemeral |
| `int/<project>` or one active PR branch | active integration lane | temporary |
| tags/releases | audited release boundary | permanent |

### 3.2 One active PR rule

For each repository + project/client + feature set:

- There may be zero or one active integration PR.
- If one exists, scheduled agents build on top of it.
- A second PR is allowed only when the old PR is merged/closed and the continuity file records a successor.
- Sibling planning PRs are forbidden unless the daily reconciliation task explicitly records an exception.

### 3.3 Branch cleanup rule

Automated deletion is allowed only for branches that are:

- merged;
- unprotected;
- not `main` or default branch;
- not referenced by an open PR;
- not marked `keep` in continuity state;
- owned by agent prefix such as `agent/`, `wo/`, `codex/`, `claude/`, `import/`.

All other cleanup becomes a recommendation, not an action.

## 4. Working memory and durable memory

Agents must not rely on chat context as the sole memory layer. Every run uses a memory stack.

| Memory layer | Scope | Storage | Owner | Update cadence |
|---|---|---|---|---|
| Prompt context | one invocation | model context | current agent | ephemeral |
| Run scratchpad | one run | run record | current agent | every run |
| Continuity state | project lane | `.foundry/projects/<slug>/current-task.json` | lifecycle manager | every meaningful run |
| Work-order registry | feature set | `.foundry/projects/<slug>/work-orders/*.json` | planner/orchestrator | planning and execution |
| File locks | parallel execution | `.foundry/projects/<slug>/locks/*.json` | lock coordinator | before/after work |
| Decision ledger | audit trail | `.foundry/projects/<slug>/decision-ledger.jsonl` | all agents | every decision |
| Evidence bundles | verification | `runs/evidence/` or project evidence dir | verifier | every verification |
| Fix memory | learning | `.foundry/memory/fix-memories/*.json` | learning curator | after bugs/failures |
| Knowledge base | retrieval | docs/RAG index/MCP resource | knowledge curator | daily/weekly |

## 5. Memory update protocol

Every scheduled run must execute this protocol:

1. Read repository manifest and current task state.
2. Read active PR, current branch, open issues, and lock files.
3. Create an `AgentRun` record with a unique idempotency key.
4. Acquire locks for intended file scopes.
5. Execute the smallest allowed task.
6. Run targeted validation.
7. Write evidence or a no-op rationale.
8. Patch continuity state.
9. Release locks or mark stale/blocked with owner and expiration.
10. Create/update human decision issue if blocked by human input.

Never overwrite a continuity file wholesale when a patch is sufficient.

## 6. Work-order lock model

Parallel work is allowed only when lock analysis says scopes are disjoint.

Lock fields:

- `lockId`
- `repo`
- `project`
- `featureSetId`
- `workOrderId`
- `agentRunId`
- `branch`
- `prNumber`
- `lockedFiles`
- `lockedGlobs`
- `readDependencies`
- `writeIntent`
- `expiresAt`
- `status`: `active | released | stale | blocked | superseded`

Lock rules:

- A write lock blocks other write locks on the same file/glob.
- A read dependency does not block unless the writer changes interface contracts.
- Stale locks are not removed automatically until daily reconciliation confirms no active run.
- A blocked work order keeps its locks only if unfinished edits exist; otherwise locks are released and the feature is marked blocked.

## 7. Roadmap and feature discovery

The repo-audit agent creates or refreshes a feature roadmap by inspecting:

- package/workspace structure;
- docs, Runbooks, ADRs, `.foundry`, `.claude`, `.codex`, `.cursor`, `.superpowers`;
- tests and CI configuration;
- open PRs and issues;
- stale branches;
- dependency graph;
- current build and validation failures;
- imported ChatGPT workspace artifacts;
- client overlays;
- security, performance, observability, architecture, documentation gaps.

Roadmap items must be classified:

- `bug_fix`
- `feature`
- `refactor`
- `migration`
- `integration`
- `observability`
- `security`
- `performance`
- `accessibility`
- `documentation`
- `release`
- `experiment`
- `cleanup`
- `technical_debt`

## 8. Human decision protocol

If a stage requires human input and the agent cannot safely reason through it:

1. Mark feature/work order `blocked_requires_human_decision`.
2. Open or update exactly one GitHub issue.
3. Include decision needed, options, risks, recommendation, affected files, rollback path, and pasteable resume instruction.
4. Release nonessential locks.
5. Pick the next unblocked feature if one exists.
6. If all work is blocked, produce a human decision digest.

## 9. Quality gates

Minimum gates for any code-producing run:

- File scope matched work-order contract.
- No untracked destructive changes.
- Tests or targeted validation ran, or an explicit runtime blocker was recorded.
- Blast-radius analysis ran for interface or shared-file changes.
- Evidence bundle recorded command, timestamp, SHA, stdout/stderr summary, and result.
- Continuity state patched.
- No second PR was created for an active lane.

## 10. Optional visual paths, default off

Visual diagramming is valuable for design, diagnosis, onboarding, and review, but it must not become diagram theater. Diagram skills are default off and invoked only when the stage needs them.

Enable optional diagrams when:

- onboarding a new repo or system;
- designing a new feature with cross-component impact;
- diagnosing hidden dependencies;
- planning parallel work boundaries;
- reviewing architecture drift;
- explaining handoff or release impact.

Disable visual diagrams when:

- the change is a small bug fix;
- a diagram would not produce contracts, tests, or work orders;
- the runtime truth can be captured more directly by code search/tests.

Accepted diagram types:

- C4 context/container/component diagrams;
- UML class/component diagrams;
- sequence diagrams;
- state machines;
- dataflow diagrams;
- event flow diagrams;
- work-order DAG diagrams;
- blast-radius dependency graphs;
- memory/lock flow diagrams.

## 11. Skill invocation pipeline

Default route:

```text
scheduler -> sdlc-phase-router -> memory-continuity-manager -> repo-auditor
          -> roadmap-feature-factory -> scope-chunker -> lock-coordinator
          -> context-curator -> implementation/review skill -> verifier
          -> evidence-collector -> continuity-writer -> integration-governor
```

Optional route branches:

```text
... -> c4-diagram-generator [off by default]
... -> uml-component-modeler [off by default]
... -> sequence-flow-generator [off by default]
... -> dataflow-event-modeler [off by default]
... -> ts-to-rust-migration-coordinator [only for TS->Rust work]
... -> wordpress-gutenberg-migration [only for WP/Gutenberg projects]
```

## 12. Scheduled operating loop

### Every hour: active work improvement

Goal: continue current work safely.

Behavior:

- inspect current work in progress;
- if active PR exists, build on it;
- optimize current feature set;
- update status and memory;
- open human-decision issue when blocked;
- move to next unblocked feature only when current feature is blocked or complete;
- never merge or delete branches.

### Every 4 hours: validation and integration check

Goal: keep work verifiable and convergent.

Behavior:

- run broader validation;
- confirm one active PR per lane;
- detect lock conflicts and stale branches;
- refresh evidence;
- run blast-radius checks;
- update roadmap and work-order DAG;
- create defect work order when validation fails.

### Every day: reconciliation and roadmap governance

Goal: keep repository state clean and strategic.

Behavior:

- reconcile branches, PRs, issues, locks, and continuity;
- safely delete merged agent branches;
- refresh roadmap;
- review fix-memory and guardrails;
- generate daily operator digest;
- prepare draft release notes/blog outlines only for merged and verified work.

## 13. Local 24/7 runner doctrine

For local always-on operation, do not run agents directly against a dirty repo. Use a scheduler with:

- idempotency keys;
- per-run worktrees;
- lock files;
- bounded max runtime;
- crash recovery;
- job queue visibility;
- hard concurrency limits;
- branch cleanup gates;
- human approval gates for merge/deploy/publish.

## 14. External publication policy

Repository events may produce draft content, but publication requires verified release state and human approval.

Safe triggers:

- merged PR;
- passing validation;
- release note bundle;
- approved publication policy.

Unsafe triggers:

- branch created;
- agent made a diff;
- PR opened but unverified;
- failed smoke test;
- human decision pending.

## 15. Done definition

A feature is done only when:

- requirements and acceptance criteria are satisfied;
- work orders are complete or intentionally superseded;
- file locks are released;
- tests and verification evidence exist;
- blast-radius findings are resolved or explicitly waived;
- continuity state reflects reality;
- PR is reviewable;
- release/handoff is created if needed;
- fix-memory is recorded for any defect found and resolved.
