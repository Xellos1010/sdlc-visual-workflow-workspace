# Artifact Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Express + vanilla-JS web viewer that lets you traverse ts-to-rust-foundry-starter pipeline artifacts in Chrome and surfaces all `todo!()` occurrences.

**Architecture:** A single-file Express server (`viewer-server.mjs`) serves one HTML page (`viewer.html`) and two JSON APIs. The HTML page uses three CDN libraries: highlight.js, marked, and Mermaid. All user-visible HTML from file content is sanitized with DOMPurify before insertion.

**Tech Stack:** Node.js ESM, Express 4, open npm package, highlight.js CDN, marked CDN, Mermaid CDN, DOMPurify CDN. No build step.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `apps/ts-to-rust-foundry-starter/package.json` | Add express + open deps; add 3 viewer scripts |
| Create | `apps/ts-to-rust-foundry-starter/viewer-server.mjs` | Express server with tree API and file API |
| Create | `apps/ts-to-rust-foundry-starter/viewer.html` | Single-page UI with sidebar, tabs, content pane |

---

## Task 1: Install dependencies and add npm scripts

**Files:**
- Modify: `apps/ts-to-rust-foundry-starter/package.json`

- [ ] **Step 1: Install runtime deps**

```bash
cd apps/ts-to-rust-foundry-starter
npm install express open
```

Expected: `added N packages`

- [ ] **Step 2: Add viewer scripts to package.json**

The full scripts block after edit:

```json
"scripts": {
  "build": "tsc -p tsconfig.json",
  "full": "tsx src/cli.ts full",
  "analyze": "tsx src/cli.ts analyze",
  "generate:rust": "tsx src/cli.ts generate-rust",
  "example": "tsx src/cli.ts full --input ./examples/src --output ./artifacts --use-tsuml2 auto",
  "viewer": "node viewer-server.mjs",
  "viewer:example": "ARTIFACT_ROOT=./artifacts node viewer-server.mjs",
  "viewer:night-agent": "ARTIFACT_ROOT=../../.foundry/staging/ts-to-rust-foundry-starter/artifacts node viewer-server.mjs"
}
```

- [ ] **Step 3: Verify install**

```bash
node -e "import('express').then(() => console.log('ok'))"
```

Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git add apps/ts-to-rust-foundry-starter/package.json apps/ts-to-rust-foundry-starter/package-lock.json
git commit -m "feat(viewer): add express + open deps and viewer npm scripts"
```

---

## Task 2: Create viewer-server.mjs

**Files:**
- Create: `apps/ts-to-rust-foundry-starter/viewer-server.mjs`

- [ ] **Step 1: Create the server file**

```javascript
import express from 'express';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative, extname, basename, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import open from 'open';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4242;
const ARTIFACT_ROOT = resolve(
  process.cwd(),
  process.env.ARTIFACT_ROOT ?? './artifacts'
);

const app = express();

function countTodos(content) {
  return (content.match(/todo!\s*\(/g) ?? []).length;
}

function extractTodoLines(content) {
  return content.split('\n').reduce((acc, line, i) => {
    if (line.includes('todo!(')) {
      acc.push({ lineNum: i + 1, text: line.trim() });
    }
    return acc;
  }, []);
}

function findModules(root) {
  const modules = [];
  const ARTIFACT_FILES = [
    { tab: 'model',      file: 'model.json',         ext: 'json'    },
    { tab: 'pseudocode', file: 'pseudocode.md',       ext: 'md'      },
    { tab: 'uml',        file: 'uml.tsuml2.mmd',     ext: 'mmd'     },
    { tab: 'nomnoml',    file: 'uml.tsuml2.nomnoml', ext: 'nomnoml' },
    { tab: 'rust',       file: 'generated.rs',       ext: 'rs'      },
  ];

  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); }
    catch { return; }

    const hasRs = entries.some(e => e.isFile() && e.name === 'generated.rs');
    if (hasRs) {
      const rsContent = readFileSync(join(dir, 'generated.rs'), 'utf8');
      modules.push({
        name: basename(dir),
        path: relative(root, dir),
        artifacts: ARTIFACT_FILES.map(a => ({
          ...a,
          exists: existsSync(join(dir, a.file)),
        })),
        todoCount: countTodos(rsContent),
        todoLines: extractTodoLines(rsContent),
      });
    }
    for (const entry of entries) {
      if (entry.isDirectory()) walk(join(dir, entry.name));
    }
  }

  walk(root);
  return modules;
}

app.get('/', (_req, res) => res.sendFile(join(__dirname, 'viewer.html')));

app.get('/api/tree', (_req, res) => {
  if (!existsSync(ARTIFACT_ROOT)) {
    return res.status(404).json({ error: `ARTIFACT_ROOT not found: ${ARTIFACT_ROOT}` });
  }
  const modules = findModules(ARTIFACT_ROOT);
  const totalTodos = modules.reduce((sum, m) => sum + m.todoCount, 0);
  res.json({ modules, summary: { totalModules: modules.length, totalTodos } });
});

app.get('/api/file', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'path query param required' });
  const absPath = resolve(join(ARTIFACT_ROOT, filePath));
  if (!absPath.startsWith(ARTIFACT_ROOT)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  if (!existsSync(absPath)) {
    return res.status(404).json({ error: 'file not found' });
  }
  const content = readFileSync(absPath, 'utf8');
  res.json({ content, ext: extname(absPath).replace('.', '') });
});

app.listen(PORT, async () => {
  console.log(`\nArtifact Viewer  http://localhost:${PORT}`);
  console.log(`Artifacts root   ${ARTIFACT_ROOT}\n`);
  try { await open(`http://localhost:${PORT}`); } catch { /* non-fatal on non-mac */ }
});
```

- [ ] **Step 2: Smoke-test the API**

```bash
cd apps/ts-to-rust-foundry-starter
ARTIFACT_ROOT=../../.foundry/staging/ts-to-rust-foundry-starter/artifacts node viewer-server.mjs &
sleep 2
curl -s http://localhost:4242/api/tree | python3 -c "import json,sys; d=json.load(sys.stdin); print('modules:', d['summary']['totalModules'], 'todos:', d['summary']['totalTodos'])"
curl -s "http://localhost:4242/api/file?path=context/context/generated.rs" | python3 -c "import json,sys; d=json.load(sys.stdin); print('ext:', d['ext'], 'len:', len(d['content']))"
kill %1
```

Expected:
```
modules: 12  todos: <N>
ext: rs  len: <positive>
```

- [ ] **Step 3: Commit**

```bash
git add apps/ts-to-rust-foundry-starter/viewer-server.mjs
git commit -m "feat(viewer): Express server with /api/tree and /api/file"
```

---

## Task 3: Create viewer.html

**Files:**
- Create: `apps/ts-to-rust-foundry-starter/viewer.html`

The file uses DOMPurify to sanitize all HTML derived from file content before DOM insertion. Raw text (sidebar labels, line numbers, error messages) uses `textContent` exclusively.

- [ ] **Step 1: Write viewer.html**

Create `apps/ts-to-rust-foundry-starter/viewer.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Artifact Viewer</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/rust.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/json.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d1117;--surface:#161b22;--border:#30363d;
  --text:#e6edf3;--muted:#8b949e;--accent:#58a6ff;
  --red:#f85149;--red-bg:rgba(248,81,73,.10);
  --amber:#d29922;--amber-bg:rgba(210,153,34,.12);
  --green:#3fb950;--green-bg:rgba(63,185,80,.12);
  --sidebar-w:260px;
}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);height:100vh;display:flex;flex-direction:column;overflow:hidden}

/* header */
#header{display:flex;align-items:center;gap:16px;padding:10px 16px;background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0}
#header h1{font-size:15px;font-weight:600;letter-spacing:.02em}
#todo-banner{font-size:13px;font-weight:500;padding:3px 10px;border-radius:12px}
#todo-banner.has-todos{background:var(--amber-bg);color:var(--amber)}
#todo-banner.no-todos{background:var(--green-bg);color:var(--green)}
#artifact-root{font-size:11px;color:var(--muted);margin-left:auto;font-family:monospace}

/* layout */
#layout{display:flex;flex:1;overflow:hidden}

/* sidebar */
#sidebar{width:var(--sidebar-w);background:var(--surface);border-right:1px solid var(--border);overflow-y:auto;flex-shrink:0}
#sidebar-header{padding:10px 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--surface);z-index:1}
.module-row{display:flex;align-items:center;padding:7px 12px;cursor:pointer;font-size:13px;border-left:3px solid transparent;gap:8px}
.module-row:hover{background:rgba(255,255,255,.04)}
.module-row.active{background:rgba(88,166,255,.08);border-left-color:var(--accent)}
.module-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.todo-badge{background:var(--red);color:#fff;font-size:10px;font-weight:700;border-radius:10px;padding:1px 6px;flex-shrink:0}

/* main */
#main{flex:1;display:flex;flex-direction:column;overflow:hidden}
#empty-state{flex:1;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:14px}
#viewer{display:none;flex-direction:column;height:100%}

/* tabs */
#tabs{display:flex;border-bottom:1px solid var(--border);background:var(--surface);flex-shrink:0;padding:0 16px;gap:2px}
.tab{padding:10px 14px;font-size:13px;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent}
.tab:hover:not(.disabled){color:var(--text)}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
.tab.disabled{color:var(--border);cursor:not-allowed}

/* content */
#content{flex:1;overflow:auto}

/* todo panel */
#todo-panel{background:var(--red-bg);border-bottom:1px solid rgba(248,81,73,.3);padding:10px 16px}
.todo-panel-header{font-size:12px;font-weight:600;color:var(--red);cursor:pointer;user-select:none;display:flex;align-items:center;gap:6px}
.todo-list{margin-top:8px;display:flex;flex-direction:column;gap:4px}
.todo-item{font-size:12px;font-family:monospace;color:var(--text);cursor:pointer;padding:2px 4px;border-radius:3px}
.todo-item:hover{background:rgba(255,255,255,.06)}
.line-ref{color:var(--red);font-weight:600;margin-right:8px}

/* code */
#code-container{padding:0}
#code-container pre{margin:0;background:#0d1117!important;border-radius:0;font-size:13px;line-height:1.6}
#code-container pre code{padding:0!important;display:block}
.code-line{display:flex;min-height:1.6em}
.code-line.todo-line{background:var(--red-bg)}
.line-num{min-width:48px;padding:0 16px 0 16px;color:var(--muted);text-align:right;user-select:none;flex-shrink:0;font-size:12px;line-height:1.6}
.code-line.todo-line .line-num{color:var(--red)}
.line-code{flex:1;padding-right:16px}

/* markdown */
#md-container{padding:24px 32px;max-width:860px;line-height:1.7;font-size:14px}
#md-container h1,#md-container h2,#md-container h3{margin:20px 0 10px}
#md-container p{margin-bottom:12px}
#md-container code{background:var(--surface);padding:2px 5px;border-radius:3px;font-size:12px;font-family:monospace}
#md-container pre{background:var(--surface);padding:12px;border-radius:6px;overflow-x:auto;margin:12px 0}
#md-container pre code{background:transparent;padding:0}
#md-container ul,#md-container ol{padding-left:20px;margin-bottom:12px}
#md-container li{margin-bottom:4px}

/* mermaid */
#mmd-container{padding:24px;display:flex;justify-content:center}

/* raw text */
#raw-container{padding:16px;font-family:monospace;font-size:12px;white-space:pre-wrap;color:var(--muted);line-height:1.6}
</style>
</head>
<body>

<div id="header">
  <h1>Artifact Viewer</h1>
  <div id="todo-banner" class="no-todos">Loading…</div>
  <div id="artifact-root"></div>
</div>

<div id="layout">
  <aside id="sidebar">
    <div id="sidebar-header">Modules</div>
    <div id="module-list"></div>
  </aside>
  <main id="main">
    <div id="empty-state">Select a module to inspect its artifacts</div>
    <div id="viewer">
      <div id="tabs"></div>
      <div id="content"></div>
    </div>
  </main>
</div>

<script>
mermaid.initialize({ startOnLoad: false, theme: 'dark' });

let treeData = null;
let activeModule = null;

async function boot() {
  const res = await fetch('/api/tree');
  if (!res.ok) { showError('Failed to load tree: ' + res.status); return; }
  treeData = await res.json();
  if (treeData.error) { showError(treeData.error); return; }
  renderSidebar();
  renderBanner();
}

function showError(msg) {
  const el = document.getElementById('empty-state');
  el.textContent = 'Error: ' + msg;
}

function renderBanner() {
  const banner = document.getElementById('todo-banner');
  const { totalTodos, totalModules } = treeData.summary;
  banner.textContent = totalTodos > 0
    ? totalTodos + ' todo!() remaining across ' + totalModules + ' modules'
    : 'All clear — ' + totalModules + ' modules, 0 todos';
  banner.className = totalTodos > 0 ? 'has-todos' : 'no-todos';
}

function renderSidebar() {
  const list = document.getElementById('module-list');
  list.textContent = '';
  for (const mod of treeData.modules) {
    const row = document.createElement('div');
    row.className = 'module-row';
    row.dataset.path = mod.path;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'module-name';
    nameSpan.textContent = mod.name;
    nameSpan.title = mod.path;
    row.appendChild(nameSpan);

    if (mod.todoCount > 0) {
      const badge = document.createElement('span');
      badge.className = 'todo-badge';
      badge.textContent = mod.todoCount;
      row.appendChild(badge);
    }

    row.addEventListener('click', () => selectModule(mod));
    list.appendChild(row);
  }
}

function selectModule(mod) {
  activeModule = mod;
  document.querySelectorAll('.module-row').forEach(r =>
    r.classList.toggle('active', r.dataset.path === mod.path));

  document.getElementById('empty-state').style.display = 'none';
  const viewer = document.getElementById('viewer');
  viewer.style.display = 'flex';

  renderTabs(mod);
  const defaultTabName = mod.todoCount > 0 ? 'rust' : 'model';
  const pick = mod.artifacts.find(a => a.tab === defaultTabName && a.exists)
            ?? mod.artifacts.find(a => a.exists);
  if (pick) selectTab(pick.tab);
}

function renderTabs(mod) {
  const tabsEl = document.getElementById('tabs');
  tabsEl.textContent = '';
  for (const art of mod.artifacts) {
    const tab = document.createElement('div');
    tab.className = 'tab' + (art.exists ? '' : ' disabled');
    tab.textContent = art.tab;
    tab.dataset.tab = art.tab;
    if (art.exists) tab.addEventListener('click', () => selectTab(art.tab));
    tabsEl.appendChild(tab);
  }
}

async function selectTab(tabName) {
  if (!activeModule) return;
  document.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === tabName));

  const art = activeModule.artifacts.find(a => a.tab === tabName);
  if (!art || !art.exists) return;

  const filePath = activeModule.path + '/' + art.file;
  const res = await fetch('/api/file?path=' + encodeURIComponent(filePath));
  const contentEl = document.getElementById('content');
  contentEl.textContent = '';

  if (!res.ok) { contentEl.textContent = 'Error loading file'; return; }
  const { content, ext } = await res.json();

  if (ext === 'rs')         renderRust(content, activeModule.todoLines, contentEl);
  else if (ext === 'md')    renderMarkdown(content, contentEl);
  else if (ext === 'mmd')   renderMermaid(content, contentEl);
  else if (ext === 'json')  renderJson(content, contentEl);
  else                      renderRaw(content, contentEl);
}

/* ── Rust renderer ──────────────────────────────────────────────── */
function renderRust(content, todos, contentEl) {
  if (todos.length > 0) {
    const panel = document.createElement('div');
    panel.id = 'todo-panel';

    const header = document.createElement('div');
    header.className = 'todo-panel-header';
    header.textContent = '\u25BE todo!() in this file (' + todos.length + ')';
    panel.appendChild(header);

    const listEl = document.createElement('div');
    listEl.className = 'todo-list';

    for (const t of todos) {
      const item = document.createElement('div');
      item.className = 'todo-item';
      item.dataset.line = t.lineNum;

      const ref = document.createElement('span');
      ref.className = 'line-ref';
      ref.textContent = 'L' + t.lineNum;
      item.appendChild(ref);
      item.appendChild(document.createTextNode(t.text));

      item.addEventListener('click', () => {
        const lineEl = contentEl.querySelector('#L' + t.lineNum);
        if (lineEl) lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      listEl.appendChild(item);
    }

    let open = true;
    header.addEventListener('click', () => {
      open = !open;
      listEl.style.display = open ? '' : 'none';
      header.textContent = (open ? '\u25BE' : '\u25B8') + ' todo!() in this file (' + todos.length + ')';
    });

    panel.appendChild(listEl);
    contentEl.appendChild(panel);
  }

  const todoLineNums = new Set(todos.map(t => t.lineNum));
  const rawLines = content.split('\n');
  // highlight.js output is trusted library output; DOMPurify applied as defence-in-depth
  const highlighted = hljs.highlight(content, { language: 'rust' }).value;
  const hlLines = highlighted.split('\n');

  const codeContainer = document.createElement('div');
  codeContainer.id = 'code-container';
  const pre = document.createElement('pre');
  const code = document.createElement('code');

  for (let i = 0; i < rawLines.length; i++) {
    const lineNum = i + 1;
    const lineEl = document.createElement('div');
    lineEl.className = 'code-line' + (todoLineNums.has(lineNum) ? ' todo-line' : '');
    lineEl.id = 'L' + lineNum;

    const numSpan = document.createElement('span');
    numSpan.className = 'line-num';
    numSpan.textContent = lineNum;
    lineEl.appendChild(numSpan);

    const codeSpan = document.createElement('span');
    codeSpan.className = 'line-code';
    // hljs output sanitized by DOMPurify before insertion
    codeSpan.innerHTML = DOMPurify.sanitize(hlLines[i] ?? '');
    lineEl.appendChild(codeSpan);

    code.appendChild(lineEl);
  }

  pre.appendChild(code);
  codeContainer.appendChild(pre);
  contentEl.appendChild(codeContainer);
}

/* ── Markdown renderer ──────────────────────────────────────────── */
function renderMarkdown(content, contentEl) {
  const div = document.createElement('div');
  div.id = 'md-container';
  // marked output sanitized by DOMPurify
  div.innerHTML = DOMPurify.sanitize(marked.parse(content));
  contentEl.appendChild(div);
}

/* ── Mermaid renderer ───────────────────────────────────────────── */
async function renderMermaid(content, contentEl) {
  const outer = document.createElement('div');
  outer.id = 'mmd-container';
  const mmdDiv = document.createElement('div');
  mmdDiv.className = 'mermaid';
  mmdDiv.textContent = content;   // textContent, not innerHTML
  outer.appendChild(mmdDiv);
  contentEl.appendChild(outer);
  try {
    await mermaid.run({ nodes: [mmdDiv] });
  } catch (e) {
    mmdDiv.textContent = 'Mermaid render error: ' + e.message + '\n\n' + content;
  }
}

/* ── JSON renderer ──────────────────────────────────────────────── */
function renderJson(content, contentEl) {
  let pretty = content;
  try { pretty = JSON.stringify(JSON.parse(content), null, 2); } catch { /* use raw */ }
  const div = document.createElement('div');
  div.id = 'code-container';
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  // hljs output sanitized by DOMPurify
  code.innerHTML = DOMPurify.sanitize(hljs.highlight(pretty, { language: 'json' }).value);
  pre.appendChild(code);
  div.appendChild(pre);
  contentEl.appendChild(div);
}

/* ── Raw text renderer ──────────────────────────────────────────── */
function renderRaw(content, contentEl) {
  const div = document.createElement('div');
  div.id = 'raw-container';
  div.textContent = content;   // textContent only — no HTML parsing
  contentEl.appendChild(div);
}

boot();
</script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add apps/ts-to-rust-foundry-starter/viewer.html
git commit -m "feat(viewer): single-page artifact viewer with DOMPurify sanitization"
```

---

## Task 4: Manual smoke test

**Files:** none (read-only verification)

- [ ] **Step 1: Start the viewer against Night-Agent artifacts**

```bash
cd apps/ts-to-rust-foundry-starter
npm run viewer:night-agent
```

Expected console:
```
Artifact Viewer  http://localhost:4242
Artifacts root   <path>/.foundry/staging/ts-to-rust-foundry-starter/artifacts
```

Chrome opens automatically.

- [ ] **Step 2: Verify sidebar and banner**

- Sidebar shows 12 module rows
- Modules with todos show a red badge
- Banner reads "N todo!() remaining…" (amber) or "All clear" (green)

- [ ] **Step 3: Verify Rust tab**

Click a module with a red badge → click **rust** tab:
- Lines containing `todo!(` highlighted red with red line number
- TODO panel appears above code listing line numbers and text
- Clicking a line number in the panel scrolls to that line in the code

- [ ] **Step 4: Verify other tabs**

- **pseudocode** → Markdown renders (headers, paragraphs visible)
- **uml** → Mermaid SVG diagram renders
- **model** → JSON pretty-printed with syntax highlighting
- **nomnoml** → raw text (expected — no CDN renderer)

- [ ] **Step 5: Test example-run script**

```bash
npm run viewer:example
```

If `./artifacts` does not exist: banner should show an error state. This is correct. If the example was run previously, the tree should show modules from that run.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat(viewer): artifact viewer PoC complete"
```

---

## Self-Review

- [x] Spec coverage: tree API, file API, todo badge sidebar, todo jump list, red line highlight, summary banner, 3 npm scripts, Mermaid, Markdown, JSON, nomnoml raw, disabled tabs for missing files — all covered
- [x] No placeholders — all code blocks are complete
- [x] Type consistency — `mod.todoLines` defined in server, consumed as `activeModule.todoLines` in renderRust — matches
- [x] Security — DOMPurify wraps all hljs and marked output before innerHTML; Mermaid and raw text use textContent; sidebar labels use textContent; path traversal guard in server
