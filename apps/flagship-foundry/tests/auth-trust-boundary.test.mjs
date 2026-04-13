import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

function buildRequest({ remoteAddress, authorization }) {
  return {
    headers: {
      authorization
    },
    socket: {
      remoteAddress
    }
  };
}

function applyEnv(overrides = {}) {
  process.env.FLAGSHIP_NO_AUTOSTART = '1';
  process.env.FLAGSHIP_CONTROL_PLANE_BEARER_TOKEN = 'test-token';
  process.env.FLAGSHIP_CONTROL_PLANE_BEARER_SCOPES = 'control-plane:read,control-plane:write,control-plane:execute';
  process.env.FLAGSHIP_CORS_ORIGINS = 'http://allowed.test';
  process.env.FLAGSHIP_ALLOW_LOOPBACK_NO_AUTH = '0';
  process.env.FLAGSHIP_DEV_MODE = '0';
  process.env.FLAGSHIP_RATE_LIMIT_MAX = '2';
  process.env.FLAGSHIP_RATE_LIMIT_WINDOW_MS = '30000';
  process.env.FLAGSHIP_CRITICAL_TIMEOUT_MS = '250';
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null || value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = String(value);
    }
  }
}

async function loadServerModule(overrides = {}) {
  applyEnv(overrides);
  const cacheBust = `case-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return import(`../apps/control-plane/src/server.mjs?${cacheBust}`);
}

async function withServer(overrides, callback) {
  const { createControlPlaneServer } = await loadServerModule(overrides);
  const server = createControlPlaneServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await callback(baseUrl);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

test('loopback no-auth is disabled by default without explicit dev mode', async () => {
  const { authorizeRequest } = await loadServerModule();
  const result = authorizeRequest(buildRequest({ remoteAddress: '127.0.0.1' }), '/runs/start');
  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 401);
  assert.equal(result.error, 'missing_bearer_token');
});

test('loopback no-auth requires explicit dev mode plus loopback exception', async () => {
  const { authorizeRequest } = await loadServerModule({
    FLAGSHIP_DEV_MODE: '1',
    FLAGSHIP_ALLOW_LOOPBACK_NO_AUTH: '1'
  });
  const result = authorizeRequest(buildRequest({ remoteAddress: '127.0.0.1' }), '/runs/start');
  assert.equal(result.ok, true);
  assert.equal(result.reason, 'loopback_no_auth');
});

test('private IPv4 (e.g. Docker bridge gateway) bypasses auth when dev exception enabled', async () => {
  const { authorizeRequest } = await loadServerModule({
    FLAGSHIP_DEV_MODE: '1',
    FLAGSHIP_ALLOW_LOOPBACK_NO_AUTH: '1',
    FLAGSHIP_CONTROL_PLANE_BEARER_TOKEN: null
  });
  for (const remoteAddress of ['172.17.0.1', '10.0.0.8', '::ffff:172.18.0.1']) {
    const result = authorizeRequest(buildRequest({ remoteAddress }), '/plans');
    assert.equal(result.ok, true, remoteAddress);
    assert.equal(result.reason, 'private_dev_no_auth', remoteAddress);
  }
});

test('non-loopback request without bearer token is rejected', async () => {
  const { authorizeRequest } = await loadServerModule();
  const result = authorizeRequest(buildRequest({ remoteAddress: '10.0.0.8' }), '/analysis/gaps');
  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 401);
  assert.equal(result.error, 'missing_bearer_token');
});

test('x-forwarded-for loopback value does not bypass auth', async () => {
  const { authorizeRequest } = await loadServerModule({
    FLAGSHIP_DEV_MODE: '1',
    FLAGSHIP_ALLOW_LOOPBACK_NO_AUTH: '1'
  });
  // Use a non-RFC1918 socket IP so we only test XFF is ignored (not private-dev bypass).
  const result = authorizeRequest({
    headers: {
      'x-forwarded-for': '127.0.0.1'
    },
    socket: {
      remoteAddress: '203.0.113.10'
    }
  }, '/runs/start');
  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 401);
  assert.equal(result.error, 'missing_bearer_token');
});

test('non-loopback request with insufficient scope is rejected', async () => {
  const { authorizeRequest } = await loadServerModule({
    FLAGSHIP_CONTROL_PLANE_BEARER_SCOPES: 'control-plane:read,control-plane:write'
  });
  const result = authorizeRequest(
    buildRequest({ remoteAddress: '10.0.0.8', authorization: 'Bearer test-token' }),
    '/runs/start'
  );
  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 403);
  assert.equal(result.error, 'insufficient_scope');
  assert.equal(result.requiredScope, 'control-plane:execute');
});

test('denied CORS origin is rejected on critical endpoint', async () => {
  await withServer({}, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/runs/start`, {
      method: 'POST',
      headers: {
        origin: 'http://blocked.test',
        authorization: 'Bearer test-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ planId: 'plan-123' })
    });
    assert.equal(response.status, 403);
    const payload = await response.json();
    assert.equal(payload.error, 'origin_not_allowed');
  });
});

test('critical endpoint rate limiting returns 429 after threshold', async () => {
  await withServer({}, async (baseUrl) => {
    for (let index = 0; index < 2; index += 1) {
      const okResponse = await fetch(`${baseUrl}/runs/start`, {
        method: 'POST',
        headers: {
          origin: 'http://allowed.test',
          authorization: 'Bearer test-token',
          'content-type': 'application/json'
        },
        body: JSON.stringify({ planId: `plan-${index}` })
      });
      assert.notEqual(okResponse.status, 429);
    }
    const limitedResponse = await fetch(`${baseUrl}/runs/start`, {
      method: 'POST',
      headers: {
        origin: 'http://allowed.test',
        authorization: 'Bearer test-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ planId: 'plan-limit' })
    });
    assert.equal(limitedResponse.status, 429);
    assert.equal(limitedResponse.headers.get('retry-after') !== null, true);
    const payload = await limitedResponse.json();
    assert.equal(payload.error, 'rate_limited');
  });
});

test('critical endpoint timeout returns 504', async () => {
  const { withTimeout } = await loadServerModule();
  await assert.rejects(
    withTimeout(new Promise(() => {}), 5),
    (error) => {
      assert.equal(error.message, 'request_timeout');
      assert.equal(error.statusCode, 504);
      return true;
    }
  );
});

test('critical route payload validation is consistent for runs, planning, and knowledge ingest', async () => {
  await withServer({}, async (baseUrl) => {
    const sharedHeaders = {
      origin: 'http://allowed.test',
      authorization: 'Bearer test-token',
      'content-type': 'application/json'
    };

    const missingPlanId = await fetch(`${baseUrl}/runs/start`, {
      method: 'POST',
      headers: sharedHeaders,
      body: JSON.stringify({})
    });
    assert.equal(missingPlanId.status, 400);
    assert.equal((await missingPlanId.json()).error, 'planId is required');

    const missingObjective = await fetch(`${baseUrl}/planning/create`, {
      method: 'POST',
      headers: sharedHeaders,
      body: JSON.stringify({})
    });
    assert.equal(missingObjective.status, 400);
    assert.equal((await missingObjective.json()).error, 'objective is required');

    const missingKnowledgeFields = await fetch(`${baseUrl}/knowledge/ingest`, {
      method: 'POST',
      headers: sharedHeaders,
      body: JSON.stringify({})
    });
    assert.equal(missingKnowledgeFields.status, 400);
    assert.equal((await missingKnowledgeFields.json()).error, 'knowledgeBaseId and name are required');
  });
});
