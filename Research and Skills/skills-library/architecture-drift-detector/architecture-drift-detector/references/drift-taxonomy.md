# Architecture Drift Taxonomy

Severity levels:

- `none`: no meaningful divergence found.
- `low`: documentation or naming mismatch, no behavioral or boundary risk.
- `medium`: stale artifact, missing test, or minor layering divergence that can be repaired locally.
- `high`: contract, dependency, data model, persistence, or security drift that can break consumers or architecture guarantees.
- `critical`: drift that invalidates the planned insertion point, violates explicit ADR constraints, or creates unsafe runtime behavior.

Decision types:

- `acceptable_evolution`: code changed intentionally and upstream artifacts need updates.
- `accidental_violation`: code violates active architecture or ADR intent.
- `stale_architecture`: docs or diagrams no longer match accepted implementation.
- `unresolved_conflict`: evidence is insufficient or authorities disagree.
