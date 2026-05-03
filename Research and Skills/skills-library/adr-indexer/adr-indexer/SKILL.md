---
name: adr-indexer
description: index, cross-link, tag, and prepare decision-ledger handoffs for architecture decision records in a cloud-agent sdlc workflow. use when an adr has been created, updated, superseded, rejected, or discovered during codegen, review, human-delta ingestion, architecture drift analysis, or release integration and the adr must be linked to work orders, pseudocode, schemas, code diffs, validation evidence, prior adrs, and inspection handles.
---

# ADR Indexer

Maintain the durable ADR index for cloud-agent SDLC work. Convert one or more ADRs and their metadata into an inspectable patch that links decisions to work orders, code, pseudocode, schemas, tests, evidence bundles, prior ADRs, and downstream ledger entries.

## Core rule

Index only decisions that are represented by an ADR or an explicit ADR update candidate. Do not invent ADR ids, paths, evidence results, supersession relationships, or affected artifacts. If an identifier or path cannot be verified from the available context, preserve it as `unresolved` and add a follow-up action.

## Required inputs

Normalize available conversation, repository, and artifact context into:

- `adr.md`: ADR content or ADR update summary.
- `adr_metadata.json`: metadata from `adr-draft-writer`, if available.
- `work_order`: active work-order id/path, issue, PR, branch, or task state.
- `decision_ledger`: existing ledger entry or ledger path, if available.
- `evidence_bundle`: validation reports, test results, generated code review, human-delta records, or inspection artifacts.

If multiple ADRs are present, process each ADR separately and return a patch list.

## Workflow

1. Parse ADR identity: id, title, status, date, decision type, and filename/path.
2. Extract affected artifact links from ADR metadata and the ADR body.
3. Classify each link by artifact type: `work_order`, `pseudocode`, `schema`, `code`, `test`, `evidence`, `prior_adr`, `diagram`, `memory`, or `unknown`.
4. Determine relationship types:
   - `decides` for the primary chosen decision.
   - `supersedes` or `superseded_by` for ADR replacement.
   - `depends_on` for prior decisions or prerequisite artifacts.
   - `validates` for test, review, benchmark, or evidence links.
   - `updates` for work orders, pseudocode, schemas, memory, or diagrams that must change.
5. Generate inspection tags using `references/inspection-tag-taxonomy.md`.
6. Build `adr_index_patch.json` using `references/adr-index-patch-schema.json`.
7. Identify missing cross-links and unresolved references.
8. Produce `next_skill_handoff` for `decision-tradeoff-ledger`.

## Output contract

Always return this structure when indexing an ADR:

```markdown
# ADR Index Patch

## Verdict
indexed | indexed_with_unresolved_links | blocked

## adr_index_patch.json
```json
{}
```

## Cross-links
| Source | Relationship | Target | Status |
|---|---|---|---|

## Inspection tags
- <tag>

## Unresolved references
- <reference or none>

## Follow-up actions
- <action or none>

## next_skill_handoff
<handoff for decision-tradeoff-ledger>
```

If editing a repository directly, apply the patch to the project ADR index only after preserving existing entries and avoiding duplicate ADR ids.

## Indexing policy

- Treat `.foundry/projects/<slug>/decision-ledger.jsonl` as the durable decision ledger when available.
- Treat `docs/adr/` as the default ADR document directory unless the repository declares another ADR location.
- Preserve existing ADR status and history. Do not silently convert `Proposed` to `Accepted`.
- If an ADR supersedes another ADR, add reciprocal links when both sides are available.
- If validation evidence is missing, mark the evidence link `missing` instead of marking the ADR complete.
- If the ADR affects code but no pseudocode, schema, or test link is present, flag a parity risk for `parity-sync-manager` through the ledger handoff.

## Quality checklist

Before finalizing, verify:

- Every ADR id appears only once in the patch.
- Every link has a relationship type and verification status.
- Unverified paths are explicitly marked instead of treated as true.
- Tags are specific enough for inspection and search.
- The handoff includes all inputs needed by `decision-tradeoff-ledger`.
