# Next Agent Execution Steps (Decisions Accepted)

This playbook assumes the blocker ADRs are accepted through **M4** (including ADR-009 and ADR-010).

## Agent Sequence

1. `@orchestrator` (plan lock + sequencing)
2. `@builder` (implementation per WO scope)
3. `@verifier` (independent verification + evidence)
4. `@docs-release-agent` (handoff, continuity update, release notes)

## Program status

**M1–M4 gap-closure chain is complete** per `MILESTONE_CHAINED_EXECUTION_PLAN.md`. Use this file for **ongoing changes**: pick the closest work order / ADR gate for your change, run local CI parity (`npm test`, `npm run ci:targeted`), and update operational docs when rollout or incident processes change.

## Verification commands (ongoing)

```bash
cd flagship-foundry-work
npm test
npm run ci:targeted
```

Nx only if `nx.json` exists at workspace root:

```bash
pnpm exec nx affected -t lint,test,build --parallel
```

## Canonical references

- [ci-release-gates.md](../ci-release-gates.md) — CI baseline and release evidence (ADR-009)
- [rollout-rollback-incident-model.md](../rollout-rollback-incident-model.md) — operations linkage (ADR-010)
- [MILESTONE_CHAINED_EXECUTION_PLAN.md](MILESTONE_CHAINED_EXECUTION_PLAN.md) — milestone history and hold rules
- [ADR_DECISION_PACKET_PREBUILD.md](ADR_DECISION_PACKET_PREBUILD.md) — ADR index

## Work-Order to Agent Mapping (historical)

| Work Order | Primary Agent | Notes |
| --- | --- | --- |
| WO-FF-001 … WO-FF-008 | builder / verifier | Closed |
| WO-FF-009 | builder / verifier | CI + ADR-009 |
| WO-FF-010 | docs-release-agent / verifier | Ops model + ADR-010 |

## Prompt starters (maintenance)

### For `@orchestrator`
`Identify which ADR gates apply to the requested change; emit file scope and verifier command list.`

### For `@builder`
`Implement the change under applicable ADRs; run npm test and npm run ci:targeted before handoff.`

### For `@verifier`
`Independently verify against acceptance criteria and ADR gates; record evidence paths.`

### For `@docs-release-agent`
`Update continuity, handoff notes, and operational docs when behavior or rollout model changes.`
