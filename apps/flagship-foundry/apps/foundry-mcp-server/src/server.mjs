import fs from 'node:fs/promises';
import path from 'node:path';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// Import Foundry capabilities
import { loadGraph, applyGraphPatches, saveGraph } from "../../../packages/core/src/graph-store.mjs";
import { importWorkspace } from "../../../packages/core/src/import-pipeline.mjs";
import { createPlan } from "../../../packages/core/src/plans.mjs";
import { analyzeBlastRadius } from "../../../packages/core/src/blast-radius.mjs";
import { analyzeKnowledgeGaps } from "../../../packages/core/src/gap-analysis.mjs";
import { writeFocusView } from "../../../packages/core/src/focus-views.mjs";
import { ingestKnowledgeSources } from "../../../packages/core/src/knowledge-base.mjs";
import { createRunForPlan, transitionRun } from "../../../packages/core/src/runs.mjs";
import { repoRoot, readJson } from "../../../packages/core/src/io.mjs";
import { initProject, readState, transitionPhase, getResumeChecklist, getPhasePolicy, checkCompliance } from "../../../packages/core/src/continuity.mjs";

const server = new Server(
  {
    name: "flagship-foundry-mcp",
    version: "0.2.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ---------------------------------------------------------------------------
// Resources — static list
// ---------------------------------------------------------------------------

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "foundry://ecosystems",
        name: "All Ecosystems",
        description: "List of all known Foundry ecosystems",
        mimeType: "application/json",
      }
    ],
  };
});

// ---------------------------------------------------------------------------
// Resource templates — URI-pattern resources
// ---------------------------------------------------------------------------

server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
  return {
    resourceTemplates: [
      {
        uriTemplate: "foundry://ecosystem/{id}/graph",
        name: "Ecosystem Graph",
        description: "The complete node/edge graph for a given ecosystem",
        mimeType: "application/json",
      },
      {
        uriTemplate: "foundry://ecosystem/{id}/manifest",
        name: "Ecosystem Manifest",
        description: "The manifest metadata for a given ecosystem",
        mimeType: "application/json",
      }
    ],
  };
});

// ---------------------------------------------------------------------------
// Resource reads
// ---------------------------------------------------------------------------

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === "foundry://ecosystems") {
    const ecosystemsDir = path.join(repoRoot, 'state', 'ecosystems');
    let entries = [];
    try {
      entries = await fs.readdir(ecosystemsDir, { withFileTypes: true });
    } catch {
      // directory may not exist yet
    }
    const ids = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ ecosystems: ids }, null, 2),
        },
      ],
    };
  }

  const graphMatch = uri.match(/^foundry:\/\/ecosystem\/([^/]+)\/graph$/);
  if (graphMatch) {
    const ecosystemId = graphMatch[1];
    const graph = await loadGraph(ecosystemId, ecosystemId);
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(graph, null, 2),
        },
      ],
    };
  }

  const manifestMatch = uri.match(/^foundry:\/\/ecosystem\/([^/]+)\/manifest$/);
  if (manifestMatch) {
    const ecosystemId = manifestMatch[1];
    const manifestPath = path.join(repoRoot, 'state', 'ecosystems', ecosystemId, 'manifest.json');
    const manifest = await readJson(manifestPath);
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(manifest, null, 2),
        },
      ],
    };
  }

  throw new Error(`Resource not found: ${uri}`);
});

// ---------------------------------------------------------------------------
// Tools — list
// ---------------------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "apply-graph-patch",
        description: "Apply patches to the Foundry ecosystem graph",
        inputSchema: {
          type: "object",
          properties: {
            ecosystemId: {
              type: "string",
              description: "The ID of the ecosystem (e.g. web-automation-workspace)"
            },
            patches: {
              type: "array",
              description: "Array of patch objects { op, path, value }",
              items: { type: "object" }
            }
          },
          required: ["ecosystemId", "patches"]
        }
      },
      {
        name: "import-workspace",
        description: "Import or re-import a workspace into the Foundry graph store",
        inputSchema: {
          type: "object",
          properties: {
            importConfig: {
              type: "object",
              description: "Full import configuration object"
            }
          },
          required: ["importConfig"]
        }
      },
      {
        name: "list-ecosystems",
        description: "List all known ecosystem IDs from the state directory",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get-graph",
        description: "Load the node/edge graph for a given ecosystem",
        inputSchema: {
          type: "object",
          properties: {
            ecosystemId: {
              type: "string",
              description: "The ecosystem ID to load"
            }
          },
          required: ["ecosystemId"]
        }
      },
      {
        name: "create-plan",
        description: "Create a change plan from a change request",
        inputSchema: {
          type: "object",
          properties: {
            changeRequest: {
              type: "object",
              description: "Change request object (must include ecosystemId)"
            }
          },
          required: ["changeRequest"]
        }
      },
      {
        name: "analyze-blast-radius",
        description: "Analyze the blast radius for a query against an ecosystem graph",
        inputSchema: {
          type: "object",
          properties: {
            ecosystemId: {
              type: "string",
              description: "The ecosystem ID to analyze"
            },
            targetQuery: {
              type: "string",
              description: "Query string identifying the seed nodes"
            }
          },
          required: ["ecosystemId", "targetQuery"]
        }
      },
      {
        name: "analyze-gaps",
        description: "Analyze knowledge gaps for an ecosystem against a knowledge base",
        inputSchema: {
          type: "object",
          properties: {
            ecosystemId: {
              type: "string",
              description: "The ecosystem ID to analyze"
            },
            knowledgeBaseId: {
              type: "string",
              description: "The knowledge base ID to compare against"
            }
          },
          required: ["ecosystemId", "knowledgeBaseId"]
        }
      },
      {
        name: "build-focus-view",
        description: "Build and persist a focus view (Mermaid diagram + JSON) for a query",
        inputSchema: {
          type: "object",
          properties: {
            ecosystemId: {
              type: "string",
              description: "The ecosystem ID to build the view for"
            },
            query: {
              type: "string",
              description: "Query string identifying the focal nodes"
            }
          },
          required: ["ecosystemId", "query"]
        }
      },
      {
        name: "ingest-knowledge",
        description: "Ingest knowledge sources from a manifest into the knowledge base",
        inputSchema: {
          type: "object",
          properties: {
            manifest: {
              type: "object",
              description: "Knowledge source manifest object"
            }
          },
          required: ["manifest"]
        }
      },
      {
        name: "start-run",
        description: "Create a new run for a plan and immediately start it",
        inputSchema: {
          type: "object",
          properties: {
            planId: {
              type: "string",
              description: "The ID of the plan to run"
            }
          },
          required: ["planId"]
        }
      },
      {
        name: "pause-run",
        description: "Pause an active run",
        inputSchema: {
          type: "object",
          properties: {
            runId: {
              type: "string",
              description: "The ID of the run to pause"
            }
          },
          required: ["runId"]
        }
      },
      {
        name: "resume-run",
        description: "Resume a paused run",
        inputSchema: {
          type: "object",
          properties: {
            runId: {
              type: "string",
              description: "The ID of the run to resume"
            }
          },
          required: ["runId"]
        }
      },
      {
        name: "stop-run",
        description: "Stop a run",
        inputSchema: {
          type: "object",
          properties: {
            runId: {
              type: "string",
              description: "The ID of the run to stop"
            }
          },
          required: ["runId"]
        }
      },
      {
        name: "init-project",
        description: "Initialize a new project with SDLC continuity state",
        inputSchema: {
          type: "object",
          properties: {
            projectName: { type: "string", description: "Project identifier (used for directory name)" },
            objective: { type: "string", description: "The project objective or goal" }
          },
          required: ["projectName", "objective"]
        }
      },
      {
        name: "get-project-status",
        description: "Get the current SDLC phase, blockers, and done criteria for a project",
        inputSchema: {
          type: "object",
          properties: {
            projectName: { type: "string", description: "Project identifier" }
          },
          required: ["projectName"]
        }
      },
      {
        name: "transition-phase",
        description: "Transition a project to a new SDLC lifecycle phase",
        inputSchema: {
          type: "object",
          properties: {
            projectName: { type: "string", description: "Project identifier" },
            phase: { type: "string", description: "Target phase (discover, define, visualize, architect, plan, implement, verify, release, operate, diagnose, improve)" },
            notes: { type: "string", description: "Optional notes for the transition" }
          },
          required: ["projectName", "phase"]
        }
      },
      {
        name: "get-phase-policy",
        description: "Get the policy for the current phase of a project, including principles, agents, DoR/DoD, required artifacts, guardrail packs, and skills",
        inputSchema: {
          type: "object",
          properties: {
            projectName: { type: "string", description: "Project identifier" }
          },
          required: ["projectName"]
        }
      },
      {
        name: "check-compliance",
        description: "Check compliance of a project against its current phase requirements, comparing DoR/DoD criteria and required artifacts",
        inputSchema: {
          type: "object",
          properties: {
            projectName: { type: "string", description: "Project identifier" }
          },
          required: ["projectName"]
        }
      }
    ]
  };
});

// ---------------------------------------------------------------------------
// Tools — call dispatch
// ---------------------------------------------------------------------------

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "apply-graph-patch") {
    const { ecosystemId, patches } = args;
    try {
      const graph = await loadGraph(ecosystemId, ecosystemId);
      const patched = applyGraphPatches(graph, patches);
      await saveGraph(patched);
      return {
        content: [{ type: "text", text: `Successfully applied ${patches.length} patches to graph.` }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error applying patches: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "import-workspace") {
    const { importConfig } = args;
    try {
      const result = await importWorkspace(importConfig);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error importing workspace: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "list-ecosystems") {
    try {
      const ecosystemsDir = path.join(repoRoot, 'state', 'ecosystems');
      let entries = [];
      try {
        entries = await fs.readdir(ecosystemsDir, { withFileTypes: true });
      } catch {
        // directory may not exist yet
      }
      const ids = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
      return {
        content: [{ type: "text", text: JSON.stringify({ ecosystems: ids }, null, 2) }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error listing ecosystems: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "get-graph") {
    const { ecosystemId } = args;
    try {
      const graph = await loadGraph(ecosystemId, ecosystemId);
      return {
        content: [{ type: "text", text: JSON.stringify(graph, null, 2) }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error loading graph: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "create-plan") {
    const { changeRequest } = args;
    try {
      const plan = await createPlan(changeRequest);
      return {
        content: [{ type: "text", text: JSON.stringify(plan, null, 2) }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error creating plan: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "analyze-blast-radius") {
    const { ecosystemId, targetQuery } = args;
    try {
      const graph = await loadGraph(ecosystemId, ecosystemId);
      const result = analyzeBlastRadius(graph, targetQuery);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error analyzing blast radius: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "analyze-gaps") {
    const { ecosystemId, knowledgeBaseId } = args;
    try {
      const manifestPath = path.join(repoRoot, 'state', 'ecosystems', ecosystemId, 'manifest.json');
      const ecosystem = await readJson(manifestPath);
      const result = await analyzeKnowledgeGaps(ecosystem, knowledgeBaseId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error analyzing gaps: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "build-focus-view") {
    const { ecosystemId, query } = args;
    try {
      const graph = await loadGraph(ecosystemId, ecosystemId);
      const result = await writeFocusView(graph, query);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error building focus view: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "ingest-knowledge") {
    const { manifest } = args;
    try {
      const result = await ingestKnowledgeSources(manifest);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error ingesting knowledge: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "start-run") {
    const { planId } = args;
    try {
      const run = await createRunForPlan(planId);
      const started = await transitionRun(run.id, 'start');
      return {
        content: [{ type: "text", text: JSON.stringify(started, null, 2) }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error starting run: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "pause-run") {
    const { runId } = args;
    try {
      const result = await transitionRun(runId, 'pause');
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error pausing run: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "resume-run") {
    const { runId } = args;
    try {
      const result = await transitionRun(runId, 'resume');
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error resuming run: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "stop-run") {
    const { runId } = args;
    try {
      const result = await transitionRun(runId, 'stop');
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error stopping run: ${err.message}` }],
        isError: true
      };
    }
  }

  if (name === "init-project") {
    const { projectName, objective } = args;
    try {
      const state = await initProject(projectName, objective);
      return { content: [{ type: "text", text: JSON.stringify(state, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }

  if (name === "get-project-status") {
    const { projectName } = args;
    try {
      const state = await readState(projectName);
      return { content: [{ type: "text", text: JSON.stringify(state, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }

  if (name === "transition-phase") {
    const { projectName, phase, notes } = args;
    try {
      const state = await transitionPhase(projectName, phase, notes || '');
      return { content: [{ type: "text", text: JSON.stringify(state, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }

  if (name === "get-phase-policy") {
    const { projectName } = args;
    try {
      const policy = await getPhasePolicy(projectName);
      return { content: [{ type: "text", text: JSON.stringify(policy, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }

  if (name === "check-compliance") {
    const { projectName } = args;
    try {
      const report = await checkCompliance(projectName);
      return { content: [{ type: "text", text: JSON.stringify(report, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }

  throw new Error(`Tool not found: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Foundry MCP Server running on stdio");
