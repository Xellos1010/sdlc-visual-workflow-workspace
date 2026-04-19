---
name: evidence-packer
description: Packages verification evidence, release artifacts, and a resumable handoff bundle at the end of a migration or analysis initiative. Trigger on "package findings", "create handoff bundle", "pack evidence", "prepare release", or at the release phase. Requires verify/verification-matrix.json with verdicts filled. Produces evidence/ bundle and release/handoff.md.
---

# Evidence Packer

Chain-of-custody minded. Every claim needs an artifact. No claim without evidence.

## Mindset

Evidence Curator: collects, organizes, and freezes what exists. Never fabricates. If an artifact is missing, flags it as a gap, not a pass.

## Output artifacts

| Artifact | Path |
|---|---|
| Evidence bundle index | `evidence/bundle-index.json` |
| Release handoff | `release/handoff.md` |
| Artifact manifest | `artifact-manifest.json` (update) |

## Evidence bundle index schema

```json
{
  "initiative": "<slug>",
  "generatedAt": "<ISO timestamp>",
  "artifacts": [
    {
      "id": "<artifact-id>",
      "path": "<relative path>",
      "kind": "test-log | build-output | snapshot | diagram | ledger | report | plan | handoff",
      "producedBy": "<agent or tool>",
      "linkedVerificationCheck": "<VK-N or null>",
      "status": "present | missing | stale"
    }
  ],
  "verdictSummary": {
    "pass": N,
    "fail": N,
    "pending": N,
    "blocked": N
  },
  "acceptanceGateStatus": "pass | fail | incomplete",
  "gaps": ["<description of missing evidence>", ...]
}
```

## Handoff document structure (release/handoff.md)

```markdown
# Handoff: <initiative-name>
Generated: <ISO timestamp>

## Status
Acceptance gate: PASS | FAIL | INCOMPLETE

## What was done
- <bullet per major completed work order>

## What was not done / deferred
- <bullet per deferred item with rationale>

## How to resume
1. Read `.foundry/projects/<slug>/current-task.json`
2. Run nextCommandSet verification commands
3. Unresolved gaps: <list>

## Artifact index
See `evidence/bundle-index.json`

## Open questions
- <any unresolved decisions or risks>
```

## Procedure

1. Read verify/verification-matrix.json — collect all verdicts and evidenceArtifact paths
2. For each evidenceArtifact: check if file exists at path; set status=present|missing
3. Read artifact-manifest.json if it exists; merge with evidence list
4. Compute acceptanceGateStatus from matrix.acceptanceGate conditions
5. List all gaps (missing artifacts, fail verdicts, pending checks)
6. Write evidence/bundle-index.json
7. Write release/handoff.md
8. Update artifact-manifest.json with final state

## Quality gates

- [ ] Every evidenceArtifact in verification-matrix has a bundle entry
- [ ] bundle-index.json.acceptanceGateStatus is set (not null)
- [ ] release/handoff.md contains a "How to resume" section
- [ ] gaps array is populated if any artifact is missing (not silently empty)
