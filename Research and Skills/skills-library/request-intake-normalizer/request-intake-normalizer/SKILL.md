---
name: request-intake-normalizer
description: normalize raw human requests, scheduled prompts, issue or pr events, repository events, and operator instructions into a stable request envelope for a cloud-agent sdlc workflow. use at the start of an autonomous run before objective classification, routing, constraint extraction, context discovery, pseudocode, code generation, review, validation, adr creation, parity sync, or continuity updates when the request has not yet been converted into structured form.
---

# Request Intake Normalizer

Convert unstructured work requests into a durable request envelope that downstream SDLC skills can consume without reinterpreting the original prompt.

## Core rule

Preserve user intent exactly, separate facts from assumptions, and do not start design or implementation. Produce a stable envelope that makes ambiguity explicit instead of silently resolving it.

## Required inputs

Normalize whatever is available into these fields:

- `raw_request`: the original human message, scheduled task prompt, issue, PR event, commit event, or repository event.
- `repository_context`: repo name, project slug, branch, workspace, package, app, or service if known.
- `actor`: requester, triggering agent, scheduled automation, issue author, or PR author.
- `trigger_type`: human_request, scheduled_run, issue_event, pr_event, commit_event, ci_event, repository_event, or unknown.
- `cadence_or_event`: schedule, event ID, issue/PR URL, or other run trigger.
- `current_continuity_state`: active work order, locks, branch, PR, known blockers, and prior handoff if available.
- `available_connectors`: repo, issue tracker, docs, chat, calendar, email, or file connectors available to the agent.

## Normalization workflow

1. Restate the request as a concise action-oriented summary.
2. Identify the requested outcome, affected system, and expected deliverables.
3. Extract explicit constraints, deadlines, approvals, non-goals, and acceptance signals stated by the user.
4. Identify missing inputs needed before route planning; do not ask for them unless they block safe progress.
5. Record assumptions separately from facts.
6. Detect whether the task is a resume/continuation, new work order, bug report, review request, reverse-sync request, or operational task.
7. Build `request_envelope.json` using `references/request-envelope.schema.json`.
8. Handoff to `objective-classifier`.

## Output contract

Always return this structure:

```markdown
# Request Intake Envelope

## Normalized summary
<one to three sentences>

## Request facts
- Actor:
- Trigger type:
- Repository or project:
- Requested outcome:
- Known deliverables:

## Assumptions
- <assumption or none>

## Missing inputs
- <missing input or none>

## request_envelope.json
```json
{}
```

## next_skill_handoff
Send `request_envelope.json` to `objective-classifier` with any missing inputs and assumptions preserved.
```

## Guardrails

- Do not infer authority to modify files, create PRs, contact people, or deploy unless the request explicitly grants it or continuity state already authorizes it.
- Do not collapse multiple tasks into one vague request; represent them as separate `requested_outcomes` when needed.
- If the request references prior state, surface the required continuity lookup instead of pretending the state is known.
- If the request is ambiguous but work can continue safely, carry the ambiguity as `missing_inputs` and continue the chain.
