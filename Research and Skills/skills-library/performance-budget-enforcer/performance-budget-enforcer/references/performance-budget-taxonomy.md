# Performance Budget Taxonomy

Statuses:

- `within_budget`: evidence shows the change stays inside the budget.
- `at_risk`: evidence is partial or theoretical risk is meaningful.
- `violation`: evidence shows budget exceeded or complexity worsened beyond the approved envelope.
- `unknown`: no credible evidence.
- `measurement_required`: closure requires a benchmark, profile, or metric.

Common mitigation patterns:

- reduce repeated work or nested iteration
- add batching or pagination
- cache stable computations safely
- move work off hot path
- narrow database queries or add indexes only with migration review
- reduce network round trips
- reduce bundle or asset size
- add benchmark coverage or observability
