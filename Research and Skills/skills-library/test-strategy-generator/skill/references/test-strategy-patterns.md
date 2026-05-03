# Test strategy patterns

## Coverage dimensions
- Unit behavior
- Integration boundaries
- Contract/schema validation
- Event or async behavior
- State transitions and idempotency
- Error and fallback paths
- Permissions and security boundaries
- Performance or resource budget
- Regression coverage for reported bug
- Smoke checks for user-visible behavior

## Evidence quality
- strong: command output, CI result, deterministic test, reproduced before and after
- medium: targeted manual verification with traceable steps
- weak: inspection only, no execution, incomplete environment

## Do not overfit
Prefer small focused tests that prove the changed behavior and one or two regression guards over broad brittle snapshots unless the repo standard requires snapshots.
