// runtime-adapters/src/registry.mjs

export const providers = {
  localShell: {
    id: "adapter:local-shell",
    name: "Local Shell",
    role: "bounded-local-executor",
    supportsMCP: false,
    isolationMode: "run-scoped-workspace",
    defaultWritePolicy: "workspace-only"
  },
  claudeCode: {
    id: "adapter-claude-code",
    name: "Claude Code",
    role: "spec-authoring-review",
    supportsMCP: true
  },
  cursor: {
    id: "adapter-cursor",
    name: "Cursor",
    role: "interactive-design-cockpit",
    supportsMCP: true
  },
  codex: {
    id: "adapter-codex",
    name: "Codex",
    role: "disciplined-executor",
    supportsMCP: true
  },
  openclaw: {
    id: "adapter-openclaw",
    name: "OpenClaw",
    role: "optional-plugin",
    supportsMCP: false
  },
  ralph: {
    id: "adapter-ralph",
    name: "Ralph",
    role: "fresh-context-execution-loop",
    supportsMCP: false
  }
};

export function getAdapter(adapterId) {
  const provider = Object.values(providers).find(p => p.id === adapterId);
  if (!provider) {
    throw new Error(`Adapter ${adapterId} not found`);
  }
  return provider;
}

export function listAdapters() {
  return Object.values(providers);
}

// Interfaces for invoking runtimes would be abstracted here.
// e.g. runWithCursor(task), runWithClaudeCode(task)
