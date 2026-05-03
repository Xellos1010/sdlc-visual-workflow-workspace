import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  encodeBrowserPopoutClientTextFrame,
  startBrowserPopoutServer,
  stopBrowserPopoutServer
} = require('../apps/cursor-companion/browser-popout-server.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaRoot = path.resolve(__dirname, '../schemas');
const schemaFile = 'browser-popout-message.schema.json';

async function loadSchema() {
  return JSON.parse(await readFile(path.join(schemaRoot, schemaFile), 'utf8'));
}

function requestText(url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf8')
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function openWebSocketUpgrade({ port, path: requestPath, token }) {
  const key = crypto.randomBytes(16).toString('base64');

  return new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1',
      port,
      path: `${requestPath}?token=${encodeURIComponent(token)}`,
      headers: {
        Connection: 'Upgrade',
        Upgrade: 'websocket',
        'Sec-WebSocket-Version': '13',
        'Sec-WebSocket-Key': key
      }
    });

    req.on('upgrade', (res, socket, head) => {
      resolve({ res, socket, head });
    });

    req.on('response', (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          res,
          body: Buffer.concat(chunks).toString('utf8')
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function parseServerTextFrame(buffer) {
  if (buffer.length < 2) {
    return null;
  }

  const second = buffer[1];
  let length = second & 0x7f;
  let offset = 2;

  if (length === 126) {
    if (buffer.length < 4) {
      return null;
    }
    length = buffer.readUInt16BE(2);
    offset = 4;
  } else if (length === 127) {
    if (buffer.length < 10) {
      return null;
    }
    const lengthBigInt = buffer.readBigUInt64BE(2);
    if (lengthBigInt > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error('frame too large');
    }
    length = Number(lengthBigInt);
    offset = 10;
  }

  const frameSize = offset + length;
  if (buffer.length < frameSize) {
    return null;
  }

  return {
    payload: buffer.subarray(offset, frameSize).toString('utf8'),
    rest: buffer.subarray(frameSize)
  };
}

async function readServerTextFrame(socket, initial = Buffer.alloc(0)) {
  let buffer = initial;

  while (true) {
    const parsed = parseServerTextFrame(buffer);
    if (parsed) {
      return parsed;
    }

    const [chunk] = await once(socket, 'data');
    buffer = Buffer.concat([buffer, chunk]);
  }
}

async function readServerTextFrameWithTimeout(socket, timeoutMs, initial = Buffer.alloc(0)) {
  return Promise.race([
    readServerTextFrame(socket, initial),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timed out waiting for server frame after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}

async function waitFor(predicate, timeoutMs, errorMessage) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (predicate()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  throw new Error(errorMessage);
}

async function withServer(options, fn) {
  const server = await startBrowserPopoutServer(options);
  try {
    return await fn(server);
  } finally {
    await stopBrowserPopoutServer(server);
  }
}

test('start and stop browser pop-out server on loopback', async () => {
  const server = await startBrowserPopoutServer({});

  try {
    assert.equal(server.host, '127.0.0.1');
    assert.equal(typeof server.port, 'number');
    assert.ok(server.port > 0);

    const response = await requestText(server.pageUrl);
    assert.equal(response.statusCode, 200);
    assert.match(response.body, /Flagship Foundry Browser Pop-out/);
    assert.match(response.body, /local extension bridge/);
  } finally {
    await stopBrowserPopoutServer(server);
  }

  assert.equal(server.httpServer.listening, false);
  await assert.rejects(
    () => requestText(`http://127.0.0.1:${server.port}/?token=${encodeURIComponent(server.token)}`),
    /ECONNREFUSED|ECONNRESET|socket hang up|connect/i
  );
});

test('invalid browser pop-out token is rejected on upgrade', async () => {
  await withServer({}, async (server) => {
    const outcome = await openWebSocketUpgrade({
      port: server.port,
      path: server.webSocketPath,
      token: 'wrong-token'
    });

    assert.equal(outcome.res.statusCode, 401);
    assert.match(outcome.body, /Invalid browser pop-out token/);
  });
});

test('theme stylesheet is token-gated and served as css', async () => {
  await withServer({}, async (server) => {
    const unauthorized = await requestText(`http://127.0.0.1:${server.port}/theme.css`);
    assert.equal(unauthorized.statusCode, 401);
    assert.match(unauthorized.body, /Invalid browser pop-out token/);

    const authorized = await requestText(server.themeUrl);
    assert.equal(authorized.statusCode, 200);
    assert.match(String(authorized.headers['content-type']), /^text\/css\b/);
    assert.match(authorized.body, /--vscode-editor-background:/);
    assert.match(authorized.body, /\.card/);
    assert.match(authorized.body, /\.sidebar/);
    assert.match(authorized.body, /button/);
  });
});

test('command and response framing round-trips over websocket', async () => {
  const schema = await loadSchema();
  const ajv = new Ajv2020({ strict: false });
  ajv.addFormat('date-time', true);
  const validate = ajv.compile(schema);

  const observedCommands = [];

  await withServer(
    {
      onCommand({ message }) {
        observedCommands.push(message);
        return {
          summary: `handled ${message.action}`,
          details: {
            action: message.action,
            payload: message.payload
          },
          metadata: {
            requestId: message.requestId
          }
        };
      }
    },
    async (server) => {
      const upgrade = await openWebSocketUpgrade({
        port: server.port,
        path: server.webSocketPath,
        token: server.token
      });

      assert.equal(upgrade.res.statusCode, 101);
      assert.equal(upgrade.head.length, 0);

      const handshake = {
        type: 'handshake',
        protocolVersion: '1',
        token: server.token,
        clientId: 'browser-session-1',
        timestamp: '2026-04-10T12:00:00.000Z'
      };

      upgrade.socket.write(encodeBrowserPopoutClientTextFrame(JSON.stringify(handshake)));

      const command = {
        type: 'command',
        requestId: 'req-001',
        action: 'export-log',
        timestamp: '2026-04-10T12:00:05.000Z',
        payload: {
          scope: 'all'
        }
      };

      upgrade.socket.write(encodeBrowserPopoutClientTextFrame(JSON.stringify(command)));

      const frame = await readServerTextFrame(upgrade.socket);
      const response = JSON.parse(frame.payload);

      assert.equal(validate(response), true, JSON.stringify(validate.errors));
      assert.equal(response.type, 'response');
      assert.equal(response.requestId, 'req-001');
      assert.equal(response.status, 'ok');
      assert.equal(response.result.summary, 'handled export-log');
      assert.equal(response.result.details.action, 'export-log');
      assert.equal(response.result.details.payload.scope, 'all');
      assert.equal(observedCommands.length, 1);
      assert.equal(observedCommands[0].requestId, 'req-001');
      assert.equal(observedCommands[0].action, 'export-log');

      upgrade.socket.destroy();
      await once(upgrade.socket, 'close');
    }
  );
});

test('broadcastState sends state updates only to authenticated websocket clients', async () => {
  const schema = await loadSchema();
  const ajv = new Ajv2020({ strict: false });
  ajv.addFormat('date-time', true);
  const validate = ajv.compile(schema);

  await withServer({}, async (server) => {
    const authenticated = await openWebSocketUpgrade({
      port: server.port,
      path: server.webSocketPath,
      token: server.token
    });
    const unauthenticated = await openWebSocketUpgrade({
      port: server.port,
      path: server.webSocketPath,
      token: server.token
    });

    assert.equal(authenticated.res.statusCode, 101);
    assert.equal(unauthenticated.res.statusCode, 101);

    const handshake = {
      type: 'handshake',
      protocolVersion: '1',
      token: server.token,
      clientId: 'browser-session-authenticated',
      timestamp: '2026-04-10T12:00:00.000Z'
    };

    authenticated.socket.write(encodeBrowserPopoutClientTextFrame(JSON.stringify(handshake)));

    await waitFor(
      () => Array.from(server.connections).some((connection) => connection.clientId === 'browser-session-authenticated'),
      500,
      'Timed out waiting for authenticated websocket client'
    );

    const delivered = server.broadcastState({
      connectionStatus: 'connected',
      activeView: 'operator-panel'
    });

    assert.equal(delivered, 1);

    const frame = await readServerTextFrameWithTimeout(authenticated.socket, 500);
    const message = JSON.parse(frame.payload);

    assert.equal(validate(message), true, JSON.stringify(validate.errors));
    assert.equal(message.type, 'state-update');
    assert.equal(message.state.connectionStatus, 'connected');
    assert.equal(message.state.activeView, 'operator-panel');

    await assert.rejects(
      () => readServerTextFrameWithTimeout(unauthenticated.socket, 200),
      /Timed out waiting for server frame/
    );

    authenticated.socket.on('error', () => {});
    unauthenticated.socket.on('error', () => {});
    authenticated.socket.destroy();
    unauthenticated.socket.destroy();
    await Promise.all([
      once(authenticated.socket, 'close'),
      once(unauthenticated.socket, 'close')
    ]);
  });
});
