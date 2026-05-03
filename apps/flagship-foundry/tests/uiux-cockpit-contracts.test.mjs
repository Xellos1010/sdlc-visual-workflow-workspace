import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaRoot = path.resolve(__dirname, '../schemas');

const schemaFiles = [
  'view-registry.schema.json',
  'saved-layout.schema.json',
  'inspector-selection.schema.json',
  'chat-command-session.schema.json',
  'operator-quick-action.schema.json'
];

async function loadSchema(schemaFile) {
  return JSON.parse(await readFile(path.join(schemaRoot, schemaFile), 'utf8'));
}

test('uiux cockpit schemas compile against draft 2020-12', async () => {
  for (const schemaFile of schemaFiles) {
    const schema = await loadSchema(schemaFile);
    const ajv = new Ajv2020({ strict: false });
    ajv.addFormat('date-time', true);

    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.doesNotThrow(() => ajv.compile(schema));
  }
});

test('uiux cockpit example payloads validate', async () => {
  const schemaMap = Object.fromEntries(
    await Promise.all(schemaFiles.map(async (schemaFile) => [schemaFile, await loadSchema(schemaFile)]))
  );

  const ajv = new Ajv2020({ strict: false });
  ajv.addFormat('date-time', true);

  const validators = Object.fromEntries(
    Object.entries(schemaMap).map(([schemaFile, schema]) => [schemaFile, ajv.compile(schema)])
  );

  const viewRegistry = {
    registryId: 'registry:flagship-foundry-cockpit',
    stateKind: 'declared',
    version: 1,
    workspaceTargetId: 'target:flagship-foundry',
    peerViews: ['map', 'board', 'timeline', 'diff', 'inspector', 'evidence', 'chat', 'pseudocode', 'session-board'],
    objectTypes: [
      {
        id: 'ecosystem',
        preferredViews: ['map', 'board', 'timeline'],
        questions: ['What exists?', 'What is active now?'],
        drillDownTargets: [
          {
            targetType: 'subsystem',
            viaView: 'map',
            label: 'Open subsystem'
          }
        ]
      },
      {
        id: 'work-order',
        preferredViews: ['board', 'inspector', 'timeline'],
        questions: ['What is blocked?', 'What approval is needed?'],
        drillDownTargets: [
          {
            targetType: 'run-session',
            viaView: 'timeline',
            label: 'Open active run'
          },
          {
            targetType: 'evidence-bundle',
            viaView: 'evidence',
            label: 'Open evidence'
          }
        ]
      }
    ],
    desktopShell: {
      topBar: ['workspace target', 'global search/command palette', 'approvals', 'alerts'],
      leftRail: ['home', 'context', 'architecture', 'plan', 'runs', 'evidence', 'settings'],
      centerCanvasPeerViews: ['map', 'board', 'timeline', 'diff'],
      rightInspector: ['selection summary', 'valid actions', 'state', 'links'],
      bottomUtility: ['logs', 'evidence', 'continuity', 'chat', 'agent suggestions']
    },
    savedLayoutIds: ['layout:architect', 'layout:planner', 'layout:operator', 'layout:investigator'],
    drillDownPath: [
      {
        stepId: 'ecosystem',
        label: 'Ecosystem',
        objectTypeId: 'ecosystem',
        viaView: 'map'
      },
      {
        stepId: 'subsystem',
        label: 'Subsystem',
        objectTypeId: 'subsystem',
        viaView: 'map'
      },
      {
        stepId: 'module',
        label: 'Module',
        objectTypeId: 'module',
        viaView: 'inspector'
      },
      {
        stepId: 'pseudocode',
        label: 'Pseudocode',
        objectTypeId: null,
        viaView: 'pseudocode'
      },
      {
        stepId: 'evidence',
        label: 'Evidence',
        objectTypeId: 'evidence-bundle',
        viaView: 'evidence'
      }
    ],
    createdAt: '2026-04-10T20:00:00.000Z',
    updatedAt: '2026-04-10T20:00:00.000Z'
  };

  const savedLayout = {
    layoutId: 'layout:planner',
    stateKind: 'declared',
    userScope: {
      scopeKind: 'workspace-user',
      userId: 'user:operator',
      workspaceTargetId: 'target:flagship-foundry'
    },
    title: 'Planner',
    role: 'planner',
    status: 'saved',
    version: 2,
    reversible: true,
    previousLayoutId: 'layout:planner:v1',
    focusSummary: 'board + inspector + quick actions',
    selectedObjectRef: {
      objectType: 'work-order',
      objectId: 'WO-UX-006',
      label: 'Schema and view-registry extensions'
    },
    topBar: ['workspace target', 'command palette', 'approvals'],
    leftRail: ['home', 'plan', 'runs', 'evidence'],
    centerCanvas: {
      activeViewId: 'board',
      availableViewIds: ['board', 'timeline', 'diff'],
      compareViewId: 'timeline'
    },
    rightInspector: ['selection summary', 'valid actions', 'links'],
    bottomUtility: ['logs', 'chat'],
    createdAt: '2026-04-10T20:00:00.000Z',
    updatedAt: '2026-04-10T20:05:00.000Z'
  };

  const inspectorSelection = {
    selectionId: 'selection:wo-ux-006',
    stateKind: 'observed',
    workspaceTargetId: 'target:flagship-foundry',
    selectionSource: 'board',
    selectedViewId: 'inspector',
    primarySelection: {
      objectType: 'work-order',
      objectId: 'WO-UX-006',
      label: 'Schema and view-registry extensions for UI/UX cockpit'
    },
    secondarySelections: [
      {
        objectType: 'evidence-bundle',
        objectId: 'evidence:uiux-baseline',
        label: 'UI/UX baseline evidence'
      }
    ],
    breadcrumbs: [
      {
        stepKind: 'ecosystem',
        label: 'Flagship Foundry',
        objectRef: {
          objectType: 'ecosystem',
          objectId: 'ecosystem:flagship-foundry',
          label: 'Flagship Foundry'
        }
      },
      {
        stepKind: 'work-order',
        label: 'WO-UX-006',
        objectRef: {
          objectType: 'work-order',
          objectId: 'WO-UX-006',
          label: 'Schema and view-registry extensions for UI/UX cockpit'
        }
      }
    ],
    drillDown: {
      currentStep: 'work-order',
      nextTargets: [
        {
          objectType: 'run-session',
          objectId: 'run:uiux-contracts',
          label: 'UI/UX contracts run'
        },
        {
          objectType: 'evidence-bundle',
          objectId: 'evidence:uiux-baseline',
          label: 'UI/UX baseline evidence'
        }
      ]
    },
    validActions: [
      {
        actionId: 'action:open-evidence',
        title: 'Open evidence bundle',
        actionKind: 'navigation',
        approvalSensitivity: 'none'
      },
      {
        actionId: 'action:start-run',
        title: 'Start run from approved plan',
        actionKind: 'command',
        approvalSensitivity: 'approval-required'
      }
    ],
    currentState: {
      status: 'blocked',
      summary: 'Waiting for schema implementation and validation.',
      declaredStateRef: {
        objectType: 'work-order',
        objectId: 'WO-UX-006',
        label: 'Schema and view-registry extensions for UI/UX cockpit'
      },
      observedStateRef: {
        objectType: 'run-session',
        objectId: 'run:uiux-contracts',
        label: 'UI/UX contracts run'
      }
    },
    observedAt: '2026-04-10T20:06:00.000Z',
    createdAt: '2026-04-10T20:05:00.000Z',
    updatedAt: '2026-04-10T20:06:00.000Z'
  };

  const chatCommandSession = {
    sessionId: 'chat-session:launch-wo-ux-006',
    stateKind: 'declared',
    workspaceTargetId: 'target:flagship-foundry',
    source: 'command-palette',
    prompt: 'Start WO-UX-006 implementation prep.',
    objective: 'Prepare schema contract work for the UI/UX cockpit.',
    status: 'ready',
    command: {
      verb: 'start-work-order',
      title: 'Start WO-UX-006',
      controlKind: 'command',
      targetRefs: [
        {
          objectType: 'work-order',
          objectId: 'WO-UX-006',
          label: 'Schema and view-registry extensions for UI/UX cockpit'
        }
      ],
      arguments: {
        mode: 'builder'
      },
      requiresConfirmation: true
    },
    approvalSensitivity: 'approval-required',
    evidenceImpact: 'execution-affecting',
    result: null,
    createdAt: '2026-04-10T20:07:00.000Z',
    updatedAt: '2026-04-10T20:07:00.000Z'
  };

  const quickAction = {
    actionId: 'action:jump-active-run',
    stateKind: 'declared',
    title: 'Jump to active run',
    description: 'Open the currently active run session from any cockpit surface.',
    actionKind: 'navigation',
    placement: ['top-bar', 'quick-action-strip'],
    urgency: 'high',
    frequency: 'high',
    approvalSensitivity: 'none',
    targetObjectTypes: ['run-session'],
    toggleSettingKey: null,
    visibility: {
      requiresSelection: false,
      allowedSelectionStates: ['active', 'ready', 'warning'],
      hiddenWhenBlocked: false
    },
    createdAt: '2026-04-10T20:08:00.000Z',
    updatedAt: '2026-04-10T20:08:00.000Z'
  };

  const cases = [
    ['view-registry.schema.json', viewRegistry],
    ['saved-layout.schema.json', savedLayout],
    ['inspector-selection.schema.json', inspectorSelection],
    ['chat-command-session.schema.json', chatCommandSession],
    ['operator-quick-action.schema.json', quickAction]
  ];

  for (const [schemaFile, value] of cases) {
    const validate = validators[schemaFile];
    assert.equal(validate(value), true, `${schemaFile}: ${JSON.stringify(validate.errors)}`);
  }
});
