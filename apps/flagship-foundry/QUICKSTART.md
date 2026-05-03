# Flagship Foundry — Quickstart Guide

This guide gets you from zero to a running project graph in about five minutes. It assumes Node.js 18+ is installed and that you have a project directory you want to ingest.

---

## Section 1: Glossary of Terms

**Ecosystem** — Your entire project, repo, or monorepo treated as a single named entity in the Foundry graph. Every import, plan, and blast-radius query is scoped to an ecosystem ID.

**Graph** — The structured map of your project: systems, components, dependencies, rules, and task states. The graph is the single source of truth the orchestrator and all agents reason against.

**Phase** — One of 11 lifecycle stages that work moves through: `discover → define → visualize → architect → plan → implement → verify → release → operate → diagnose → improve`. Each phase has explicit entry criteria (Definition of Ready) and exit criteria (Definition of Done).

**Work Order** — A bounded task assigned to a specific agent. A work order contains a goal, explicit file scope, input contracts, acceptance criteria, and a verification plan. The builder will not start without one.

**Continuity State** — Machine-readable JSON stored at `.codex/projects/<project>/current-task.json`. It records exactly where you are in the lifecycle so any agent — or a fresh Claude Code session — can resume deterministically without relying on chat history.

**Guardrail Pack** — A policy set that constrains what an agent can do in a given context. Examples: "TypeScript strict mode with no `any`", "no new npm dependencies without explicit approval", "do not modify files outside declared scope". Guardrails live in `.cursor/rules/` and are referenced in work orders.

**Principle Card** — An operating principle attached to a piece of work. Examples: `blast-radius-before-build` (understand downstream impact before starting), `contract-first` (define interfaces before writing implementation). Principle cards are lightweight, portable reminders that travel with work orders.

**Agent** — A specialized AI role in the Foundry system. Each agent has a defined phase binding, a set of allowed tools, and a forbidden-behaviors list. See Section 6 for the full roster.

**Skill** — A slash command that triggers a structured, multi-step workflow. `/define-intent` walks through the full discover-to-architect pipeline; `/scope-chunker` decomposes a feature into typed work orders. Skills are listed in `.claude/CLAUDE.md` and invoked in Claude Code.

**DoR / DoD** — Definition of Ready (gates that must pass before a phase starts) and Definition of Done (gates that must pass before a phase closes). The orchestrator evaluates both automatically. No work moves forward without them.

**Artifact Authority Stack** — A precedence hierarchy that resolves conflicts: doctrine and operating principles beat everything; charter and guardrails beat schemas; schemas and ADRs beat diagrams; diagrams beat code; code beats tests. When two artifacts contradict each other, the higher-authority artifact wins.

**MCP** — Model Context Protocol. The interoperability layer that lets Claude Code, Cursor, and Codex all share the same Foundry tools and graph state without duplicating logic. MCP servers expose Foundry capabilities as callable tools.

**Focus View** — A filtered, query-scoped slice of the graph showing only the systems and components relevant to a specific change or question. Focus views reduce noise and keep agents working on what matters.

**Blast Radius** — The set of systems, components, and consumers that would be affected by a proposed change. Always compute blast radius before starting implementation to understand scope and risk.

**Intent Packet** — The structured output of the discover-to-architect pipeline: a problem statement, scope boundaries, acceptance criteria, C4 diagrams, and principle cards. The intent packet is the contract between human intent and implementation work.

---

## Section 2: 5-Minute Setup

```bash
cd apps/flagship-foundry
npm install

# Ingest your project
node apps/orchestrator-cli/src/main.mjs import path/to/your-import-config.json

# Start the API
node apps/control-plane/src/server.mjs

# Browse your project graph
curl http://localhost:4010/ecosystems
```

The `import` command reads your project directory, builds a graph, and writes the result to `state/ecosystems/<ecosystemId>/`. Subsequent commands (blast, focus, plan) all read from that persisted state.

---

## Section 3: Sample import config

The import config is a small JSON file that tells the ingestion pipeline which project to read and what to call it. A placeholder config you can copy is at `examples/sample-import/import-config.json` (set `workspaceRoot` to an absolute path on your machine):

```json
{
  "ecosystemId": "sample-app",
  "name": "Sample Application",
  "source": {
    "type": "filesystem",
    "workspaceRoot": "/absolute/path/to/your/project"
  }
}
```

Run it with:

```bash
node apps/orchestrator-cli/src/main.mjs import examples/sample-import/import-config.json
```

### Generic template

Use this template as the starting point for any other project:

```json
{
  "ecosystemId": "your-project-id",
  "name": "Your Project Name",
  "source": {
    "type": "filesystem",
    "workspaceRoot": "/absolute/path/to/your/project"
  }
}
```

- `ecosystemId` must be a lowercase, hyphen-separated identifier. It is used as the directory name under `state/ecosystems/` and as the primary key in all blast-radius and plan queries.
- `workspaceRoot` must be an absolute path to the root of the project you want to ingest.

---

## Section 4: Using the SDLC Workflow in Claude Code

1. Open Claude Code in this monorepo root (the directory that contains `apps/` and `package.json`).
2. Say "I want to add a feature to my-project." The orchestrator reads the continuity state, determines the current phase, and routes you to `discover` if this is a new feature.
3. Use `/define-intent` to walk through structured intent capture: problem statement, scope, acceptance criteria, C4 diagrams, and principle cards. This produces an intent packet.
4. Use `/scope-chunker` to decompose the intent packet into typed work orders with explicit file scope, model routing, and acceptance criteria for each slice.
5. The builder agent receives each work order and implements within the declared scope. The verifier validates independently — it does not trust the builder's claims, it re-runs the verification commands itself.
6. The orchestrator evaluates the Definition of Done, updates the continuity state, and advances to the next phase.

Each phase transition writes to `.codex/projects/<project>/current-task.json`, so you can close Claude Code, come back the next day, and resume from exactly where you left off by running the `nextCommandSet` commands listed in that file.

---

## Section 5: CLI Command Reference

All commands are run from the `apps/flagship-foundry/` directory:

```
node apps/orchestrator-cli/src/main.mjs <command> [args]
```

| Command | Description | Example |
|---------|-------------|---------|
| `import` | Ingest a project from the filesystem into the Foundry graph. Reads an import config JSON and writes ecosystem state to `state/ecosystems/`. | `node apps/orchestrator-cli/src/main.mjs import examples/sample-import/import-config.json` |
| `visualize` | Run import and return the visualization data (Mermaid diagrams, graph views) for the ingested ecosystem. | `node apps/orchestrator-cli/src/main.mjs visualize examples/sample-import/import-config.json` |
| `profiles` | Run import and return the component profiles (tags, types, scopes, platform assignments) for the ecosystem. | `node apps/orchestrator-cli/src/main.mjs profiles examples/sample-import/import-config.json` |
| `blast` | Compute the blast radius for a given change query against an already-imported ecosystem. Reads a blast-request JSON with `ecosystemId` and `query`. | `node apps/orchestrator-cli/src/main.mjs blast path/to/blast-request.json` |
| `knowledge` | Ingest a knowledge manifest (documentation, runbooks, ADRs) into the knowledge base for a project. Reads a manifest JSON that lists source documents. | `node apps/orchestrator-cli/src/main.mjs knowledge path/to/knowledge-manifest.json` |
| `gap` | Analyze gaps between the project graph and the knowledge base — surfaces undocumented components, missing ADRs, and unknown dependencies. Reads a gap-request JSON with `ecosystemId` and optional `knowledgeBaseId`. | `node apps/orchestrator-cli/src/main.mjs gap path/to/gap-request.json` |
| `focus` | Generate a focus view — a filtered slice of the graph scoped to a specific query. Reads a focus-request JSON with `ecosystemId` and `query`. | `node apps/orchestrator-cli/src/main.mjs focus path/to/focus-request.json` |
| `plan` | Create an implementation plan from a change request. Reads a change-request JSON and produces a structured plan with work orders. | `node apps/orchestrator-cli/src/main.mjs plan path/to/change-request.json` |
| `bootstrap` | One-shot command that runs import, optional knowledge ingestion, and optional plan creation in sequence. Useful for cold-starting a new project. | `node apps/orchestrator-cli/src/main.mjs bootstrap examples/sample-import/import-config.json` |
| `run` | Execute a plan in simulate mode. Takes a plan ID (from a previous `plan` command) and runs through all work orders, reporting outcomes without applying changes. | `node apps/orchestrator-cli/src/main.mjs run <planId>` |
| `show-plan` | Print a previously created plan in full. Takes a plan ID. | `node apps/orchestrator-cli/src/main.mjs show-plan <planId>` |
| `scaffold-env` | Scaffold a new environment configuration from a named preset. Use `--dry-run` to preview the output without writing files. | `node apps/orchestrator-cli/src/main.mjs scaffold-env node-ts ./my-new-service --dry-run` |
| `init-project` | Initialize a new project with SDLC continuity state. Creates `.codex/projects/<name>/current-task.json` and a project charter. | `node apps/orchestrator-cli/src/main.mjs init-project my-project "Sample SDLC objective"` |
| `status` | Show the current SDLC phase, blockers, and done criteria for a project. | `node apps/orchestrator-cli/src/main.mjs status my-project` |
| `resume` | Print a resume checklist for interrupted work — current phase, next commands, blockers, and done criteria. | `node apps/orchestrator-cli/src/main.mjs resume my-project` |
| `transition` | Transition a project to a new SDLC phase. Validates the transition and updates continuity state. | `node apps/orchestrator-cli/src/main.mjs transition my-project define "Scope defined"` |
| `add-blocker` | Record a blocker on the current phase. Sets the phase status to blocked. | `node apps/orchestrator-cli/src/main.mjs add-blocker my-project "Waiting on API keys"` |
| `resolve-blocker` | Resolve a blocker by index (0-based). Restores the phase to in-progress if no blockers remain. | `node apps/orchestrator-cli/src/main.mjs resolve-blocker my-project 0` |
| `compile-ralph` | Compile a Foundry plan into a Ralph-compatible PRD (prd.json) for autonomous execution. | `node apps/orchestrator-cli/src/main.mjs compile-ralph state/ecosystems/my-project/plans/plan-001.json` |
| `sync-ralph` | Sync Ralph execution progress back to Foundry continuity state. | `node apps/orchestrator-cli/src/main.mjs sync-ralph ./ralph-prd.json my-project` |

Pass no arguments or `--help` to print the command list and usage summary.

---

## Section 6: What Each Agent Does (Plain English)

**Orchestrator** — The conductor. It activates at the start of any new feature, bug triage, or resumed session. It reads the continuity state, determines which lifecycle phase you are in, evaluates the Definition of Ready for the next phase, and routes the work to the right specialist. It also enforces the Definition of Done before closing a phase and writes the updated continuity state. The orchestrator never writes code directly — it only delegates. Its outputs are updated task state, phase completion summaries, and handoff documents.

**Context Curator** — The research assistant. It activates before a specialist agent begins work whenever a clean, bounded working context is needed. It reads the continuity state, searches the codebase for relevant files and schemas, identifies applicable cursor rules and ADRs, and assembles a structured context packet. It is read-only — it never modifies files. Its output is a markdown context packet that the receiving agent uses to avoid hallucination and stay focused.

**Systems Architect** — The designer. It activates during the discover, define, visualize, and architect phases. It clarifies ambiguous intent, defines system boundaries, produces C4 diagrams (context, container, component, sequence), writes Architecture Decision Records, and defines the contracts and schemas that constrain implementation. It does not write implementation code. Its outputs are ADRs, interface definitions, scope documents, and acceptance criteria.

**Builder** — The implementer. It activates only during the implement phase, after the orchestrator has issued a work order with explicit file scope and contracts. It reads existing code before writing, makes the minimal changes required by the work order, writes tests for new behavior, and runs the verification commands from the work order before reporting completion. It will not touch files outside its declared scope. Its outputs are changed source files, test files, and a verification report.

**Verifier** — The skeptic. It activates after the builder reports completion and during the verify and release phases. It re-runs all verification commands independently — it does not trust the builder's claimed results. It inspects changed files for contract compliance, test coverage, scope violations, and regressions. It is read-only and cannot modify source files. Its output is a PASS / FAIL / MIXED / INSUFFICIENT EVIDENCE verdict with a per-criterion evidence table.

**Security Reviewer** — The threat modeler. It activates during the architect and verify phases, and whenever security-sensitive changes are in scope. It checks for hardcoded secrets, trust boundary violations, supply-chain risks, overly broad permissions, and OWASP Top 10 patterns. It is read-only. Its output is a security review report with severity-rated findings and a release recommendation (CLEAR / FINDINGS / BLOCKS RELEASE).

**Performance Reviewer** — The profiler. It activates during the verify and diagnose phases. It checks for bundle size regressions, unnecessary re-renders, memory leaks, blocking I/O, and algorithmic hot paths. It is read-only and will not claim performance issues without measurement or code evidence. Its output is a performance review report with severity-rated findings and a release recommendation.

**Docs & Release Agent** — The packager. It activates during the document, improve, and release phases. It converts execution history into handoff documents, release notes, continuity patches, and learning records. It updates runbooks when operational procedures change. It will not fabricate test results or merge speculation into documented fact. Its outputs are the release package, updated runbooks, continuity state patches, and learning records that feed back into future work.

---

## Section 7: Three Operating Loops

The Foundry lifecycle is organized into three loops. Each loop feeds the next.

### Loop 1: Intent to Architecture

Phases: `discover → define → visualize → architect`

This loop answers "what are we building and why?" before any code is written. The context curator assembles available information, the systems architect clarifies scope and constraints, C4 diagrams make the structure explicit, and ADRs capture the key decisions. The loop exits when the intent packet is complete and the Definition of Ready for the plan phase is satisfied.

Use this loop for new features, significant refactors, or any time the problem is not yet well-defined. Skipping it is the most common cause of rework.

### Loop 2: Architecture to Implementation

Phases: `plan → implement → verify → release`

This loop answers "how do we build it correctly?" The orchestrator breaks the architecture into bounded implementation slices, the builder implements each slice within declared scope, the verifier validates each slice independently, and the docs agent packages the release. Every phase transition updates the continuity state. The loop exits when all acceptance criteria have passed verification and the release artifact is ready.

### Loop 3: Operate to Improve

Phases: `operate → diagnose → improve`

This loop answers "is it working in production, and what do we learn?" The performance reviewer baselines runtime behavior, the verifier and security reviewer diagnose production issues with evidence, and the docs agent captures learning records that update standards, runbooks, and future work orders. The loop feeds back into Loop 1 by enriching the context available for the next discover phase.

---

## Section 8: Next Steps

- **CHARTER.md** (`.claude/CHARTER.md`) — The authority document for the Foundry system. Defines operating principles, agent hierarchy, and what humans own versus what agents own.
- **RUNBOOK.md** (`.claude/RUNBOOK.md`) — Operational procedures for agent orchestration: how to resume interrupted work, how to recover from context collapse, how to escalate blockers.
- **Flagship Handbook** (`docs/flagship_systems_sdlc_handbook.docx.md`) — The full reference for the SDLC system: phase definitions, artifact schemas, guardrail conventions, and the reasoning behind the design.
- **Schemas** (`apps/flagship-foundry/schemas/`) — JSON schemas for continuity state, work orders, and agent outputs. Useful when integrating external tools or writing custom scripts.
- **Cursor Rules** (`.cursor/rules/`) — The guardrail packs applied during code review and agent execution. Start with `03-workflow/ai-sdlc-orchestrator.mdc` and the `nx-sdlc/RULE.md` for module boundary rules.
