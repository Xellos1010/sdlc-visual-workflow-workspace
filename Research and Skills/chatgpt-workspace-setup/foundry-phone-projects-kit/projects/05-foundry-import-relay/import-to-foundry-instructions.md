# Import to Foundry Instructions

Use `foundry-import-manifest.json` from this workspace.

## Import now
Import only the artifacts that this workspace explicitly marks as ready.

## Timing
- If this workspace is pre-build (release, improve), import as design authority before implementation.
- If this workspace is post-build or verification, import only after verification status is PASS or equivalent.

## Authority rule
When conflicts exist, prefer the highest-authority artifact available:
charter → continuity → ADRs → diagrams → contracts/schemas → work orders → code → evidence → operational docs
