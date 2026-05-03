# Uploaded Skills Integration Audit

## Scope

This audit evaluates the uploaded ChatGPT skills listed in:

- `Wordpress-Development-Copilot-Chatgpt/chatgpt-generated-skills-library/final-registry-reconciliation-upload-manifest.md`
- `Wordpress-Development-Copilot-Chatgpt/chatgpt-generated-skills-library/upload-manifest.csv`
- `inspection-workspace/cloud-agent-sdlc-bible-packet/skills/granular-codegen-skill-registry-v2.yml`
- `inspection-workspace/cloud-agent-sdlc-bible-packet/skills/skill-registry-v1.yml`

The goal is to determine whether the installed skill set is sufficient for the WordPress cloud-agent SDLC, how each skill family fits into the lifecycle, and what remains intentionally deferred.

## Executive result

- Upload-ready skills present: `60`
- Covered granular codegen v2 skills: complete
- Covered lifecycle v1 minimal bundle skills: complete
- Overlap skill shared by both control planes: `memory-continuity-manager`
- Default-off visual skills: intentionally deferred
- WordPress-specific conclusion: the uploaded skill set is sufficient to run the SDLC control plane now, even before the future MCP block-layout server is attached

## Audit findings

### 1. Registry coverage is complete for the non-visual control plane

The uploaded manifests show full coverage for:

- the v2 granular request-to-pseudocode-to-codegen pipeline
- the v1 lifecycle and governance minimal bundle
- the shared memory/continuity layer

No required non-visual lifecycle or codegen skill is missing from the upload manifest.

### 2. The installed skills are generic but integrate cleanly with the WordPress initiative

The uploaded skills are not WordPress-specific skills. They are SDLC control-plane skills. That is acceptable for this initiative because:

- WordPress implementation rules come from `Instructions.md`, the Gutenberg SOP, and the local `guide/` docs
- the uploaded skills govern routing, design discipline, contracts, bounded implementation, verification, memory, and release control
- the domain-specific intelligence is expected to come from the local authority stack, not from the generic skill names alone

### 3. The skills support the full lifecycle, but they must be routed selectively

Not every request should trigger the entire chain. For WordPress theme and Gutenberg work:

- small content or pattern fixes should stay mostly in the lifecycle lane
- medium implementation work should use lifecycle plus targeted v2 planning/codegen skills
- large refactors, block migrations, or plugin/theme runtime changes should use the full lifecycle and full v2 codegen path

### 4. The current gap is not skill coverage; it is runtime environment reach

The next major capability gap is the future MCP server for actual block-layout interaction. Until that is attached:

- the agent can still plan, scope, implement, validate, and document
- the agent cannot fully automate live block-layout inspection/manipulation through your custom MCP interface
- `Instructions.md` should state that live block-layout MCP operations are deferred and optional until the server is connected

### 5. Deferred visual skills are correctly excluded for now

The omitted default-off visual skills are appropriate to defer because the current initiative needs:

- routing
- design and codegen discipline
- validation
- continuity

It does not yet require:

- visual diagrams as mandatory SDLC artifacts
- automatic graph/diagram outputs

## Skill-to-SDLC integration map

### Intake and request routing

Use these skills first for substantial requests:

- `cloud-agent-sdlc-orchestrator`
- `sdlc-phase-router`
- `request-intake-normalizer`
- `objective-classifier`
- `problem-type-router`
- `workspace-authority-resolver`
- `authority-and-constraint-extractor`

WordPress fit:

- classify whether the request is block recovery, theme/page work, plugin/runtime work, validation, or operational governance
- identify the affected WordPress surfaces before implementation begins

### Discovery and context loading

Use when the request is not trivially local:

- `repository-intake-auditor`
- `domain-context-locator`
- `impacted-system-cartographer`
- `blast-radius-preflight-analyzer`
- `risk-blast-radius-analyzer`
- `architecture-snapshot-reader`
- `insertion-point-locator`

WordPress fit:

- find the correct theme, pattern, template, block, CSS, or plugin surface
- detect whether the change affects stored markup, reusable patterns, synced patterns, templates, or runtime rendering

### Planning and bounded work formation

Use before implementation for non-trivial work:

- `scope-chunker`
- `abstraction-opportunity-finder`
- `base-interface-class-planner`
- `adapter-boundary-planner`
- `dependency-inversion-planner`
- `contract-first-io-schema-writer`
- `data-model-type-system-designer`
- `event-contract-modeler`
- `test-strategy-generator`
- `file-lock-coordinator`

WordPress fit:

- decide whether the change belongs in theme, plugin, pattern library, or block implementation
- define file boundaries for safe edits
- prevent overbuilding custom blocks when patterns or `theme.json` are sufficient

### Design and pseudocode gate

Use for medium and large engineering work:

- `pseudocode-spec-writer`
- `algorithm-decomposition-planner`
- `memory-lifecycle-analyzer`
- `complexity-notation-assessor`
- `concurrency-state-safety-analyzer`
- `observability-instrumentation-planner`
- `pseudocode-review-verifier`
- `test-from-pseudocode-generator`
- `pseudocode-to-language-plan-compiler`

WordPress fit:

- dynamic blocks
- server-rendered integrations
- query/data-backed components
- custom editor/runtime logic
- migration utilities for saved block content

### Implementation bridge and controlled code generation

Use only after planning gates are clear:

- `codegen-contract-builder`
- `code-from-pseudocode-generator`
- `type-safety-implementation-enforcer`
- `implementation-insertion-verifier`
- `generated-code-reviewer`
- `code-to-pseudocode-reconciler`
- `human-code-delta-ingestor`
- `semantic-diff-explainer`
- `software-engineer-decision-capture`

WordPress fit:

- custom block code
- block registration changes
- theme/runtime integration code
- migration scripts
- validation tooling around serialized blocks

### Verification, evidence, and release governance

Use before claiming completion:

- `test-execution-verifier`
- `independent-verifier`
- `trace-evidence-collector`
- `performance-budget-enforcer`
- `architecture-drift-detector`
- `adr-draft-writer`
- `adr-indexer`
- `decision-tradeoff-ledger`
- `parity-sync-manager`
- `pr-integration-governor`

WordPress fit:

- verify editor save/reload stability
- capture evidence for block validity, responsive behavior, accessibility, and rollback
- document markup compatibility decisions and migration tradeoffs

### Memory, operations, and human escalation

Use across the full lifecycle:

- `memory-continuity-manager`
- `continuity-writer`
- `scheduler-cadence-runner`
- `roadmap-feature-factory`
- `human-decision-escalator`
- `branch-bloat-reconciler`
- `cloud-agent-ops-sentinel`
- `pair-programming-copilot-router`

WordPress fit:

- maintain resumable work across theme/plugin/content changes
- record unresolved site/runtime blockers
- keep long-running initiative work coherent across many requests

## Per-skill audit status

Each uploaded skill falls into one of these audit statuses:

- `required-core`: needed to operate the SDLC control plane
- `default-on-when-substantial`: use for non-trivial scoped work
- `conditional`: invoke only when the request characteristics demand it
- `optional-overlay`: available but not part of the default lane

### Required core

- `cloud-agent-sdlc-orchestrator`
- `sdlc-phase-router`
- `memory-continuity-manager`
- `continuity-writer`
- `file-lock-coordinator`
- `pr-integration-governor`
- `request-intake-normalizer`
- `objective-classifier`
- `problem-type-router`
- `authority-and-constraint-extractor`
- `scope-chunker`
- `test-execution-verifier`

### Default-on when substantial

- `repository-intake-auditor`
- `workspace-authority-resolver`
- `domain-context-locator`
- `impacted-system-cartographer`
- `blast-radius-preflight-analyzer`
- `risk-blast-radius-analyzer`
- `architecture-snapshot-reader`
- `insertion-point-locator`
- `abstraction-opportunity-finder`
- `contract-first-io-schema-writer`
- `data-model-type-system-designer`
- `pseudocode-spec-writer`
- `algorithm-decomposition-planner`
- `memory-lifecycle-analyzer`
- `complexity-notation-assessor`
- `pseudocode-review-verifier`
- `test-from-pseudocode-generator`
- `pseudocode-to-language-plan-compiler`
- `codegen-contract-builder`
- `code-from-pseudocode-generator`
- `type-safety-implementation-enforcer`
- `implementation-insertion-verifier`
- `generated-code-reviewer`
- `independent-verifier`
- `trace-evidence-collector`

### Conditional

- `base-interface-class-planner`
- `adapter-boundary-planner`
- `dependency-inversion-planner`
- `event-contract-modeler`
- `concurrency-state-safety-analyzer`
- `observability-instrumentation-planner`
- `architecture-drift-detector`
- `adr-draft-writer`
- `adr-indexer`
- `decision-tradeoff-ledger`
- `parity-sync-manager`
- `performance-budget-enforcer`
- `test-strategy-generator`
- `human-code-delta-ingestor`
- `code-to-pseudocode-reconciler`
- `semantic-diff-explainer`
- `software-engineer-decision-capture`
- `human-decision-escalator`
- `roadmap-feature-factory`
- `scheduler-cadence-runner`
- `branch-bloat-reconciler`
- `cloud-agent-ops-sentinel`

### Optional overlay

- `pair-programming-copilot-router`

## WordPress-specific invocation policy

For this initiative, `Instructions.md` should direct the agent to use the uploaded skills with these constraints:

1. Route through lifecycle skills first.
2. Do not invoke the full v2 codegen chain for simple content, pattern, template, or `theme.json` edits.
3. Use the deeper v2 design/codegen chain for:
   - dynamic blocks
   - plugin/runtime integrations
   - block migrations
   - validation tooling
   - complex reusable components
4. Treat the local WordPress docs and Gutenberg SOP as the domain authority that shapes how these generic skills operate.
5. Keep visual/default-off skills disabled unless a future visual artifact requirement is introduced.
6. Treat live MCP block-layout operations as a future optional capability, not a current prerequisite.

## Required `Instructions.md` implications

The rebuilt `Instructions.md` should explicitly state:

- the uploaded skills are installed and should be invoked as part of the SDLC pipeline
- lifecycle/router skills are always preferred before implementation
- WordPress surface classification must happen before codegen
- codegen and pseudocode skills are conditional on task complexity
- verification, evidence, and continuity updates are mandatory
- future MCP block-layout tools may extend the pipeline later, but the current pipeline must work without them

## Final conclusion

The uploaded skill library is integrated enough to support this initiative now. The main remaining work is instructional wiring:

- teach `Instructions.md` how to invoke the installed skills
- teach it when not to invoke the heavy codegen chain
- bind the generic skills to the WordPress-specific doctrine in the local SOP and docs

No additional skill uploads are required for the current non-visual, pre-MCP phase of the initiative.
