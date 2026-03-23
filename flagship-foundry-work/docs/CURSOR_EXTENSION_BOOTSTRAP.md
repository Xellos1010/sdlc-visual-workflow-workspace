# Cursor Companion Bootstrap

The first editor surface is a VS Code-compatible companion intended to run inside Cursor while the control plane stays editor-agnostic.

## What the companion does

- starts the local control plane from the current workspace;
- imports the current workspace into Foundry;
- ingests the seed knowledge manifest;
- runs gap analysis against the imported ecosystem;
- creates draft plans from a short objective;
- opens a focused blast-radius drilldown view;
- approves plans or starts runs;
- pauses, resumes, and stops the latest run.

## Why this is the right first surface

It gives you plan visibility, knowledge quality feedback, and execution controls inside the editor you are already using, while preserving the deeper long-term path toward a dedicated orchestration shell.

## Extension folder

- `apps/cursor-companion/package.json`
- `apps/cursor-companion/extension.js`

Install the extension from that folder in a VS Code-compatible environment and point it at the same workspace that contains the Foundry control plane.
