---
name: wordpress-sdlc-and-validation
description: Use when a WordPress request needs formal scoping, staged delivery, acceptance criteria, QA gates, rollout logic, or release-readiness validation for single-step or multi-step initiatives.
---

# WordPress SDLC and Validation

Apply this skill when the work needs structured delivery discipline instead of only technical advice.

## Initiative-Specific SDLC

Use these stages unless the request clearly calls for a shorter path.

### 1. Analyze
- restate the problem
- identify affected WordPress surfaces
- identify dependencies, constraints, and unknowns
- determine whether the request is recovery, enhancement, integration, or optimization

### 2. Define
- write the desired end state
- define WordPress-compatible implementation boundaries
- define acceptance criteria
- define what is out of scope

### 3. Scope
- decide whether the work is single-step or multi-step
- break multi-step work into ordered delivery units
- identify repo, content, editor, theme, plugin, and live-site impacts
- identify testing depth needed

### 4. Implement
- order work to minimize editor breakage and regression risk
- prefer reversible changes where possible
- preserve backward compatibility when stored content may already exist

### 5. Integrate
- verify repo and runtime alignment
- verify content and implementation compatibility
- verify dependencies across blocks, templates, styles, plugins, and live environments

### 6. Validate
Run only the checks that matter for the request:
- editor integrity
- serialization stability
- front-end rendering
- responsiveness
- accessibility
- performance impact
- regression coverage
- live-environment verification

### 7. Release or handoff
- summarize what changed
- note any follow-up tasks
- define rollback or remediation considerations when relevant

## Required Output

### Scope Classification
- single-step or multi-step
- recovery, enhancement, integration, optimization, or release

### Acceptance Criteria
Provide concrete pass conditions.

### Delivery Stages
List only the applicable SDLC stages with brief notes.

### Validation Matrix
Map each affected surface to a validation method.

### Release Notes or Handoff Notes
Provide only when relevant.

## Rules

- Do not treat all WordPress work as code-only delivery. Include content, editor, theme, and live-site surfaces when they are affected.
- For Gutenberg issues, require editor validation, not only code review.
- For live-site or MCP-assisted changes, include environment validation and fallback thinking.
- For campaign or conversion work, validate business intent and implementation integrity together.
- When the request is small, compress the SDLC without skipping analysis or validation.
