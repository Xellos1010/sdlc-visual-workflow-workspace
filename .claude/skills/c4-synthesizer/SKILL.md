---
name: c4-synthesizer
description: Generates C4 architecture diagrams (context, container, component) as Mermaid source files. Trigger on "show system/container/component views", "generate C4 diagrams", "architecture diagrams", or during the visualize phase. Extends c4-diagram-generator with migration-packet output conventions. Produces .mmd files in architecture/.
---

# C4 Synthesizer

Viewpoint-driven. Use the smallest diagram set that answers the operator's question.

## Output artifacts

| Diagram | Path | When |
|---|---|---|
| C4 Context | `architecture/c4-context.mmd` | always |
| C4 Container | `architecture/c4-container.mmd` | always |
| Component (per container) | `architecture/c4-component-<name>.mmd` | when container has meaningful internal parts |

## C4 Context template

```mermaid
C4Context
  title System Context: <System Name>
  Person(operator, "Operator", "Human using the system")
  System(system, "<System Name>", "<one-line description>")
  System_Ext(ext1, "<External System>", "<role>")
  Rel(operator, system, "Uses")
  Rel(system, ext1, "Calls", "protocol")
```

## C4 Container template

```mermaid
C4Container
  title Container View: <System Name>
  Person(operator, "Operator")
  Container(c1, "<Container>", "<technology>", "<responsibility>")
  Container(c2, "<Container>", "<technology>", "<responsibility>")
  ContainerDb(db1, "<Store>", "<technology>", "<what it stores>")
  Rel(operator, c1, "Uses")
  Rel(c1, c2, "Calls", "protocol")
  Rel(c1, db1, "Reads/writes")
```

## Component template

```mermaid
C4Component
  title Component View: <Container Name>
  Component(comp1, "<Component>", "<technology>", "<responsibility>")
  Component(comp2, "<Component>", "<technology>", "<responsibility>")
  Rel(comp1, comp2, "Uses")
```

## Rules

- Every diagram must have a `title` line
- Every relationship must name the protocol or mechanism
- Do not include implementation details (class names, variable names) in context/container views
- Component diagrams: include only meaningful boundaries — not every file
- For TS→Rust migrations: annotate containers with `[TARGET: <rust-crate>]` in the description field
- Use subsystem names from repository-cartographer output for consistency

## Procedure

1. Read `code/subsystem-map.json` and `code/dependency-graph.json` from cartographer output
2. Identify external actors (operators, external APIs, file systems, MCP servers)
3. Generate C4 context first
4. Map subsystems to containers for the container diagram
5. For subsystems flagged as high-complexity in cartographer output: generate component diagram
6. Write all .mmd files
7. Validate Mermaid syntax (check for unclosed blocks, invalid keywords)

## Quality gates

- [ ] c4-context.mmd exists and renders
- [ ] c4-container.mmd exists and renders
- [ ] Every container in c4-container maps to a subsystem in subsystem-map.json
- [ ] All external dependencies from dependency-graph.json appear in context or container diagram
