# Memory Patch Template

Use a minimal patch shaped like this when no stricter repository schema is provided:

```json
{
  "op": "merge_patch",
  "target": ".foundry/projects/<slug>/current-task.json",
  "reason": "why the patch is needed",
  "patch": {
    "status": "verify_ready",
    "phase": "verify",
    "updated_at": "<iso8601 or unknown>",
    "evidence": [],
    "pending_actions": [],
    "blockers": [],
    "next_agent_handoff": {}
  },
  "preserve": ["locks", "prior_evidence", "open_blockers"],
  "review_required": false
}
```
