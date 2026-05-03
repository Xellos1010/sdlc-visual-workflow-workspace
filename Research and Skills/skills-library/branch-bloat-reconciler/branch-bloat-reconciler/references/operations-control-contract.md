# Operations control contract

Use this vocabulary for SDLC operations skills.

## Evidence rules
- Prefer inspectable evidence: command output, CI run, diff, PR, issue, ADR, work order, log, file path, or continuity record.
- Mark unsupported claims as `not_evidenced`.
- Preserve timestamps, run ids, commit ids, file paths, URLs, and source names when available.
- Treat stale evidence as a finding, not as a pass.

## Status vocabulary
Use one of these statuses where possible: healthy, watch, verified, verified_with_notes, degraded, blocked, failed, needs_human_review, unsafe_to_continue.

## Handoff contract
Every output must name the next skill and provide: reason, required inputs, safe actions, blocked actions, and blocking gaps.
