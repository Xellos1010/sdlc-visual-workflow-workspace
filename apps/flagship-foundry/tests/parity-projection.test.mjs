import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { projectWithParityPolicy } from '../packages/core/src/parity-projection.mjs';

async function mkTmp(prefix) {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

test('projectWithParityPolicy applies new files into empty target', async () => {
  const sourceDir = await mkTmp('parity-src-');
  const targetDir = await mkTmp('parity-dst-');

  try {
    const sourceFile = path.join(sourceDir, 'AGENTS.md');
    await fs.writeFile(sourceFile, '# Foundry AGENTS instructions\n', 'utf8');

    const result = await projectWithParityPolicy({ sourceDir, targetDir });
    assert.equal(result.approvalRequired, false);
    assert.equal(result.filesChanged, 1);

    const written = await fs.readFile(path.join(targetDir, 'AGENTS.md'), 'utf8');
    assert.equal(written, '# Foundry AGENTS instructions\n');
  } finally {
    await fs.rm(sourceDir, { recursive: true, force: true });
    await fs.rm(targetDir, { recursive: true, force: true });
  }
});

test('projectWithParityPolicy blocks user-owned conflicts without approval', async () => {
  const sourceDir = await mkTmp('parity-src-');
  const targetDir = await mkTmp('parity-dst-');

  try {
    await fs.writeFile(path.join(sourceDir, 'settings.json'), '{"managed":true}\n', 'utf8');
    const targetFile = path.join(targetDir, 'settings.json');
    await fs.writeFile(targetFile, '{"custom":"user"}\n', 'utf8');

    const result = await projectWithParityPolicy({ sourceDir, targetDir });
    assert.equal(result.approvalRequired, true);
    assert.equal(result.conflicts.length, 1);
    assert.equal(result.conflicts[0].path, targetFile);

    const preserved = await fs.readFile(targetFile, 'utf8');
    assert.equal(preserved, '{"custom":"user"}\n');
  } finally {
    await fs.rm(sourceDir, { recursive: true, force: true });
    await fs.rm(targetDir, { recursive: true, force: true });
  }
});

test('projectWithParityPolicy auto-applies machine-owned conflicts', async () => {
  const sourceDir = await mkTmp('parity-src-');
  const targetDir = await mkTmp('parity-dst-');

  try {
    await fs.writeFile(path.join(sourceDir, 'AGENTS.md'), '# Foundry AGENTS instructions\nnext\n', 'utf8');
    const targetFile = path.join(targetDir, 'AGENTS.md');
    await fs.writeFile(targetFile, '# Foundry AGENTS instructions\nold\n', 'utf8');

    const result = await projectWithParityPolicy({ sourceDir, targetDir });
    assert.equal(result.approvalRequired, false);
    assert.equal(result.filesChanged, 1);

    const overwritten = await fs.readFile(targetFile, 'utf8');
    assert.equal(overwritten, '# Foundry AGENTS instructions\nnext\n');
  } finally {
    await fs.rm(sourceDir, { recursive: true, force: true });
    await fs.rm(targetDir, { recursive: true, force: true });
  }
});
