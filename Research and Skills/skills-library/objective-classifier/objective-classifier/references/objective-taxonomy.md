# Objective Taxonomy

- `new_system`: create a new service, app, package, domain, or major standalone capability.
- `new_feature`: add user-visible or API-visible behavior within an existing system.
- `refactor`: change internal structure while preserving external behavior.
- `bug_fix`: correct unintended behavior or regression.
- `migration`: move language, framework, persistence, runtime, API version, data model, or infrastructure boundary.
- `external_library`: introduce, replace, remove, or materially upgrade a dependency or vendor SDK.
- `experiment`: create a bounded spike, benchmark, prototype, or feasibility check.
- `diagnosis`: inspect, debug, explain, reproduce, or localize without committing to implementation.
- `documentation`: create or update docs, runbooks, diagrams, comments, onboarding, or specs.
- `release`: prepare, validate, publish, tag, changelog, or coordinate release actions.
- `operations`: operate systems, CI, deployments, incident response, monitoring, config, or scheduled maintenance.

## Tie breakers

1. If behavior changes for users or external callers, prefer `new_feature` or `bug_fix` over `refactor`.
2. If data or runtime environment moves, prefer `migration` even when feature work is included.
3. If the request is to explain or inspect before changing, prefer `diagnosis`.
4. If code already changed outside the agent workflow, flag reverse-sync routing regardless of primary objective.
