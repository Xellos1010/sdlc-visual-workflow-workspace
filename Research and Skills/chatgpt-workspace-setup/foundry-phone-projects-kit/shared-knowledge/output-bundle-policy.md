# Output Bundle Policy

When a response creates more than one artifact:
1. Create each artifact as its own file if possible.
2. Create `artifact-manifest.json` listing every artifact name, purpose, and target path.
3. Package artifacts into a single zip named:
   `<project-slug>-<phase-id>-artifacts.zip`

If the current ChatGPT surface cannot emit multiple files, produce:
- one markdown file named `ARTIFACT_BUNDLE.md`
- one JSON file named `artifact-manifest.json`
with each artifact embedded in fenced blocks.
