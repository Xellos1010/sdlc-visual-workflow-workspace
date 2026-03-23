# Flagship Foundry `extension.js` regeneration

This starter file is designed for Cursor / VS Code style extensions and adds:

- Mermaid diagram rendering inside the control panel.
- External popout diagram viewer via a local HTTP server, so the diagram can be moved to another screen.
- Local plan + task list persistence at `.foundry/tasks/current-plan.json`.
- Start / watch / pause / resume / stop buttons per task.
- Claude subagent scaffolding into `.claude/agents/`.
- `.cursor/mcp.json` bootstrap for a local Foundry MCP server entry.

## Important note about Claude task start

The extension supports two modes:

1. **Prompt-only mode**: no runtime command configured. Start generates a prompt file and log location so you can run Claude manually.
2. **Configured runtime mode**: set `flagshipFoundry.agentCommandTemplate` to a shell command template.

Supported placeholders:

- `{workspaceRoot}`
- `{agent}`
- `{taskId}`
- `{title}`
- `{promptFile}`

Example template shape:

```text
claude --agent {agent} < {promptFile}
```

Adjust that to your installed Claude Code workflow.

## Suggested commands to contribute in package.json

```json
{
  "contributes": {
    "commands": [
      { "command": "flagshipFoundry.openControlCenter", "title": "Flagship Foundry: Open Control Center" },
      { "command": "flagshipFoundry.popoutCurrentDiagram", "title": "Flagship Foundry: Pop Out Current Diagram" },
      { "command": "flagshipFoundry.scaffoldClaudeSubagents", "title": "Flagship Foundry: Scaffold Claude Subagents" },
      { "command": "flagshipFoundry.ensureCursorMcp", "title": "Flagship Foundry: Ensure Cursor MCP Config" }
    ]
  }
}
```
