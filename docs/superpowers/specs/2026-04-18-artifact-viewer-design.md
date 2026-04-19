# Artifact Viewer — Design Spec
Date: 2026-04-18
Status: approved
Scope: PoC (Option A — single-file HTML + Express API)

---

## Purpose

A local web viewer for inspecting artifacts produced by the `ts-to-rust-foundry-starter` pipeline. Primary goal: let the user traverse the artifact tree, read each artifact in a rendered view, and immediately spot any `todo!()` occurrences that require manual implementation work.

---

## Files Produced

| File | Location |
|------|----------|
| `viewer-server.mjs` | `apps/ts-to-rust-foundry-starter/` |
| `viewer.html` | `apps/ts-to-rust-foundry-starter/` |

Two npm scripts added to `apps/ts-to-rust-foundry-starter/package.json`:

```json
"viewer": "node viewer-server.mjs",
"viewer:example": "ARTIFACT_ROOT=./artifacts node viewer-server.mjs"
```

For the pipeline run against Night-Agent, a third script opens the staging artifacts:

```json
"viewer:night-agent": "ARTIFACT_ROOT=../../.foundry/staging/ts-to-rust-foundry-starter/artifacts node viewer-server.mjs"
```

Default `ARTIFACT_ROOT` when not set: `./artifacts` (the example run output).

Server starts on `http://localhost:4242` and opens Chrome automatically via `open` (macOS).

---

## Architecture

```
viewer-server.mjs (Express, Node.js)
  GET /              → serves viewer.html
  GET /api/tree      → walks ARTIFACT_ROOT, returns JSON tree
  GET /api/file      → reads a file by relative path, returns { content, ext }

viewer.html (vanilla JS, no framework, CDN libs only)
  ├── Left sidebar   — collapsible file tree grouped by source module
  │     └── badge    — todo!() count per generated.rs (red pill)
  ├── Tab bar        — model | pseudocode | uml-mermaid | uml-nomnoml | rust
  └── Content pane
        ├── .rs      — syntax-highlighted (highlight.js Rust grammar), todo!() lines red + jump list
        ├── .md      — rendered (marked.js)
        ├── .mmd     — rendered diagram (Mermaid.js)
        ├── .nomnoml — raw preformatted text (no CDN renderer available)
        └── .json    — pretty-printed, no collapse needed for PoC
```

CDN libraries (loaded from unpkg/cdn.jsdelivr.net in viewer.html):
- `highlight.js` — syntax highlighting for Rust and JSON
- `marked` — Markdown rendering
- `mermaid` — Mermaid diagram rendering

---

## File Tree Structure

`GET /api/tree` response shape:

```json
{
  "modules": [
    {
      "name": "context",           // source file stem
      "path": "context/context",   // relative path from ARTIFACT_ROOT
      "artifacts": [
        { "tab": "model",     "file": "model.json",          "ext": "json" },
        { "tab": "pseudocode","file": "pseudocode.md",        "ext": "md"   },
        { "tab": "uml",       "file": "uml.tsuml2.mmd",      "ext": "mmd"  },
        { "tab": "nomnoml",   "file": "uml.tsuml2.nomnoml",  "ext": "nomnoml" },
        { "tab": "rust",      "file": "generated.rs",        "ext": "rs"   }
      ],
      "todoCount": 2               // count of todo!() in generated.rs
    }
  ],
  "summary": {
    "totalModules": 12,
    "totalTodos": 14
  }
}
```

Server groups by walking all `generated.rs` files, counts `todo!()` occurrences via regex, and returns the tree sorted: directories first, then alphabetically within each level.

---

## TODO Surface

### Sidebar badge
Each module row in the sidebar shows a red pill badge with the `todo!()` count when > 0. Modules with no todos show no badge.

### Top summary bar
A fixed banner below the header shows total `todo!()` count across all modules. Color: amber when > 0, green when 0.

### In-file highlight (Rust tab only)
Lines containing `todo!()` are highlighted with a red left border and light red background. A collapsible "TODOs in this file" panel above the code block lists each occurrence as: `Line N — <surrounding context>`. Clicking a line number scrolls to that line.

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Artifact Viewer  |  14 todos remaining         [amber banner]  │
├──────────────────┬──────────────────────────────────────────────┤
│  ARTIFACT ROOT   │  [model] [pseudocode] [uml] [nomnoml] [rust] │
│  ▾ context       │                                              │
│    context  [2]  │  ┌── TODOs in this file (2) ─────────────┐  │
│  ▾ types         │  │  Line 8  — todo!("Implement...")       │  │
│    command       │  │  Line 15 — todo!("Implement...")       │  │
│    hooks    [3]  │  └────────────────────────────────────────┘  │
│    ids           │                                              │
│    logs     [1]  │  <syntax-highlighted content>               │
│    permissions   │                                              │
│    plugin        │                                              │
│    textInputTypes│                                              │
│  ▾ generated/... │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

---

## npm Commands

| Command | What it opens |
|---------|---------------|
| `npm run viewer` | `./artifacts` (example run) |
| `npm run viewer:example` | `./artifacts` (explicit) |
| `npm run viewer:night-agent` | `.foundry/staging/.../artifacts` (Night-Agent run) |

All three start the server and open `http://localhost:4242` in Chrome (macOS `open` command).

---

## Constraints (PoC)

- No authentication, no persistence, local only
- No live reload (refresh to pick up new pipeline runs)
- nomnoml rendered as raw text — no visual diagram
- No search across artifacts (future)
- No side-by-side diff between runs (future)
- Mermaid renders on tab activation to avoid FOUC
- Error state: if a file is missing, tab is disabled (greyed out), not hidden

---

## Dependencies

Runtime (already installed or available):
- Node.js (already present — tsx is installed)
- `express` — needs `npm install express` in `apps/ts-to-rust-foundry-starter/`
- `open` (npm package) — for auto-opening Chrome on macOS

No build step. CDN libraries loaded in-browser.

---

## Non-Goals (PoC)

- Not a full IDE / editor
- No Rust compilation or cargo check
- No nomnoml live rendering
- No cross-run comparison
- No authentication
