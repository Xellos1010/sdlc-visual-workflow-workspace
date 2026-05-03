import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaRoot = path.resolve(__dirname, '../../../../schemas');

test('bridge schemas are valid against draft 2020-12 meta-schema', async () => {
  const provenanceSchema = JSON.parse(await readFile(path.join(schemaRoot, 'provenance-record.schema.json'), 'utf8'));

  for (const schemaFile of [
    'provenance-record.schema.json',
    'import-bridge-config.schema.json',
    'chatgpt-workspace-source.schema.json'
  ]) {
    const ajv = new Ajv2020({ strict: false });
    if (schemaFile !== 'provenance-record.schema.json') {
      ajv.addSchema(provenanceSchema);
    }
    const value = JSON.parse(await readFile(path.join(schemaRoot, schemaFile), 'utf8'));
    assert.equal(value.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.doesNotThrow(() => ajv.compile(value));
  }
});
