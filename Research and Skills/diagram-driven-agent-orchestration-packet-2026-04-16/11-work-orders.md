# Work Orders — Diagram-Driven Agent Orchestration Dashboard
Initiative: `diagram-driven-agent-orchestration-dashboard`
Phase: `discover` → `architect` kickoff
Generated: 2026-04-16

---

## Work Order: WO-DDAOD-01
- **Initiative**: Diagram-Driven Agent Orchestration Dashboard
- **Lifecycle Stage**: discover
- **Agent Role**: systems-architect
- **Subagent Type**: systems-architect
- **Model**: opus
- **Scope**: product thesis, object model, canonical artifact doctrine
- **Depends On**: none — starts immediately
- **Objective**: Define the product scope, object model, artifact authority stack, and release thesis.
- **Acceptance Criteria**:
  - [ ] object model approved
  - [ ] artifact contract draft produced
  - [ ] architecture principles documented
- **Verification**:
  - Review `04-product-architecture.md`
  - Review `08-artifact-contract.md`
- **Plan Approval Required**: yes

---

## Work Order: WO-DDAOD-02
- **Initiative**: Diagram-Driven Agent Orchestration Dashboard
- **Lifecycle Stage**: define
- **Agent Role**: repository-cartographer
- **Subagent Type**: repository-cartographer
- **Model**: sonnet
- **Scope**: parser adapters, source ingestion, IR requirements
- **Depends On**: WO-DDAOD-01
- **Objective**: Define how repos are ingested and normalized into a shared IR.
- **Acceptance Criteria**:
  - [ ] source unit schema documented
  - [ ] symbol graph extraction requirements defined
  - [ ] dependency graph extraction plan documented
- **Verification**:
  - Review `04-product-architecture.md`
  - Review `machine/artifact-contract.json`
- **Plan Approval Required**: yes

---

## Work Order: WO-DDAOD-03
- **Initiative**: Diagram-Driven Agent Orchestration Dashboard
- **Lifecycle Stage**: visualize
- **Agent Role**: diagram-architect
- **Subagent Type**: diagram-decision-matrix
- **Model**: sonnet
- **Scope**: diagram taxonomy, notation rules, view-selection logic
- **Depends On**: WO-DDAOD-01
- **Objective**: Define which diagrams are mandatory, optional, auto-generated, or human-curated.
- **Acceptance Criteria**:
  - [ ] diagram catalog complete
  - [ ] automation policy defined
  - [ ] legend/title rules defined
- **Verification**:
  - Review `03-diagram-catalog.md`
- **Plan Approval Required**: no

---

## Work Order: WO-DDAOD-04
- **Initiative**: Diagram-Driven Agent Orchestration Dashboard
- **Lifecycle Stage**: architect
- **Agent Role**: pseudocode-extractor
- **Subagent Type**: pseudocode-ledger-writer
- **Model**: sonnet
- **Scope**: pseudocode ledger format, function/module normalization rules
- **Depends On**: WO-DDAOD-02
- **Objective**: Standardize how extracted code logic is summarized into reusable pseudocode artifacts.
- **Acceptance Criteria**:
  - [ ] per-function schema defined
  - [ ] uncertainty flags defined
  - [ ] source-to-pseudocode traceability preserved
- **Verification**:
  - Review `08-artifact-contract.md`
  - Review `machine/artifact-contract.json`
- **Plan Approval Required**: yes

---

## Work Order: WO-DDAOD-05
- **Initiative**: Diagram-Driven Agent Orchestration Dashboard
- **Lifecycle Stage**: architect
- **Agent Role**: contract-analyst
- **Subagent Type**: contract-inventory-builder
- **Model**: sonnet
- **Scope**: schema extraction, IO boundaries, API contracts
- **Depends On**: WO-DDAOD-02
- **Objective**: Define the contract inventory and boundary analysis layer.
- **Acceptance Criteria**:
  - [ ] IO inventory schema defined
  - [ ] contract extraction pipeline described
  - [ ] schema versioning rules defined
- **Verification**:
  - Review `07-knowledge-base-blueprint.md`
- **Plan Approval Required**: yes

---

## Work Order: WO-DDAOD-06
- **Initiative**: Diagram-Driven Agent Orchestration Dashboard
- **Lifecycle Stage**: architect
- **Agent Role**: migration-strategist
- **Subagent Type**: migration-map-builder
- **Model**: opus
- **Scope**: keep/adapt/rewrite/defer model, target-platform profiles, gap matrix
- **Depends On**: WO-DDAOD-02, WO-DDAOD-04, WO-DDAOD-05
- **Objective**: Define the migration-planning core and target mapping doctrine.
- **Acceptance Criteria**:
  - [ ] migration gap matrix format defined
  - [ ] target mapping ledger format defined
  - [ ] risk classes documented
- **Verification**:
  - Review `machine/knowledge-base-blueprint.json`
  - Review `machine/skill-specs.json`
- **Plan Approval Required**: yes

---

## Work Order: WO-DDAOD-07
- **Initiative**: Diagram-Driven Agent Orchestration Dashboard
- **Lifecycle Stage**: architect
- **Agent Role**: ux-dashboard-architect
- **Subagent Type**: dashboard-projection-planner
- **Model**: opus
- **Scope**: dashboard shell, view model, information scent, saved layouts
- **Depends On**: WO-DDAOD-01, WO-DDAOD-03
- **Objective**: Design the dashboard shell and God View operating model.
- **Acceptance Criteria**:
  - [ ] core views defined
  - [ ] drill-down chain defined
  - [ ] action vs navigation rules defined
- **Verification**:
  - Review `09-dashboard-ux.md`
  - Review `diagrams/dashboard-shell.mmd`
- **Plan Approval Required**: yes

---

## Work Order: WO-DDAOD-08
- **Initiative**: Diagram-Driven Agent Orchestration Dashboard
- **Lifecycle Stage**: plan
- **Agent Role**: skill-designer
- **Subagent Type**: skill-creator
- **Model**: sonnet
- **Scope**: reusable skill package for analysis/migration packet generation
- **Depends On**: WO-DDAOD-01, WO-DDAOD-03, WO-DDAOD-04, WO-DDAOD-05, WO-DDAOD-06
- **Objective**: Package the reusable ChatGPT skill that standardizes the packet.
- **Acceptance Criteria**:
  - [ ] skill validates
  - [ ] `skill.zip` created
  - [ ] templates and scripts included
- **Verification**:
  - Run `python /home/oai/skills/skill-creator/scripts/package_skill.py <skill-folder>`
- **Plan Approval Required**: no

---

## Work Order: WO-DDAOD-09
- **Initiative**: Diagram-Driven Agent Orchestration Dashboard
- **Lifecycle Stage**: plan
- **Agent Role**: collaboration-server-architect
- **Subagent Type**: systems-architect
- **Model**: sonnet
- **Scope**: project registry, artifact store, approvals, evidence, multi-user sync
- **Depends On**: WO-DDAOD-01
- **Objective**: Define the collaboration server and project repository design.
- **Acceptance Criteria**:
  - [ ] core entities identified
  - [ ] sync model documented
  - [ ] approval/evidence ownership documented
- **Verification**:
  - Review `04-product-architecture.md`
  - Review `machine/pipeline.json`
- **Plan Approval Required**: yes

---

## Work Order: WO-DDAOD-10
- **Initiative**: Diagram-Driven Agent Orchestration Dashboard
- **Lifecycle Stage**: verify
- **Agent Role**: verifier
- **Subagent Type**: parity-verifier-planner
- **Model**: sonnet
- **Scope**: verification matrix, evidence bundle, pilot acceptance gate
- **Depends On**: WO-DDAOD-02 through WO-DDAOD-09
- **Objective**: Define how the pilot and the platform itself are verified.
- **Acceptance Criteria**:
  - [ ] verification matrix defined
  - [ ] evidence bundle structure defined
  - [ ] pilot acceptance gate documented
- **Verification**:
  - Review `08-artifact-contract.md`
  - Review `10-execution-roadmap.md`
- **Plan Approval Required**: yes

---

## Work Order: WO-DDAOD-DONE
- **Initiative**: Diagram-Driven Agent Orchestration Dashboard
- **Lifecycle Stage**: plan/architect acceptance gate
- **Agent Role**: lead
- **Subagent Type**: none
- **Model**: n/a
- **Scope**: whole packet
- **Depends On**: WO-DDAOD-01 through WO-DDAOD-10
- **Objective**: Validate that the planning packet is internally consistent and launch-ready.
- **Acceptance Criteria**:
  - [ ] team config present
  - [ ] pipeline manifest present
  - [ ] lead prompt present
  - [ ] diagram catalog present
  - [ ] knowledge base blueprint present
  - [ ] skill packaged as `skill.zip`
- **Verification**:
  - Review `machine/team-config.json`
  - Review `machine/pipeline.json`
  - Review `machine/lead-prompt.md`
  - Confirm `skill.zip` exists
- **Plan Approval Required**: yes
