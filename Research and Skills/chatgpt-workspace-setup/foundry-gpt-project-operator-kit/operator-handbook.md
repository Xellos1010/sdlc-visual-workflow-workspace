# Operator Handbook

## 1. Choose your topology

### On phone right now
Use the Projects-only chain in `phone-projects/`.

### On desktop later
Build the 5 specialist GPTs from `specialist-gpts/`.

## 2. What to create first

### If you are on phone
Create these Projects in order:
1. Flagship Foundry — Intake & Routing
2. Flagship Foundry — Architecture Studio
3. Flagship Foundry — Work-Order Factory
4. Flagship Foundry — Verification, Release & Learning
5. Flagship Foundry — Import Relay

### If you are on desktop
Create these GPTs in order:
1. Foundry Intake Orchestrator
2. Foundry Architecture Studio
3. Foundry Work-Order Factory
4. Foundry Verification & Release
5. Foundry Import Relay

## 3. First input packet you provide

For the very first request, give ChatGPT:
- project or ecosystem name
- what completed step should update pipeline requirements
- what user or system outcome changes after shipping
- constraints
- success criteria
- rollback idea
- current repo/module location
- framework requirements
- target Foundry workspace path or import target if known

Use `templates/initial-change-request.md`.

## 4. Operator chaining

### Chain 1 — Intake to Architecture
Start in Intake.
Ask it to emit a strict intent packet and DoR checklist.
Do not move to architecture until open questions are either resolved or explicitly accepted as assumptions.

### Chain 2 — Architecture to Work Orders
Start in Architecture Studio.
Ask it to emit diagrams, ADRs, contracts, function IO schemas, decomposition, and expected system output diagrams.
Only after these exist should you move to Work-Order Factory.

### Chain 3 — Work Orders to Execution
Start in Work-Order Factory.
Ask it to turn architecture into bounded work orders.
Each work order must be independent enough for a low-cost model to execute without hidden context.

### Chain 4 — Execution to Verification
After builders run, move the outputs to Verification & Release.
It should distrust builder claims, re-check criteria, produce evidence, then create release/handoff/learning artifacts.

### Chain 5 — Verification to Foundry import
Finally use Import Relay.
It produces the import order and the manifests for:
- pre-implementation design artifact import
- post-verification evidence and learning import

## 5. What to import into Foundry and when

### Import before implementation
Import after architecture is approved:
- intent packet
- diagrams
- ADRs
- contracts and schemas
- decomposition plan
- work-order batch, if approved

### Import after verification
Import only after PASS or accepted MIXED:
- verification report
- evidence bundle
- release notes
- handoff
- continuity patch
- learning record

## 6. Cost strategy

Use expensive reasoning only for:
- scope clarification
- architecture tradeoffs
- ADR decisions
- system decomposition

Use cheaper execution models for:
- deterministic transformation work orders
- schema generation
- file-scoped module tasks
- structured doc generation

Use balanced models for:
- verification
- diagnostics
- learning extraction

## 7. Required quality bar for a work order

A work order is not ready unless it contains:
- exact module/component name
- exact path or hierarchy target
- file scope
- tests to create first
- function pseudocode
- input/output schema per changed public function
- framework constraints
- verification commands
- acceptance criteria
- rollback notes

## 8. Paste-ready kickoff prompt

Use `prompts/kickoff-projects-only.md` on phone or `prompts/kickoff-specialist-gpts.md` on desktop.

## 9. Minimal operating rule

Do not let implementation begin until architecture has produced:
- impacted system view
- ADRs
- trust boundaries
- contracts
- IO schemas
- UML / expected output diagrams
- decomposition plan
- work-order-ready acceptance criteria
