# Cadence policy

| Cadence | Goal | Default behavior | Forbidden by default |
|---|---|---|---|
| hourly | continue current active work safely | inspect state, build on canonical PR, update memory | merge, delete branches, start unrelated work |
| four_hour | validate and converge | broader validation, one PR check, stale lock detection | destructive cleanup, publication |
| daily | reconcile and govern | reconcile PRs, branches, issues, locks, roadmap, digest | risky deletion without gates |
| weekly | strategic review | roadmap, fix-memory, trend review, guardrails | unbounded implementation |
| local_24x7 | queue-based always-on work | idempotency keys, per-run worktrees, locks, crash recovery | dirty repo mutation, unlimited concurrency |
