---
name: wordpress-request-router
description: Use when a request needs to be classified into the correct WordPress development path, scoped as single-step or multi-step work, and routed to the right downstream workflow before implementation starts.
---

# WordPress Request Router

Classify every request before proposing implementation details.

## Primary Goal

Turn incoming WordPress requests into a clear workstream, execution mode, and validation path so the agent does not mix editor fixes, block engineering, theme work, repo changes, live-site changes, and research-driven improvements into one generic response.

## Route Every Request Through This Sequence

1. Identify the request type.
2. Identify the primary artifact being changed.
3. Decide whether the job is:
   - single-step
   - multi-step
   - investigative first, then implementation
   - recovery first, then stabilization
4. Define the required inputs.
5. Define the delivery path.
6. Define the validation path.

## Canonical Workstreams

Route to exactly one primary workstream first. Add secondary workstreams only when truly required.

### 1. Gutenberg block recovery
Use when the request involves:
- invalid block content
- unexpected characters in block content
- block parsing failures
- serialization mismatches
- save vs edit markup drift
- markdown-to-block conversion problems
- content recovery from damaged editor state

### 2. Block and component implementation
Use when the request involves:
- custom blocks
- block.json changes
- attributes, supports, transforms, variations, bindings, or context
- editor UI controls and component usage
- dynamic vs static rendering decisions
- block patterns or reusable block structures

### 3. Theme, pattern, template, and page implementation
Use when the request involves:
- theme.json
- patterns
- templates
- template parts
- full-site editing
- page composition
- converting a design into a WordPress-compatible structure
- aligning visual requirements with supported block architecture

### 4. Integration and repository delivery
Use when the request involves:
- GitHub repositories
- diff review
- implementation scoping against existing code
- pull-request planning
- plugin or package integration
- MCP-driven inspection of live WordPress environments
- change propagation across repo and live site

### 5. SDLC, QA, and release governance
Use when the request involves:
- scoping work
- acceptance criteria
- test plans
- regression review
- validation gates
- release readiness
- rollout, fallback, or post-release checks

### 6. Research and optimization
Use when the request involves:
- ad campaign findings
- conversion improvements
- content structure improvements
- UX recommendations
- performance or accessibility improvements driven by evidence

## Required Output

For every routed request, produce these sections:

### Request Classification
- primary workstream
- secondary workstreams
- request intent
- single-step or multi-step

### Change Surface
- editor content
- block code
- theme or pattern layer
- repository code
- live site configuration
- content strategy or optimization

### Inputs Required
List only the inputs actually needed, such as:
- repo or branch
- page, pattern, or template name
- affected block names
- broken content sample
- diff or markdown source
- live page URL or MCP site target
- acceptance criteria

### Execution Path
State the ordered path, using only the needed stages.

### Validation Path
State how the result must be checked before completion.

## Routing Rules

- Prefer diagnosis before implementation when corruption, invalid markup, unexpected characters, or editor recovery is involved.
- Prefer scope-first behavior when the request touches multiple artifacts or repositories.
- Prefer WordPress-native structures over generic HTML or markdown when the final state must be editor-compatible.
- If a design request would produce invalid or fragile Gutenberg output, explicitly convert it into compatible blocks, patterns, templates, or theme.json structures.
- If a live-site request depends on repo state, define both the repository impact and the runtime validation path.
- If the request is under-specified, do not ask broad questions first. Infer the most likely route and clearly state the assumptions.

## Internal References

When available, consult the attached source index and diff files first to anchor routing decisions to the current WordPress documentation set and change inventory.
