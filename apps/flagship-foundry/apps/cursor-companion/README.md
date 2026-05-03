# Flagship Foundry Cursor Companion

A Cursor and VS Code companion surface for Flagship Foundry.

## Capabilities

- Start the local Foundry control plane
- Import the current workspace into the ecosystem graph
- Create plans from the current workspace
- Toggle auto approval and auto start behavior
- Approve plans manually
- Start, pause, resume, and stop simulated runs
- Pop the companion into a new host window while keeping the same workspace binding and overlay state
- Record each overlay action into a structured in-memory action log
- Export the full action log or just the last action as JSON through the editor save dialog
- Open an opt-in loopback browser pop-out backed by a token-gated local relay

## Install during development

1. Open the `apps/cursor-companion/` folder as an extension project in a VS Code compatible environment.
2. Run the extension host for development.
3. Open the Foundry repository in Cursor.
4. Run `Flagship Foundry: Open Orchestration Overlay`.

### Watch mode (API + extension workflow)

From the monorepo root, `pnpm exec nx run flagship-foundry:companion:watch` (or `nx run cursor-companion:watch`) starts:

- **Native control plane** with `node --watch` so server changes restart automatically.
- A **file watcher** on companion `*.js` that prints when to run **Developer: Reload Window** in the Extension Development Host (editors do not hot-reload extension code).

Variants: `companion:watch:docker` / `nx run cursor-companion:watch-docker` (debounced `docker compose restart control-plane` on API file changes), and `:serve` / `watch-serve` targets to skip launching the Extension Host.

### Debug / observability (Output panel)

1. **View → Output** (or **Toggle Output** from the Command Palette).
2. In the **dropdown** on the right, choose **Flagship Foundry Companion** (not “Log (Extension Host)” unless you want raw extension-host noise).
3. Or run **Flagship Foundry: Show Companion Log (Output)** from the Command Palette to focus that channel.

Pop-out and overlay actions write timestamped lines there. If a button does nothing, check for **WARN** (e.g. no workspace folder) or **ERROR** after **Pop-out: vscode.openFolder finished** — some hosts treat reopening the same folder as a no-op.

For lower-level debugging, in the **Extension Development Host** window use **Help → Toggle Developer Tools** and inspect the **Console** tab.

### Structured action log

The overlay includes an **Observability** card:

- **Export Log** writes the whole 500-entry ring buffer to a JSON file.
- **Export Last Action** writes only the newest structured entry.
- The latest entry summary is mirrored in-panel and every action is also mirrored to the Output channel.

Each action entry records:

- `id`
- `action`
- `timestamp`
- `status`
- `result` or `error`
- `durationMs`

### Browser pop-out

The **Windowing** card now exposes an opt-in **Open In Browser** path in addition to the host-window pop-out flow.

- The relay binds to `127.0.0.1` only.
- A random token is required in both the page URL and the WebSocket handshake.
- Browser commands are proxied back to the extension host; successful state-changing commands trigger a page reload so the browser view rehydrates from fresh extension state.
- The host-window flow remains the default posture.

## Settings

- `flagshipFoundry.controlPlaneUrl`
- `flagshipFoundry.autoApproveDraftPlans`
- `flagshipFoundry.autoStartApprovedPlans`
