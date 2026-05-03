# Human Decision Required: <project> - <decision title>

## Status

- Repository: `<repo>`
- Project: `<project>`
- Feature set: `<featureSetId>`
- Work order: `<workOrderId>`
- Current PR: `<url or none>`
- Current branch: `<branch>`
- Continuity file: `.foundry/projects/<project>/current-task.json`
- Status: `blocked_requires_human_decision`

## Decision needed

<The exact decision the human must make.>

## Why the agent cannot decide safely

<Explain what is ambiguous, risky, business-dependent, compliance-dependent, production-impacting, or outside available evidence.>

## Options

### Option A - <name>

- Impact:
- Risk:
- Files affected:
- Rollback path:

### Option B - <name>

- Impact:
- Risk:
- Files affected:
- Rollback path:

## Agent recommendation

<Recommended default, or no recommendation if the choice is human/business only.>

## Paste this back to the agent

```text
Decision for <repo>/<project>/<featureSetId>:
Choose Option <A|B|custom>.
Additional instructions:
<human notes>

Resume from:
- PR: <url>
- Branch: <branch>
- Work order: <workOrderId>
- Continuity file: .foundry/projects/<project>/current-task.json
```

## Acceptance after decision

- [ ] Decision recorded in continuity state
- [ ] Issue updated with selected option
- [ ] Existing active PR resumed
- [ ] Targeted validation run
- [ ] Evidence recorded
