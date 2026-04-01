# Model Tier Routing

Use these assignments when you later run work orders outside ChatGPT Projects.

- frontier_reasoner: strategy, architecture, high ambiguity
- balanced_reasoner: verification, diagnostics, learning
- low_cost_executor: deterministic code generation, structured generation
- deterministic_rule_engine: schema validation, policy checks

Design rule:
Create work orders so builder slices can be executed by low_cost_executor with minimal hidden context.
