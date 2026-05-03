import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaRoot = path.resolve(__dirname, '../schemas');
const schemaFile = 'browser-popout-message.schema.json';
const require = createRequire(import.meta.url);
const { validateBrowserPopoutMessage } = require('../apps/cursor-companion/browser-popout-server.js');

async function loadSchema() {
  return JSON.parse(await readFile(path.join(schemaRoot, schemaFile), 'utf8'));
}

test('browser pop-out message schema compiles against draft 2020-12', async () => {
  const schema = await loadSchema();
  const ajv = new Ajv2020({ strict: false });
  ajv.addFormat('date-time', true);

  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.doesNotThrow(() => ajv.compile(schema));
});

test('browser pop-out handshake, relay payloads, and state updates validate', async () => {
  const schema = await loadSchema();
  const ajv = new Ajv2020({ strict: false });
  ajv.addFormat('date-time', true);
  const validate = ajv.compile(schema);

  const handshake = {
    type: 'handshake',
    protocolVersion: '1',
    token: 'token-abc123',
    clientId: 'browser-session-1',
    timestamp: '2026-04-10T12:00:00.000Z'
  };

  const command = {
    type: 'command',
    requestId: 'req-001',
    action: 'export-log',
    timestamp: '2026-04-10T12:00:05.000Z',
    payload: {
      scope: 'all'
    }
  };

  const response = {
    type: 'response',
    requestId: 'req-001',
    status: 'ok',
    timestamp: '2026-04-10T12:00:05.120Z',
    result: {
      summary: 'Export queued',
      details: {
        entries: 500
      }
    }
  };

  const stateUpdate = {
    type: 'state-update',
    timestamp: '2026-04-10T12:00:06.000Z',
    state: {
      connectionStatus: 'connected',
      activeView: 'operator-panel'
    }
  };

  assert.equal(validate(handshake), true, JSON.stringify(validate.errors));
  assert.equal(validate(command), true, JSON.stringify(validate.errors));
  assert.equal(validate(response), true, JSON.stringify(validate.errors));
  assert.equal(validate(stateUpdate), true, JSON.stringify(validate.errors));
});

test('browser pop-out state-update schema rejects malformed payloads', async () => {
  const schema = await loadSchema();
  const ajv = new Ajv2020({ strict: false });
  ajv.addFormat('date-time', true);
  const validate = ajv.compile(schema);

  const missingState = {
    type: 'state-update',
    timestamp: '2026-04-10T12:00:06.000Z'
  };

  const invalidStateType = {
    type: 'state-update',
    timestamp: '2026-04-10T12:00:06.000Z',
    state: 'not-an-object'
  };

  const extraField = {
    type: 'state-update',
    timestamp: '2026-04-10T12:00:06.000Z',
    state: {
      ready: true
    },
    requestId: 'unexpected'
  };

  assert.equal(validate(missingState), false);
  assert.equal(validate(invalidStateType), false);
  assert.equal(validate(extraField), false);
});

test('browser pop-out runtime validator accepts and rejects state-update messages', () => {
  const validStateUpdate = {
    type: 'state-update',
    timestamp: '2026-04-10T12:00:06.000Z',
    state: {
      ready: true
    }
  };

  const missingTimestamp = {
    type: 'state-update',
    state: {
      ready: true
    }
  };

  const invalidStateType = {
    type: 'state-update',
    timestamp: '2026-04-10T12:00:06.000Z',
    state: null
  };

  assert.deepEqual(validateBrowserPopoutMessage(validStateUpdate), {
    valid: true,
    errors: []
  });
  assert.equal(validateBrowserPopoutMessage(missingTimestamp).valid, false);
  assert.equal(validateBrowserPopoutMessage(invalidStateType).valid, false);
});
