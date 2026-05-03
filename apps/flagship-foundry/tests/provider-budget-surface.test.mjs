import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAdvisoryBudgetSnapshot } from '../packages/model-gateway/src/gateway.mjs';

test('provider budget snapshot exposes configured providers and adapters for operator posture', () => {
  const snapshot = buildAdvisoryBudgetSnapshot({
    workspaceTargetId: 'target:workspace'
  });

  const providerNames = snapshot.providers.map((provider) => provider.displayName);
  const adapterIds = snapshot.adapters.map((adapter) => adapter.adapterId);

  assert.ok(providerNames.includes('Codex Cloud'));
  assert.ok(providerNames.includes('Anthropic Cloud'));
  assert.ok(providerNames.includes('Gemini Cloud'));
  assert.ok(providerNames.includes('Cursor Agent Runtime'));
  assert.ok(adapterIds.includes('adapter:codex-cli'));
  assert.ok(adapterIds.includes('adapter:cursor-agent'));
});
