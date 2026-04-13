/**
 * When control-plane runs in Docker with bind mounts, Node inside the container does not auto-restart.
 * Watch API-related trees and debounce `docker compose restart control-plane`.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const composeFile = path.resolve(process.argv[2]);
const composeDir = path.dirname(composeFile);
const roots = process.argv.slice(3).map((p) => path.resolve(p)).filter((p) => fs.existsSync(p));

const Y = '\x1b[1;33m';
const C = '\x1b[0;36m';
const R = '\x1b[0m';

let timer;
function scheduleRestart() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log(`${C}[watch]${R} Restarting control-plane container...`);
    const child = spawn('docker', ['compose', '-f', composeFile, 'restart', 'control-plane'], {
      cwd: composeDir,
      stdio: 'inherit'
    });
    child.on('error', (err) => console.error(`${Y}[watch]${R} docker restart failed:`, err.message));
  }, 900);
}

function shouldTrigger(filename) {
  if (!filename) return false;
  const lower = filename.toLowerCase();
  return lower.endsWith('.mjs') || lower.endsWith('.json');
}

for (const root of roots) {
  try {
    fs.watch(root, { recursive: true }, (_event, file) => {
      if (!shouldTrigger(file)) return;
      if (file.includes(`${path.sep}node_modules${path.sep}`)) return;
      console.log(`${Y}[watch]${R} API file changed: ${file}`);
      scheduleRestart();
    });
  } catch (err) {
    console.error(`[watch] fs.watch failed for ${root}:`, err.message);
    process.exit(1);
  }
}

if (roots.length === 0) {
  console.error('[watch] No watch roots exist; check paths.');
  process.exit(1);
}

await new Promise(() => {});
