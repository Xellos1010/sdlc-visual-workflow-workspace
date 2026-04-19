import express from 'express';
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
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

app.put('/api/file', express.json(), (req, res) => {
  const { path: filePath, content } = req.body ?? {};
  if (!filePath || content === undefined) {
    return res.status(400).json({ error: 'path and content required' });
  }
  const absPath = resolve(join(ARTIFACT_ROOT, filePath));
  if (!absPath.startsWith(ARTIFACT_ROOT)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  if (!existsSync(absPath)) {
    return res.status(404).json({ error: 'file not found' });
  }
  writeFileSync(absPath, content, 'utf8');
  res.json({ ok: true });
});

app.listen(PORT, async () => {
  console.log(`\nArtifact Viewer  http://localhost:${PORT}`);
  console.log(`Artifacts root   ${ARTIFACT_ROOT}\n`);
  try { await open(`http://localhost:${PORT}`); } catch { /* non-fatal */ }
});
