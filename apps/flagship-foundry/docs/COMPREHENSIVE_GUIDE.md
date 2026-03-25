# Flagship Foundry: Comprehensive End-to-End Guide

Welcome to **Flagship Foundry**, a graph-native Software Development Life Cycle (SDLC) control plane designed for Visual-Driven Development (VDD) with Human + AI orchestration.

This guide explains how the ecosystem works, the roles of each AI Agent, and the step-by-step order of operations to take a project from an initial idea to a fully verified, executed reality with minimal token cost and maximum reliability.

---

## 1. Core Philosophy: Visual-Driven Development

Flagship Foundry shifts the developer experience from "reading thousands of lines of code" to **visual traversal and system overview**.
You interact with your system via an interactive, split-pane IDE (the Cursor Companion). Diagrams are not just pictures—they are **executable indexes into design intent**.
When you click a node on the visual graph, you navigate directly to the code. When you approve a node, it becomes an executable task for an AI.

---

## 2. Architecture Topology

The Foundry ecosystem operates through the following interconnected layers:

1. **Foundry Control Plane (`apps/control-plane`)**: The brain of the operation. It maintains the system graph (AST), schemas, knowledge base, gap analysis, and the approval engine.
2. **Foundry MCP Server (`apps/foundry-mcp-server`)**: Exposes the Foundry Control Plane to external Runtimes (Claude Code, Cursor, Codex) using the standard Model Context Protocol.
3. **Model Gateway (`packages/model-gateway`)**: Normalizes all AI model requests. It routes high-reasoning tasks to Anthropic/MiniMax and low-cost execution tasks to a local SSH-tunneled model (Qwen3-Coder).
4. **Interactive Cockpit (`apps/cursor-companion`)**: The VS Code/Cursor extension that renders the dynamic Mermaid logic graph, highlights blast radii, and provides execution controls (Approve/Start/Pause/Stop).
5. **Ralph Execution Loop (`packages/core/src/ralph-`...)**: The autonomous executor loop that continuously processes bounded microtasks deterministically without reinventing the architecture.

---

## 3. The AI Agent Swarm (Roles)

Your development pipeline is fulfilled by a Swarm Consensus Model. Different models play different roles to ensure structural integrity:

*   **The Specifier (MiniMax / Claude):** Intake. Translates your human requirement into formal capability statements, constraints, and risk posture.
*   **The Architect (MiniMax / Claude):** Generates the initial system diagram, state flow, and bounded PRD Shards based on the Specifier's requirements.
*   **The Adversary (Separate High-Reasoning Model):** Attacks the Architect's diagram. Identifies hidden blast radiuses, tight coupling, and rollback concerns. Forces a Reconciler phase if vulnerabilities are found.
*   **The Verifier (Codex):** A disciplined reviewer that checks the final PRD shard for completeness and strict verification logic before declaring it "Ready for Execution."
*   **The Builder / Ralph (Qwen-3 Coder):** The cheap, deterministic, local/tunneled executor that blindly loops through authorized PRD components one at a time. It updates `progress.txt` and learns from its execution failures.

---

## 4. End-to-End Project Development Lifecycle (The Workflow)

When you begin a new project (or ingest a new feature for an existing ecosystem), you will follow this exact pipeline:

### Step 1: Ingestion & Environment Bootstrapping
Before any code is written, the system must understand what exists.
1. **Start the Control Plane & MCP Server.**
2. **Import Workspace:** The control plane parses your directory and turns it into a System Graph.
3. **Ingest Seed Knowledge:** Documentation, framework rules, and domain heuristics are loaded into the Knowledge Base.
4. **Analyze Gaps:** The system highlights what your current setup is missing (e.g., missing React UI guidelines, missing security protocols) so agents do not hallucinate.

### Step 2: Requirement Capture & Diagram Synthesis
1. You describe a feature objective via the **Cursor Companion Overlay**.
2. The **Specifier** and **Architect** are invoked. They build a proposed Component Architecture.
3. The **Interactive Focus Graph** dynamically renders in your IDE beside your code.

### Step 3: Adversarial Debate & Blast Radius Discovery
1. The Foundry orchestrator automatically feeds the proposed Graph to the **Adversary**.
2. The Adversary highlights nodes that will break (blast radius).
3. The Architect updates the design safely.
4. If the risk is high, the system pauses. **Human Approval Gates** require you to click "Approve" on the revised diagram via the Webview.

### Step 4: Sharding & Ralph Bridge Execution
1. Once Approved, the system compiles the visual nodes into **Executable PRD Shards** (`prd.json`, `AGENTS.md`).
2. The **Foundry-to-Ralph** compiler spins up local workspaces for these shards.
3. You click **"Start Run"** in the Cursor UI.
4. **Ralph (Qwen3-Coder)** begins grinding through the shards locally.

### Step 5: Sync & Verification
1. As Ralph completes tasks, `progress.txt` is updated.
2. **Ralph State Sync** automatically pushes updates back into the Foundry Graph.
3. The visual node in your IDE turns green.
4. The **Verifier** runs unit tests. If tests pass, the feature is successfully integrated!

---

## 5. Standard Operating Procedures (What to do in what order)

To manually operate the minimal slice of the ecosystem today, follow these sequenced events via your terminal or IDE:

**1. Start the Foundation**
Open the integrated terminal and start the Control Plane API:
\`\`\`bash
npm run api
\`\`\`
*(Optional) Ensure you start `foundry-mcp-server` and `model-gateway` out of their respective app folders.*

**2. Open your Cockpit**
In VS Code / Cursor, run the command **`Flagship Foundry: Open Orchestration Overlay`**.
This opens the split-pane View.

**3. Run the Initialization Pipeline via the UI**
In the Webview Overlay, click the buttons in this specific sequence:
1. `Start Plane` (Validates Health)
2. `Import` (Generates Ecosystem Manifest and initial Graph)
3. `Gap Analysis` (Determines missing documentation required for tasks)

**4. Plan your Work (Visual Mapping)**
1. Click `Plan`. Type your objective (e.g., "Add user authentication flow").
2. Click `Generate Focus Graph`. The Mermaid AST will render. You can click on the visual nodes to open specific source files instantly.

**5. Execute and Monitor**
1. Review the generated "Latest Plan" block matching your objective.
2. Click `Approve` to satisfy the verification gate.
3. Click `Start Run`.
4. Monitor the "Latest Run (Ralph loop)" tab. Use `Pause` or `Stop` to interject if the agent loops unexpectedly.
5. Click `Refresh` to observe the progress bridging back from Ralph to your visual map!
