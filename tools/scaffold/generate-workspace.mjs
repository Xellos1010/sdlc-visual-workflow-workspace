import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root of the parent repo
const ROOT_DIR = path.resolve(__dirname, '../../');

const targetPathArg = process.argv.find(arg => arg.startsWith('--path='));
let rawPath = targetPathArg ? targetPathArg.split('=')[1] : './agent-ready-repo';

// Handle literal tilde expansion
if (rawPath.startsWith('~/')) {
  rawPath = path.join(os.homedir(), rawPath.slice(2));
}
// Fix accidental dot before absolute paths (e.g. ./Users/... -> /Users/...)
if (rawPath.startsWith('./Users/') || rawPath.startsWith('.//')) {
  rawPath = rawPath.slice(1);
}

const targetPath = path.resolve(process.cwd(), rawPath);

const finalDir = path.basename(targetPath);
const parentDir = path.dirname(targetPath);

console.log(`🚀 Scaffolding Agent-Ready NX Workspace in: ${targetPath}`);

try {
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
  // Use create-nx-workspace to do the heavy lifting of package.json, nx.json, tsconfig etc.
  execSync(`npx --yes create-nx-workspace@latest "${finalDir}" --preset=apps --packageManager=pnpm --interactive=false`, { 
    stdio: 'inherit',
    cwd: parentDir
  });
} catch (e) {
  console.error("❌ Failed to scaffold NX workspace", e);
  process.exit(1);
}

console.log('📦 NX workspace created. Integrating SDLC agents and workspaces...');

const sdlcFolders = ['.foundry', '.cursor', '.codex', '.claude'];

sdlcFolders.forEach(folder => {
  const src = path.join(ROOT_DIR, folder);
  const dest = path.join(targetPath, folder);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`✓ Integrated ${folder}`);
  }
});

console.log('✅ Repository successfully scaffolded and ready for agentic development.');
console.log(`\nNext steps:\n  cd ${rawPath}\n  pnpm install\n  nx serve [app-name]`);
