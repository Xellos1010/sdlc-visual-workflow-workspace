import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// Import Foundry capabilities
import { loadGraph, applyGraphPatches, saveGraph } from "../../../packages/core/src/graph-store.mjs";

const server = new Server(
  {
    name: "flagship-foundry-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "foundry://graph/current",
        name: "Current Ecosystem Graph",
        description: "The complete AST and system graph for the current ecosystem",
        mimeType: "application/json",
      }
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "foundry://graph/current") {
    // We assume default ecosystem ID for now, or it could be passed via context
    // Hardcoding 'web-automation-workspace' based on PROJECT_HANDOFF.md example
    const graph = await loadGraph("web-automation-workspace", "web-automation-workspace");
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(graph, null, 2),
        },
      ],
    };
  }
  throw new Error("Resource not found");
});

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
              items: {
                type: "object"
              }
            }
          },
          required: ["ecosystemId", "patches"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "apply-graph-patch") {
    const { ecosystemId, patches } = request.params.arguments;
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
  throw new Error("Tool not found");
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Foundry MCP Server running on stdio");
