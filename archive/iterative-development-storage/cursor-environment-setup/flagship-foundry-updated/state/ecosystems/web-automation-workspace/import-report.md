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
- Treat the repository as a graph of apps, libs, tools, rules, diagrams, and current task states.
- Expand blast radius beyond touched files when a change touches shared Chrome extension patterns, shared libraries, or workflow rule packs.
- Preserve manual approval as the default until a plan explicitly opts into auto approval.
- Use imported diagrams and task states as continuity artifacts, not as decoration.
