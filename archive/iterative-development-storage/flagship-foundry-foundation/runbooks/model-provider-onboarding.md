# Model Provider Onboarding Runbook

## Purpose
Add a provider or adapter without changing the core orchestration model.

## Inputs
- provider details
- transport and auth model
- supported tasks or model tiers
- operational constraints

## Steps
1. Define the provider profile.
2. Define or update the adapter manifest if needed.
3. Map supported tiers into routing policy.
4. Test health, latency, and failure behavior.
5. Document safe usage and escalation boundaries.
6. Register the provider in catalogs.

## Outputs
- provider profile
- adapter manifest if applicable
- routing update
- onboarding notes
