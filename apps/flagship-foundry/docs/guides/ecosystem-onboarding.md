# Ecosystem onboarding (step-by-step)

Use this guide to bring a **real repository** into Flagship Foundry as an ecosystem and wire **continuity**, **knowledge**, and **verification**. Canonical app commands assume `cd flagship-foundry-work`.

## Prerequisites

- Node.js 20+
- `npm install` in `flagship-foundry-work/`

## 1. Create an import request

Save a JSON file (e.g. `my-ecosystem.import.json`) at a path you can pass to the CLI:

```json
{
  "ecosystemId": "my-product",
  "name": "My Product",
  "source": {
    "type": "filesystem",
    "workspaceRoot": "/absolute/path/to/target/repo"
  }
}
```

`workspaceRoot` must be the root of the codebase you want modeled.

## 2. Import the workspace

```bash
node apps/orchestrator-cli/src/main.mjs import /path/to/my-ecosystem.import.json
```

**Outputs:** `state/ecosystems/<ecosystemId>/` (manifest, graph, reports).

## 3. Visualize (optional)

```bash
node apps/orchestrator-cli/src/main.mjs visualize /path/to/my-ecosystem.import.json
```

## 4. Ingest knowledge (recommended)

Use or adapt a manifest under `examples/knowledge-sources/` as a template, then:

```bash
node apps/orchestrator-cli/src/main.mjs knowledge /path/to/manifest.json
```

## 5. Gap analysis

Prepare a gap request JSON referencing `ecosystemId` and `knowledgeBaseId` as needed (see `examples/current-workspace/requests/gap-analysis.json`), then:

```bash
node apps/orchestrator-cli/src/main.mjs gap /path/to/gap-request.json
```

## 6. Planning

Use a change request JSON (see `examples/current-workspace/requests/`) and:

```bash
node apps/orchestrator-cli/src/main.mjs plan /path/to/change-request.json
```

## 7. Continuity (per repo workspace)

From the **repository root** where you want `.foundry/` to live (often the monorepo root):

```bash
cd /path/to/repo-root
node /path/to/flagship-foundry-work/apps/orchestrator-cli/src/main.mjs init-project my-project "One-line objective"
```

This creates **`.foundry/projects/<name>/current-task.json`** and **`SDLC_CHARTER.md`** per **ADR-011**.

## 8. Control plane (optional)

```bash
cd flagship-foundry-work
npm run api
```

Configure auth per `README.md` (**ADR-006**). Use REST or the Cursor companion (`apps/cursor-companion/`).

## 9. Agents, skills, and pipeline

Foundry does not install a separate “agent runtime.” Instead:

- **Cursor / IDE**: `.cursor/rules`, `.cursor/skills`, `.cursor/agents`
- **Claude Code**: `.claude/` as applicable
- **Foundry continuity**: `.foundry/projects/<id>/`
- **Codex legacy** (optional): `.codex/` may still exist for other tools
- **CI gates**: `docs/ci-release-gates.md` (**ADR-009**)

Align runbooks and personas from `runbooks/` and `personas/` with your process.

## 10. Verification

```bash
cd flagship-foundry-work
npm test
npm run ci:targeted
```

## References

- [REPOSITORY_LAYOUT.md](../REPOSITORY_LAYOUT.md)
- [adr-011-foundry-directory-layout-and-continuity-instance.md](../adr/adr-011-foundry-directory-layout-and-continuity-instance.md)
- [docker-and-local-dev.md](../docker-and-local-dev.md)
