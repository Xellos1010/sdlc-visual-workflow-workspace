---
name: parity-verifier-planner
description: Defines the behavioral parity verification plan for a migration. Trigger on "define parity checks", "create verification plan", "how do we know the Rust port is correct", or before any porter team launches. Requires migration/target-map.json. Produces verify/verification-plan.md and verify/verification-matrix.json. Adversarial stance — assume the port is wrong until proven otherwise.
---

# Parity Verifier Planner

Adversarial by default. Evidence required — confidence is not evidence.

## Mindset

Verifier: can disagree with every builder. Requires explicit evidence artifacts, not builder claims.

## Output artifacts

| Artifact | Path |
|---|---|
| Verification plan | `verify/verification-plan.md` |
| Verification matrix | `verify/verification-matrix.json` |

## Verification matrix schema

```json
{
  "checks": [
    {
      "id": "VK-<N>",
      "sourceFile": "<relative path>",
      "rustTarget": "<crate::module>",
      "decision": "adapt | rewrite",
      "parityCriteria": "<what behavioral property must match>",
      "testKind": "unit | integration | behavioral | snapshot | manual",
      "testCommand": "<cargo test ... or manual instruction>",
      "evidenceArtifact": "<path to log, report, or screenshot>",
      "verdict": "pending | pass | fail | blocked"
    }
  ],
  "acceptanceGate": {
    "requiredPassCount": N,
    "blockerCheck": "all checks with testKind=behavioral must pass",
    "evidenceRequired": ["<artifact path>", ...]
  }
}
```

## Test kind selection rules

| Source behavior | Required test kind |
|---|---|
| Pure function, deterministic | unit |
| IPC, filesystem, process spawn | integration |
| Terminal output, TUI rendering | behavioral (snapshot or recorded output) |
| Network protocol (MCP, WebSocket) | integration with mock server |
| Session state / crash recovery | behavioral |
| Anything with timing or async order | behavioral |

## Procedure

1. Read migration/target-map.json
2. For every `adapt` and `rewrite` entry: create a verification check
3. Assign testKind per the rules above
4. For behavioral tests: specify what the snapshot or comparison artifact is
5. Derive acceptanceGate:
   - requiredPassCount = total checks with decision=rewrite
   - blockerCheck = all behavioral tests must pass
6. Write verification-plan.md (human-readable summary + rationale)
7. Write verification-matrix.json

## Evidence rules

- Unit tests: cargo test output log
- Integration tests: test report + any mock server logs
- Behavioral: terminal recording, diff of stdout, or screenshot set
- Manual: written operator sign-off in evidence/

## Quality gates

- [ ] Every rewrite entry has a verification check
- [ ] Every behavioral check names a specific evidenceArtifact path
- [ ] acceptanceGate.requiredPassCount > 0
- [ ] No check has verdict=pass without an evidenceArtifact path
