# Cloud Agent SDLC Skills Catalog

## Source review summary

The uploaded archives contain two environment layers:

- `.foundry/`: canonical source of truth for projects, skills, agents, schemas, personas, and staging artifacts.
- `.codex/`: Codex overlay/runtime packaging with TOML agent profiles and thin skill wrappers that point back to `.foundry`.

Drive search confirmed the same SDLC doctrine: the 11-phase lifecycle, three operating loops, continuity state, handoffs, verification commands, agent hierarchy, and skills reference.

## Exhaustive Cloud-Agent Skill List

| Skill | Status | Primary purpose | Attach to |
|---|---|---|---|
| `sdlc-phase-router` | existing canonical | start/resume/triage; map intent and continuity to 11-stage SDLC | orchestrator, all cloud agents |
| `define-intent` | existing canonical | turn vague request into intent packet and readiness baseline | orchestrator, systems architect |
| `c4-diagram-generator` | existing canonical | create C4 diagrams, sequence views, trust-boundary diagrams | systems architect |
| `adr-writer` | existing canonical | capture durable architecture decisions | systems architect |
| `scope-chunker` | existing canonical | convert approved intent into bounded work orders | orchestrator |
| `model-router` | existing canonical | choose model/provider tier by task class | orchestrator |
| `continuity-writer` | existing canonical | update task state after phase, branch, verification, blocker, interruption | orchestrator, docs/release agent |
| `handoff-generator` | existing canonical | write recovery handoffs for delegation, interruption, context collapse | docs/release agent |
| `evidence-collector` | existing canonical | collect tests, builds, coverage, artifact inventory, acceptance evidence | verifier |
| `nx-verification` | existing canonical | run Nx typecheck/test/build/e2e and report structured result | builder, verifier |
| `cloud-agent-lifecycle-manager` | new | govern start, heartbeat, stop, resume, finalization, memory, single PR policy | all cloud agents |
| `agent-memory-consolidator` | new | compress memories and handoffs into durable task/project/learned memory patches | scheduled agent, docs/release agent |
| `cron-pr-consolidator` | new | scheduled reconciliation of previous work into one canonical PR | scheduled cloud agent |
| `task-state-auditor` | new | validate continuity state, branch/PR drift, missing evidence, schema mismatches | orchestrator, scheduled agent |
| `release-pr-packager` | new | prepare PR body, merge readiness, release notes, rollback, evidence links | docs/release agent |

## Recommended Cloud Agent attachments

| Cloud Agent | Required skills | Optional skills |
|---|---|---|
| SDLC Orchestrator | `sdlc-phase-router`, `continuity-writer`, `handoff-generator`, `scope-chunker`, `model-router`, `cloud-agent-lifecycle-manager`, `task-state-auditor` | `cron-pr-consolidator`, `release-pr-packager` |
| Context Curator | `cloud-agent-lifecycle-manager`, `agent-memory-consolidator` | `sdlc-phase-router` |
| Systems Architect | `define-intent`, `c4-diagram-generator`, `adr-writer`, `cloud-agent-lifecycle-manager` | `model-router` |
| Builder | `nx-verification`, `cloud-agent-lifecycle-manager` | `continuity-writer` |
| Verifier | `evidence-collector`, `nx-verification`, `task-state-auditor`, `cloud-agent-lifecycle-manager` | `release-pr-packager` |
| Security Reviewer | `evidence-collector`, `task-state-auditor`, `cloud-agent-lifecycle-manager` | `adr-writer` |
| Performance Reviewer | `evidence-collector`, `nx-verification`, `cloud-agent-lifecycle-manager` | `task-state-auditor` |
| Docs and Release Agent | `handoff-generator`, `continuity-writer`, `release-pr-packager`, `agent-memory-consolidator`, `cloud-agent-lifecycle-manager` | `cron-pr-consolidator` |
| Scheduled Consolidation Agent | `cloud-agent-lifecycle-manager`, `agent-memory-consolidator`, `cron-pr-consolidator`, `task-state-auditor`, `release-pr-packager` | `evidence-collector`, `handoff-generator` |

## Packaging notes

Each skill under `skills-uploadable/<skill-name>/skill.zip` is independently packaged. Upload the `skill.zip` from the named folder for the specific skill you want to add.

The `skills-source/` directory contains editable source folders. The packaged ZIPs are generated from those sources.
