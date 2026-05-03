# Command Selection Guidance

Prefer the narrowest reliable validation before broader checks:

1. generated or touched unit tests
2. type check for affected package
3. lint or static checks for affected package
4. integration tests for changed boundary
5. build for affected app/package
6. migrations or schema validation when data contracts changed
7. benchmark or performance check when complexity or budget is relevant

If the repository uses Nx, prefer affected commands when known. If the repository uses another build system, follow its local conventions.
