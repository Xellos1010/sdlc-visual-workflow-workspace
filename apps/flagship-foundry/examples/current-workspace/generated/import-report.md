# Current Workspace Import Report

## Topology
- Kind: **nx-monorepo**
- Confidence: **0.99**
- Reasons: nx.json present, multiple package/project manifests detected

## Detected Scope
- Projects: **46**
- Systems: **8**
- Rule files: **68**
- Existing Mermaid diagrams: **4**
- Current task states: **1**
- Agent environments: **1**

## Agent Environment Parity
- Cursor: .cursor/rules/00-master-index/RULE.md, .cursor/rules/01-code-standards/error-handling-and-reliability.mdc, .cursor/rules/01-code-standards/eslint-configuration.mdc, .cursor/rules/01-code-standards/node-platform-standards.mdc, .cursor/rules/01-code-standards/separation-of-concerns.mdc, .cursor/rules/01-code-standards/simplicity.mdc, .cursor/rules/01-code-standards/single-responsibility.mdc, .cursor/rules/01-code-standards/ts-standards-and-strictness.mdc, .cursor/rules/02-architecture/architecture-and-nx-boundaries.mdc, .cursor/rules/03-workflow/ai-sdlc-orchestrator.mdc, .cursor/rules/03-workflow/dev-workflow-and-git.mdc, .cursor/rules/03-workflow/documentation-standards.mdc, .cursor/rules/03-workflow/sdlc-setup.mdc, .cursor/rules/03-workflow/ship-it-workflow.mdc, .cursor/rules/04-testing/bridge-communication-testing.mdc, .cursor/rules/04-testing/comprehensive-testing-strategy.mdc, .cursor/rules/04-testing/playwright/playwright-automation-standards.mdc, .cursor/rules/04-testing/runtime-verification.mdc, .cursor/rules/05-review/code-review.mdc, .cursor/rules/07-apis/api-standards.mdc, .cursor/rules/08-infrastructure/ci-cd-and-releases.mdc, .cursor/rules/08-infrastructure/configuration-standards.mdc, .cursor/rules/08-infrastructure/deployment-workflow.mdc, .cursor/rules/08-infrastructure/ui-feature-flags.mdc, .cursor/rules/10-observability/alert-definitions.mdc, .cursor/rules/10-observability/distributed-tracing.mdc, .cursor/rules/10-observability/incident-management.mdc, .cursor/rules/10-observability/metrics-collection.mdc, .cursor/rules/10-observability/structured-logging.mdc, .cursor/rules/11-security/audit-logging.mdc, .cursor/rules/11-security/authentication-patterns.mdc, .cursor/rules/11-security/authorization-rbac.mdc, .cursor/rules/11-security/data-encryption.mdc, .cursor/rules/11-security/data-retention.mdc, .cursor/rules/11-security/gdpr-compliance.mdc, .cursor/rules/11-security/hipaa-compliance.mdc, .cursor/rules/11-security/security-and-secrets-policy.mdc, .cursor/rules/12-performance/performance-and-bundling.mdc, .cursor/rules/13-ux/accessibility-standards.mdc, .cursor/rules/13-ux/react-standards.mdc

## System Groups
- apps/chrome-extensions: 2 projects
- apps/documentation-scraper: 1 projects
- libs/common: 5 projects
- libs/cursor-flow: 1 projects
- libs/flows-bravado: 1 projects
- libs/Google-Chrome-Extension-Library: 34 projects
- libs/platform: 1 projects
- libs/web-documentation: 1 projects

## Framework Coverage
- TypeScript
- Nx
- React
- Vite
- Playwright
- Test Harnesses
- Browser Automation
- Google Apps Script
- Document Generation

## Platform Coverage
- Web Runtime
- Chrome Extension MV3
- Google Apps Script
- Node Runtime

## Highest Chrome API Usage Signals
- `storage`: 206 references
- `runtime`: 193 references
- `tabs`: 117 references
- `action`: 42 references
- `downloads`: 40 references
- `scripting`: 33 references
- `identity`: 32 references
- `sidePanel`: 31 references

## Immediate Planning Implications
- Treat the repository as a graph of apps, libs, tools, rules, diagrams, task states, and agent-environment contracts.
- Expand blast radius beyond touched files when a change touches shared Chrome extension patterns, shared libraries, workflow rule packs, or shared environment rules.
- Preserve manual approval as the default until a plan explicitly opts into auto approval.
- Use imported diagrams and task states as continuity artifacts, not as decoration.
