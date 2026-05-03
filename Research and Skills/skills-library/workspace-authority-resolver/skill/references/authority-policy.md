# Authority policy

Use this source-of-truth order unless the workspace defines a stricter order.

1. Explicit current human instruction
2. Safety, privacy, security, and legal constraints
3. Repository state, active PR, active branch, work order, locks, and continuity state
4. Workspace or project charter
5. ADRs and decision ledger
6. CI and validation evidence
7. Roadmap, issues, tickets, and docs
8. Agent inference

Agent inference cannot override explicit user instruction, locks, branch policy, safety constraints, or current repository state.

## Actions that usually require explicit authority

- Merging or closing PRs
- Deleting branches, files, data, or issues
- Publishing releases, external communications, or production changes
- Changing credentials, secrets, permissions, or infrastructure access
- Overwriting continuity or decision history
- Editing outside the approved scope or lock set
