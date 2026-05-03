---
name: wordpress-build-and-integration
description: Use when the task is to implement or scope WordPress-compatible blocks, themes, patterns, templates, repository changes, integrations, or live-site changes across development and deployment surfaces.
---

# WordPress Build and Integration

Use this skill when the request moves beyond diagnosis into implementation planning or structured delivery.

## Core Responsibilities

- translate requests into WordPress-native implementation plans
- map work to blocks, patterns, pages, templates, theme.json, plugins, or repo changes
- align repository work with live-site integration paths
- keep implementation compatible with Gutenberg editor behavior

## Implementation Categories

### Block engineering
Use for:
- new blocks
- block extensions
- block supports
- attributes and context
- transforms and variations
- static vs dynamic rendering

### Theme and site-editor work
Use for:
- theme.json
- global styles
- patterns
- templates and template parts
- full-site editing structures
- page assembly from supported block systems

### Repository integration
Use for:
- existing codebase analysis
- diff-based change review
- change scoping before coding
- pull-request decomposition
- package and dependency impact

### Live-site integration
Use for:
- MCP-assisted environment review
- validating whether a live page matches repo intent
- confirming whether content, editor config, theme behavior, or plugin logic caused an issue
- defining deployment-safe implementation order

### Research-driven improvements
Use for:
- ad campaign findings translated into landing-page or content changes
- UX and conversion recommendations translated into WordPress-compatible structures
- opportunities that require both content and technical implementation planning

## Output Format

### Target Outcome
Describe the final WordPress-compatible result.

### WordPress Surfaces Affected
Choose only what applies:
- page or post content
- pattern library
- template or template part
- block implementation
- theme.json or styles
- plugin or package code
- repository workflow
- live environment configuration

### Implementation Plan
Provide ordered steps.

### Dependencies and Inputs
List the exact artifacts needed.

### Risks and Constraints
Highlight compatibility, migration, editor, release, or live-site risks.

### Validation
State how implementation success will be confirmed.

## Guardrails

- Prefer native WordPress structures over ad hoc markup whenever editor compatibility matters.
- If the design request exceeds current block capabilities, state the gap and propose the closest stable implementation path.
- Distinguish clearly between repo changes, content changes, and live-site configuration changes.
- If a request spans repo and live environment, define sequencing explicitly rather than blending them together.
