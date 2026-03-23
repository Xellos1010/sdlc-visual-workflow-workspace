---
name: evidence-collector
description: >
  Gathers verification evidence into a structured bundle: test results,
  build outputs, coverage reports, and artifact references. Used by the
  verifier agent to produce evidence-backed verdicts.
---

# Evidence Collector

Gather and structure verification evidence for phase gates and release decisions.

## Evidence Bundle Structure
```markdown
# Evidence Bundle: [phase-id]

## Metadata
- Phase: [lifecycle stage]
- Project: [project name]
- Branch: [active branch]
- Collected: [ISO 8601]
- Collector: evidence-collector

## Test Evidence
| Suite | Pass | Fail | Skip | Coverage | Path |
|-------|------|------|------|----------|------|

## Build Evidence
| Target | Status | Size | Output Path |
|--------|--------|------|-------------|

## Code Quality Evidence
| Check | Status | Details |
|-------|--------|---------|
| TypeCheck | | |
| Lint | | |
| Security | | |

## Artifact Inventory
| Artifact Type | Path | Status |
|---|---|---|

## Acceptance Criteria Evidence
| Criterion | Verdict | Evidence |
|---|---|---|

## Gaps
- [evidence that should exist but doesn't]
```

## Collection Protocol
1. Run `nextCommandSet` commands from continuity state
2. Capture test results (Jest/Vitest output, coverage reports)
3. Capture build results (sizes, output paths, exit codes)
4. Scan for type errors
5. Check artifact existence at declared paths
6. Map evidence to `doneCriteria` from continuity state
7. Identify gaps

## Evidence Locations
- `coverage/` — test coverage reports
- `dist/` — build outputs
- `test-results/` — test result files
- `.nx/cache/` — Nx computation cache
