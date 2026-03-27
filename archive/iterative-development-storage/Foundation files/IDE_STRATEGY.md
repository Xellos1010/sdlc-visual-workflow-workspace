# IDE Strategy

## Problem

The ecosystem needs an eventual integrated environment, but the control plane must not depend on that environment to be correct.

## Options considered

### Option A: VS Code / Cursor-style extension first
**Strengths**
- fastest adoption path
- huge existing extension ecosystem
- strong remote development story
- familiar to most developers
- ideal as a thin companion surface over a separate control plane

**Weaknesses**
- product surface is constrained by the host editor
- deeper orchestration UX becomes awkward over time
- marketplace and telemetry constraints are influenced by the host ecosystem
- long-term product identity is dependent on another vendor’s editor shape

### Option B: Eclipse Theia-based custom IDE/tooling shell
**Strengths**
- vendor-neutral foundation
- browser and Electron targets
- deeper customization than a plain extension
- strong fit for a graph canvas + orchestration + dashboard product
- compatible with many VS Code extensions via Open VSX

**Weaknesses**
- slower to ship than an extension
- requires product-level frontend/platform engineering
- extension compatibility is strong but not identical in every case

### Option C: Grassroots editor/IDE from scratch
**Strengths**
- maximum product control
- no inherited assumptions
- can optimize everything around orchestration and visualization

**Weaknesses**
- highest cost and longest time to value
- must rebuild editor, terminal, language tooling, debugging, extensions, remote dev, accessibility, and theming foundations
- very poor validation path for an ambitious product this early

## Determination

### Phase 1 recommendation
Use a **terminal-first control plane** plus **thin editor companions** where helpful. The system should work even if the only surface is a terminal agent and a browser dashboard.

### Phase 2 recommendation
Build the dedicated product shell on **Eclipse Theia**, not by forking VS Code and not by building a grassroots editor from scratch.

### Why this determination is correct
The product is not just “an editor with AI.” It is a **human/AI orchestration environment with graph visualization, evidence review, process control, and runtime operations**. That argues for full product control eventually, but not at the cost of delaying validation.

## Final recommendation
- **Now:** terminal-first + VS Code-compatible companion where necessary
- **Target product shell:** Theia-based custom environment
- **Avoid initially:** building a net-new editor core from zero
