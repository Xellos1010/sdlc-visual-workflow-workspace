# Flagship Foundry Cursor Companion

A Cursor and VS Code companion surface for Flagship Foundry.

## Capabilities

- Start the local Foundry control plane
- Import the current workspace into the ecosystem graph
- Create plans from the current workspace
- Toggle auto approval and auto start behavior
- Approve plans manually
- Start, pause, resume, and stop simulated runs

## Install during development

1. Open the `apps/cursor-companion/` folder as an extension project in a VS Code compatible environment.
2. Run the extension host for development.
3. Open the Foundry repository in Cursor.
4. Run `Flagship Foundry: Open Orchestration Overlay`.

## Settings

- `flagshipFoundry.controlPlaneUrl`
- `flagshipFoundry.autoApproveDraftPlans`
- `flagshipFoundry.autoStartApprovedPlans`
