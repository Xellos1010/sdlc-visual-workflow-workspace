# Diagram Catalog, Acronyms, and When to Use Them

This document starts with the major diagram families represented by Software Ideas Modeler and extends outward into the artifact system your product should support.

## Acronyms and terms

| Term | Expansion | Why it matters in your platform |
|---|---|---|
| CASE | Computer-Aided Software Engineering | The category Software Ideas Modeler sits in; your product is an AI-native CASE evolution |
| UML | Unified Modeling Language | Standard software architecture and behavior notation |
| ERD | Entity-Relationship Diagram | Data model and persistence design |
| BPMN | Business Process Model and Notation | Human/business workflow modeling |
| SysML | Systems Modeling Language | System-of-systems and engineering-heavy modeling |
| DFD | Data Flow Diagram | How data moves between actors, processes, and stores |
| C4 | Context, Container, Component, Code | Practical layered software architecture views |
| CMMN | Case Management Model and Notation | Case-driven business workflows |
| DMN | Decision Model and Notation | Repeatable rules and decision logic |
| CRC | Class-Responsibility-Collaboration | Fast domain/object exploration |
| FTA | Fault Tree Analysis | Failure-cause analysis |
| ETA | Event Tree Analysis | Outcome-path analysis after initiating events |
| FMEA | Failure Modes and Effects Analysis | Structured failure-risk analysis |
| ArchiMate | Proper name of an enterprise architecture language, not an acronym | Enterprise architecture viewpoints across business, application, and technology layers |

## 1. Structural architecture diagrams

### C4 diagrams

| Diagram | Primary question | Best use in your system | Automation stance |
|---|---|---|---|
| System Context | What external people and systems surround the product? | Show the overall ecosystem and boundaries | AI-curated from repo + brief |
| Container | What deployable applications/data stores exist and how do they talk? | Show runner, dashboard, server, DB, storage, queues | AI-curated from code + infra |
| Component | What major internal building blocks exist inside a container? | Show subsystems inside dashboard or runner | AI-curated with human review |
| Code | How is a critical component implemented? | Use selectively for hot spots only | Mostly auto-generated |

### UML structural diagrams

| Diagram | Primary question | Use in your system |
|---|---|---|
| Class Diagram | What types, fields, methods, and relationships exist? | Domain model, conversion targets, code-level architecture |
| Object Diagram | What does a concrete runtime snapshot look like? | Example state snapshots and fixtures |
| Package Diagram | How are namespaces/modules grouped? | Module boundaries and crate mapping |
| Component Diagram | What logical components expose interfaces and dependencies? | Service/component contracts |
| Composite Structure Diagram | What parts exist inside a class/component and how are they wired? | Complex orchestrators, stateful runtimes |
| Deployment Diagram | Where are things deployed? | Local runner vs web vs server infrastructure |
| Profile Diagram | What stereotypes/extensions define your modeling conventions? | Internal modeling conventions if you formalize them |

### Enterprise / system diagrams

| Diagram | Primary question | Use in your system |
|---|---|---|
| ArchiMate views | How do business, application, and technology layers align? | Productization, enterprise rollout, multi-team landscapes |
| SysML Block/Internal Block | What system blocks exist and what flows through them? | Runner/server/dashboard/system-of-systems mapping |
| Layer Diagram | What layers should depend on what? | Enforce architecture boundaries |

## 2. Behavioral / runtime diagrams

| Diagram | Primary question | Use in your system | Automation stance |
|---|---|---|---|
| Sequence Diagram | In what order do actors/components exchange messages? | Request flow, pipeline execution, agent-to-agent coordination | AI-curated from code + traces |
| Communication Diagram | Who talks to whom with focus on links? | Alternative to sequence when topology matters more than time | AI-curated |
| Activity Diagram | What actions and branches occur in a process? | Pipeline steps, onboarding flows, execution routines | AI-curated |
| Flowchart | What is the operational logic path? | Simplified human-friendly process views | AI-curated |
| State Machine Diagram | What states can an entity/runtime occupy and how do transitions happen? | Query engines, task states, run/session lifecycles | AI-curated from code |
| Interaction Overview Diagram | How do multiple interaction flows fit together? | Multi-agent orchestration over several scenarios | AI-curated |
| Timing Diagram | How does state/value change over time? | Time-sensitive workflows, retries, rate limiting | Optional, evidence-backed |

## 3. Data and information diagrams

| Diagram | Primary question | Use in your system |
|---|---|---|
| ERD | What entities/tables exist and how do they relate? | Artifact DB, work-order store, evidence store |
| DFD | What data moves where? | Ingestion → IR → artifacts → verification → dashboard |
| Schema / contract map | What structures cross module boundaries? | JSON Schema, OpenAPI, message contracts |
| Dependency Graph | Which modules depend on which others? | Refactor planning, Rust crate allocation |
| Module Graph | How is code grouped at file/module/package level? | Reverse engineering and component synthesis |
| Call Graph | Which functions call which? | High-risk runtime tracing and conversion planning |

## 4. UX and product diagrams

| Diagram | Primary question | Use in your system |
|---|---|---|
| Wireframe | What is the screen layout? | Dashboard MVP, inspector, evidence drawer |
| Screen Flow | How does the user move between screens? | Quick actions, drill-down model |
| User Journey | What does a persona need to do end-to-end? | Operator, reviewer, architect, verifier workflows |
| Information Architecture / Site Map | How are screens and objects organized? | Dashboard navigation and object model |
| Dashboard Layout Map | Where do panels live and what can be docked? | “God View” shell and saved layouts |

## 5. AI-native migration artifacts your product should add

These are not classic notation families, but they are essential for your product.

| Artifact | Primary question | Why it matters |
|---|---|---|
| Pseudocode Ledger | What does each module/function do in normalized human-readable logic? | Makes migration and review deterministic |
| IO Contract Inventory | What goes in/out of each function, module, API, and queue? | Preserves behavior across conversions |
| Migration Gap Matrix | What concepts do not map 1:1 from source to target? | Prevents hidden rewrite risk |
| Keep/Adapt/Rewrite/Defer Ledger | What should happen to each module? | Bounded porting decisions |
| Work-Order Graph | What slices can be executed independently? | Agent orchestration and parallelization |
| Evidence Bundle | What proves parity, correctness, and release readiness? | Trust and handoff |
| Diff Intent Map | What is being added, removed, or changed and why? | Reviewability and approvals |

## Recommended default diagram pack per analysis

### For every non-trivial codebase

- C4 context
- C4 container
- package/module diagram
- dependency graph
- pseudocode ledger
- IO contract inventory
- work-order graph

### Add when the system is stateful or asynchronous

- sequence diagrams
- state machines
- timing diagrams
- DFD

### Add when persistence or APIs matter

- ERD
- schema/contract map
- deployment diagram

### Add when product surfaces matter

- wireframes
- screen flow
- user journey

## Automation guidance

### Best auto-generated

- dependency graph
- call graph
- package/module diagram
- class diagram candidates
- ERD candidates
- code diagram for selected components

### Best AI-generated with human review

- C4 diagrams
- sequence diagrams
- state machines
- DFDs
- deployment diagrams
- pseudocode ledger
- migration gap matrix

### Best human-approved even if AI drafts first

- target architecture
- work-order boundaries
- risky framework substitutions
- verification gates
