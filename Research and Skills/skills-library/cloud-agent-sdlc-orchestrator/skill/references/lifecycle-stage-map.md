# Lifecycle stage map

Every task routes to exactly one active stage.

| Stage | Purpose | Hard gate |
|---|---|---|
| intake | Capture repo, project, human intent, constraints, target environment | no execution until scope exists |
| discover | Audit codebase, docs, branches, PRs, issues, CI, architecture | no planning from uninspected assumptions |
| define | Convert intent into requirements, unknowns, acceptance criteria | no design until unknowns are classified |
| design | Produce ADRs, contracts, schemas, optional diagrams | diagrams must compile to contracts or work orders |
| plan | Chunk work into bounded work orders and locks | no implementation until file scopes and tests exist |
| implement | Execute one bounded work order or one active PR improvement | no sibling PR for same lane |
| verify | Run tests, static checks, smoke checks, blast-radius analysis | no completion without evidence |
| integrate | Consolidate into one PR, resolve conflicts, update status | no merge without gates and approval |
| release | Produce release, handoff, rollback materials | no external publication from unmerged work |
| operate | Scheduled audits, branch cleanup, learning, roadmap refresh | destructive cleanup stays conservative |

Normalized status: `not_started`, `starting`, `in_progress`, `blocked`, `interrupted`, `verify_ready`, `verified`, `complete`, `incomplete`, `abandoned`.
