# `Instructions.md` Rebuild Prompt For The AI Agent Builder

Use the prompt below in the agent development environment when rebuilding [Instructions.md](instructions.md).

```text
You are rebuilding instructions.md so it matches the current local file hierarchy, the attached WordPress developer documentation snapshot, the uploaded ChatGPT skills, and the cloud-agent SDLC workflow.

Primary objective:
Rewrite Instructions.md into a stable operating contract for a WordPress cloud agent that works across Gutenberg content, patterns, templates, template parts, theme.json, theme-directory changes, custom blocks, repo work, validation, release/handoff, and continuity.

Important context:
- This agent is being built to stabilize a theme-directory-based WordPress implementation so MCP AI controllers can create and update site content and get predictable results.
- The editing surface must remain Gutenberg-native, valid through save/reload, and safe for future author edits.
- The instruction file must reflect the current local hierarchy, not an older or assumed repo layout.
- A future custom MCP server will later provide direct block-layout/runtime interaction. The current instruction file must work correctly before that MCP server exists.

Authoritative local sources, in descending order:
1. ./sdlc/docs/cloud-agent-sdlc-bible.md
2. ./sdlc/docs/cloud-agent-sdlc-lifecycle-management.md
3. ./sdlc/docs/onboarding-new-agentic-developers.md
4. ./sdlc/docs/skills-integration-audit.md
5. ./gutenberg_block_first_sop_bible.md
6. ./guide/...
7. ./final-registry-reconciliation-upload-manifest.md
8. ./upload-manifest.csv
9. ./granular-codegen-skill-registry-v2.yml
10. ./skill-registry-v1.yml
11. ./guide.md as a generated index only after path repair

Installed skills context:
- Treat the uploaded skill manifests as evidence that the non-visual lifecycle and granular codegen control plane is installed.
- Total upload-ready skills: 60.
- Treat the v1 lifecycle minimal bundle as available.
- Treat the v2 granular codegen pipeline as available.
- Treat default-off visual/diagramming skills as intentionally deferred.
- Treat pair-programming-copilot-router as optional overlay, not default behavior.

Required corrections:
- Treat ./guide as the canonical attached WordPress docs root.
- Repair any broken references that assume ./wordpress-guides/... and replace them with paths that actually exist in this repo.
- Do not reference files that are not present in the submitted hierarchy.
- Normalize link targets and internal references so the instruction file points at real local documents.
- Use exact repo-relative paths, not vague shorthand such as Files/... .

Required operating model:
- Route every request before implementation.
- Distinguish these primary workstreams:
  1. Gutenberg block recovery
  2. Page, pattern, template, and theme implementation
  3. Custom block or plugin-backed functionality
  4. Theme.json and editor curation
  5. Repository integration and delivery
  6. SDLC, QA, verification, and release governance
  7. Research, optimization, and live-site analysis
- Separate affected WordPress surfaces explicitly:
  - post/page content
  - patterns
  - synced patterns
  - templates
  - template parts
  - theme.json
  - theme CSS/assets
  - custom blocks
  - plugin/runtime code
  - repository and release workflow

Required skill invocation model:
- The rebuilt Instructions.md must state that installed skills are part of the operating pipeline and should be used when relevant.
- Lifecycle/router skills come first. Prefer them before any implementation or codegen skills.
- The agent must not invoke the full granular codegen chain for trivial content or styling edits.
- The agent must invoke deeper planning/design/codegen skills only when complexity justifies it.

Required lifecycle/router skills:
- cloud-agent-sdlc-orchestrator
- sdlc-phase-router
- memory-continuity-manager
- continuity-writer
- file-lock-coordinator
- pr-integration-governor
- request-intake-normalizer
- objective-classifier
- problem-type-router
- authority-and-constraint-extractor
- scope-chunker

Required default-on for substantial requests:
- repository-intake-auditor
- workspace-authority-resolver
- domain-context-locator
- impacted-system-cartographer
- blast-radius-preflight-analyzer
- risk-blast-radius-analyzer
- architecture-snapshot-reader
- insertion-point-locator
- abstraction-opportunity-finder
- contract-first-io-schema-writer
- data-model-type-system-designer
- pseudocode-spec-writer
- algorithm-decomposition-planner
- memory-lifecycle-analyzer
- complexity-notation-assessor
- pseudocode-review-verifier
- test-from-pseudocode-generator
- pseudocode-to-language-plan-compiler
- codegen-contract-builder
- code-from-pseudocode-generator
- type-safety-implementation-enforcer
- implementation-insertion-verifier
- generated-code-reviewer
- test-execution-verifier
- independent-verifier
- trace-evidence-collector

Required conditional skill policy:
- Use deeper codegen/pseudocode/design skills for:
  - dynamic blocks
  - server-rendered integrations
  - plugin/runtime logic
  - block migrations
  - serialization recovery
  - reusable component engineering
  - validation tooling
- Keep these conditional rather than mandatory for every request:
  - base-interface-class-planner
  - adapter-boundary-planner
  - dependency-inversion-planner
  - event-contract-modeler
  - concurrency-state-safety-analyzer
  - observability-instrumentation-planner
  - architecture-drift-detector
  - adr-draft-writer
  - adr-indexer
  - decision-tradeoff-ledger
  - parity-sync-manager
  - performance-budget-enforcer
  - test-strategy-generator
  - human-code-delta-ingestor
  - code-to-pseudocode-reconciler
  - semantic-diff-explainer
  - software-engineer-decision-capture
  - human-decision-escalator
  - roadmap-feature-factory
  - scheduler-cadence-runner
  - branch-bloat-reconciler
  - cloud-agent-ops-sentinel

Required Gutenberg/theme doctrine:
- Prefer core blocks, patterns, template parts, theme.json tokens, and block supports before custom code.
- Use custom blocks only when runtime rendering, structured controls, integrations, or reusable functionality truly require them.
- State clearly that reusable or portable custom blocks should default to a plugin, while theme-owned concerns belong in the theme.
- Make update-propagation rules explicit:
  - normal patterns are starter content and detach after insertion
  - synced patterns propagate centrally
  - template and template-part updates are affected by user-customized copies in the database
  - static block markup changes require deprecations or migration handling
- Explicitly prohibit raw HTML as final architecture except for temporary quarantine/recovery cases.

Required SDLC lifecycle:
- Align to the cloud-agent lifecycle and present a practical operator flow for this project.
- The lifecycle in Instructions.md should make clear how work moves through:
  - analyze/discover
  - define
  - scope/plan
  - implement
  - integrate
  - validate
  - release/handoff
  - operate/improve
- Include phase gates, required artifacts, validation expectations, rollback thinking, and continuity updates.
- Preserve the principle that substantial work needs analysis plus validation, not just implementation.

Required validation posture:
- Require editor save/reload validation for Gutenberg-managed output.
- Require parse/serialize awareness for stored block markup.
- Require build/lint/test expectations when JS/PHP/theme assets change.
- Include the current WordPress pipeline references:
  - @wordpress/create-block
  - @wordpress/scripts
  - @wordpress/env / wp-env
  - Playwright/e2e where appropriate
  - backward-compatibility and deprecations when saved markup changes
- Include accessibility, responsive behavior, performance, rollback, and evidence-bundle expectations.

Required source hierarchy section:
- Add a section that tells the agent exactly which local documents to consult first.
- Group them into:
  - WordPress handbook sources
  - local SOP sources
  - SDLC lifecycle sources
  - uploaded skill manifests and audit sources
  - skill registry sources
  - generated indexes
- Make it clear that local attached docs outrank assumptions.

Required future MCP note:
- State that a custom MCP server for live block-layout interaction may be integrated later.
- Treat that future MCP server as an enhancement to the pipeline, not a prerequisite for current SDLC operation.
- Until it exists, rely on repo files, local docs, WordPress environment validation, and installed skills rather than pretending direct live block-layout control already exists.

Required output structure for Instructions.md:
- Role / mission
- Source hierarchy
- Installed skills and invocation policy
- Request routing rules
- WordPress surface model
- Gutenberg and theme implementation doctrine
- SDLC lifecycle and phase gates
- Validation and acceptance rules
- Memory / continuity expectations
- Response structure expectations
- Safety and escalation rules

Constraints:
- Rewrite for clarity and operational usefulness, not just prose polish.
- Remove outdated references, broken paths, and vague placeholders.
- Keep the file focused on actionable agent behavior.
- Do not invent external systems that are not in the submitted files.
- Favor exact local paths when naming internal references.
- Treat the uploaded skills as installed capabilities, not hypothetical future ideas.
- Do not force every request through every skill; encode proportional routing rules.

Deliverables:
1. Updated instructions.md
2. A short change summary describing:
   - broken links fixed
   - hierarchy changes
   - lifecycle formalization
   - installed-skill integration
   - WordPress/Gutenberg doctrine changes
   - validation additions
   - future MCP boundary note
```
