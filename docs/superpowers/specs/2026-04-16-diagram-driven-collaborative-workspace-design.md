# Diagram-Driven Collaborative AI Workspace — Design Spec

**Date:** 2026-04-16
**Status:** Approved — proceeding to implementation plan

---

## 1. Vision

A skill-first, cloud-synced collaborative workspace where teams define processes, execute them via AI agent pipelines, manage human approval gates, and let the system grow more autonomous as confidence accumulates from real decisions. Works inside Claude Code and Codex as a skill layer with a companion web app for team collaboration. Artifacts are the source of truth — everything the system does produces a versioned, traceable artifact.

Core loop: **idea → spec → diagrams → code → tests → approve → ship → learn → repeat — faster each cycle.**

---

## 2. Architecture

### Approach
Nx monorepo. Skills prove the loop first. Web app and Rust services added in the same workspace as capabilities, not separate projects.

### Build phases
| Phase | Deliverable |
|---|---|
| 1 — Prove | Skills + visual companion. Hello world loop fires end to end locally. |
| 2 — Connect | PAL + AWS infra. Event-driven sync. Auth + workspaces. |
| 3 — Accelerate | Rust agent runner, confidence engine, IR pipeline replace TS hot paths. |
| 4 — Scale | Web app, marketplace, ML training loop on decision corpus. |

### Container map

```
NX MONOREPO (apps/ libs/ crates/ skills/)
├── apps/skills/         TypeScript — Claude Code / Codex skill surface
├── apps/web/            Next.js 14 + React — collaborative web app
├── apps/api-gateway/    Next.js API routes — thin auth + routing layer
├── crates/
│   ├── agent-runner         Tokio — work order scheduling + coordination
│   ├── confidence-engine    Rust — score computation + threshold logic
│   ├── ir-pipeline          Rayon + Tokio — repo ingestion + symbol graph
│   ├── generation-engine    Rust — target-framework code generation
│   ├── test-runner          Rust — TDD loop + dependency-sorted failure tree
│   └── event-processor      Rust — consume EventBridge, route to subscribers
├── libs/
│   ├── pal/             Platform Abstraction Layer (TS interface + AWS/Supabase impls)
│   ├── schemas/         Shared TypeScript + Rust schema definitions
│   └── sdk/             Skill SDK — context detection, visual companion, PAL client
└── skills/              Claude Code skill definitions (SKILL.md files)
```

### Communication
- **Skills → Rust services**: gRPC (low-latency, binary)
- **Web app → Rust services**: HTTP/JSON via API gateway
- **Rust → DB**: `sqlx` async, Aurora PostgreSQL Serverless v2
- **Realtime**: AWS API Gateway WebSockets broadcast to all workspace subscribers
- **Events**: AWS EventBridge + SQS consumed by `event-processor`

---

## 3. Platform Abstraction Layer (PAL)

All application code (skills, web app, Rust services) calls one interface. Platform resolves from `PLATFORM` env var at startup.

### Five capabilities
| Capability | Methods |
|---|---|
| `auth` | `getUser()`, `createSession()`, `refreshToken()` |
| `database` | `query()`, `insert()`, `transaction()` |
| `realtime` | `subscribe()`, `emit()`, `broadcast()` |
| `storage` | `upload()`, `download()`, `getSignedUrl()` |
| `events` | `emitEvent()`, `consumeStream()`, `replay()` |

### Implementations shipped from day one
- **AWS adapter** (active — credits): Cognito, Aurora PG Serverless v2, API Gateway WebSockets, S3 + CloudFront, EventBridge + SQS
- **Supabase adapter** (available): Supabase Auth, Postgres, Realtime channels, Storage

### Rust trait
```rust
trait PlatformAdapter: Send + Sync {
    async fn query(&self, sql: &str, params: &[Value]) -> Result<Vec<Row>>;
    async fn emit_event(&self, channel: &str, event: &Event) -> Result<()>;
    async fn upload(&self, path: &str, data: Bytes) -> Result<String>;
}
```

Switching platforms = `PLATFORM=supabase` in env. No code change.

---

## 4. Data Model

### Entities by layer

**Identity**: `User`, `Workspace`, `WorkspaceMember`, `Project`

**Artifacts**: `Artifact` (types: spec / diagram / schema / runbook / code / evidence / template), `ArtifactVersion`, `Task`, `Comment`

**Execution**: `Runbook`, `RunbookRun`, `WorkOrder`, `TestRun`

**Intelligence**: `ApprovalGate`, `ApprovalDecision`, `ConfidenceScore`, `Template`

### Design rules
- Every DB write emits a corresponding event — no silent mutations
- Events are append-only — never deleted, full audit trail always present
- All entities scoped to `workspace_id` — row-level security enforces isolation
- `content_url` on Artifact points to S3 — DB holds metadata only
- `dep_tree` on TestRun is a JSONB DAG — root-cause failures computed by Rust `test-runner`

### Universal event schema
```json
{
  "id": "uuid",
  "workspace_id": "uuid",
  "project_id": "uuid | null",
  "type": "EventType",
  "actor_id": "uuid",
  "actor_type": "user | agent",
  "payload": "JSONB",
  "timestamp": "timestamptz",
  "conf_delta": "float | null"
}
```

### Event taxonomy
- **Workspace**: `workspace.created`, `member.invited`, `project.created`
- **Artifacts**: `spec.drafted`, `spec.published`, `diagram.generated`, `schema.defined`, `artifact.commented`
- **Execution**: `run.started`, `step.completed`, `agent.spawned`, `agent.completed`, `run.failed`
- **Generation**: `code.generated`, `code.compiled`, `test.passed`, `test.failed`, `test.root_cause`
- **Intelligence**: `gate.opened`, `approval.decided`, `approval.auto`, `confidence.updated`, `threshold.crossed`, `template.published`

---

## 5. Confidence & Approval Pipeline

### Model
- `ConfidenceScore` per `(workspace_id, gate_type)` pair
- Score = weighted rolling average of `ApprovalDecision` outcomes for that gate type
- `conf_delta` on each event = marginal score shift
- Default threshold: `0.85` — configurable per gate
- When `score ≥ threshold` → `approval.auto` event fires — human review skipped
- Human override of auto-approval feeds back as negative `conf_delta`

### Pipeline flow
```
RunbookRun reaches approval step
  → ApprovalGate created (gate.opened event)
  → confidence-engine checks score for gate_type
  → score < threshold: notify assignees, await decision
  → score ≥ threshold: approval.auto fires, run continues
  → Human decides: ApprovalDecision written → conf_delta computed → score updated
  → threshold.crossed event if score crosses boundary in either direction
```

---

## 6. Skill Layer

### Skills (Claude Code / Codex)

| Skill | Purpose |
|---|---|
| `/workspace` | Create project, invite members, view team feed, manage tasks |
| `/define` | Idea → spec → diagrams → pseudocode → contracts conversationally |
| `/run` | Launch runbook/agent team, monitor live, intervene |
| `/approve` | View approval queue, decide with context, set thresholds |
| `/generate` | Code gen from spec, compile check, view diff, accept/reject |
| `/test` | Run TDD loop, view dependency-sorted failure tree, auto-fix |
| `/confidence` | View scores per gate type, set thresholds, view trend |
| `/sync` | Push/pull artifacts between local and cloud workspace |
| `/marketplace` | Browse, fork, publish templates and schemas |

### Context detection
Skills read `.workspace/config.json` from CWD on invocation. Config contains `workspace_id`, `project_id`, and `platform` (aws/supabase). No manual scoping — every call is automatically attributed to the right workspace and project.

### Visual companion
Skills use the superpowers visual companion pattern. Context-specific: `/define` shows diagrams as they generate, `/test` shows the failure dependency tree interactively, `/approve` shows the approval queue with confidence score prominently, `/confidence` shows trend charts.

---

## 7. Rust Services

### `agent-runner`
- Tokio async runtime, gRPC server (tonic)
- Accepts `WorkOrder` from skill layer, schedules execution
- Manages agent team coordination: fan-out, fan-in, dependency ordering
- Emits `agent.spawned`, `agent.completed`, `run.failed` events
- State persisted in Aurora via PAL — resumable after crash

### `confidence-engine`
- Consumes `approval.decided` and `approval.auto` events
- Computes Bayesian-updated rolling score per `(workspace_id, gate_type)`
- Evaluates threshold crossings, emits `confidence.updated` and `threshold.crossed`
- Hot path — all reads/writes via `sqlx` connection pool, no ORM overhead

### `ir-pipeline`
- Rayon parallel repo ingestion across all source files
- Produces: `module-graph.json`, `dependency-graph.json`, `subsystem-map.json`
- Feeds `generation-engine` and existing `ts-react-rust-analyzer` skill chain

### `generation-engine`
- Accepts spec + IR artifacts + target profile
- Generates target-framework code (Rust, TypeScript, Python, etc.)
- Returns generated files + compile result
- Target profiles: `terminal-tui`, `cli-binary`, `async-core`, `mcp-server`, `web-api`, `plugin-host`

### `test-runner`
- Executes generated test suite against generated code
- Builds dependency DAG of failing tests
- Identifies root-cause failures (top-level dependent that if fixed resolves sub-dependencies)
- Emits `test.root_cause` event with sorted failure tree
- Triggers auto-fix cycle in `generation-engine` on failure

### `event-processor`
- Consumes AWS EventBridge stream
- Routes events to correct workspace WebSocket channels via API Gateway
- Enforces workspace isolation — events never cross workspace boundaries

---

## 8. Web Application

### Views

| View | Content |
|---|---|
| **God View / Dashboard** | All projects, live agent status, approval queue count, confidence trend |
| **Project Workspace** | Artifacts list, task board, team feed, comments |
| **Artifact Inspector** | Versioned artifact viewer, diff, comment thread, linked tasks |
| **Runbook Builder** | Visual step editor, branch logic, gate configuration |
| **Approval Queue** | Pending gates with context, one-click approve/reject, confidence score |
| **Confidence Panel** | Score per gate type, trend over time, threshold controls, decision history |
| **Generate & Test** | Code gen output, compile status, interactive failure tree |
| **Marketplace** | Browse templates, preview schema, fork to workspace, publish |

### Realtime collaboration
- All views subscribe to workspace WebSocket channel on mount
- Artifact updates, approval decisions, agent status, comments — all live without refresh
- Presence indicators: who is viewing the same artifact
- Optimistic UI for comments and task updates

---

## 9. Hello World Proof Chain (MVP End-to-End)

The minimum viable loop that proves every layer works:

```
1. /define "hello world REST API"
   → spec drafted (spec.drafted event)
   → C4 context + container diagrams generated (diagram.generated events)
   → pseudocode ledger produced

2. /generate --target web-api
   → generation-engine produces Axum handler + Cargo.toml
   → cargo check runs → compile result returned
   → code.compiled event emitted

3. /test
   → test-runner generates test suite from spec
   → runs tests against generated code
   → dependency-sorted failure tree shown in visual companion
   → auto-fix cycle if failures exist

4. /approve (if runbook gate configured)
   → gate.opened event
   → confidence score checked
   → human decides or auto-approves

5. Artifact sync
   → all artifacts pushed to S3 via PAL
   → workspace team sees update in web app via WebSocket
```

---

## 10. Schema & Syntax Builder + Marketplace

- Visual schema builder in web app: add fields, types, constraints, relationships
- Schema stored as `Artifact` of type `template` with structured JSONB
- Schemas validated against `meta-schema` (schema of schemas)
- Published templates visible to community with download count, ratings, fork history
- Skill `/marketplace` enables browse + fork from terminal
- Community contributions feed global template corpus — improves suggestions for all workspaces

---

## 11. AWS Infrastructure (Phase 1 + 2)

| Service | Role |
|---|---|
| Aurora PostgreSQL Serverless v2 | Primary DB — scales to zero, 128TB ceiling |
| Amazon Cognito | Auth — GitHub OAuth + email, JWT tokens |
| S3 + CloudFront | Artifact file storage + CDN delivery |
| API Gateway WebSockets | Realtime collaboration channel |
| EventBridge + SQS | Event bus — decouples emitters from consumers |
| ECS Fargate | Rust service containers — auto-scaling |
| ECR | Container registry for Rust service images |
| Route 53 + ACM | DNS + TLS |

**Phase 3 additions**: Redshift (analytics corpus), OpenSearch (semantic artifact search), SageMaker (confidence model training).

---

## 12. Monorepo Structure

```
sdlc-visual-workflow/
├── apps/
│   ├── skills/          Claude Code skill surface (TypeScript)
│   ├── web/             Next.js 14 web application
│   └── api-gateway/     Thin Next.js API routes
├── crates/
│   ├── agent-runner/
│   ├── confidence-engine/
│   ├── ir-pipeline/
│   ├── generation-engine/
│   ├── test-runner/
│   └── event-processor/
├── libs/
│   ├── pal/             Platform Abstraction Layer
│   ├── schemas/         Shared entity + event schemas
│   └── sdk/             Skill SDK (context detection, visual companion, PAL client)
├── skills/              SKILL.md definitions
├── .foundry/            SDLC continuity state
└── tools/               scaffold scripts, sync-claude-folder.sh
```

---

## Acceptance Criteria

- [ ] Hello world loop fires end to end: `/define` → `/generate` → compile ✓ → `/test` → failure tree displayed
- [ ] Event emitted for every meaningful action, visible in web app within 500ms
- [ ] PAL swap (`PLATFORM=supabase`) requires zero code changes, only env var
- [ ] Confidence score updates after every `approval.decided` event
- [ ] Auto-approval fires correctly when score ≥ threshold
- [ ] Template published from skill shows in web marketplace
- [ ] All Rust services pass `cargo check`, `clippy`, and integration tests
- [ ] Nx affected pipeline runs only changed apps/crates on PR
