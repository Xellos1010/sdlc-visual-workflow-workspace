---
name: handoff-generator
description: >
  Generates plan handoff documents for context collapse recovery. Produces
  concise evidence references and supporting file lists so any agent can
  resume work with appropriate context. Used by docs-release-agent.
---

# Handoff Generator

Generate standardized handoff documents that enable any agent — or a new session after context collapse — to resume work with full context.

## When to Generate
- Phase completion
- Work interruption (session ending, context limit approaching)
- Agent delegation (handing work from one agent to another)
- Plan completion (plan approved, implementation about to begin)

## Generation Protocol

1. Read `.codex/projects/<project>/current-task.json`
2. Run `git log --oneline -10` for recent commit context
3. For each decision made: what was claimed, what evidence supports it, where is evidence located
4. List every file a resuming agent would need (continuity state, charter, source files, test files, schemas)
5. Fill template at `.cursor/skills/handoff-generator/templates/PLAN_HANDOFF_TEMPLATE.md`
6. Save to `docs/handoffs/handoff-[phase-id]-[date].md`

## Quality Checklist
- [ ] Summary is 1-3 sentences (not a wall of text)
- [ ] Every evidence reference has a real file path
- [ ] Continuity snapshot matches actual `current-task.json`
- [ ] Supporting files list contains only files that actually exist
- [ ] Open questions are actionable
- [ ] Rollback notes describe a concrete reversal path
- [ ] Next steps are specific and ordered
