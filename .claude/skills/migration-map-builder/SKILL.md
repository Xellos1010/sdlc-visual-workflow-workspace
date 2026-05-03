---
name: migration-map-builder
description: Builds the keep/adapt/rewrite/defer decision ledger and target mapping for a TypeScript→Rust migration. Trigger on "plan TS to Rust", "map source to target", "keep adapt rewrite defer decisions", "migration planning". Requires pseudocode-ledger-writer and dependency-gap-researcher outputs. Produces migration/target-map.json. Frontier reasoning model recommended for hard decisions.
---

# Migration Map Builder

Keep/adapt/rewrite/defer — every module gets a verdict. No undecided.

## Mindset

Migration Strategist: planner, not implementer. Produce decisions and rationale, not code. Treat memory model, async model, and ownership model mismatches as first-class risks.

## Output artifacts

| Artifact | Path |
|---|---|
| Target mapping ledger | `migration/target-map.json` |
| Migration sequence | `migration/migration-sequence.md` |

## Target map schema

```json
{
  "entries": [
    {
      "sourceFile": "<relative path>",
      "subsystem": "<subsystem>",
      "decision": "keep | adapt | rewrite | defer",
      "decisionRationale": "<why this decision — must cite specific blocker, risk, or opportunity>",
      "rustTarget": "<crate::module::path>",
      "rustFile": "<target relative path in Rust workspace>",
      "migrationRisks": ["<risk-1>", ...],
      "parity": {
        "behaviorCritical": true,
        "testStrategy": "unit | integration | behavioral | manual | none",
        "parityCriteria": "<what must match in the Rust port>"
      },
      "dependencies": ["<source-file>", ...]
    }
  ],
  "summary": {
    "total": N,
    "byDecision": { "keep": N, "adapt": N, "rewrite": N, "defer": N },
    "bySubsystem": { "<subsystem>": { "keep": N, "adapt": N, "rewrite": N, "defer": N } },
    "highRiskEntries": ["<sourceFile>", ...]
  }
}
```

## Decision definitions

| Decision | Meaning |
|---|---|
| `keep` | Source is not migrated — keep TypeScript/Node in place (e.g., build tools, scripts) |
| `adapt` | Logic is preserved but API/idioms are adapted to Rust (e.g., async model, error handling) |
| `rewrite` | Logic must be reimplemented from scratch due to paradigm mismatch (e.g., React UI → ratatui) |
| `defer` | Not migrating in this iteration — document why and when it could be revisited |

## Procedure

1. Read `code/pseudocode-ledger.md`, `contracts/io-contracts.json`, `migration/gap-matrix.json`
2. For each module in pseudocode-ledger: assign a decision
3. Decision logic:
   - If module uses a blocker dependency with no Rust path → `defer` or `rewrite`
   - If module is pure logic with no platform-specific IO → `adapt`
   - If module is UI/React/Ink → `rewrite`
   - If module is a config file, build script, test helper → `keep`
4. For each `adapt` or `rewrite`: specify rustTarget and rustFile
5. For each `rewrite`: set parity.testStrategy and parity.parityCriteria
6. Write migration-sequence.md: ordered list of modules from least to most dependent (topological sort from module-graph.json)

## Risk escalation

Flag `highRiskEntries` when:
- Module has `rewrite` decision AND fidelityGap=blocker in gap-matrix
- Module is on the critical import path for 5+ other modules
- Parity criteria require behavioral tests that do not yet exist

## Quality gates

- [ ] Every file from pseudocode-ledger has an entry
- [ ] No entry has decision=undefined
- [ ] All rewrite entries have a non-empty parityCriteria
- [ ] migration-sequence.md is topologically ordered (no module appears before its dependencies)
