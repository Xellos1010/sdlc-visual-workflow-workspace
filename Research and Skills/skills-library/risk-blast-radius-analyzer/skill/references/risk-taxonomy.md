# Risk taxonomy

## Risk levels
- low: localized, well-tested, reversible, no public contract change
- medium: touches shared code, public behavior, auth, data shape, or multiple packages
- high: migration, security, payments, production infrastructure, permissions, deletion, generated-code boundary, or broad dependency shift
- critical: destructive action, secret exposure, production incident, cross-tenant data, compliance, or irreversible operation

## Hidden-risk signals
- Public API, schema, route, event, or database changes
- Shared utility or base class changes
- Generated files or codegen ownership boundaries
- Concurrency, retry, cache, or state mutation changes
- Auth, permissions, secrets, or PII
- CI, build, package manager, dependency, or deployment changes
- Large diff with low test coverage
