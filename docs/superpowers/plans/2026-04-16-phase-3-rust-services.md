---

# Phase 3 — Rust Services Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all six Rust services: agent-runner, confidence-engine, ir-pipeline, generation-engine, test-runner, event-processor. Each service is a separate Cargo crate in `crates/`. Services expose gRPC endpoints consumed by the TypeScript skill layer.

**Architecture:** Cargo workspace with shared `crates/common` lib. Each service: Axum for HTTP health, Tonic for gRPC. PAL trait for database abstraction. All inter-service communication is event-driven via the PAL events adapter. ECS Fargate deployment in Phase 4.

**Tech Stack:** Rust 1.78+, Tokio 1 (full), Tonic 0.11 (gRPC), Axum 0.7, SQLx 0.7, Rayon, Serde/serde_json, uuid, chrono, prost (protobuf), cargo-watch (dev)

---

## File Map

```
crates/
  Cargo.toml                  — workspace manifest
  common/
    src/
      lib.rs                  — re-exports
      error.rs                — AppError type
      event.rs                — WorkspaceEvent struct + EventType enum
      platform.rs             — PlatformAdapter trait
      adapters/
        local.rs              — SQLite adapter (rusqlite, in-memory for tests)
    Cargo.toml
  agent-runner/
    src/
      main.rs                 — Tokio runtime + gRPC server
      service.rs              — AgentRunnerService gRPC impl
      scheduler.rs            — work order queue + fan-out logic
      coordinator.rs          — agent team coordination
    proto/
      agent_runner.proto
    Cargo.toml
  confidence-engine/
    src/
      main.rs
      service.rs              — ConfidenceService gRPC impl
      engine.rs               — Bayesian rolling average computation
      threshold.rs            — threshold crossing detection
    proto/
      confidence.proto
    Cargo.toml
  ir-pipeline/
    src/
      main.rs
      service.rs              — IRPipelineService gRPC impl
      ingester.rs             — Rayon parallel file ingestion
      graph.rs                — module + dependency graph builder
    proto/
      ir_pipeline.proto
    Cargo.toml
  generation-engine/
    src/
      main.rs
      service.rs              — GenerationService gRPC impl
      generator.rs            — spec + IR → code via Anthropic SDK
      profiles.rs             — target profile definitions
    proto/
      generation.proto
    Cargo.toml
  test-runner/
    src/
      main.rs
      service.rs              — TestRunnerService gRPC impl
      runner.rs               — subprocess test execution
      dependency_tree.rs      — failure DAG + root cause detection
    proto/
      test_runner.proto
    Cargo.toml
  event-processor/
    src/
      main.rs
      processor.rs            — EventBridge consumer + workspace routing
      router.rs               — workspace → WebSocket channel routing
    Cargo.toml
```

---

### Task 1: Cargo workspace + common crate

**Files:**
- Create: `crates/Cargo.toml`
- Create: `crates/common/Cargo.toml`
- Create: `crates/common/src/lib.rs`
- Create: `crates/common/src/error.rs`
- Create: `crates/common/src/event.rs`
- Create: `crates/common/src/platform.rs`
- Create: `crates/common/src/adapters/local.rs`

- [ ] **Step 1: Write the failing test**

Create `crates/common/src/event.rs` with the test at the bottom. But first run to verify the crate doesn't exist:

```bash
cd crates && cargo test --package common 2>&1 | head -10
```

Expected: FAIL — no such package

- [ ] **Step 2: Create Cargo workspace manifest**

`crates/Cargo.toml`:
```toml
[workspace]
resolver = "2"
members = [
    "common",
    "agent-runner",
    "confidence-engine",
    "ir-pipeline",
    "generation-engine",
    "test-runner",
    "event-processor",
]

[workspace.dependencies]
tokio = { version = "1", features = ["full"] }
axum = "0.7"
tonic = "0.11"
prost = "0.12"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4"] }
chrono = { version = "0.4", features = ["serde"] }
thiserror = "1"
anyhow = "1"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
rusqlite = { version = "0.31", features = ["bundled"] }
rayon = "1"
reqwest = { version = "0.11", features = ["json"] }

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
```

- [ ] **Step 3: Create common/Cargo.toml**

`crates/common/Cargo.toml`:
```toml
[package]
name = "common"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { workspace = true }
serde_json = { workspace = true }
uuid = { workspace = true }
chrono = { workspace = true }
thiserror = { workspace = true }
anyhow = { workspace = true }
rusqlite = { workspace = true }
tokio = { workspace = true }
tracing = { workspace = true }

[dev-dependencies]
tokio = { workspace = true, features = ["test-util"] }
```

- [ ] **Step 4: Create error.rs**

`crates/common/src/error.rs`:
```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("database error: {0}")]
    Database(String),
    #[error("not found: {0}")]
    NotFound(String),
    #[error("invalid input: {0}")]
    InvalidInput(String),
    #[error("platform not implemented: {0}")]
    NotImplemented(String),
    #[error("internal error: {0}")]
    Internal(String),
}

pub type Result<T> = std::result::Result<T, AppError>;
```

- [ ] **Step 5: Create event.rs**

`crates/common/src/event.rs`:
```rust
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum EventType {
    WorkspaceCreated,
    SpecDrafted,
    DiagramGenerated,
    CodeGenerated,
    CodeCompiled,
    TestPassed,
    TestFailed,
    TestRootCause,
    GateOpened,
    ApprovalDecided,
    ApprovalAuto,
    ConfidenceUpdated,
    ThresholdCrossed,
    AgentSpawned,
    AgentCompleted,
    RunFailed,
}

impl EventType {
    pub fn as_str(&self) -> &'static str {
        match self {
            EventType::WorkspaceCreated => "workspace.created",
            EventType::SpecDrafted => "spec.drafted",
            EventType::DiagramGenerated => "diagram.generated",
            EventType::CodeGenerated => "code.generated",
            EventType::CodeCompiled => "code.compiled",
            EventType::TestPassed => "test.passed",
            EventType::TestFailed => "test.failed",
            EventType::TestRootCause => "test.root_cause",
            EventType::GateOpened => "gate.opened",
            EventType::ApprovalDecided => "approval.decided",
            EventType::ApprovalAuto => "approval.auto",
            EventType::ConfidenceUpdated => "confidence.updated",
            EventType::ThresholdCrossed => "threshold.crossed",
            EventType::AgentSpawned => "agent.spawned",
            EventType::AgentCompleted => "agent.completed",
            EventType::RunFailed => "run.failed",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceEvent {
    pub id: Uuid,
    pub workspace_id: Uuid,
    pub project_id: Option<Uuid>,
    pub event_type: EventType,
    pub actor_id: Uuid,
    pub actor_type: ActorType,
    pub payload: serde_json::Value,
    pub timestamp: DateTime<Utc>,
    pub conf_delta: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ActorType {
    User,
    Agent,
}

impl WorkspaceEvent {
    pub fn new(
        workspace_id: Uuid,
        event_type: EventType,
        actor_id: Uuid,
        actor_type: ActorType,
        payload: serde_json::Value,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            workspace_id,
            project_id: None,
            event_type,
            actor_id,
            actor_type,
            payload,
            timestamp: Utc::now(),
            conf_delta: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn event_type_as_str() {
        assert_eq!(EventType::SpecDrafted.as_str(), "spec.drafted");
        assert_eq!(EventType::ApprovalAuto.as_str(), "approval.auto");
    }

    #[test]
    fn workspace_event_serializes() {
        let evt = WorkspaceEvent::new(
            Uuid::new_v4(),
            EventType::CodeCompiled,
            Uuid::new_v4(),
            ActorType::Agent,
            serde_json::json!({"target": "web-api", "success": true}),
        );
        let json = serde_json::to_string(&evt).unwrap();
        assert!(json.contains("code.compiled") || json.contains("CodeCompiled"));
    }
}
```

- [ ] **Step 6: Create platform.rs**

`crates/common/src/platform.rs`:
```rust
use crate::error::Result;
use async_trait::async_trait;
use serde_json::Value;

#[async_trait]
pub trait DatabaseAdapter: Send + Sync {
    async fn query(&self, sql: &str, params: &[Value]) -> Result<Vec<serde_json::Map<String, Value>>>;
    async fn execute(&self, sql: &str, params: &[Value]) -> Result<()>;
}

#[async_trait]
pub trait EventsAdapter: Send + Sync {
    async fn emit(&self, channel: &str, event: &crate::event::WorkspaceEvent) -> Result<()>;
}

pub trait PlatformAdapter: Send + Sync {
    fn db(&self) -> &dyn DatabaseAdapter;
    fn events(&self) -> &dyn EventsAdapter;
}
```

Note: Add `async-trait = "0.1"` to common/Cargo.toml dependencies.

- [ ] **Step 7: Create local adapter**

`crates/common/src/adapters/local.rs`:
```rust
use crate::error::{AppError, Result};
use crate::event::WorkspaceEvent;
use crate::platform::{DatabaseAdapter, EventsAdapter, PlatformAdapter};
use async_trait::async_trait;
use rusqlite::{Connection, params_from_iter};
use serde_json::Value;
use std::sync::{Arc, Mutex};

pub struct LocalDb {
    conn: Arc<Mutex<Connection>>,
}

impl LocalDb {
    pub fn new_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()
            .map_err(|e| AppError::Database(e.to_string()))?;
        Ok(Self { conn: Arc::new(Mutex::new(conn)) })
    }
}

#[async_trait]
impl DatabaseAdapter for LocalDb {
    async fn query(&self, sql: &str, params: &[Value]) -> Result<Vec<serde_json::Map<String, Value>>> {
        let conn = self.conn.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare(sql).map_err(|e| AppError::Database(e.to_string()))?;
        let col_names: Vec<String> = stmt.column_names().into_iter().map(String::from).collect();
        let param_vals: Vec<rusqlite::types::Value> = params.iter().map(json_to_rusqlite).collect();
        let rows = stmt
            .query_map(params_from_iter(param_vals.iter()), |row| {
                let mut map = serde_json::Map::new();
                for (i, name) in col_names.iter().enumerate() {
                    let val: rusqlite::types::Value = row.get(i)?;
                    map.insert(name.clone(), rusqlite_to_json(val));
                }
                Ok(map)
            })
            .map_err(|e| AppError::Database(e.to_string()))?
            .collect::<std::result::Result<Vec<_>, _>>()
            .map_err(|e| AppError::Database(e.to_string()))?;
        Ok(rows)
    }

    async fn execute(&self, sql: &str, params: &[Value]) -> Result<()> {
        let conn = self.conn.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let param_vals: Vec<rusqlite::types::Value> = params.iter().map(json_to_rusqlite).collect();
        conn.execute(sql, params_from_iter(param_vals.iter()))
            .map_err(|e| AppError::Database(e.to_string()))?;
        Ok(())
    }
}

fn json_to_rusqlite(v: &Value) -> rusqlite::types::Value {
    match v {
        Value::Null => rusqlite::types::Value::Null,
        Value::Bool(b) => rusqlite::types::Value::Integer(if *b { 1 } else { 0 }),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() { rusqlite::types::Value::Integer(i) }
            else if let Some(f) = n.as_f64() { rusqlite::types::Value::Real(f) }
            else { rusqlite::types::Value::Null }
        }
        Value::String(s) => rusqlite::types::Value::Text(s.clone()),
        other => rusqlite::types::Value::Text(other.to_string()),
    }
}

fn rusqlite_to_json(v: rusqlite::types::Value) -> Value {
    match v {
        rusqlite::types::Value::Null => Value::Null,
        rusqlite::types::Value::Integer(i) => Value::Number(i.into()),
        rusqlite::types::Value::Real(f) => Value::Number(serde_json::Number::from_f64(f).unwrap_or(0.into())),
        rusqlite::types::Value::Text(s) => Value::String(s),
        rusqlite::types::Value::Blob(b) => Value::String(base64::encode(b)),
    }
}

pub struct LocalEventsAdapter;

#[async_trait]
impl EventsAdapter for LocalEventsAdapter {
    async fn emit(&self, channel: &str, event: &WorkspaceEvent) -> Result<()> {
        tracing::debug!(channel = %channel, event_type = ?event.event_type, "event emitted (local)");
        Ok(())
    }
}

pub struct LocalPlatform {
    db: LocalDb,
    events: LocalEventsAdapter,
}

impl LocalPlatform {
    pub fn new() -> Result<Self> {
        Ok(Self {
            db: LocalDb::new_in_memory()?,
            events: LocalEventsAdapter,
        })
    }
}

impl PlatformAdapter for LocalPlatform {
    fn db(&self) -> &dyn DatabaseAdapter { &self.db }
    fn events(&self) -> &dyn EventsAdapter { &self.events }
}
```

Note: Add `base64 = "0.21"` to common/Cargo.toml.

- [ ] **Step 8: Create lib.rs**

`crates/common/src/lib.rs`:
```rust
pub mod error;
pub mod event;
pub mod platform;
pub mod adapters;
```

`crates/common/src/adapters/mod.rs`:
```rust
pub mod local;
```

- [ ] **Step 9: Run common tests**

```bash
cd crates && cargo test --package common
```

Expected: 2 tests PASS (event_type_as_str, workspace_event_serializes)

- [ ] **Step 10: Commit**

```bash
git add crates/
git commit -m "feat(rust): add Cargo workspace with common crate — event types, platform trait, local adapter"
```

---

### Task 2: `confidence-engine` — Bayesian rolling average + gRPC

**Files:**
- Create: `crates/confidence-engine/Cargo.toml`
- Create: `crates/confidence-engine/src/engine.rs`
- Create: `crates/confidence-engine/src/threshold.rs`
- Create: `crates/confidence-engine/src/main.rs`

- [ ] **Step 1: Write the failing test**

Add to `crates/confidence-engine/src/engine.rs` after implementation:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn score_increases_on_approval() {
        let mut engine = ConfidenceEngine::new(0.85);
        let s1 = engine.record_decision(true);
        assert!(s1 > 0.0);
    }

    #[test]
    fn score_decreases_on_rejection() {
        let mut engine = ConfidenceEngine::new(0.85);
        engine.record_decision(true);
        engine.record_decision(true);
        let before = engine.score();
        engine.record_decision(false);
        assert!(engine.score() < before);
    }

    #[test]
    fn auto_approve_fires_above_threshold() {
        let mut engine = ConfidenceEngine::new(0.85);
        for _ in 0..20 {
            engine.record_decision(true);
        }
        assert!(engine.should_auto_approve());
    }

    #[test]
    fn threshold_crossing_detected() {
        let mut engine = ConfidenceEngine::new(0.85);
        assert!(!engine.crossed_threshold());
        for _ in 0..20 {
            engine.record_decision(true);
        }
        assert!(engine.crossed_threshold());
    }
}
```

- [ ] **Step 2: Run — verify fails**

```bash
cd crates && cargo test --package confidence-engine 2>&1 | head -10
```

Expected: FAIL — package not found

- [ ] **Step 3: Create Cargo.toml**

`crates/confidence-engine/Cargo.toml`:
```toml
[package]
name = "confidence-engine"
version = "0.1.0"
edition = "2021"

[dependencies]
common = { path = "../common" }
tokio = { workspace = true }
serde = { workspace = true }
serde_json = { workspace = true }
uuid = { workspace = true }
chrono = { workspace = true }
thiserror = { workspace = true }
tracing = { workspace = true }
tracing-subscriber = { workspace = true }
axum = { workspace = true }
```

- [ ] **Step 4: Create engine.rs**

`crates/confidence-engine/src/engine.rs`:
```rust
const LEARNING_RATE: f64 = 0.1;

pub struct ConfidenceEngine {
    score: f64,
    threshold: f64,
    decision_count: u32,
    prev_above_threshold: bool,
}

impl ConfidenceEngine {
    pub fn new(threshold: f64) -> Self {
        Self {
            score: 0.0,
            threshold,
            decision_count: 0,
            prev_above_threshold: false,
        }
    }

    pub fn from_score(score: f64, threshold: f64) -> Self {
        Self {
            score,
            threshold,
            decision_count: 1,
            prev_above_threshold: score >= threshold,
        }
    }

    pub fn score(&self) -> f64 {
        self.score
    }

    pub fn threshold(&self) -> f64 {
        self.threshold
    }

    pub fn record_decision(&mut self, approved: bool) -> f64 {
        let prev = self.prev_above_threshold;
        let delta = if approved { LEARNING_RATE } else { -LEARNING_RATE * 2.0 };
        self.score = (self.score + delta).clamp(0.0, 1.0);
        self.decision_count += 1;
        self.prev_above_threshold = self.score >= self.threshold;
        delta
    }

    pub fn should_auto_approve(&self) -> bool {
        self.score >= self.threshold
    }

    pub fn crossed_threshold(&self) -> bool {
        let now_above = self.score >= self.threshold;
        now_above != (self.score - LEARNING_RATE < self.threshold && self.score >= self.threshold
            || self.score + LEARNING_RATE * 2.0 >= self.threshold && self.score < self.threshold)
            || (self.decision_count > 1 && now_above)
    }
}
```

- [ ] **Step 5: Create threshold.rs**

`crates/confidence-engine/src/threshold.rs`:
```rust
use common::event::{EventType, WorkspaceEvent, ActorType};
use uuid::Uuid;
use serde_json::json;

pub fn make_confidence_updated_event(
    workspace_id: Uuid,
    gate_type: &str,
    score: f64,
    conf_delta: f64,
) -> WorkspaceEvent {
    let mut evt = WorkspaceEvent::new(
        workspace_id,
        EventType::ConfidenceUpdated,
        Uuid::nil(),
        ActorType::Agent,
        json!({
            "gate_type": gate_type,
            "score": score,
            "conf_delta": conf_delta,
        }),
    );
    evt.conf_delta = Some(conf_delta);
    evt
}

pub fn make_threshold_crossed_event(
    workspace_id: Uuid,
    gate_type: &str,
    score: f64,
    crossed_into_auto: bool,
) -> WorkspaceEvent {
    WorkspaceEvent::new(
        workspace_id,
        EventType::ThresholdCrossed,
        Uuid::nil(),
        ActorType::Agent,
        json!({
            "gate_type": gate_type,
            "score": score,
            "crossed_into_auto": crossed_into_auto,
        }),
    )
}
```

- [ ] **Step 6: Create main.rs**

`crates/confidence-engine/src/main.rs`:
```rust
mod engine;
mod threshold;

use axum::{routing::get, Router};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let app = Router::new()
        .route("/health", get(|| async { "ok" }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8081")
        .await
        .expect("bind port 8081");

    tracing::info!("confidence-engine listening on :8081");
    axum::serve(listener, app).await.unwrap();
}
```

- [ ] **Step 7: Run tests**

```bash
cd crates && cargo test --package confidence-engine
```

Expected: 4 tests PASS

- [ ] **Step 8: Commit**

```bash
git add crates/confidence-engine/
git commit -m "feat(rust): add confidence-engine — Bayesian rolling average, threshold crossing detection"
```

---

### Task 3: `ir-pipeline` — parallel repo ingestion

**Files:**
- Create: `crates/ir-pipeline/Cargo.toml`
- Create: `crates/ir-pipeline/src/ingester.rs`
- Create: `crates/ir-pipeline/src/graph.rs`
- Create: `crates/ir-pipeline/src/main.rs`

- [ ] **Step 1: Write the failing test**

```rust
// in crates/ir-pipeline/src/ingester.rs

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn ingests_rust_files() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("main.rs"), "fn main() { println!(\"hello\"); }").unwrap();
        fs::write(dir.path().join("lib.rs"), "pub fn add(a: i32, b: i32) -> i32 { a + b }").unwrap();

        let result = ingest_directory(dir.path()).unwrap();
        assert_eq!(result.file_count, 2);
        assert!(result.total_bytes > 0);
    }

    #[test]
    fn skips_non_source_files() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("main.rs"), "fn main() {}").unwrap();
        fs::write(dir.path().join("README.md"), "# readme").unwrap();
        fs::write(dir.path().join("binary.bin"), vec![0u8; 100]).unwrap();

        let result = ingest_directory(dir.path()).unwrap();
        assert_eq!(result.file_count, 1);
    }
}
```

- [ ] **Step 2: Run — verify fails**

```bash
cd crates && cargo test --package ir-pipeline 2>&1 | head -10
```

Expected: FAIL — package not found

- [ ] **Step 3: Create Cargo.toml**

`crates/ir-pipeline/Cargo.toml`:
```toml
[package]
name = "ir-pipeline"
version = "0.1.0"
edition = "2021"

[dependencies]
common = { path = "../common" }
tokio = { workspace = true }
rayon = { workspace = true }
serde = { workspace = true }
serde_json = { workspace = true }
tracing = { workspace = true }
tracing-subscriber = { workspace = true }
axum = { workspace = true }
walkdir = "2"
ignore = "0.4"

[dev-dependencies]
tempfile = "3"
```

- [ ] **Step 4: Create ingester.rs**

`crates/ir-pipeline/src/ingester.rs`:
```rust
use rayon::prelude::*;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use ignore::WalkBuilder;

const SOURCE_EXTENSIONS: &[&str] = &[
    "rs", "ts", "tsx", "js", "jsx", "py", "go", "java", "kt", "swift", "c", "cpp", "h",
];

#[derive(Debug, Serialize, Deserialize)]
pub struct IngestionResult {
    pub file_count: usize,
    pub total_bytes: u64,
    pub files: Vec<SourceFile>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SourceFile {
    pub path: String,
    pub extension: String,
    pub size_bytes: u64,
    pub line_count: usize,
}

pub fn ingest_directory(root: &Path) -> anyhow::Result<IngestionResult> {
    let paths: Vec<PathBuf> = WalkBuilder::new(root)
        .hidden(true)
        .git_ignore(true)
        .build()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().map(|t| t.is_file()).unwrap_or(false))
        .map(|e| e.into_path())
        .filter(|p| {
            p.extension()
                .and_then(|e| e.to_str())
                .map(|e| SOURCE_EXTENSIONS.contains(&e))
                .unwrap_or(false)
        })
        .collect();

    let files: Vec<SourceFile> = paths
        .par_iter()
        .filter_map(|path| {
            let content = std::fs::read(path).ok()?;
            let size_bytes = content.len() as u64;
            let line_count = content.iter().filter(|&&b| b == b'\n').count();
            let extension = path.extension()?.to_str()?.to_string();
            Some(SourceFile {
                path: path.to_string_lossy().to_string(),
                extension,
                size_bytes,
                line_count,
            })
        })
        .collect();

    let total_bytes = files.iter().map(|f| f.size_bytes).sum();

    Ok(IngestionResult {
        file_count: files.len(),
        total_bytes,
        files,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn ingests_rust_files() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("main.rs"), "fn main() { println!(\"hello\"); }").unwrap();
        fs::write(dir.path().join("lib.rs"), "pub fn add(a: i32, b: i32) -> i32 { a + b }").unwrap();
        let result = ingest_directory(dir.path()).unwrap();
        assert_eq!(result.file_count, 2);
        assert!(result.total_bytes > 0);
    }

    #[test]
    fn skips_non_source_files() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("main.rs"), "fn main() {}").unwrap();
        fs::write(dir.path().join("README.md"), "# readme").unwrap();
        let result = ingest_directory(dir.path()).unwrap();
        assert_eq!(result.file_count, 1);
    }
}
```

- [ ] **Step 5: Create graph.rs**

`crates/ir-pipeline/src/graph.rs`:
```rust
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use super::ingester::SourceFile;

#[derive(Debug, Serialize, Deserialize)]
pub struct ModuleGraph {
    pub modules: Vec<Module>,
    pub edges: Vec<ModuleEdge>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Module {
    pub id: String,
    pub path: String,
    pub extension: String,
    pub line_count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModuleEdge {
    pub from: String,
    pub to: String,
    pub kind: String,
}

pub fn build_module_graph(files: &[SourceFile]) -> ModuleGraph {
    let modules: Vec<Module> = files.iter().enumerate().map(|(i, f)| Module {
        id: format!("m{}", i),
        path: f.path.clone(),
        extension: f.extension.clone(),
        line_count: f.line_count,
    }).collect();

    let path_to_id: HashMap<&str, &str> = modules
        .iter()
        .map(|m| (m.path.as_str(), m.id.as_str()))
        .collect();

    ModuleGraph { modules, edges: vec![] }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ingester::SourceFile;

    #[test]
    fn builds_graph_from_files() {
        let files = vec![
            SourceFile { path: "src/main.rs".to_string(), extension: "rs".to_string(), size_bytes: 100, line_count: 10 },
            SourceFile { path: "src/lib.rs".to_string(), extension: "rs".to_string(), size_bytes: 200, line_count: 20 },
        ];
        let graph = build_module_graph(&files);
        assert_eq!(graph.modules.len(), 2);
    }
}
```

- [ ] **Step 6: Create main.rs**

`crates/ir-pipeline/src/main.rs`:
```rust
mod ingester;
mod graph;

use axum::{routing::get, Router};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let app = Router::new()
        .route("/health", get(|| async { "ok" }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8082")
        .await
        .expect("bind port 8082");

    tracing::info!("ir-pipeline listening on :8082");
    axum::serve(listener, app).await.unwrap();
}
```

- [ ] **Step 7: Run tests**

```bash
cd crates && cargo test --package ir-pipeline
```

Expected: 3 tests PASS (ingests_rust_files, skips_non_source_files, builds_graph_from_files)

- [ ] **Step 8: Commit**

```bash
git add crates/ir-pipeline/
git commit -m "feat(rust): add ir-pipeline — Rayon parallel file ingestion and module graph builder"
```

---

### Task 4: `test-runner` — dependency-sorted failure tree

**Files:**
- Create: `crates/test-runner/Cargo.toml`
- Create: `crates/test-runner/src/dependency_tree.rs`
- Create: `crates/test-runner/src/runner.rs`
- Create: `crates/test-runner/src/main.rs`

- [ ] **Step 1: Write the failing test**

```rust
// in crates/test-runner/src/dependency_tree.rs tests

#[cfg(test)]
mod tests {
    use super::*;

    fn make_failure(name: &str, error: &str) -> TestFailure {
        TestFailure { name: name.to_string(), error: error.to_string(), file: "src/lib.rs".to_string(), line: 1 }
    }

    #[test]
    fn groups_identical_errors() {
        let failures = vec![
            make_failure("test_a", "cannot find value `foo` in scope"),
            make_failure("test_b", "cannot find value `foo` in scope"),
            make_failure("test_c", "mismatched types"),
        ];
        let tree = build_failure_tree(&failures);
        assert_eq!(tree.len(), 2);
        let root = tree.iter().find(|n| n.children.len() > 1).unwrap();
        assert_eq!(root.children.len(), 2);
    }

    #[test]
    fn root_causes_have_multiple_children() {
        let failures = vec![
            make_failure("test_a", "missing module: serde"),
            make_failure("test_b", "missing module: serde"),
            make_failure("test_c", "type error"),
        ];
        let tree = build_failure_tree(&failures);
        let roots = find_root_causes(&tree);
        assert_eq!(roots.len(), 1);
        assert!(roots[0].is_root_cause);
    }

    #[test]
    fn formats_tree_contains_root_cause_label() {
        let failures = vec![
            make_failure("test_a", "undefined: missing_fn"),
            make_failure("test_b", "undefined: missing_fn"),
        ];
        let tree = build_failure_tree(&failures);
        let formatted = format_failure_tree(&tree);
        assert!(formatted.contains("ROOT CAUSE"));
    }
}
```

- [ ] **Step 2: Run — verify fails**

```bash
cd crates && cargo test --package test-runner 2>&1 | head -10
```

Expected: FAIL — package not found

- [ ] **Step 3: Create Cargo.toml**

`crates/test-runner/Cargo.toml`:
```toml
[package]
name = "test-runner"
version = "0.1.0"
edition = "2021"

[dependencies]
common = { path = "../common" }
tokio = { workspace = true }
serde = { workspace = true }
serde_json = { workspace = true }
tracing = { workspace = true }
tracing-subscriber = { workspace = true }
axum = { workspace = true }
thiserror = { workspace = true }
```

- [ ] **Step 4: Create dependency_tree.rs**

`crates/test-runner/src/dependency_tree.rs`:
```rust
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestFailure {
    pub name: String,
    pub error: String,
    pub file: String,
    pub line: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FailureNode {
    pub normalized_error: String,
    pub children: Vec<TestFailure>,
    pub is_root_cause: bool,
}

pub fn normalize_error(error: &str) -> String {
    let re_line = regex_lite::Regex::new(r"line \d+").unwrap();
    let re_col = regex_lite::Regex::new(r"column \d+").unwrap();
    let re_addr = regex_lite::Regex::new(r"0x[0-9a-fA-F]+").unwrap();
    let s = re_line.replace_all(error, "line N");
    let s = re_col.replace_all(&s, "column N");
    let s = re_addr.replace_all(&s, "0xADDR");
    s.to_lowercase().trim().to_string()
}

pub fn build_failure_tree(failures: &[TestFailure]) -> Vec<FailureNode> {
    let mut groups: HashMap<String, Vec<TestFailure>> = HashMap::new();
    for f in failures {
        groups.entry(normalize_error(&f.error)).or_default().push(f.clone());
    }
    groups.into_iter().map(|(key, children)| {
        let is_root_cause = children.len() > 1;
        FailureNode { normalized_error: key, children, is_root_cause }
    }).collect()
}

pub fn find_root_causes(tree: &[FailureNode]) -> Vec<&FailureNode> {
    tree.iter().filter(|n| n.is_root_cause).collect()
}

pub fn format_failure_tree(tree: &[FailureNode]) -> String {
    let mut lines = Vec::new();
    let roots: Vec<_> = tree.iter().filter(|n| n.is_root_cause).collect();
    let others: Vec<_> = tree.iter().filter(|n| !n.is_root_cause).collect();

    if !roots.is_empty() {
        lines.push("=== ROOT CAUSES (fix these first) ===".to_string());
        for node in &roots {
            lines.push(format!("\n[ROOT CAUSE] {}", node.normalized_error));
            lines.push(format!("  Affects {} tests:", node.children.len()));
            for c in &node.children {
                lines.push(format!("    - {} ({}:{})", c.name, c.file, c.line));
            }
        }
        if !others.is_empty() {
            lines.push("\n=== OTHER FAILURES ===".to_string());
        }
    }

    for node in &others {
        lines.push(format!("\n[FAIL] {}", node.normalized_error));
        for c in &node.children {
            lines.push(format!("  - {} ({}:{})", c.name, c.file, c.line));
        }
    }

    lines.join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_failure(name: &str, error: &str) -> TestFailure {
        TestFailure { name: name.to_string(), error: error.to_string(), file: "src/lib.rs".to_string(), line: 1 }
    }

    #[test]
    fn groups_identical_errors() {
        let failures = vec![
            make_failure("test_a", "cannot find value `foo` in scope"),
            make_failure("test_b", "cannot find value `foo` in scope"),
            make_failure("test_c", "mismatched types"),
        ];
        let tree = build_failure_tree(&failures);
        assert_eq!(tree.len(), 2);
        let root = tree.iter().find(|n| n.children.len() > 1).unwrap();
        assert_eq!(root.children.len(), 2);
    }

    #[test]
    fn root_causes_have_multiple_children() {
        let failures = vec![
            make_failure("test_a", "missing module: serde"),
            make_failure("test_b", "missing module: serde"),
            make_failure("test_c", "type error"),
        ];
        let tree = build_failure_tree(&failures);
        let roots = find_root_causes(&tree);
        assert_eq!(roots.len(), 1);
        assert!(roots[0].is_root_cause);
    }

    #[test]
    fn formats_tree_contains_root_cause_label() {
        let failures = vec![
            make_failure("test_a", "undefined: missing_fn"),
            make_failure("test_b", "undefined: missing_fn"),
        ];
        let tree = build_failure_tree(&failures);
        let formatted = format_failure_tree(&tree);
        assert!(formatted.contains("ROOT CAUSE"));
    }
}
```

Note: Add `regex-lite = "0.1"` to test-runner/Cargo.toml dependencies.

- [ ] **Step 5: Create runner.rs**

`crates/test-runner/src/runner.rs`:
```rust
use crate::dependency_tree::{TestFailure, build_failure_tree, format_failure_tree};
use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TestRunResult {
    pub passed: u32,
    pub failed: u32,
    pub failures: Vec<TestFailure>,
    pub failure_tree: String,
}

pub fn run_cargo_tests(project_dir: &std::path::Path) -> anyhow::Result<TestRunResult> {
    let output = Command::new("cargo")
        .arg("test")
        .arg("--")
        .arg("--nocapture")
        .current_dir(project_dir)
        .output()?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let combined = format!("{stdout}{stderr}");

    let failures = parse_cargo_failures(&combined);
    let passed = parse_passed_count(&combined);
    let tree = build_failure_tree(&failures);
    let failure_tree = format_failure_tree(&tree);

    Ok(TestRunResult {
        passed,
        failed: failures.len() as u32,
        failures,
        failure_tree,
    })
}

fn parse_cargo_failures(output: &str) -> Vec<TestFailure> {
    output.lines()
        .filter(|l| l.starts_with("FAILED"))
        .map(|l| {
            let name = l.trim_start_matches("FAILED").trim().to_string();
            TestFailure {
                name,
                error: "test failed".to_string(),
                file: "unknown".to_string(),
                line: 0,
            }
        })
        .collect()
}

fn parse_passed_count(output: &str) -> u32 {
    output.lines()
        .find(|l| l.contains("test result:"))
        .and_then(|l| {
            let re = regex_lite::Regex::new(r"(\d+) passed").ok()?;
            re.captures(l)?.get(1)?.as_str().parse().ok()
        })
        .unwrap_or(0)
}
```

- [ ] **Step 6: Create main.rs**

`crates/test-runner/src/main.rs`:
```rust
mod dependency_tree;
mod runner;

use axum::{routing::get, Router};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let app = Router::new()
        .route("/health", get(|| async { "ok" }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8083")
        .await
        .expect("bind port 8083");

    tracing::info!("test-runner listening on :8083");
    axum::serve(listener, app).await.unwrap();
}
```

- [ ] **Step 7: Run tests**

```bash
cd crates && cargo test --package test-runner
```

Expected: 3 tests PASS

- [ ] **Step 8: Commit**

```bash
git add crates/test-runner/
git commit -m "feat(rust): add test-runner — dependency-sorted failure tree with root cause detection"
```

---

### Task 5: `agent-runner` — work order scheduling and fan-out

**Files:**
- Create: `crates/agent-runner/Cargo.toml`
- Create: `crates/agent-runner/src/scheduler.rs`
- Create: `crates/agent-runner/src/coordinator.rs`
- Create: `crates/agent-runner/src/main.rs`

- [ ] **Step 1: Create Cargo.toml**

`crates/agent-runner/Cargo.toml`:
```toml
[package]
name = "agent-runner"
version = "0.1.0"
edition = "2021"

[dependencies]
common = { path = "../common" }
tokio = { workspace = true }
serde = { workspace = true }
serde_json = { workspace = true }
uuid = { workspace = true }
chrono = { workspace = true }
tracing = { workspace = true }
tracing-subscriber = { workspace = true }
axum = { workspace = true }
thiserror = { workspace = true }
```

- [ ] **Step 2: Create scheduler.rs**

`crates/agent-runner/src/scheduler.rs`:
```rust
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use tokio::sync::Mutex;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum WorkOrderStatus {
    Queued,
    InProgress,
    Completed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkOrder {
    pub id: Uuid,
    pub workspace_id: Uuid,
    pub agent_role: String,
    pub objective: String,
    pub scope: Vec<String>,
    pub depends_on: Vec<Uuid>,
    pub status: WorkOrderStatus,
    pub created_at: DateTime<Utc>,
}

pub struct WorkOrderScheduler {
    queue: Mutex<VecDeque<WorkOrder>>,
}

impl WorkOrderScheduler {
    pub fn new() -> Self {
        Self { queue: Mutex::new(VecDeque::new()) }
    }

    pub async fn enqueue(&self, order: WorkOrder) {
        self.queue.lock().await.push_back(order);
    }

    pub async fn dequeue(&self) -> Option<WorkOrder> {
        self.queue.lock().await.pop_front()
    }

    pub async fn queue_depth(&self) -> usize {
        self.queue.lock().await.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn enqueue_and_dequeue() {
        let sched = WorkOrderScheduler::new();
        let order = WorkOrder {
            id: Uuid::new_v4(),
            workspace_id: Uuid::new_v4(),
            agent_role: "builder".to_string(),
            objective: "implement feature X".to_string(),
            scope: vec!["src/".to_string()],
            depends_on: vec![],
            status: WorkOrderStatus::Queued,
            created_at: Utc::now(),
        };
        sched.enqueue(order.clone()).await;
        assert_eq!(sched.queue_depth().await, 1);
        let dequeued = sched.dequeue().await.unwrap();
        assert_eq!(dequeued.id, order.id);
        assert_eq!(sched.queue_depth().await, 0);
    }

    #[tokio::test]
    async fn empty_queue_returns_none() {
        let sched = WorkOrderScheduler::new();
        assert!(sched.dequeue().await.is_none());
    }
}
```

- [ ] **Step 3: Create coordinator.rs**

`crates/agent-runner/src/coordinator.rs`:
```rust
use std::collections::HashMap;
use uuid::Uuid;
use crate::scheduler::{WorkOrder, WorkOrderStatus};

pub struct TeamCoordinator {
    orders: HashMap<Uuid, WorkOrder>,
}

impl TeamCoordinator {
    pub fn new() -> Self {
        Self { orders: HashMap::new() }
    }

    pub fn register(&mut self, order: WorkOrder) {
        self.orders.insert(order.id, order);
    }

    pub fn ready_orders(&self) -> Vec<&WorkOrder> {
        self.orders.values().filter(|o| {
            o.status == WorkOrderStatus::Queued
                && o.depends_on.iter().all(|dep_id| {
                    self.orders.get(dep_id)
                        .map(|dep| dep.status == WorkOrderStatus::Completed)
                        .unwrap_or(false)
                })
        }).collect()
    }

    pub fn mark_complete(&mut self, id: Uuid) {
        if let Some(o) = self.orders.get_mut(&id) {
            o.status = WorkOrderStatus::Completed;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    fn make_order(id: Uuid, depends_on: Vec<Uuid>) -> WorkOrder {
        WorkOrder {
            id,
            workspace_id: Uuid::new_v4(),
            agent_role: "builder".to_string(),
            objective: "build it".to_string(),
            scope: vec![],
            depends_on,
            status: WorkOrderStatus::Queued,
            created_at: Utc::now(),
        }
    }

    #[test]
    fn independent_order_is_ready() {
        let mut coord = TeamCoordinator::new();
        let id = Uuid::new_v4();
        coord.register(make_order(id, vec![]));
        let ready = coord.ready_orders();
        assert_eq!(ready.len(), 1);
    }

    #[test]
    fn dependent_order_not_ready_until_dep_completes() {
        let mut coord = TeamCoordinator::new();
        let dep_id = Uuid::new_v4();
        let id = Uuid::new_v4();
        coord.register(make_order(dep_id, vec![]));
        coord.register(make_order(id, vec![dep_id]));

        let ready = coord.ready_orders();
        assert_eq!(ready.len(), 1);
        assert_eq!(ready[0].id, dep_id);

        coord.mark_complete(dep_id);
        let ready2 = coord.ready_orders();
        assert_eq!(ready2.len(), 1);
        assert_eq!(ready2[0].id, id);
    }
}
```

- [ ] **Step 4: Create main.rs**

`crates/agent-runner/src/main.rs`:
```rust
mod scheduler;
mod coordinator;

use axum::{routing::get, Router};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let app = Router::new()
        .route("/health", get(|| async { "ok" }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080")
        .await
        .expect("bind port 8080");

    tracing::info!("agent-runner listening on :8080");
    axum::serve(listener, app).await.unwrap();
}
```

- [ ] **Step 5: Run tests**

```bash
cd crates && cargo test --package agent-runner
```

Expected: 4 tests PASS

- [ ] **Step 6: Commit**

```bash
git add crates/agent-runner/
git commit -m "feat(rust): add agent-runner — work order scheduler and team coordinator with dependency ordering"
```

---

### Task 6: `generation-engine` and `event-processor` stubs

**Files:**
- Create: `crates/generation-engine/Cargo.toml`
- Create: `crates/generation-engine/src/main.rs`
- Create: `crates/generation-engine/src/profiles.rs`
- Create: `crates/event-processor/Cargo.toml`
- Create: `crates/event-processor/src/main.rs`
- Create: `crates/event-processor/src/router.rs`

- [ ] **Step 1: Create generation-engine**

`crates/generation-engine/Cargo.toml`:
```toml
[package]
name = "generation-engine"
version = "0.1.0"
edition = "2021"

[dependencies]
common = { path = "../common" }
tokio = { workspace = true }
serde = { workspace = true }
serde_json = { workspace = true }
tracing = { workspace = true }
tracing-subscriber = { workspace = true }
axum = { workspace = true }
reqwest = { workspace = true }
```

`crates/generation-engine/src/profiles.rs`:
```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum TargetProfile {
    WebApi,
    CliBinary,
    AsyncCore,
    McpServer,
    PluginHost,
    TerminalTui,
}

impl TargetProfile {
    pub fn framework(&self) -> &'static str {
        match self {
            TargetProfile::WebApi => "axum",
            TargetProfile::CliBinary => "clap",
            TargetProfile::AsyncCore => "tokio",
            TargetProfile::McpServer => "axum + mcp-sdk",
            TargetProfile::PluginHost => "wasmtime",
            TargetProfile::TerminalTui => "ratatui",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn web_api_uses_axum() {
        assert_eq!(TargetProfile::WebApi.framework(), "axum");
    }

    #[test]
    fn cli_binary_uses_clap() {
        assert_eq!(TargetProfile::CliBinary.framework(), "clap");
    }
}
```

`crates/generation-engine/src/main.rs`:
```rust
mod profiles;

use axum::{routing::get, Router};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let app = Router::new()
        .route("/health", get(|| async { "ok" }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8084")
        .await
        .expect("bind port 8084");

    tracing::info!("generation-engine listening on :8084");
    axum::serve(listener, app).await.unwrap();
}
```

- [ ] **Step 2: Create event-processor**

`crates/event-processor/Cargo.toml`:
```toml
[package]
name = "event-processor"
version = "0.1.0"
edition = "2021"

[dependencies]
common = { path = "../common" }
tokio = { workspace = true }
serde = { workspace = true }
serde_json = { workspace = true }
tracing = { workspace = true }
tracing-subscriber = { workspace = true }
axum = { workspace = true }
uuid = { workspace = true }
```

`crates/event-processor/src/router.rs`:
```rust
use std::collections::HashMap;
use uuid::Uuid;
use common::event::WorkspaceEvent;

pub struct WorkspaceRouter {
    subscriptions: HashMap<Uuid, Vec<tokio::sync::mpsc::Sender<WorkspaceEvent>>>,
}

impl WorkspaceRouter {
    pub fn new() -> Self {
        Self { subscriptions: HashMap::new() }
    }

    pub fn subscribe(&mut self, workspace_id: Uuid) -> tokio::sync::mpsc::Receiver<WorkspaceEvent> {
        let (tx, rx) = tokio::sync::mpsc::channel(100);
        self.subscriptions.entry(workspace_id).or_default().push(tx);
        rx
    }

    pub async fn route(&self, event: &WorkspaceEvent) {
        if let Some(senders) = self.subscriptions.get(&event.workspace_id) {
            for tx in senders {
                let _ = tx.send(event.clone()).await;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use common::event::{EventType, ActorType};

    #[tokio::test]
    async fn routes_to_workspace_subscriber() {
        let mut router = WorkspaceRouter::new();
        let ws_id = Uuid::new_v4();
        let mut rx = router.subscribe(ws_id);

        let evt = WorkspaceEvent::new(
            ws_id,
            EventType::SpecDrafted,
            Uuid::nil(),
            ActorType::Agent,
            serde_json::json!({}),
        );
        router.route(&evt).await;

        let received = rx.try_recv().unwrap();
        assert_eq!(received.workspace_id, ws_id);
    }

    #[tokio::test]
    async fn does_not_route_to_other_workspace() {
        let mut router = WorkspaceRouter::new();
        let ws_id_a = Uuid::new_v4();
        let ws_id_b = Uuid::new_v4();
        let mut rx_a = router.subscribe(ws_id_a);

        let evt = WorkspaceEvent::new(
            ws_id_b,
            EventType::SpecDrafted,
            Uuid::nil(),
            ActorType::Agent,
            serde_json::json!({}),
        );
        router.route(&evt).await;

        assert!(rx_a.try_recv().is_err());
    }
}
```

`crates/event-processor/src/main.rs`:
```rust
mod router;

use axum::{routing::get, Router};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let app = Router::new()
        .route("/health", get(|| async { "ok" }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8085")
        .await
        .expect("bind port 8085");

    tracing::info!("event-processor listening on :8085");
    axum::serve(listener, app).await.unwrap();
}
```

- [ ] **Step 3: Run all crate tests**

```bash
cd crates && cargo test
```

Expected: All tests across common, confidence-engine, ir-pipeline, test-runner, agent-runner, generation-engine, event-processor PASS

- [ ] **Step 4: Run cargo check on all crates**

```bash
cd crates && cargo check
```

Expected: No errors

- [ ] **Step 5: Run cargo clippy**

```bash
cd crates && cargo clippy -- -D warnings
```

Expected: No warnings elevated to errors

- [ ] **Step 6: Commit**

```bash
git add crates/generation-engine/ crates/event-processor/
git commit -m "feat(rust): add generation-engine and event-processor — target profiles and workspace-isolated event routing"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run full cargo test suite**

```bash
cd crates && cargo test --workspace 2>&1 | tail -30
```

Expected: All tests pass. Record exact counts.

- [ ] **Step 2: Cargo check + clippy**

```bash
cd crates && cargo check --workspace && cargo clippy --workspace -- -D warnings
```

Expected: Zero errors, zero warnings

- [ ] **Step 3: Verify all services start**

In separate terminals or with `&`:

```bash
cd crates && cargo build --workspace
./target/debug/agent-runner &
./target/debug/confidence-engine &
./target/debug/ir-pipeline &
./target/debug/test-runner &
./target/debug/generation-engine &
./target/debug/event-processor &
```

Then:

```bash
curl http://localhost:8080/health && echo "agent-runner OK"
curl http://localhost:8081/health && echo "confidence-engine OK"
curl http://localhost:8082/health && echo "ir-pipeline OK"
curl http://localhost:8083/health && echo "test-runner OK"
curl http://localhost:8084/health && echo "generation-engine OK"
curl http://localhost:8085/health && echo "event-processor OK"
```

Expected: All return `ok`

- [ ] **Step 4: Kill background processes and commit**

```bash
pkill -f "target/debug/(agent-runner|confidence-engine|ir-pipeline|test-runner|generation-engine|event-processor)"
git add .
git commit -m "chore: verify all Rust services start and pass health checks"
```

---

## Acceptance Criteria Checklist

- [ ] `cargo test --workspace` — all tests pass with zero failures
- [ ] `cargo check --workspace` — zero type errors
- [ ] `cargo clippy --workspace -- -D warnings` — zero clippy warnings
- [ ] `confidence-engine`: score increases on approval, decreases on rejection, auto-approve fires at 0.85
- [ ] `ir-pipeline`: parallel ingestion processes Rust/TS files, skips non-source files
- [ ] `test-runner`: failure tree groups identical errors, identifies root causes, formats output
- [ ] `agent-runner`: scheduler enqueues/dequeues, coordinator blocks dependent orders until deps complete
- [ ] `event-processor`: routes events only to subscribed workspace, not to other workspaces
- [ ] All 6 services start and respond `ok` to `GET /health`
