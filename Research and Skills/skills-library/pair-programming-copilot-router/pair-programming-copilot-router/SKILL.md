---
name: pair-programming-copilot-router
description: optional pair-programming control skill for cloud agent sdlc work. use when the operator asks for collaborative coding, coaching, manual checkpoints, guided implementation, rubber-ducking, or a human-in-the-loop pairing mode instead of autonomous execution. routes between advisory, navigator, driver-reviewer, and checkpoint-heavy modes while preserving current work orders, artifacts, authorities, and safety gates.
---

# Pair Programming Copilot Router

## Purpose

Select and run a bounded pair-programming mode without bypassing the normal SDLC chain. Treat this as an optional overlay, not a replacement for planning, verification, ADR capture, or continuity updates.

## Inputs

Use the available request, current work order, repository context, active artifacts, operator preference, authority constraints, and risk state. If the requested pairing mode is ambiguous, pick the safest mode and list the assumption.

## Routing modes

Choose exactly one primary mode:

- **navigator**: guide the human through steps while the human edits code.
- **driver-reviewer**: generate proposed code or patches, then require human review before integration.
- **rubber-duck reviewer**: ask focused diagnostic questions and explain tradeoffs without generating patches.
- **checkpoint coach**: break work into manual checkpoints with validation criteria between steps.
- **handoff explainer**: explain current state, next actions, and risks for a human taking over.

## Workflow

1. Read the active work order, constraints, target artifacts, and current phase.
2. Decide whether autonomous work is inappropriate because the user requested pairing, the risk is high, or human confirmation is required.
3. Select the pairing mode and define boundaries for what the agent may and may not do.
4. Produce a short pairing plan with checkpoints, questions, artifacts to inspect, and stopping conditions.
5. Preserve SDLC handoffs. Route implementation outputs back to the relevant planning, codegen, review, evidence, ADR, parity, or continuity skill.

## Output contract

Always produce:

```json
{
  "pairing_mode": "navigator | driver-reviewer | rubber-duck reviewer | checkpoint coach | handoff explainer",
  "reason": "why this mode is appropriate",
  "allowed_actions": [],
  "blocked_actions": [],
  "manual_checkpoints": [],
  "questions": [],
  "artifacts_to_inspect": [],
  "next_skill_handoff": {
    "recommended_skill": "skill-name-or-none",
    "handoff_reason": "why this skill comes next"
  }
}
```

Also include a markdown summary titled `pairing_plan.md` with the same decisions in human-readable form.

## Guardrails

Do not use this skill to skip authority resolution, tests, evidence collection, or PR governance. If pairing reveals a new decision, route to `software-engineer-decision-capture` or `adr-draft-writer`. If pairing changes code or pseudocode, route to `code-to-pseudocode-reconciler`, `generated-code-reviewer`, or `parity-sync-manager` as appropriate.
