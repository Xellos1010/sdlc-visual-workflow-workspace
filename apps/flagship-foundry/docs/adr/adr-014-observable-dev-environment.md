# ADR-014: Define the Observable Dev Environment Contract Pack

## Status
accepted

## Date
2026-04-10

## Context
The Cursor Companion extension needs an observable development loop that records what actually happened when a user clicks a control, not just what the UI intended to do. The intent packet calls for two first-class contracts before implementation:

- a structured action-log entry schema for exportable runtime evidence
- a browser pop-out message schema for the opt-in localhost relay path

The existing operator-surface ADR already establishes the extension as a projection and control surface rather than the authority for lifecycle state. This decision stays within that boundary.

Two behaviors need to be explicit:

1. The default pop-out posture remains host-supported window movement, so the panel can be dragged to another monitor without introducing a browser relay.
2. The browser pop-out path is opt-in, local-only, and token-gated, because it crosses a trust boundary and should not become the default execution path.

## Options Considered

### Option A: Leave the contracts implicit and implement directly in the handlers
**Description**: Build the action log and browser relay logic first, then infer the schema from code.
**Pros**: Fastest initial implementation.
**Cons**: Encourages drift between runtime behavior, exports, and tests; makes the trust boundary harder to review.

### Option B: Define the contract pack first and implement against it
**Description**: Publish the action-log entry schema, browser pop-out message schema, and contract tests before the module work lands.
**Pros**: Keeps the implementation bounded, reviewable, and testable; makes the observability surface explicit; aligns with contract-first and observed-vs-declared-truth principles.
**Cons**: Requires a small upfront design pass before the handler code can be written.

### Option C: Model the browser relay as an untyped ad hoc message stream
**Description**: Use loosely structured messages between the browser and extension host and validate only at runtime.
**Pros**: Lowest schema effort.
**Cons**: Too easy to break silently, especially across the localhost trust boundary.

## Decision
Choose **Option B**.

Normative rules:

- Action log entries are structured JSON records with `id`, `action`, `timestamp`, `status`, and `durationMs` as required fields.
- Successful actions must carry a `result` object with a summary; failed actions must carry an `error` object with a message.
- Browser pop-out traffic uses a minimal discriminated contract with `handshake`, `command`, and `response` message types.
- The browser relay remains local-only and token-gated; it is not a general-purpose remote transport.
- The default extension pop-out behavior remains the host-supported window flow.

## Consequences

### Positive
- Gives the builder work a stable contract target.
- Makes the export format and message protocol reviewable without reading runtime code.
- Keeps the browser relay isolated to the narrowest useful shape.

### Negative
- Adds two schema files and two contract test files before the implementation lands.
- Forces the implementation to fit the declared export and relay shapes instead of inventing them later.

### Risks
- If the result and error payloads are modeled too loosely, the log may become noisy; if they are modeled too tightly, the later implementation may need a small revision.
- If the browser relay grows beyond the handshake/command/response contract, the protocol should be revisited before it accretes additional state.

## DoD Indicators

- [ ] `action-log-entry.schema.json` compiles and validates representative success and failure entries.
- [ ] `browser-popout-message.schema.json` compiles and validates handshake, command, and response payloads.
- [ ] The ADR documents the default host-window pop-out posture and the localhost token boundary.
- [ ] The contract tests encode the intent packet's declared message shapes.

## References

- `apps/flagship-foundry/apps/cursor-companion/docs/intent/intent-observable-dev-environment-2026-04-10.md`
- `apps/flagship-foundry/docs/adr/adr-013-cursor-companion-operator-surface.md`
- `apps/flagship-foundry/schemas/action-log-entry.schema.json`
- `apps/flagship-foundry/schemas/browser-popout-message.schema.json`
- `apps/flagship-foundry/tests/action-log-contracts.test.mjs`
- `apps/flagship-foundry/tests/browser-popout-contracts.test.mjs`
