---
name: continuity-writer
description: patch machine-readable cloud-agent continuity state safely after stage transitions, branch or pr changes, blockers, evidence updates, verification results, lock changes, work-order changes, interruptions, or handoffs. use when updating `.foundry/projects/<project>/current-task.json` or legacy `.codex` task state without overwriting existing data, after memory-continuity-manager decides what state should change and before closing, resuming, integrating, or handing off work.
---

# Continuity Writer

Apply or propose safe continuity patches. This skill writes the patch plan; it does not decide durable truth when artifacts conflict. Use `memory-continuity-manager` first for state-authority decisions.

## Core rule

Patch only fields that changed and preserve all unknown or unrelated fields exactly. Never erase blockers, evidence, artifacts, PRs, branches, or locks without named resolving evidence.

## Required inputs

- Target continuity file path; canonical `.foundry/projects/<project>/current-task.json`, legacy fallback `.codex/projects/<project>/current-task.json`
- Current file contents or a reliable excerpt
- Approved state change from `memory-continuity-manager`, orchestration decision, verification report, PR integration verdict, or operator instruction
- Evidence paths, run ID, timestamp, branch, PR, locks, blockers, next action, and affected work orders

## Workflow

1. Read the current state before proposing any patch.
2. Identify changed fields and preserved fields.
3. Detect conflicts between requested patch and current state: newer timestamp, branch mismatch, PR mismatch, unresolved blocker, stale lock, missing evidence, or incompatible status transition.
4. Use schema-safe status values when repo schema is narrower; preserve richer status in notes.
5. Produce a JSON-patch-style summary and an updated-field table.
6. Include validation checklist for resumability: phase, status, branch, PR, blockers, evidence, next commands, next safe action.
7. If direct file editing is authorized and tools permit it, apply the patch conservatively; otherwise return exact patch content for the operator or agent to apply.
8. Produce `continuity_patch.json` using `references/continuity-patch.schema.json` as a structural guide.

## Output contract

Always return this structure:

```markdown
# Continuity Patch

## Target
- file:
- run_id:
- patch_mode: proposed|applied

## Updated fields
| Field | Previous | New | Evidence |
|---|---|---|---|

## Preserved fields
- <field or section preserved>

## Conflict warnings
- <warning, impact, safe resolution>

## Validation checklist
| Check | Status | Notes |
|---|---|---|

## continuity_patch.json
```json
{}
```

## next_skill_handoff
Send patch evidence to `memory-continuity-manager`, `parity-sync-manager`, or `cloud-agent-sdlc-orchestrator` as appropriate.
```

## Guardrails

- Do not overwrite the entire file when a field-level patch is possible.
- Do not delete unknown fields.
- Do not mark complete unless verification, PR, continuity, lock release, and handoff evidence exist.
