# Generated Code Review Rubric

Finding severity:

- `blocker`: cannot validate or merge safely.
- `high`: likely correctness, security, contract, or architecture failure.
- `medium`: meaningful maintainability, test, performance, or reliability issue.
- `low`: improvement suggestion, cleanup, or clarity issue.

Mark `ready_for_validation` false when:

- changed behavior lacks tests or validation commands;
- implementation violates a schema, ADR, insertion map, or codegen contract;
- error handling is missing for expected failures;
- security, authorization, data migration, or persistence behavior is unverified;
- generated code includes broad unrelated changes;
- test results are claimed but not evidenced.
