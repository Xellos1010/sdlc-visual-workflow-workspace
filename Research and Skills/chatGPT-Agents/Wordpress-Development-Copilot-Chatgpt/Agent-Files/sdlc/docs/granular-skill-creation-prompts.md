# Granular Skill Creation Prompt Library

Use these prompt blocks to create individual Cloud Agent skills. Each skill is intentionally narrow and chainable.

## Shared prompt suffix

Add this suffix to every prompt below:

```text
Required behavior:
- Treat this as one deterministic chunk in a larger SDLC chain.
- Validate required inputs before producing output.
- Emit a concise human-readable summary and a machine-readable artifact.
- Include a `next_skill_handoff` section naming the next skill and exact artifacts to pass forward.
- In autonomous mode, make safe decisions inside approved boundaries and record ADR or decision-ledger candidates for material tradeoffs.
- In pair-programming mode, pause at the declared checkpoint and present options to the operator.
- Do not skip to implementation if upstream classification, context, contracts, pseudocode, tests, or file locks are missing.
- Never merge, deploy, publish, or delete protected/ambiguous branches without explicit approval.

Connector expectations:
- Use GitHub for repo, PR, issue, branch, diff, and file context when available.
- Use Drive/uploaded docs for architecture, runbook, ADR, and SDLC source-of-truth context when available.
- Use MCP/local filesystem only when explicitly available.

Package the skill as `skill.zip` when complete.
```

## Prompt template

```text
Create a ChatGPT skill named `<skill-name>`.

Purpose:
<one deterministic transformation this skill performs>

Use when:
<exact trigger conditions>

Expected inputs:
- <artifact or context>

Expected outputs:
- <primary artifact>
- <secondary artifacts>
- next_skill_handoff

Output format:
<markdown + JSON/YAML artifact requirements>

Then apply the shared prompt suffix.
```

## P0/P1 granular prompts

### request-intake-normalizer

```text
Create a ChatGPT skill named `request-intake-normalizer`.

Purpose: Normalize raw human requests, scheduled task prompts, issues, PR events, or repository events into a stable request envelope.

Use when: any Cloud Agent SDLC run begins and the request has not yet been converted into structured form.

Expected inputs:
- raw_request or event payload
- repository name and project slug
- actor and trigger type
- cadence if scheduled
- current continuity state if available

Expected outputs:
- request_envelope.json
- normalized summary
- assumptions and missing inputs
- next_skill_handoff for `objective-classifier`

Output format: Markdown summary plus JSON object matching `request-envelope.schema.json`.
```

### objective-classifier

```text
Create a ChatGPT skill named `objective-classifier`.

Purpose: Classify the normalized request into the correct objective type and risk class.

Use when: a `request_envelope.json` exists but no objective classification exists.

Expected inputs:
- request_envelope.json
- known project state
- active work orders, issues, and PRs when available

Expected outputs:
- objective_classification.json
- primary objective type
- secondary objective types
- risk precheck
- next_skill_handoff for `problem-type-router`

Objective types: new_system, new_feature, refactor, bug_fix, migration, external_library, experiment, diagnosis, documentation, release, operations.
```

### problem-type-router

```text
Create a ChatGPT skill named `problem-type-router`.

Purpose: Choose the canonical SDLC route and skill chain for the classified request.

Use when: an objective classification exists and the pipeline needs to know which skills to invoke next.

Expected inputs:
- objective_classification.json
- current repo memory
- available skill registry
- cadence or operator mode

Expected outputs:
- route_plan.json
- required skills
- optional default-off skills
- blocked paths
- next_skill_handoff for `authority-and-constraint-extractor` and `domain-context-locator`
```

### authority-and-constraint-extractor

```text
Create a ChatGPT skill named `authority-and-constraint-extractor`.

Purpose: Extract source-of-truth order, hard constraints, approval boundaries, non-goals, security restrictions, runtime restrictions, and quality bars.

Use when: a route plan exists and the agent must know what it may and may not do.

Expected inputs:
- route_plan.json
- docs, runbooks, ADRs, current-task files, issues, PRs

Expected outputs:
- constraint_contract.json
- authority stack
- approval boundaries
- non-goals
- quality bar
- next_skill_handoff for `domain-context-locator`
```

### domain-context-locator

```text
Create a ChatGPT skill named `domain-context-locator`.

Purpose: Locate the relevant files, packages, apps, modules, docs, runbooks, tests, and prior decisions for the request.

Use when: a request has been routed and the agent must curate context before reasoning.

Expected inputs:
- route_plan.json
- constraint_contract.json
- repository index
- knowledge index

Expected outputs:
- context_pack_manifest.json
- candidate paths
- relevant docs
- missing context
- next_skill_handoff for `impacted-system-cartographer`
```

### impacted-system-cartographer

```text
Create a ChatGPT skill named `impacted-system-cartographer`.

Purpose: Map direct and indirect impacted systems, runtime surfaces, related sibling patterns, and owner boundaries.

Use when: the agent needs to understand blast radius before architecture or implementation planning.

Expected inputs:
- context_pack_manifest.json
- dependency graph
- target or changed paths

Expected outputs:
- impacted_systems.json
- direct dependencies and dependents
- sibling-pattern candidates
- runtime surfaces
- next_skill_handoff for `blast-radius-preflight-analyzer`
```

### blast-radius-preflight-analyzer

```text
Create a ChatGPT skill named `blast-radius-preflight-analyzer`.

Purpose: Estimate risk before changes by analyzing dependencies, public contracts, shared abstractions, generated files, migrations, and runtime ownership.

Use when: impacted systems are known but before insertion points or code plans are approved.

Expected inputs:
- impacted_systems.json
- target paths
- objective_classification.json

Expected outputs:
- blast_radius_report.json
- risk score
- manual review triggers
- high-risk files
- test expansion requirements
- next_skill_handoff for `architecture-snapshot-reader`
```

### architecture-snapshot-reader

```text
Create a ChatGPT skill named `architecture-snapshot-reader`.

Purpose: Summarize the current architecture of the affected system from code, docs, tests, diagrams, and ADRs.

Use when: the agent needs system understanding before selecting insertion points or abstractions.

Expected inputs:
- context_pack_manifest.json
- impacted_systems.json
- constraint_contract.json
- existing ADRs and diagrams when available

Expected outputs:
- architecture_snapshot.json
- current boundaries
- known patterns
- extension points
- architecture gaps
- next_skill_handoff for `insertion-point-locator`
```

### insertion-point-locator

```text
Create a ChatGPT skill named `insertion-point-locator`.

Purpose: Find the exact approved insertion points for the requested work.

Use when: architecture has been summarized and a work order needs scoped files, symbols, routes, commands, blocks, adapters, or tests.

Expected inputs:
- architecture_snapshot.json
- blast_radius_report.json
- request contract

Expected outputs:
- insertion_point_map.json
- owned files
- forbidden files
- integration points
- test targets
- next_skill_handoff for `abstraction-opportunity-finder`
```

### abstraction-opportunity-finder

```text
Create a ChatGPT skill named `abstraction-opportunity-finder`.

Purpose: Decide whether the correct implementation shape is direct code, base abstraction, interface extraction, adapter boundary, composition, or deferral.

Use when: insertion points exist and the agent must avoid under-abstracting or over-abstracting.

Expected inputs:
- insertion_point_map.json
- architecture_snapshot.json
- repetition or variation evidence

Expected outputs:
- abstraction_decision.json
- abstraction candidates
- reuse justification
- do-not-abstract warnings
- next_skill_handoff for `base-interface-class-planner` or `contract-first-io-schema-writer`
```

### base-interface-class-planner

```text
Create a ChatGPT skill named `base-interface-class-planner`.

Purpose: Plan base classes, abstract classes, interfaces, traits, ports, generics, and dependency inversion points when justified.

Use when: an abstraction decision requires a reusable contract or inheritance/composition boundary.

Expected inputs:
- abstraction_decision.json
- language context
- runtime constraints

Expected outputs:
- interface_plan.json
- base types
- extension points
- migration steps
- compatibility notes
- next_skill_handoff for `adapter-boundary-planner` or `contract-first-io-schema-writer`
```

### contract-first-io-schema-writer

```text
Create a ChatGPT skill named `contract-first-io-schema-writer`.

Purpose: Define input and output schemas before pseudocode or implementation.

Use when: insertion points and any interface/adapter decisions are known.

Expected inputs:
- request contract
- insertion_point_map.json
- interface_plan.json if available
- adapter_boundary_contract.json if available

Expected outputs:
- io_contract.schema.json
- example inputs and outputs
- error schema
- compatibility rules
- next_skill_handoff for `data-model-type-system-designer`
```

### data-model-type-system-designer

```text
Create a ChatGPT skill named `data-model-type-system-designer`.

Purpose: Map IO schemas into target language/framework types with type safety rules.

Use when: IO schema exists and the agent must plan static types, runtime validation, nullability, ownership, or serialization.

Expected inputs:
- io_contract.schema.json
- language context
- framework context

Expected outputs:
- type_system_plan.json
- types to create
- types to reuse
- type-safety gates
- next_skill_handoff for `pseudocode-spec-writer`
```

### pseudocode-spec-writer

```text
Create a ChatGPT skill named `pseudocode-spec-writer`.

Purpose: Write structured language-neutral pseudocode from requirements, architecture, schemas, types, insertion points, and acceptance criteria.

Use when: IO schemas and type plan exist and the pipeline needs a code-generation-neutral plan.

Expected inputs:
- io_contract.schema.json
- type_system_plan.json
- insertion_point_map.json
- acceptance criteria

Expected outputs:
- pseudocode_contract.md
- pseudocode_contract.json
- control flow
- data flow
- side effects
- next_skill_handoff for `algorithm-decomposition-planner`
```

### memory-lifecycle-analyzer

```text
Create a ChatGPT skill named `memory-lifecycle-analyzer`.

Purpose: Analyze state ownership, allocation, borrowing, copying, caching, lifecycle, cleanup, and retention risk before implementation.

Use when: pseudocode exists and implementation language/runtime may affect memory, state, concurrency, or performance.

Expected inputs:
- pseudocode_contract.json
- type_system_plan.json
- language context

Expected outputs:
- memory_lifecycle_report.json
- state ownership map
- lifetime notes
- retention risks
- cleanup plan
- next_skill_handoff for `complexity-notation-assessor`
```

### complexity-notation-assessor

```text
Create a ChatGPT skill named `complexity-notation-assessor`.

Purpose: Estimate initial Big-O time and space complexity and record performance budget assumptions.

Use when: pseudocode and memory lifecycle analysis exist.

Expected inputs:
- algorithm_decomposition.json
- memory_lifecycle_report.json
- data-size assumptions

Expected outputs:
- complexity_assessment.json
- time complexity
- space complexity
- hotspots
- benchmark suggestions
- next_skill_handoff for `pseudocode-review-verifier`
```

### pseudocode-review-verifier

```text
Create a ChatGPT skill named `pseudocode-review-verifier`.

Purpose: Verify pseudocode is complete, testable, type-safe, architecture-aligned, and implementation-ready.

Use when: pseudocode, IO schema, type plan, memory lifecycle, and complexity assessment exist.

Expected inputs:
- pseudocode_contract.json
- io_contract.schema.json
- type_system_plan.json
- memory_lifecycle_report.json
- complexity_assessment.json

Expected outputs:
- pseudocode_review_report.json
- definition-of-ready verdict
- blocking gaps
- approved-for-codegen flag
- next_skill_handoff for `test-from-pseudocode-generator`
```

### test-from-pseudocode-generator

```text
Create a ChatGPT skill named `test-from-pseudocode-generator`.

Purpose: Generate test specifications from pseudocode, acceptance criteria, schemas, and blast-radius risks.

Use when: pseudocode has passed the review gate.

Expected inputs:
- pseudocode_contract.json
- acceptance criteria
- io_contract.schema.json
- blast_radius_report.json

Expected outputs:
- test_specification.json
- fixtures
- expected results
- validation commands
- next_skill_handoff for `pseudocode-to-language-plan-compiler`
```

### pseudocode-to-language-plan-compiler

```text
Create a ChatGPT skill named `pseudocode-to-language-plan-compiler`.

Purpose: Compile approved pseudocode into a language/framework-specific implementation plan.

Use when: pseudocode and test specs are approved and implementation can be planned.

Expected inputs:
- pseudocode_review_report.json
- language context
- insertion_point_map.json
- test_specification.json

Expected outputs:
- codegen_plan.json
- file edit plan
- language rules
- implementation sequence
- validation commands
- next_skill_handoff for `codegen-contract-builder`
```

### codegen-contract-builder

```text
Create a ChatGPT skill named `codegen-contract-builder`.

Purpose: Create the final contract that constrains code generation to approved files, tests, schemas, locks, PR, work order, rollback, and validation requirements.

Use when: a codegen plan exists and the agent is ready to implement.

Expected inputs:
- codegen_plan.json
- file locks
- active PR
- work order

Expected outputs:
- codegen_contract.json
- allowed files
- forbidden files
- validation commands
- rollback plan
- next_skill_handoff for `code-from-pseudocode-generator`
```

### code-from-pseudocode-generator

```text
Create a ChatGPT skill named `code-from-pseudocode-generator`.

Purpose: Generate or edit code from approved pseudocode and codegen contract without expanding scope.

Use when: implementation is approved by the codegen contract.

Expected inputs:
- codegen_contract.json
- pseudocode_contract.json
- repository files

Expected outputs:
- implementation diff
- changed files
- implementation notes
- unresolved questions
- next_skill_handoff for `type-safety-implementation-enforcer`
```

### adr-draft-writer

```text
Create a ChatGPT skill named `adr-draft-writer`.

Purpose: Write ADR documents for material architecture, abstraction, schema, performance, persistence, integration, tool, or trade-off decisions.

Use when: the agent makes or detects a decision that should be historically inspectable.

Expected inputs:
- decision context
- options considered
- chosen option
- consequences
- affected artifacts

Expected outputs:
- adr.md
- adr_metadata.json
- decision summary
- follow-up actions
- next_skill_handoff for `adr-indexer`
```

### human-code-delta-ingestor

```text
Create a ChatGPT skill named `human-code-delta-ingestor`.

Purpose: Ingest approved human engineer code changes and convert them into updated architecture, pseudocode, ADR, test, and memory tasks.

Use when: code changes were made outside the autonomous codegen chain.

Expected inputs:
- git diff
- commits
- human notes
- active work order

Expected outputs:
- human_delta_record.json
- reverse sync plan
- missing docs
- required ADR updates
- next_skill_handoff for `code-to-pseudocode-reconciler`
```

### code-to-pseudocode-reconciler

```text
Create a ChatGPT skill named `code-to-pseudocode-reconciler`.

Purpose: Reverse-synchronize accepted code changes back into pseudocode, schemas, diagrams, tests, and work-order memory.

Use when: human code or implementation drift makes the upstream artifacts stale.

Expected inputs:
- human_delta_record.json or implementation diff
- current pseudocode contract
- current schemas
- architecture snapshot

Expected outputs:
- pseudocode_patch.json
- schema patch candidates
- diagram patch candidates
- parity gaps
- next_skill_handoff for `parity-sync-manager`
```

### parity-sync-manager

```text
Create a ChatGPT skill named `parity-sync-manager`.

Purpose: Maintain two-way parity between requirements, schemas, pseudocode, code, tests, diagrams, ADRs, evidence, and memory.

Use when: any major artifact has changed or a work order is being closed.

Expected inputs:
- artifact diffs
- implementation diff
- validation report
- ADR index
- current memory state

Expected outputs:
- parity_report.json
- out-of-sync artifacts
- sync patches
- human-review-needed flag
- next_skill_handoff for `memory-continuity-manager`
```
