# Work order sizing rules

A good work order:

- Has one outcome and one owner lane
- Names allowed files or directories
- Names forbidden files or directories
- Lists expected tests and validation commands
- Has clear acceptance criteria
- Has rollback notes
- Can be reviewed independently
- Does not require parallel edits to locked files

## Split signals

Split the work when:

- It touches unrelated domains
- It changes public contracts and implementation at once
- It requires both architecture decision and code changes
- It changes database/schema and UI in the same unit
- It needs multiple PRs or reviewers
- It mixes refactor, feature, and cleanup
