# Repo Schema Catalog

## task-state.schema.json
- Title: Codex Task State
- Category: workflow
- Required: project, objective, sdlcPhase, activeBranch, currentPhase, nextCommit, nextCommandSet, blockedBy, artifacts, doneCriteria
- Properties: project, objective, sdlcPhase, lifecycleStage, activeBranch, currentPhase, nextCommit, nextCommandSet, blockedBy, artifacts, doneCriteria
- Source path: `.codex/schemas/task-state.schema.json`

## task-state.schema.json
- Title: Codex Task State
- Category: workflow
- Required: project, objective, sdlcPhase, activeBranch, currentPhase, nextCommit, nextCommandSet, blockedBy, artifacts, doneCriteria
- Properties: project, objective, sdlcPhase, activeBranch, currentPhase, nextCommit, nextCommandSet, blockedBy, artifacts, doneCriteria
- Source path: `.foundry/schemas/task-state.schema.json`

## adapter-manifest.schema.json
- Title: Adapter Manifest
- Category: environment
- Required: adapterId, displayName, runtime, executionModel
- Properties: adapterId, displayName, runtime, supportsMcp, supportsParallelAgents, supportsWorktrees, supportsProviderSwap, executionModel
- Source path: `apps/flagship-foundry/schemas/adapter-manifest.schema.json`

## agent-work-order.schema.json
- Title: Agent Work Order
- Category: workflow
- Required: id, projectId, phase, title, personaIds, acceptanceCriteria
- Properties: id, projectId, phase, title, personaIds, commands, acceptanceCriteria, status
- Source path: `apps/flagship-foundry/schemas/agent-work-order.schema.json`

## continuity-state.schema.json
- Title: Continuity State
- Category: workflow
- Required: authority, project, objective, sdlcPhase, lifecycleStage, currentPhase, activeBranch, nextCommit, nextCommandSet, blockedBy, artifacts, doneCriteria
- Properties: authority, project, objective, sdlcPhase, lifecycleStage, currentPhase, activeBranch, nextCommit, nextCommandSet, blockedBy, artifacts, doneCriteria
- Source path: `apps/flagship-foundry/schemas/continuity-state.schema.json`

## ecosystem-import-request.schema.json
- Title: Ecosystem Import Request
- Category: environment
- Required: source
- Properties: ecosystemId, name, source
- Source path: `apps/flagship-foundry/schemas/ecosystem-import-request.schema.json`

## ecosystem-manifest.schema.json
- Title: Ecosystem Manifest
- Category: environment
- Required: id, name, topology, projects, systems, frameworks, platforms
- Properties: id, name, topology, projects, systems, frameworks, platforms, ruleFiles, existingVisualizations, taskStates
- Source path: `apps/flagship-foundry/schemas/ecosystem-manifest.schema.json`

## environment-scaffold-request.schema.json
- Title: Environment Scaffold Request
- Category: environment
- Required: preset, targetDir
- Properties: preset, targetDir, dryRun, approveUserOwnedConflicts
- Source path: `apps/flagship-foundry/schemas/environment-scaffold-request.schema.json`

## evidence-bundle.schema.json
- Title: Evidence bundle
- Category: execution
- Required: id, runId, assembledAt, correlation, summary, tasks
- Properties: id, runId, planId, ecosystemId, adapterId, assembledAt, correlation, summary, telemetryReferences, tasks
- Source path: `apps/flagship-foundry/schemas/evidence-bundle.schema.json`

## guardrail-pack.schema.json
- Title: Guardrail Pack
- Category: governance
- Required: id, name, scope, rules
- Properties: id, name, scope, rules, evidenceRequirements
- Source path: `apps/flagship-foundry/schemas/guardrail-pack.schema.json`

## persona-pack.schema.json
- Title: Persona Pack
- Category: governance
- Required: id, name, category, purpose
- Properties: id, name, category, purpose, activationCriteria, guardrailPackIds, runbookIds
- Source path: `apps/flagship-foundry/schemas/persona-pack.schema.json`

## provider-profile.schema.json
- Title: Provider Profile
- Category: environment
- Required: providerId, displayName, protocol, transport
- Properties: providerId, displayName, protocol, transport, suitableForCritical, riskFit, roles
- Source path: `apps/flagship-foundry/schemas/provider-profile.schema.json`

## runbook.schema.json
- Title: Runbook
- Category: governance
- Required: id, name, purpose, phases
- Properties: id, name, purpose, triggers, phases, handoffArtifacts
- Source path: `apps/flagship-foundry/schemas/runbook.schema.json`

## sme-profile.schema.json
- Title: Subject Matter Expert Profile
- Category: knowledge
- Required: id, domain, title, mandatoryQuestions, blastRadiusChecklist
- Properties: id, domain, title, detectedFrom, mandatoryQuestions, blastRadiusChecklist, trainingSignals
- Source path: `apps/flagship-foundry/schemas/sme-profile.schema.json`