# Knowledge Base Architecture

## Design goals

- version documentation sources instead of treating them as transient prompt context;
- preserve source lineage for every document chunk;
- align retrieval to packs, frameworks, platforms, personas, and runbooks;
- support future framework-specific skill generation from the same source base.

## Primary artifacts

- `knowledge/catalogs/domain-packs.json`
- `knowledge/catalogs/framework-registry.json`
- `knowledge/catalogs/source-presets.json`
- `knowledge/templates/agent-blueprints/`
- `knowledge/templates/skill-blueprints/`
- `state/knowledge/<knowledgeBaseId>/manifest.json`
- `state/knowledge/<knowledgeBaseId>/documents/index.json`
- `state/knowledge/<knowledgeBaseId>/coverage-report.md`

## Retrieval posture

Retrieval should happen in layers:

1. identify the ecosystem and impacted pack set;
2. narrow by framework or platform;
3. narrow by persona or runbook phase;
4. retrieve only the documents needed for the current planning or execution step.

This keeps context small and makes low-cost microtask agents viable.
