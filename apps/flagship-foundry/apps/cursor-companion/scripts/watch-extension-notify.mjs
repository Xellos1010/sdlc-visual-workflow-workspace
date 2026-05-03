/**
 * Watches companion *.js files and prints a reminder to reload the Extension Development Host.
 * VS Code/Cursor do not hot-reload extension code on disk changes.
 */
import fs from 'node:fs';
import path from 'node:path';

const companionRoot = path.resolve(process.argv[2] ?? '.');

const Y = '\x1b[1;33m';
const C = '\x1b[0;36m';
const R = '\x1b[0m';

let timer;
function notify() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log(
      `${Y}[companion watch]${R} Extension sources changed — run ${C}Developer: Reload Window${R} in the Extension Development Host (or Cmd/Ctrl+Shift+P).`
    );
  }, 250);
}

try {
  fs.watch(companionRoot, { recursive: true }, (_event, file) => {
    if (!file || !file.endsWith('.js')) return;
    if (file.includes(`${path.sep}node_modules${path.sep}`)) return;
    notify();
  });
} catch (err) {
  console.error('[companion watch] fs.watch failed (recursive watch needs macOS or Windows):', err.message);
  process.exit(1);
}

await new Promise(() => {});
