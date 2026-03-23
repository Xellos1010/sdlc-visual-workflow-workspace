---
name: nx-verification
description: >
  Runs Nx-based verification commands (typecheck, test, build, e2e) and
  reports results in a structured format. Used by builder and verifier agents.
allowed-tools:
  - run_terminal_cmd
---

# Nx Verification

Run Nx verification pipelines and produce structured results.

## Standard Verification Pipeline

### TypeScript Type Checking
```bash
npx nx typecheck <project>
# or
pnpm exec nx run <project>:typecheck
```

### Unit Tests
```bash
npx nx test <project>
# or
pnpm exec nx run <project>:test
```

### Build
```bash
npx nx build <project> --configuration=production
# or
pnpm exec nx run <project>:build:dev
```

### E2E Tests (when available)
```bash
npx nx e2e <project>-e2e
# or
pnpm exec nx run <project>:e2e
```

### Affected Pipeline (when changes span multiple projects)
```bash
pnpm exec nx affected -t typecheck test build --parallel
```

### Chrome Extension Specific
```bash
pnpm exec nx run <project>:validate-dist
```

## Result Format
```markdown
## Verification Results: <project>
- **TypeCheck**: PASS/FAIL [details]
- **Tests**: PASS/FAIL [X passed, Y failed, Z skipped]
- **Build**: PASS/FAIL [output size: X KB]
- **E2E**: PASS/FAIL/SKIPPED [details]
- **Overall**: PASS/FAIL
- **Timestamp**: [ISO 8601]
- **Branch**: [current branch]
- **Commands Run**: [list]
```

## Error Handling
- Capture full error output on failure
- Do not retry — report the failure
- If a target doesn't exist, report as SKIPPED not FAIL
- Run `npm install` or `pnpm install` if `node_modules` is missing, then retry once
