# Artifact Contract

Every analysis / migration / optimization assignment should produce the same minimum packet shape.

## Required artifacts

| File / folder | Purpose | Required |
|---|---|---|
| `project-intake.md` | scope, goals, constraints, stakeholders | yes |
| `artifact-manifest.json` | inventory of all outputs and ownership | yes |
| `architecture/c4-context.mmd` | ecosystem view | yes |
| `architecture/c4-container.mmd` | system container view | yes |
| `architecture/component-map.mmd` | major internal components | yes |
| `code/module-graph.json` | module relationships | yes |
| `code/dependency-graph.json` | dependency graph | yes |
| `code/pseudocode-ledger.md` | normalized logic ledger | yes |
| `contracts/io-contracts.json` | boundaries and interfaces | yes |
| `behavior/sequence/` | key runtime interactions | conditional |
| `behavior/state/` | state machines for stateful flows | conditional |
| `data/erd.mmd` or `.puml` | persistence model | conditional |
| `migration/gap-matrix.json` | source→target mismatches | yes for migrations |
| `migration/target-map.json` | keep/adapt/rewrite/defer | yes for migrations |
| `execution/team-config.json` | machine-readable team definition | yes |
| `execution/work-orders.md` | executable bounded slices | yes |
| `execution/lead-prompt.md` | launch prompt | yes |
| `verify/verification-plan.md` | checks and parity criteria | yes |
| `evidence/` | logs, verdicts, reports, screenshots | yes |
| `release/handoff.md` | resumable human+AI handoff | yes |

## Minimum artifact quality rules

- Every artifact states scope and inputs.
- Every diagram has a title and legend if notation could be ambiguous.
- Every generated recommendation distinguishes fact vs inference.
- Every work order is bounded and independently verifiable.
- Every migration decision records keep/adapt/rewrite/defer explicitly.

## Recommended artifact generation order

1. intake
2. repository map
3. contracts and pseudocode
4. architecture diagrams
5. behavior diagrams
6. migration gap matrix
7. work orders and team config
8. verification plan
9. evidence bundle and handoff
