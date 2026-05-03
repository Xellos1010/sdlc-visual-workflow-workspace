import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaRoot = path.resolve(__dirname, '../schemas');

const schemaFiles = [
  'workspace-target.schema.json',
  'context-cart.schema.json',
  'requirement-refinement-session.schema.json',
  'visual-artifact.schema.json',
  'execution-budget-snapshot.schema.json'
];

async function loadSchema(schemaFile) {
  return JSON.parse(await readFile(path.join(schemaRoot, schemaFile), 'utf8'));
}

test('operator surface schemas compile against draft 2020-12', async () => {
  for (const schemaFile of schemaFiles) {
    const schema = await loadSchema(schemaFile);
    const ajv = new Ajv2020({ strict: false });

    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.doesNotThrow(() => ajv.compile(schema));
  }
});

test('operator surface example payloads validate', async () => {
  const schemaMap = Object.fromEntries(
    await Promise.all(schemaFiles.map(async (schemaFile) => [schemaFile, await loadSchema(schemaFile)]))
  );

  const ajv = new Ajv2020({ strict: false });
  const validators = Object.fromEntries(
    Object.entries(schemaMap).map(([schemaFile, schema]) => [schemaFile, ajv.compile(schema)])
  );

  const workspaceTarget = {
    targetId: 'target:web-automation-workspace',
    workspaceRoot: '/Users/evan/Workspaces/Web Automation Workspace',
    displayName: 'Web Automation Workspace',
    hostKind: 'cursor',
    bindingMode: 'single-root',
    source: 'active-workspace',
    selectedAt: '2026-04-02T23:59:00.000Z',
    status: 'active',
    selectionEvidence: ['workspaceFolders[0]']
  };

  const contextCart = {
    cartId: 'cart:workspace-bootstrap',
    workspaceTargetId: workspaceTarget.targetId,
    title: 'Workspace bootstrap context',
    status: 'ready',
    items: [
      {
        itemId: 'item:file:readme',
        kind: 'file',
        label: 'README',
        authority: 'workspace',
        path: 'README.md',
        selectedAt: '2026-04-02T23:59:00.000Z'
      },
      {
        itemId: 'item:note:operator-goal',
        kind: 'note',
        label: 'Operator goal',
        authority: 'manual',
        content: 'Use the extension as the SDLC cockpit.',
        selectedAt: '2026-04-02T23:59:00.000Z'
      }
    ],
    createdAt: '2026-04-02T23:59:00.000Z',
    updatedAt: '2026-04-02T23:59:00.000Z'
  };

  const refinementSession = {
    sessionId: 'refine:cursor-companion-v1',
    workspaceTargetId: workspaceTarget.targetId,
    contextCartId: contextCart.cartId,
    objective: 'Turn cursor-companion into the extension-first SDLC cockpit.',
    status: 'ready',
    definitionOfReady: {
      status: 'ready',
      checklist: [
        {
          id: 'dor-scope',
          label: 'Scope is explicit',
          status: 'met'
        }
      ],
      blockingItems: []
    },
    knowledgeGaps: [
      {
        id: 'gap-windowing',
        title: 'Detached window support in the host editor',
        severity: 'medium',
        recommendedAction: 'Use host-supported new-window behavior first.',
        resolved: false
      }
    ],
    unresolvedQuestions: [
      {
        id: 'question-billing',
        question: 'Should usage posture be advisory or invoice-grade in v1?',
        status: 'deferred'
      }
    ],
    acceptanceCriteria: [
      'Companion resolves a workspace target before plan actions.'
    ],
    risks: [
      'Workspace targeting could drift in multi-root sessions.'
    ],
    constraints: [
      'Execution remains approval-gated.'
    ],
    createdAt: '2026-04-02T23:59:00.000Z',
    updatedAt: '2026-04-02T23:59:00.000Z'
  };

  const visualArtifact = {
    artifactId: 'artifact:c4-context:cursor-companion',
    workspaceTargetId: workspaceTarget.targetId,
    kind: 'c4-context',
    title: 'Cursor Companion System Context',
    representation: 'mermaid',
    content: {
      body: 'C4Context\\n  title System Context: Cursor Companion',
      mimeType: 'text/x-mermaid'
    },
    sourceRefs: [
      {
        kind: 'file',
        ref: 'apps/flagship-foundry/apps/cursor-companion/extension.js',
        label: 'extension.js'
      }
    ],
    createdAt: '2026-04-02T23:59:00.000Z',
    status: 'generated'
  };

  const executionBudgetSnapshot = {
    snapshotId: 'budget:workspace-bootstrap',
    workspaceTargetId: workspaceTarget.targetId,
    advisoryStatus: 'informational',
    createdAt: '2026-04-02T23:59:00.000Z',
    usageWindow: {
      startedAt: '2026-04-02T00:00:00.000Z',
      endedAt: '2026-04-02T23:59:00.000Z'
    },
    defaultRoute: {
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      taskClass: 'verification',
      tier: 'balanced_reasoner',
      fallbackProvider: null
    },
    providers: [
      {
        providerId: 'provider:anthropic-cloud',
        displayName: 'Anthropic Cloud',
        riskFit: 'critical',
        health: 'healthy',
        configured: true,
        usage: {
          promptTokens: 2000,
          completionTokens: 500,
          totalTokens: 2500
        },
        thresholds: {
          unit: 'tokens',
          softLimit: 10000,
          hardLimit: 20000
        }
      }
    ],
    adapters: [
      {
        adapterId: 'adapter:codex-cli',
        displayName: 'Codex CLI Adapter',
        transport: 'cli',
        availability: 'available',
        supportsMcp: true
      }
    ],
    connectors: [
      {
        connectorId: 'connector:github',
        displayName: 'GitHub',
        status: 'connected'
      }
    ],
    warnings: []
  };

  const cases = [
    ['workspace-target.schema.json', workspaceTarget],
    ['context-cart.schema.json', contextCart],
    ['requirement-refinement-session.schema.json', refinementSession],
    ['visual-artifact.schema.json', visualArtifact],
    ['execution-budget-snapshot.schema.json', executionBudgetSnapshot]
  ];

  for (const [schemaFile, value] of cases) {
    const validate = validators[schemaFile];
    assert.equal(validate(value), true, `${schemaFile}: ${JSON.stringify(validate.errors)}`);
  }
});
