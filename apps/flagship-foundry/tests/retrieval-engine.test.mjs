import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { indexEcosystem } from '../packages/core/src/embedding-pipeline.mjs';
import { retrieve, buildRagStatus } from '../packages/core/src/retrieval-engine.mjs';

test('rag indexing and retrieval rank matching artifacts with token budgets', async () => {
  const ecosystemId = `test-rag-${Date.now()}`;
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'rag-index-'));
  const docsDir = path.join(root, 'docs', 'adr');
  await fs.mkdir(docsDir, { recursive: true });
  await fs.writeFile(
    path.join(docsDir, 'adr-001.md'),
    '# ADR-001\n\nUse a file-based vector index for local retrieval.\n'
  );

  await indexEcosystem(ecosystemId, { roots: [root], gatewayUrl: 'http://127.0.0.1:4011' });
  const status = await buildRagStatus(ecosystemId);
  assert.ok(status.indexedArtifacts >= 1);

  const result = await retrieve(ecosystemId, {
    queryId: `query:${ecosystemId}`,
    query: 'file-based vector index for local retrieval',
    maxResults: 5,
    tokenBudget: 200
  });

  assert.ok(result.results.length >= 1);
  assert.match(result.results[0].chunkText, /vector index/i);
});

