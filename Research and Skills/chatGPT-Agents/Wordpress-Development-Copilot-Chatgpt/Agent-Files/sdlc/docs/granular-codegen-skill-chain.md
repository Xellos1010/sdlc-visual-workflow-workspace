# Granular Request → Pseudocode → Codegen → ADR → Parity Skill Chain

This addendum defines the missing granular skills for a strict autonomous SDLC pipeline. The goal is to prevent agents from jumping from a request directly to code. Each skill is a bounded transformation step with explicit inputs, explicit outputs, and a handoff contract for the next skill.

## Non-negotiable operating rule

Every autonomous implementation must pass through this chain unless an existing approved artifact already satisfies that step:

```text
request → classification → authority/constraints → context → impacted systems → blast radius → architecture snapshot → insertion points → abstraction/interface/adapters → IO schemas → type plan → pseudocode → algorithm decomposition → memory lifecycle → complexity assessment → tests → codegen plan → codegen contract → code → type/scope review → validation → ADR/decision ledger → parity sync → memory update
```

Optional visual diagramming stays default-off. A visual skill can be invoked when the system is ambiguous, the blast radius is high, the human operator asks for it, or the next skill needs a diagram artifact as input.

## Canonical autonomous chain

| Step | Skill | Required input | Required output | Next handoff |
|---:|---|---|---|---|
| 1 | `request-intake-normalizer` | raw request, schedule/issue/PR event, repo context | `request_envelope.json` | `objective-classifier` |
| 2 | `objective-classifier` | `request_envelope.json` | `objective_classification.json` | `problem-type-router` |
| 3 | `problem-type-router` | classification, repo memory, skill registry | `route_plan.json` | constraint/context skills |
| 4 | `authority-and-constraint-extractor` | route plan, docs, runbooks, current-task | `constraint_contract.json` | context locator |
| 5 | `domain-context-locator` | route plan, repo index, knowledge index | `context_pack_manifest.json` | impacted system mapper |
| 6 | `impacted-system-cartographer` | context pack, dependency graph, target paths | `impacted_systems.json` | blast-radius preflight |
| 7 | `blast-radius-preflight-analyzer` | impacted systems, target paths, objective class | `blast_radius_report.json` | architecture snapshot |
| 8 | `architecture-snapshot-reader` | context, impacted systems, authority stack | `architecture_snapshot.json` | insertion point locator |
| 9 | `architecture-drift-detector` | architecture snapshot, ADRs, code reality | `architecture_drift_report.json` | insertion point or ADR |
| 10 | `insertion-point-locator` | architecture snapshot, blast-radius report | `insertion_point_map.json` | abstraction finder |
| 11 | `abstraction-opportunity-finder` | insertion map, repetition evidence, current architecture | `abstraction_decision.json` | base/interface planner or IO schema |
| 12 | `base-interface-class-planner` | abstraction decision, language context | `interface_plan.json` | adapter/dependency planner |
| 13 | `adapter-boundary-planner` | interface plan, integrations, event requirements | `adapter_boundary_contract.json` | IO schema writer |
| 14 | `dependency-inversion-planner` | architecture snapshot, interface plan | `dependency_inversion_plan.json` | IO schema writer |
| 15 | `contract-first-io-schema-writer` | request contract, insertion map, interface plan | `io_contract.schema.json` | type system designer |
| 16 | `data-model-type-system-designer` | IO schema, language/framework context | `type_system_plan.json` | event modeler or pseudocode writer |
| 17 | `event-contract-modeler` | IO schema, adapter boundary, runtime topology | `event_contract.json` | pseudocode writer |
| 18 | `pseudocode-spec-writer` | IO schema, type plan, insertion map, acceptance criteria | `pseudocode_contract.md` and `pseudocode_contract.json` | algorithm decomposition |
| 19 | `algorithm-decomposition-planner` | pseudocode contract, architecture snapshot | `algorithm_decomposition.json` | memory lifecycle / complexity |
| 20 | `memory-lifecycle-analyzer` | pseudocode, type plan, language context | `memory_lifecycle_report.json` | complexity assessment |
| 21 | `complexity-notation-assessor` | algorithm decomposition, lifecycle report, data assumptions | `complexity_assessment.json` | pseudocode review |
| 22 | `concurrency-state-safety-analyzer` | algorithm decomposition, event contract, runtime context | `concurrency_safety_report.json` | pseudocode review |
| 23 | `observability-instrumentation-planner` | IO schema, complexity, runtime context | `observability_plan.json` | pseudocode review |
| 24 | `pseudocode-review-verifier` | pseudocode, IO schema, type plan, complexity, memory lifecycle | `pseudocode_review_report.json` | tests and codegen plan |
| 25 | `test-from-pseudocode-generator` | pseudocode, acceptance criteria, IO schema, risk gates | `test_specification.json` | codegen plan |
| 26 | `pseudocode-to-language-plan-compiler` | pseudocode review, language context, insertion map, test spec | `codegen_plan.json` | codegen contract |
| 27 | `codegen-contract-builder` | codegen plan, file locks, active PR, work order | `codegen_contract.json` | code generator |
| 28 | `code-from-pseudocode-generator` | codegen contract, pseudocode, repo files | implementation diff | type/scope review |
| 29 | `type-safety-implementation-enforcer` | implementation diff, IO schema, type plan | `type_safety_report.json` | generated code review |
| 30 | `implementation-insertion-verifier` | implementation diff, insertion map, codegen contract | `insertion_verification_report.json` | generated code review |
| 31 | `generated-code-reviewer` | implementation diff, tests, complexity, observability | `generated_code_review.md` | test execution |
| 32 | `test-execution-verifier` | validation commands, changed files, test spec | `validation_report.json` and evidence bundle | ADR/ledger/parity |
| 33 | `adr-draft-writer` | decision context, options, chosen option, consequences | `adr.md` | ADR indexer |
| 34 | `adr-indexer` | ADR, work order, decision ledger, evidence | `adr_index_patch.json` | decision ledger |
| 35 | `decision-tradeoff-ledger` | decision context, ADR metadata, agent summary | `decision_ledger_entry.json` | parity manager |
| 36 | `parity-sync-manager` | requirements, schemas, pseudocode, code, tests, ADRs, evidence | `parity_report.json` | memory continuity |
| 37 | `memory-continuity-manager` | parity report, evidence, locks, active PR | continuity patch | next work order |

## Two-way parity chain for human engineer edits

When an approved software engineer changes code directly, code is allowed to lead temporarily. The system must reverse-synchronize that code back into the planning artifacts.

```text
human diff → human-code-delta-ingestor → code-to-pseudocode-reconciler → software-engineer-decision-capture → adr-draft-writer → parity-sync-manager → memory-continuity-manager
```

| Skill | Trigger | Output |
|---|---|---|
| `human-code-delta-ingestor` | approved human commit, PR, local diff, or patch | `human_delta_record.json` |
| `code-to-pseudocode-reconciler` | code differs from generated pseudocode or schemas | `pseudocode_patch.json` and `schema_patch_candidates` |
| `software-engineer-decision-capture` | human code implies a design choice not in ADRs | `human_decision_capture.md` and ADR candidates |
| `semantic-diff-explainer` | reviewer needs human-readable meaning of diff | `semantic_diff_report.md` |
| `architecture-drift-detector` | code reality diverges from intended architecture | `architecture_drift_report.json` |
| `parity-sync-manager` | any artifact changes | `parity_report.json` |

## Skill definitions

### `request-intake-normalizer`

Purpose: normalize raw human requests, scheduled task prompts, issues, PR events, or repo events into a stable request envelope.

Inputs:
- raw request or event payload
- repository name and project slug
- actor and trigger type
- cadence, if scheduled
- current continuity state, if available

Outputs:
- `request_envelope.json`
- concise normalized summary
- assumptions and missing inputs
- `next_skill_handoff` for `objective-classifier`

### `objective-classifier`

Purpose: classify the request as `new_system`, `new_feature`, `refactor`, `bug_fix`, `migration`, `external_library`, `experiment`, `diagnosis`, `documentation`, `release`, or `operations`.

Outputs:
- `objective_classification.json`
- primary objective
- secondary objectives
- risk precheck
- recommended route family

### `problem-type-router`

Purpose: choose the specific SDLC route and skill chain for the classified request.

Outputs:
- `route_plan.json`
- required skills
- optional skills default-off
- blocked paths
- model tier recommendation

### `authority-and-constraint-extractor`

Purpose: extract source-of-truth order, hard constraints, approvals, non-goals, security boundaries, runtime restrictions, and quality bars.

Outputs:
- `constraint_contract.json`
- authority stack
- approval boundaries
- non-goals
- quality bar

### `domain-context-locator`

Purpose: locate the relevant repo areas, docs, packages, apps, modules, runbooks, prior decisions, and tests.

Outputs:
- `context_pack_manifest.json`
- candidate paths
- relevant docs
- missing context

### `impacted-system-cartographer`

Purpose: map direct and indirect impacted systems before design or implementation.

Outputs:
- `impacted_systems.json`
- direct dependencies
- dependents
- runtime surfaces
- sibling patterns
- owner boundaries

### `blast-radius-preflight-analyzer`

Purpose: estimate risk before changes using dependencies, public contracts, shared abstractions, generated files, migrations, and runtime ownership.

Outputs:
- `blast_radius_report.json`
- risk score
- manual review triggers
- high-risk files
- test expansion requirements

### `architecture-snapshot-reader`

Purpose: summarize current architecture of the affected system from code, docs, diagrams, tests, and ADRs.

Outputs:
- `architecture_snapshot.json`
- boundaries
- current patterns
- existing extension points
- known tradeoffs
- gaps

### `architecture-drift-detector`

Purpose: detect drift between intended architecture, diagrams, ADRs, schemas, and code reality.

Outputs:
- `architecture_drift_report.json`
- drift severity
- repair candidates
- ADR update needs

### `insertion-point-locator`

Purpose: find where work should attach: files, classes, functions, interfaces, adapters, routes, commands, components, blocks, schemas, tests.

Outputs:
- `insertion_point_map.json`
- owned files
- forbidden files
- integration points
- test targets

### `abstraction-opportunity-finder`

Purpose: decide whether to implement directly, extract base abstractions, define interfaces, create adapters, compose existing modules, or defer.

Outputs:
- `abstraction_decision.json`
- abstraction candidates
- reuse justification
- anti-abstraction warnings

### `base-interface-class-planner`

Purpose: plan base classes, abstract classes, interfaces, traits, ports, adapters, generics, or dependency inversion points only when justified.

Outputs:
- `interface_plan.json`
- base types
- extension points
- migration steps
- compatibility notes

### `adapter-boundary-planner`

Purpose: define adapter seams for external APIs, message endpoints, plugins, MCP tools, databases, and vendor-specific implementations.

Outputs:
- `adapter_boundary_contract.json`
- ports
- adapters
- error boundaries
- retry policy
- observability points

### `dependency-inversion-planner`

Purpose: ensure high-level modules depend on contracts rather than low-level details.

Outputs:
- `dependency_inversion_plan.json`
- allowed imports
- disallowed imports
- refactor steps

### `contract-first-io-schema-writer`

Purpose: define inputs and outputs before pseudocode or code, including validation, defaults, errors, versions, serialization, and compatibility.

Outputs:
- `io_contract.schema.json`
- example inputs
- example outputs
- error schema
- compatibility rules

### `data-model-type-system-designer`

Purpose: map schemas into language/framework types with nullability, generics, enums, discriminated unions, ownership expectations, and serialization rules.

Outputs:
- `type_system_plan.json`
- types to create
- types to reuse
- type-safety gates

### `event-contract-modeler`

Purpose: define event names, payloads, producers, consumers, ordering, idempotency, retries, and dead-letter behavior.

Outputs:
- `event_contract.json`
- producer/consumer map
- handler contracts
- idempotency rules

### `pseudocode-spec-writer`

Purpose: write structured language-neutral pseudocode from requirements, architecture, schemas, insertion points, and acceptance criteria.

Outputs:
- `pseudocode_contract.md`
- `pseudocode_contract.json`
- control flow
- data flow
- side effects

Pseudocode format:

```yaml
pseudocode_contract:
  id: <work-order-id>
  purpose: <one sentence>
  inputs:
    - name: <input>
      type: <type/schema ref>
      required: true
  outputs:
    - name: <output>
      type: <type/schema ref>
  preconditions: []
  postconditions: []
  steps:
    - id: step-001
      action: <language-neutral operation>
      reads: []
      writes: []
      calls: []
      errors: []
  side_effects: []
  observability: []
  tests_implied: []
```

### `algorithm-decomposition-planner`

Purpose: break pseudocode into functions, methods, modules, tasks, handlers, state transitions, and reusable operations.

Outputs:
- `algorithm_decomposition.json`
- function inventory
- module boundaries
- call graph

### `memory-lifecycle-analyzer`

Purpose: analyze state ownership, allocation, borrowing, copying, caching, lifecycle, cleanup, and retention risk before implementation.

Outputs:
- `memory_lifecycle_report.json`
- state ownership map
- lifetime notes
- retention risks
- cleanup plan

Language-specific checks:
- Rust: ownership, borrowing, lifetimes, Send/Sync, Arc/Mutex, channels, async cancellation
- TypeScript: object retention, async closure capture, type narrowing, mutation, cache lifecycle
- React: state ownership, memoization, effects, re-render cost, stale closures
- Node: streams, timers, handles, listeners, cleanup
- Python: references, generators, context managers, resource cleanup

### `complexity-notation-assessor`

Purpose: estimate initial Big-O time and space complexity and record performance budget assumptions.

Outputs:
- `complexity_assessment.json`
- time complexity
- space complexity
- data-size assumptions
- hotspots
- benchmark suggestions

### `concurrency-state-safety-analyzer`

Purpose: analyze async tasks, locks, transactions, race conditions, event ordering, cancellation, and deadlock risk.

Outputs:
- `concurrency_safety_report.json`
- state risks
- lock strategy
- cancellation policy
- transaction boundaries

### `observability-instrumentation-planner`

Purpose: define logs, metrics, traces, spans, audit events, error classes, and debug affordances required by the design.

Outputs:
- `observability_plan.json`
- log points
- metrics
- trace spans
- alert candidates

### `pseudocode-review-verifier`

Purpose: verify pseudocode is complete, testable, type-safe, architecture-aligned, and implementation-ready.

Outputs:
- `pseudocode_review_report.json`
- definition-of-ready verdict
- blocking gaps
- approved-for-codegen flag

### `test-from-pseudocode-generator`

Purpose: generate unit, integration, e2e, smoke, property, and regression test specifications from pseudocode and acceptance criteria.

Outputs:
- `test_specification.json`
- fixtures
- expected results
- commands
- coverage requirements

### `pseudocode-to-language-plan-compiler`

Purpose: compile approved pseudocode into language/framework-specific implementation steps.

Outputs:
- `codegen_plan.json`
- file edit plan
- language rules
- implementation sequence
- validation commands

### `codegen-contract-builder`

Purpose: constrain code generation to approved files, tests, schemas, locks, PR, work order, rollback, and validation requirements.

Outputs:
- `codegen_contract.json`
- allowed files
- forbidden files
- validation commands
- rollback plan

### `code-from-pseudocode-generator`

Purpose: generate or edit code from approved pseudocode without expanding scope.

Outputs:
- implementation diff
- changed files
- implementation notes
- unresolved questions

### `type-safety-implementation-enforcer`

Purpose: verify implementation preserves schemas, types, nullability, errors, serialization, ownership, and boundary contracts.

Outputs:
- `type_safety_report.json`
- violations
- fix plan
- typecheck commands

### `implementation-insertion-verifier`

Purpose: verify generated code attached at approved insertion points and did not mutate forbidden layers or unrelated modules.

Outputs:
- `insertion_verification_report.json`
- scope violations
- layering violations
- approved flag

### `generated-code-reviewer`

Purpose: review generated code for correctness, maintainability, security, performance, observability, tests, and architecture alignment.

Outputs:
- `generated_code_review.md`
- findings JSON
- required fixes
- ready-for-validation flag

### `test-execution-verifier`

Purpose: run or specify validation, interpret results, and block completion when tests are missing or failing.

Outputs:
- `validation_report.json`
- evidence bundle
- pass/fail verdict
- corrective work order

### `adr-draft-writer`

Purpose: write an ADR for material architecture, abstraction, contract, performance, persistence, tool, or trade-off decisions.

Outputs:
- `adr.md`
- `adr_metadata.json`
- decision summary
- follow-up actions

ADR format:

```markdown
# ADR-<id>: <title>

## Status
Proposed | Accepted | Superseded | Rejected

## Context
<problem, forces, constraints, evidence>

## Options considered
1. <option, benefits, risks>
2. <option, benefits, risks>

## Decision
<chosen option>

## Consequences
- Positive:
- Negative:
- Neutral:

## Reversal triggers
<signals that should reopen this decision>

## Linked artifacts
- Work order:
- Pseudocode:
- Schema:
- Code diff:
- Evidence:
```

### `adr-indexer`

Purpose: add ADRs to the decision index and link them to work orders, schemas, pseudocode, code diffs, and evidence.

Outputs:
- `adr_index_patch.json`
- cross-links
- inspection tags

### `decision-tradeoff-ledger`

Purpose: record decisions, alternatives, tradeoffs, assumptions, reversal triggers, and inspection handles.

Outputs:
- `decision_ledger_entry.json`
- inspection summary
- reversal conditions

### `human-code-delta-ingestor`

Purpose: ingest approved engineer code changes and convert them into updated architecture, pseudocode, ADR, test, and memory tasks.

Outputs:
- `human_delta_record.json`
- reverse sync plan
- missing docs
- required ADR updates

### `software-engineer-decision-capture`

Purpose: ask or infer what decision a human engineer made when code diverged from generated plan, without inventing hidden intent.

Outputs:
- `human_decision_capture.md`
- questions for engineer
- ADR update candidates

### `code-to-pseudocode-reconciler`

Purpose: reverse-synchronize accepted code changes back into pseudocode, schemas, diagrams, tests, and work-order memory.

Outputs:
- `pseudocode_patch.json`
- schema patch candidates
- diagram patch candidates
- parity gaps

### `semantic-diff-explainer`

Purpose: explain code, schema, pseudocode, and ADR diffs in semantic terms for inspection and review.

Outputs:
- `semantic_diff_report.md`
- risk summary
- review questions

### `performance-budget-enforcer`

Purpose: compare actual or expected performance against the complexity assessment and project performance budget.

Outputs:
- `performance_budget_report.json`
- violations
- mitigation work orders

### `parity-sync-manager`

Purpose: keep requirements, schemas, pseudocode, code, tests, diagrams, ADRs, evidence, and memory synchronized after both agent and human changes.

Outputs:
- `parity_report.json`
- out-of-sync artifacts
- sync patches
- human-review-needed flag

### `pair-programming-copilot-router`

Purpose: enable human-AI pair programming mode with interactive questions, diagrams, and checkpoints. Default-off for autonomous runs.

Outputs:
- pairing plan
- operator questions
- optional diagrams
- manual checkpoints

## Optional visual diagramming skills, default off

| Skill | Use only when | Output |
|---|---|---|
| `request-scope-map-diagrammer` | request has many systems or unclear scope | request scope graph |
| `c4-diagram-generator` | system/container/component boundaries matter | C4 Mermaid/Structurizr diagram |
| `uml-component-modeler` | class/module relationships are non-trivial | UML component/class diagram |
| `sequence-flow-generator` | cross-service calls or user flows matter | sequence diagram |
| `state-machine-modeler` | lifecycle states or async job states matter | state machine |
| `dataflow-event-modeler` | events, queues, webhooks, adapters matter | dataflow/event diagram |
| `algorithm-flowchart-generator` | algorithm needs human inspection | flowchart |
| `memory-lifetime-flowchart` | state ownership/lifecycle is risky | memory lifecycle diagram |
| `work-order-dag-visualizer` | parallelization or blocking is complex | work-order DAG |
| `blast-radius-graph-visualizer` | risk score is high | impacted-system graph |

## Autonomous vs pair-programming behavior

Default autonomous mode:
- self-reason decisions inside approved boundaries
- write ADR candidates for material tradeoffs
- only escalate when a decision is business/compliance/destructive/external/ambiguous
- never skip schemas, pseudocode, tests, or validation when code changes are made

Optional pair-programming mode:
- pause after request classification, insertion-point selection, IO schema, pseudocode review, and ADR decisions
- provide visual diagrams when requested
- allow the engineer to modify code first, then run two-way parity sync

## Completion gate

A work order is not complete until these artifacts are synchronized:

- request envelope
- objective classification
- route plan
- impacted systems
- blast-radius report
- architecture snapshot
- insertion point map
- IO schema
- type system plan
- pseudocode contract
- memory lifecycle report
- complexity assessment
- test specification
- codegen contract
- implementation diff
- validation report
- ADR/decision ledger entry, if material decision occurred
- parity report
- continuity memory patch
