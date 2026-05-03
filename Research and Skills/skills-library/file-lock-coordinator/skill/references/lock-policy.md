# Lock policy

A lock reserves a file, directory, symbol, work order, route, schema, migration, generated artifact, or PR lane for a bounded run.

Lock status values: `requested`, `active`, `blocked`, `stale`, `released`, `expired`, `conflict`.

Compatibility rules:

- Same exact file path: conflict unless read-only.
- Parent directory vs child file: potential conflict; inspect intent.
- Schema/migration/global config: high conflict risk.
- Generated artifact and source generator: conflict unless ordered.
- Tests can usually run in parallel but test file edits still require path locks.
