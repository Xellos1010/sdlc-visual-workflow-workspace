---
name: repository-intake-auditor
description: audit repository structure, current state, docs, tests, tooling, branches, pull requests, issues, generated files, validation commands, ownership signals, and readiness for cloud-agent sdlc work. use during discovery before roadmap planning, scope chunking, architecture mapping, blast-radius analysis, work-order creation, code generation, verification, integration, or continuity updates when the agent needs a grounded repository inventory instead of assumptions.
---

# Repository Intake Auditor

Produce a repository intake audit that gives later agents a truthful starting map of the repo, its tooling, its active work state, and its readiness for bounded SDLC work.

## Core rule

Do not infer repository shape from conventions alone. Use observed files, docs, package metadata, tests, CI config, branch/PR state, and command evidence. If a source is unavailable, record it as a gap instead of guessing.

## Required inputs

- Repository path, URL, connector result, or uploaded archive
- Current branch, default branch, open PRs, issues, and worktree status when available
- Existing continuity state when available
- Relevant docs, README, ADRs, roadmap, CI config, package metadata, and test config

## Workflow

1. Identify repository identity: name, root path, default branch, active branch, project, and owner hints.
2. Inventory top-level structure: apps, packages, libraries, services, scripts, tests, docs, config, generated files, migrations, and deployment surfaces.
3. Detect technology stack and validation commands from package managers, CI, config, README, and scripts.
4. Inspect docs and compare them to code reality. Mark docs as current, stale, contradictory, or missing.
5. Identify active work state: dirty files, open PRs, branches, issues, locks, work orders, and continuity records.
6. Classify readiness for downstream work: discover-ready, define-ready, design-ready, plan-ready, implement-ready, verify-ready, or blocked.
7. Record blockers and missing evidence. Do not route to implementation if validation commands, ownership, or target area are unknown.
8. Produce `repository_intake_audit.md` and `repository_intake_audit.json` using `references/repository-intake-audit.schema.json` as a structural guide.

## Output format

```markdown
# Repository Intake Audit

## Repository identity
- repository:
- project:
- default_branch:
- active_branch:
- ownership_signals:

## Structure inventory
| Area | Paths | Purpose | Confidence |
|---|---|---|---|

## Tooling and commands
| Command | Source | Purpose | Confidence |
|---|---|---|---|

## Documentation status
| Document | Status | Notes |
|---|---|---|

## Active work state
- branches:
- prs:
- issues:
- dirty_files:
- locks_or_work_orders:

## Readiness assessment
- readiness:
- safe_next_stage:
- blocking_gaps:

## repository_intake_audit.json
```json
{}
```

## next_skill_handoff
Name the next skill, usually `workspace-authority-resolver`, `roadmap-feature-factory`, `scope-chunker`, or `domain-context-locator`.
```

## Guardrails

- Do not modify repository files.
- Do not run destructive commands.
- Do not mark validation commands as authoritative unless discovered in repo docs, CI, package scripts, or prior continuity evidence.
