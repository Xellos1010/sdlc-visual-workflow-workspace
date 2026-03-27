# AI Context Exporter

Exports repository content to one minified text file for AI context submission.

## Quick Commands

- `pnpm export:ai:all`
  - Full repository export using default safety/ignore rules.
- `pnpm export:ai:latest`
  - Export the curated list in `tools/ai-context/profiles/latest.json`.
- `pnpm export:ai:profile -- --profile <json>`
  - Export from a custom include/exclude profile JSON.

## Optional Flags

- `--versioned`: write output into `exports/ai-context/YYYY-MM-DD_HH-mm-ss_EST/`.
- `--outputDir <path>`: override output root.
- `--dry-run`: print file selection summary without writing output files.
- `--outputFileName <name>`: override output filename.
- `--maxFileBytes <n>`: skip files larger than `n` bytes (default 524288).

## Output Behavior

- Default output root: `exports/ai-context/`.
- Non-versioned mode:
  - Deletes prior target file (`latest.txt` by default) if present.
  - Writes one aggregate text file and `manifest.json`.
- Versioned mode:
  - Creates timestamped EST folder.
  - Writes `export.txt` (or configured name) and `manifest.json`.

## Format

Each file is represented as one line:

`===FILE:<relative/path>===<minified-content>`

Minification collapses whitespace and removes newlines/tabs.

## Default Safety Rules

Configured in `tools/ai-context/profiles/default-ignore.json`:

- Skip generated/system folders (e.g. `node_modules`, `dist`, `build`, `coverage`, reports, cache dirs).
- Skip lockfiles.
- Skip sensitive names/patterns (`.env*`, key/cert-like names, token/secret/credential patterns).
- Skip known binary extensions and NUL-byte files.
- Skip imported ecosystems/projects by default (`iterative-development-storage`, repo-root `ralph/` via `^ralph/`, etc.).

## Example: `Example AI Agent Pipelines` only

Profiles (one folder per export):

- `tools/ai-context/profiles/example-agent-pipelines-ralph.json`
- `tools/ai-context/profiles/example-agent-pipelines-ruflo.json`

```bash
pnpm export:ai:profile -- --profile tools/ai-context/profiles/example-agent-pipelines-ralph.json --outputDir exports/ai-context/example-agent-pipelines/ralph
pnpm export:ai:profile -- --profile tools/ai-context/profiles/example-agent-pipelines-ruflo.json --outputDir exports/ai-context/example-agent-pipelines/ruflo
```

## Profile JSON Schema

```json
{
  "include": ["apps", ".cursor", "README.md"],
  "exclude": ["apps/some-large-project/", "docs/3rd-party/"],
  "extraIgnore": ["*.snap", "tmp/"],
  "mode": "include-only",
  "versioned": false,
  "outputFileName": "custom-export.txt"
}
```

Notes:

- `include` is required for profile mode.
- Paths can be relative to repo root or absolute paths within repo root.

## Generate a Profile JSON (AI-assisted helper)

Use helper script:

`pnpm export:ai:profile:generate -- --out tools/ai-context/profiles/my-profile.json --include .cursor --include apps --exclude apps/legacy --prompt "focus on SDLC orchestration"`

The helper writes a valid profile JSON and reports unresolved paths in metadata.
