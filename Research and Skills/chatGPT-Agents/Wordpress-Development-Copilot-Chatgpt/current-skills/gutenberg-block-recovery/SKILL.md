---
name: gutenberg-block-recovery
description: Use when a request involves invalid Gutenberg blocks, unexpected editor characters, markup corruption, serialization drift, block recovery, markdown conversion, or editor-compatible remediation.
---

# Gutenberg Block Recovery

Use this skill for diagnosis-first recovery work in the block editor.

## Objectives

- identify why content became invalid or unstable
- separate content corruption from block-definition problems
- preserve as much valid content as possible
- restore editor-compatible state
- define the safest repair path before editing content or code

## Recovery Decision Tree

### A. Content-state issue
Use this branch when the problem appears limited to a page, post, pattern, or copied markdown content.

Check for:
- malformed block comments
- unexpected characters inserted into serialized markup
- broken nesting
- mismatched opening and closing delimiters
- markdown or HTML pasted into block contexts that changed serialization

Preferred response:
1. identify the smallest broken segment
2. explain whether the content can be safely repaired in place
3. propose a WordPress-native replacement structure
4. define how to validate the repaired content in editor mode and front-end rendering

### B. Block-definition issue
Use this branch when the problem points to the block implementation.

Check for:
- attribute schema drift
- save output no longer matching stored content
- deprecated block versions missing or insufficient
- wrapper changes affecting serialization
- static vs dynamic rendering mismatches
- block supports or transforms changing the saved structure

Preferred response:
1. identify the serialization contract that changed
2. determine whether deprecations are needed
3. determine whether the save function, edit function, attributes, or migration path must change
4. define a backward-compatible repair plan

### C. Design-to-editor conversion issue
Use this branch when a layout or markdown structure must become editor-compatible content.

Check for:
- whether the design maps cleanly to existing core blocks
- whether a pattern is more appropriate than custom block work
- whether the content should be a template, template part, synced pattern, unsynced pattern, or page content
- whether the request is trying to force unsupported raw markup into Gutenberg

Preferred response:
1. convert the design into WordPress-native structures
2. list the required blocks, patterns, and template surfaces
3. note any unsupported behaviors or risky approximations
4. define the final editor-safe representation

## Required Output

### Diagnosis
State the most likely failure mode.

### Root Cause Layer
Choose one:
- content serialization
- block implementation
- migration gap
- design incompatibility
- editor configuration

### Repair Model
Choose one:
- in-place content repair
- block deprecation and migration
- markup normalization
- pattern or template conversion
- block implementation update

### Validation Checklist
Include only relevant checks, such as:
- block loads without invalid-content warnings
- editor reopens without corruption
- save cycle is stable
- front-end output matches intent
- deprecated content migrates cleanly
- copied markdown no longer re-breaks content

## Guardrails

- Never recommend raw HTML or markdown as the final answer when the result must stay fully manageable in Gutenberg unless the request explicitly requires a raw-code fallback.
- Prefer backward-compatible block evolution over destructive content rewrites.
- Preserve author intent when reconstructing damaged block content.
- If the issue may affect many pages, say so and shift from one-off repair to migration planning.
