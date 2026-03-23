# Import and Scaffold Pipeline

## Goal

Turn an existing ecosystem into a graph-native, approval-aware, knowledge-backed SDLC workspace without forcing a new implementation stack first.

## Supported entry paths

- direct filesystem import for a live repository or workspace;
- export-bundle import for text exports of code, configs, rules, and documentation;
- future adapter path for connector or remote repository ingestion.

## Import stages

1. **Topology detection**
   - identify Nx monorepo, polyrepo, or undefined legacy structure;
   - detect systems, projects, frameworks, platforms, and deployment surfaces.

2. **Continuity and artifact ingestion**
   - ingest current task states, diagrams, rule packs, handoff markers, and phase-ledger signals;
   - detect agent-environment artifacts such as `.cursor`, `.claude`, `.codex`, `AGENTS.md`, `CLAUDE.md`, and `.mcp.json`.

3. **Graph construction**
   - create nodes for ecosystem, repo, system, project, framework, platform, rule pack, diagram, task state, and environment;
   - create edges for containment, dependency, governance, platform targeting, visualization, environment configuration, and shared patterns.

4. **Knowledge publication**
   - generate SME profiles for detected frameworks, platforms, environment parity, and knowledge ingestion;
   - generate visualization exports;
   - publish an import report for human review.

5. **Planning enablement**
   - create plans from requests, telemetry, or inspection findings;
   - default to manual approval unless policy explicitly enables auto approval;
   - insert adversarial review rounds before implementation for risky work.

## Polyrepo and undefined ecosystem extrapolation

When a workspace is not neatly organized, Foundry groups package roots, infers system boundaries from manifests and directories, marks uncertain edges as provisional, and publishes a review list rather than pretending certainty.
