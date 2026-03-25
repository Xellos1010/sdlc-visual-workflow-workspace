import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Routing config path (mirrors the resolution in gateway.mjs)
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROUTING_CONFIG_PATH = path.resolve(
  __dirname,
  '../configs/model-routing/default.json'
);

function loadRoutingConfig() {
  const raw = fs.readFileSync(ROUTING_CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

// ---------------------------------------------------------------------------
// resolveRoute extracted as a pure function — mirrors the logic in gateway.mjs
// so we can test it without starting a server.
// ---------------------------------------------------------------------------

function resolveRoute(config, taskClass, requestedModel) {
  if (!taskClass) {
    return {
      provider: config.defaultProvider,
      model: requestedModel || config.defaultModel,
      fallbackProvider: null,
    };
  }

  const route = (config.routes || []).find((r) => r.taskClass === taskClass);
  if (!route) {
    return {
      provider: config.defaultProvider,
      model: requestedModel || config.defaultModel,
      fallbackProvider: null,
    };
  }

  return {
    provider: route.provider,
    model: route.model,
    fallbackProvider: route.fallback ?? null,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('routing config loads correctly with 7 routes and 3 providers', () => {
  const config = loadRoutingConfig();

  assert.ok(config, 'Config should load without errors');
  assert.equal(typeof config.version, 'string');
  assert.ok(config.defaultProvider, 'Should have a defaultProvider');
  assert.ok(config.defaultModel, 'Should have a defaultModel');

  assert.ok(Array.isArray(config.routes), 'routes should be an array');
  assert.equal(config.routes.length, 7, 'Should have exactly 7 routes');

  assert.ok(typeof config.providers === 'object', 'providers should be an object');
  assert.equal(Object.keys(config.providers).length, 3, 'Should have exactly 3 providers');
  assert.ok(config.providers['anthropic'], 'Should have anthropic provider');
  assert.ok(config.providers['local-ollama'], 'Should have local-ollama provider');
  assert.ok(config.providers['openai'], 'Should have openai provider');
});

test('strategic_reasoning routes to anthropic/claude-opus-4-6', () => {
  const config = loadRoutingConfig();
  const route = resolveRoute(config, 'strategic_reasoning', null);

  assert.equal(route.provider, 'anthropic');
  assert.equal(route.model, 'claude-opus-4-6');
});

test('deterministic_transformation routes to local-ollama/qwen2.5-coder:7b', () => {
  const config = loadRoutingConfig();
  const route = resolveRoute(config, 'deterministic_transformation', null);

  assert.equal(route.provider, 'local-ollama');
  assert.equal(route.model, 'qwen2.5-coder:7b');
  // This route should declare a fallback to anthropic
  assert.equal(route.fallbackProvider, 'anthropic');
});

test('unknown task class falls back to default provider and model', () => {
  const config = loadRoutingConfig();
  const route = resolveRoute(config, 'completely_unknown_task_class', null);

  assert.equal(route.provider, config.defaultProvider);
  assert.equal(route.model, config.defaultModel);
  assert.equal(route.fallbackProvider, null);
});

test('no task class uses the requested model with the default provider', () => {
  const config = loadRoutingConfig();
  const route = resolveRoute(config, null, 'gpt-4o');

  assert.equal(route.provider, config.defaultProvider);
  assert.equal(route.model, 'gpt-4o');
  assert.equal(route.fallbackProvider, null);
});

test('no task class and no requested model uses the default model', () => {
  const config = loadRoutingConfig();
  const route = resolveRoute(config, null, null);

  assert.equal(route.provider, config.defaultProvider);
  assert.equal(route.model, config.defaultModel);
});

test('all route entries have required fields', () => {
  const config = loadRoutingConfig();

  for (const route of config.routes) {
    assert.ok(typeof route.taskClass === 'string' && route.taskClass.length > 0,
      `Route taskClass should be a non-empty string: ${JSON.stringify(route)}`);
    assert.ok(typeof route.provider === 'string' && route.provider.length > 0,
      `Route provider should be a non-empty string: ${JSON.stringify(route)}`);
    assert.ok(typeof route.model === 'string' && route.model.length > 0,
      `Route model should be a non-empty string: ${JSON.stringify(route)}`);
    // provider must exist in providers map
    assert.ok(config.providers[route.provider],
      `Route provider "${route.provider}" must exist in providers config`);
  }
});
