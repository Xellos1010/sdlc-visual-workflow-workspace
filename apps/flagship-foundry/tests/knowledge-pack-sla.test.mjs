import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { importWorkspace } from '../packages/core/src/import-pipeline.mjs';
import { ingestKnowledgeSources } from '../packages/core/src/knowledge-base.mjs';
import { analyzeKnowledgeGaps } from '../packages/core/src/gap-analysis.mjs';
import { repoRoot } from '../packages/core/src/io.mjs';

const sampleImportConfig = JSON.parse(await fs.readFile(path.join(repoRoot, 'examples/current-workspace/import-config.json'), 'utf8'));
const knowledgeManifest = JSON.parse(await fs.readFile(path.join(repoRoot, 'examples/knowledge-sources/input/foundry-foundational-docs.manifest.json'), 'utf8'));

async function rmWithRetry(targetPath, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await fs.rm(targetPath, { recursive: true, force: true });
      return;
    } catch (error) {
      const code = error?.code;
      const isTransient = code === 'ENOTEMPTY' || code === 'EBUSY' || code === 'EPERM';
      if (!isTransient || attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 20));
    }
  }
}

test('knowledge gap analysis reports tiered freshness and canonical linkage', async () => {
  await rmWithRetry(path.join(repoRoot, 'state/ecosystems/web-automation-workspace'));
  const knowledgeBaseId = 'test-foundry-foundational-docs-sla';
  await rmWithRetry(path.join(repoRoot, 'state/knowledge', knowledgeBaseId));
  const imported = await importWorkspace(sampleImportConfig);
  await ingestKnowledgeSources({
    ...knowledgeManifest,
    knowledgeBaseId
  });
  const report = await analyzeKnowledgeGaps(imported.ecosystem, knowledgeBaseId);

  const ingestionPack = report.coverage.find((entry) => entry.packId === 'pack:knowledge-ingestion-and-rag');
  const parityPack = report.coverage.find((entry) => entry.packId === 'pack:environment-parity-and-tooling');
  assert.ok(ingestionPack);
  assert.ok(parityPack);
  assert.equal(ingestionPack.slaTier, 'critical');
  assert.equal(parityPack.slaTier, 'critical');
  assert.equal(ingestionPack.freshness.windowDays, 14);
  assert.equal(parityPack.freshness.windowDays, 14);
  assert.equal(typeof ingestionPack.missing.includes('downstream-linkage'), 'boolean');
  assert.equal(typeof parityPack.missing.includes('downstream-linkage'), 'boolean');
  await rmWithRetry(path.join(repoRoot, 'state/knowledge', knowledgeBaseId));
});

test('critical packs past freshness window are flagged as stale', async () => {
  await rmWithRetry(path.join(repoRoot, 'state/ecosystems/web-automation-workspace'));
  const imported = await importWorkspace(sampleImportConfig);

  const knowledgeBaseId = 'test-knowledge-pack-sla';
  const outputDir = path.join(repoRoot, 'state/knowledge', knowledgeBaseId, 'documents');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(repoRoot, 'state/knowledge', knowledgeBaseId, 'manifest.json'), JSON.stringify({
    id: knowledgeBaseId,
    name: 'SLA Test Base',
    importedAt: '2026-03-23T00:00:00.000Z'
  }, null, 2));
  await fs.writeFile(path.join(outputDir, 'index.json'), JSON.stringify([
    {
      id: 'knowledge-document:test-1',
      sourceId: 'source:test',
      title: 'stale knowledge doc',
      content: 'knowledge rag provenance manifest',
      knowledgePackIds: ['pack:knowledge-ingestion-and-rag'],
      metadata: {
        version: '2026-02-01'
      }
    }
  ], null, 2));

  const report = await analyzeKnowledgeGaps(imported.ecosystem, knowledgeBaseId);
  const ingestionPack = report.coverage.find((entry) => entry.packId === 'pack:knowledge-ingestion-and-rag');
  assert.ok(ingestionPack);
  assert.equal(ingestionPack.freshness.status, 'stale');
  assert.ok(ingestionPack.missing.includes('freshness'));
  assert.ok(report.summary.staleCriticalPackCount >= 1);

  await rmWithRetry(path.join(repoRoot, 'state/knowledge', knowledgeBaseId));
});
