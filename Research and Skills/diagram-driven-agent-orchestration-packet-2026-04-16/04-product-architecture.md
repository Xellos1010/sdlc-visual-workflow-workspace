# Product Architecture

## Product name (working)

**Diagram-Driven Agent Orchestration Dashboard**

## Design goal

Provide a **visual control plane** for reverse engineering, scaling, optimization, and codebase conversion. The dashboard should let a user move from ecosystem map → subsystem → module → pseudocode → diff intent → work order → execution evidence without losing context.

## Canonical object model

| Object | What it represents |
|---|---|
| Project | One initiative or engagement |
| Source Unit | File, module, package, schema, endpoint, test, infra asset |
| Symbol | Function, class, interface, component, entity, type, route |
| Artifact | Diagram, ledger, pseudocode, contract, ADR, report |
| Work Order | Bounded executable slice |
| Agent Profile | Personality + permitted transforms + preferred tools |
| Skill | Reusable task definition |
| Run Session | One execution attempt or agent-team run |
| Evidence Item | Log, result, diff, check, screenshot, benchmark, verdict |
| Decision | Approved architecture or migration decision |
| Target Mapping | Source → target plan |

## High-level containers

1. **Workspace API / Collaboration Server**
   - project registry
   - artifact store metadata
   - work-order graph
   - approvals and evidence
   - multi-user sync

2. **Repository Ingestion Engine**
   - parser adapters per language/framework
   - symbol extraction
   - dependency graph extraction
   - config and infra discovery

3. **Intermediate Representation (IR) + Knowledge Graph**
   - normalized symbols, modules, contracts, runtime surfaces, relations
   - truth bridge between extracted facts and generated artifacts

4. **Artifact Engine**
   - diagram synthesis
   - pseudocode generation
   - contract inventory
   - migration matrix
   - export packaging

5. **Research / Gap Analysis Engine**
   - dependency gap research
   - target platform profile lookup
   - framework/runtime mismatch analysis

6. **Orchestration Engine**
   - team config generation
   - work-order chunking
   - skill routing
   - run/session tracking

7. **Dashboard Projection Layer**
   - architecture view
   - migration view
   - task/work-order view
   - evidence/verifier view
   - diff/contract inspector

8. **Code Generation / Porter Adapters**
   - target-language templates
   - pseudocode-to-code transforms
   - framework-specific emitters

9. **Verification Harness**
   - build/test hooks
   - parity checks
   - diff assertions
   - evidence collection

## Canonical flow

1. Ingest repository / brief
2. Build IR and symbol graph
3. Generate base artifact pack
4. Ask targeted research questions for gaps
5. Draft target architecture and migration map
6. Chunk work orders and assign agents/skills
7. Execute port / optimization / build slices
8. Verify parity, capture evidence, update approvals
9. Release packet and keep continuity state fresh

## Source-of-truth rule

The IR and artifact manifests are the source of truth.

- Diagrams are projections.
- Generated code is a consequence, not the first truth.
- Runtime evidence never silently rewrites declared design.
- Human approvals gate high-risk changes.

## Recommended storage

- relational metadata store for projects, work orders, artifacts, approvals
- object store for large artifacts and evidence
- local cache on workstation runners for parser speed and private repo access

## Recommended dashboard modes

- **Architecture** — C4, packages, components, deployment
- **Behavior** — sequence, state, activity, DFD
- **Migration** — keep/adapt/rewrite/defer, target mapping, gap matrix
- **Execution** — work orders, runs, blockers, verifier status
- **Evidence** — logs, reports, parity verdicts, release gate
