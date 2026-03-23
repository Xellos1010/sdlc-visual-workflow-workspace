# ADR-006: Adopt Control-Plane Auth and Trust-Boundary Model

## Status
accepted

## Date
2026-03-23

## Context
The control plane is central to planning, runs, continuity, and evidence. Security hardening requires a clear auth model and trust-boundary policy before `WO-FF-006`.

## Options Considered

### Option A: Local-only unauthenticated mode
**Description**: Trust loopback and host boundaries only.  
**Pros**: Minimal complexity and friction.  
**Cons**: Unsafe beyond pure local use.

### Option B: Scoped bearer-token baseline with explicit local-dev exception
**Description**: Require tokens for non-loopback access; allow bounded local loopback mode.  
**Pros**: Strong baseline without heavy federation complexity.  
**Cons**: Requires token lifecycle and secret-handling discipline.

### Option C: Federated identity from day one
**Description**: Full OIDC or similar immediately.  
**Pros**: Strong long-term enterprise posture.  
**Cons**: Premature complexity for current maturity.

## Decision
Choose **Option B**.

Security policy:
- Non-loopback access requires scoped bearer tokens.
- Loopback no-auth mode is allowed only as explicit development mode.
- Remove wildcard CORS; enforce explicit allowlist.
- Add request validation, payload size limits, timeouts, and rate limits.

## Consequences

### Positive
- Raises security baseline before production-core execution.
- Preserves practical local development.
- Defers federation until a real multi-user hosting requirement exists.

### Negative
- Token issuance/rotation introduces operational overhead.
- Existing clients may need configuration changes.

### Risks
- Overuse of local no-auth mode can erode posture.
- Token leakage risk if logging/redaction is weak.

## References
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/.cursor/plans/foundry-gap-analysis-intent_d20ed327.plan.md`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/apps/control-plane/src/server.mjs`
- `/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge/flagship-foundry-work/configs/approval-policies/default.json`
