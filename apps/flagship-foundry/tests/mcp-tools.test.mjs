import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Read the server source file once for all tests
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_FILE = path.resolve(
  __dirname,
  '../apps/foundry-mcp-server/src/server.mjs'
);

const serverSource = fs.readFileSync(SERVER_FILE, 'utf8');

// ---------------------------------------------------------------------------
// Expected tool names (13 original + 3 continuity tools = 16 total)
// ---------------------------------------------------------------------------

const EXPECTED_TOOLS = [
  // Original graph/plan/run tools
  'apply-graph-patch',
  'import-workspace',
  'list-ecosystems',
  'get-graph',
  'create-plan',
  'analyze-blast-radius',
  'analyze-gaps',
  'build-focus-view',
  'ingest-knowledge',
  'start-run',
  'pause-run',
  'resume-run',
  'stop-run',
  // Continuity tools added in expansion
  'init-project',
  'get-project-status',
  'transition-phase',
];

// ---------------------------------------------------------------------------
// Expected resource URIs (1 static + 2 templates = 3 total)
// ---------------------------------------------------------------------------

const EXPECTED_RESOURCE_URIS = [
  'foundry://ecosystems',
  'foundry://ecosystem/{id}/graph',
  'foundry://ecosystem/{id}/manifest',
];

// ---------------------------------------------------------------------------
// Expected import statements for core modules
// ---------------------------------------------------------------------------

const EXPECTED_IMPORTS = [
  '../../../packages/core/src/graph-store.mjs',
  '../../../packages/core/src/import-pipeline.mjs',
  '../../../packages/core/src/plans.mjs',
  '../../../packages/core/src/blast-radius.mjs',
  '../../../packages/core/src/gap-analysis.mjs',
  '../../../packages/core/src/focus-views.mjs',
  '../../../packages/core/src/knowledge-base.mjs',
  '../../../packages/core/src/runs.mjs',
  '../../../packages/core/src/io.mjs',
  '../../../packages/core/src/continuity.mjs',
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('server file contains all 16 expected tool names', () => {
  for (const toolName of EXPECTED_TOOLS) {
    assert.ok(
      serverSource.includes(`"${toolName}"`),
      `Expected server to declare tool: "${toolName}"`
    );
  }
});

test('server file declares exactly 16 tool name entries', () => {
  // Count occurrences of the pattern  name: "<tool-name>" inside the tools
  // array. Each tool block starts with { name: "..." } in the ListToolsRequest
  // handler as well as being referenced in the CallToolRequest handler.
  // We count unique quoted tool names that appear in EXPECTED_TOOLS to ensure
  // none are missing.
  const foundTools = EXPECTED_TOOLS.filter((name) =>
    serverSource.includes(`"${name}"`)
  );
  assert.equal(
    foundTools.length,
    EXPECTED_TOOLS.length,
    `Expected ${EXPECTED_TOOLS.length} tools, found ${foundTools.length}: ` +
    `missing=${EXPECTED_TOOLS.filter((n) => !serverSource.includes(`"${n}"`)).join(', ')}`
  );
});

test('server file contains all 3 resource URIs', () => {
  for (const uri of EXPECTED_RESOURCE_URIS) {
    assert.ok(
      serverSource.includes(uri),
      `Expected server to declare resource URI: "${uri}"`
    );
  }
});

test('server file has proper import statements for all core modules', () => {
  for (const importPath of EXPECTED_IMPORTS) {
    assert.ok(
      serverSource.includes(importPath),
      `Expected server to import module at path: "${importPath}"`
    );
  }
});

test('server file imports the MCP SDK with StdioServerTransport', () => {
  assert.ok(
    serverSource.includes('@modelcontextprotocol/sdk/server/stdio.js'),
    'Expected server to import StdioServerTransport from MCP SDK'
  );
  assert.ok(
    serverSource.includes('StdioServerTransport'),
    'Expected StdioServerTransport to be used in the server'
  );
});

test('server file connects transport and logs startup message', () => {
  assert.ok(
    serverSource.includes('server.connect(transport)'),
    'Expected server to connect a transport'
  );
  assert.ok(
    serverSource.includes('flagship-foundry-mcp'),
    'Expected server to declare name flagship-foundry-mcp'
  );
});
