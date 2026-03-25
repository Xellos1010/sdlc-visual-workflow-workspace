# Foundry Knowledge Pipeline

## Purpose

The knowledge pipeline exists to prevent the orchestrator from planning against vague intuition or tool-specific folklore. It turns documentation, local exports, framework references, and future downloaded doc bundles into versioned, attributable, reusable knowledge.

## Core flow

1. collect source manifests;
2. ingest and split sources into documents;
3. tag documents to domain packs, frameworks, and platforms;
4. publish a knowledge-base manifest and coverage report;
5. run ecosystem-aware gap analysis;
6. use the resulting recommendations to refine personas, runbooks, guardrails, skills, and environment parity.

## Source types in the current slice

- combined markdown docs;
- text bundles exported from existing repos;
- JavaScript or source files treated as canonical tooling references.

## Current foundational sources

- Claude Code docs bundle;
- OpenAI Codex docs bundle;
- Cursor learning-path bundle;
- generic documentation scraper bundle;
- Nx context bundler source.

## Why this matters

The knowledge base is not a generic RAG dump. It is mapped to domain packs, framework registries, persona expectations, runbooks, and guardrails so the orchestrator can ask: what is missing for this ecosystem to plan and execute reliably?
