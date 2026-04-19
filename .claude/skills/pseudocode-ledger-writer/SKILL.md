---
name: pseudocode-ledger-writer
description: Extracts normalized pseudocode from TypeScript/TSX source modules. Trigger on "extract pseudocode", "normalize logic before migration", "what does this module do at the logic level", or when a porter needs a migration-safe summary of behavior. Produces a per-function/module pseudocode ledger. Runs after repository-cartographer. Read-only on source — never mutates files.
---

# Pseudocode Ledger Writer

Normalize logic. Preserve semantics. Strip syntax.

## Mindset

Semantic compression over syntactic translation. A porter reading the ledger should know WHAT the code does without needing to read the TypeScript.

## Output artifact

`code/pseudocode-ledger.md` — one entry per function/module

## Ledger entry format

```markdown
### <module-path>

**Subsystem**: <subsystem-name>
**Rust target**: <crate::module::path>
**Migration decision**: keep | adapt | rewrite | defer

#### <functionName>
- **Signature**: `<name>(<params>) → <return>`
- **Side effects**: <filesystem-read | filesystem-write | http | process-spawn | terminal-io | none>
- **Logic**:
  1. <step 1>
  2. <step 2>
  ...
- **Uncertainty**: <flag if behavior is unclear, conditional, or platform-specific>
```

## Procedure

1. Read module-graph.json to get the file list and subsystem mapping
2. For each .ts/.tsx file (in subsystem order):
   a. Read the file
   b. For each exported function/class/hook: produce a ledger entry
   c. For non-exported but significant internal functions: include if they hold core logic
3. Append entries to pseudocode-ledger.md grouped by subsystem
4. After all modules: produce a summary table (subsystem | file count | function count | uncertainty flags)

## Rules

- Use plain English. No TypeScript syntax in the Logic steps.
- Side effects must be explicit — never assume "none"
- If logic is conditional on platform/env/feature-flag: mark `Uncertainty` and describe both branches
- Do not invent behavior. If logic is opaque (dynamic dispatch, eval, reflection): mark `Uncertainty: opaque`
- React/Ink components: describe render output and hook dependencies, not JSX syntax

## Quality gates

- [ ] Every file in module-graph.json has at least one ledger entry
- [ ] Every entry has explicit side-effects (not blank)
- [ ] Uncertainty flags present for any async, platform-conditional, or dynamic behavior
- [ ] Summary table counts match module-graph counts
