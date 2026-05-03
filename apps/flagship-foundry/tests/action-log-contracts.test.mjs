import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaRoot = path.resolve(__dirname, '../schemas');
const schemaFile = 'action-log-entry.schema.json';

async function loadSchema() {
  return JSON.parse(await readFile(path.join(schemaRoot, schemaFile), 'utf8'));
}

test('action log entry schema compiles against draft 2020-12', async () => {
  const schema = await loadSchema();
  const ajv = new Ajv2020({ strict: false });
  ajv.addFormat('date-time', true);

  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.doesNotThrow(() => ajv.compile(schema));
});

test('action log entry payloads validate', async () => {
  const schema = await loadSchema();
  const ajv = new Ajv2020({ strict: false });
  ajv.addFormat('date-time', true);
  const validate = ajv.compile(schema);

  const okEntry = {
    id: 'action-log:0001',
    action: 'pop-out-window',
    timestamp: '2026-04-10T12:00:00.000Z',
    status: 'ok',
    result: {
      summary: 'Overlay moved to ViewColumn.Beside',
      details: {
        viewColumn: 'Beside'
      }
    },
    durationMs: 18
  };

  const errorEntry = {
    id: 'action-log:0002',
    action: 'open-in-browser',
    timestamp: '2026-04-10T12:01:00.000Z',
    status: 'error',
    error: {
      name: 'Error',
      message: 'Browser relay server failed to start',
      details: {
        port: 0
      }
    },
    durationMs: 9
  };

  assert.equal(validate(okEntry), true, JSON.stringify(validate.errors));
  assert.equal(validate(errorEntry), true, JSON.stringify(validate.errors));
});
