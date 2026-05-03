---
name: workspace-authority-resolver
description: resolve source-of-truth hierarchy, permissions, approvals, project authority, branch authority, pr authority, workspace policy, human escalation needs, and safe action boundaries for cloud-agent sdlc work. use before planning, mutation, branch operations, pr integration, release, deletion, external publication, continuity updates, or when instructions conflict across user prompts, docs, work orders, adrs, repo state, ci evidence, or agent assumptions.
---

# Workspace Authority Resolver

Determine what the agent is allowed to do, what it must not do, and what evidence or approval is needed before proceeding.

## Core rule

Authority is not the same as confidence. A plausible action is still blocked if the current source-of-truth hierarchy does not authorize it.

## Required inputs

- Current human instruction and any explicit constraints
- Repository intake audit and continuity state when available
- Work order, active branch, active PR, locks, ADRs, issue, roadmap, and validation evidence
- Workspace/project policy or operating method docs when available

## Workflow

1. List all available authority sources and classify them by priority.
2. Detect conflicts: user versus docs, docs versus code, continuity versus branch state, PR versus work order, roadmap versus current request.
3. Resolve conflicts using `references/authority-policy.md` unless a stricter workspace rule exists.
4. Define allowed actions for this run only.
5. Define blocked actions with exact missing approvals, locks, evidence, or context.
6. Identify human escalation requirements and the smallest question or approval needed.
7. Produce `workspace_authority_resolution.md` and `workspace_authority_resolution.json`.

## Output format

```markdown
# Workspace Authority Resolution

## Authority order
| Priority | Source | Applies to | Status |
|---|---|---|---|

## Resolved permissions
### Allowed now
- <action, scope, evidence>

### Blocked now
- <action, reason, required unblocker>

## Conflicts
| Conflict | Resolution | Evidence |
|---|---|---|

## Required escalation
- decision_needed:
- approver_or_source:
- unblock_condition:

## workspace_authority_resolution.json
```json
{}
```

## next_skill_handoff
Pass allowed actions, blocked actions, and escalation requirements to the next skill.
```

## Guardrails

- Do not broaden scope beyond current authority.
- Do not convert an assumption into permission.
- Do not overwrite or delete continuity, branches, PRs, files, or decisions without explicit authority.
