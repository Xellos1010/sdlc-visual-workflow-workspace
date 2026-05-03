# Low-Level Model Training Guide

## Objective

Train a smaller executor-oriented model or adapter so recurring implementation and remediation patterns become cheaper and faster.

## What to train on

Do not train first on raw chat logs. Train on structured artifacts:
- fix-memory records
- work orders and their outcomes
- evidence bundles
- guardrail packs
- accepted diffs and rejected diffs
- incident-to-remediation chains

## Recommended data units

### 1. Work-order examples
Input:
- task class
- constraints
- file/component scope
- relevant contracts

Output:
- bounded implementation or analysis artifact

### 2. Fix-memory examples
Input:
- problem summary
- environment
- symptoms
- root cause

Output:
- validated remediation pattern and prevention rules

### 3. Guardrail-aware transformations
Input:
- language/platform/cloud guardrails
- narrow objective

Output:
- compliant microtask result

## Training sequence

### Phase A: corpus curation
- normalize fix-memory and work-order outcomes into JSONL
- exclude low-confidence or unresolved incidents
- label by task class, language, platform, and risk

### Phase B: SFT / adapter training
- start with parameter-efficient adaptation rather than full fine-tuning
- prioritize LoRA/QLoRA style adaptation for small-to-mid models
- keep training artifacts versioned and reproducible

### Phase C: evaluation
Evaluate on:
- exactness to schema
- guardrail adherence
- regression reproduction and repair quality
- token efficiency
- false-positive and hallucination rate

### Phase D: distillation and promotion
Once the dataset is healthy:
- distill larger orchestration outputs into smaller executor models
- separate orchestration reasoning from microtask execution
- promote only after offline evaluation and shadow-mode validation

## Practical rule

The first fine-tuned low-level model should target **one narrow executor lane** such as:
- TypeScript refactor microtasks,
- regression test generation,
- bug-fix pattern matching,
- documentation synchronization.

Do not try to train the “whole ecosystem model” first.
