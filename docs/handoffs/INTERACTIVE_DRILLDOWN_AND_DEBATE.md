# Interactive Drilldown and Debate

## Drilldown model

Foundry should let a human start from an ecosystem view and narrow into:

- system;
- project;
- module or component;
- rule pack;
- task state;
- environment contract;
- focused blast-radius slice.

The current minimum slice implements the first technical step: a focus-view generator that builds a Mermaid drilldown from a query and the current ecosystem graph.

## Debate model

For risky or architecture-shaping work, the plan should not jump from inspect to code.

The current review policy model supports:

- proposal;
- adversarial challenge rounds;
- reconciliation memos;
- implementation only after the debate has stabilized the blast radius.

## Why this exists

This is the bridge between static diagrams and trustworthy implementation. The goal is not only to visualize impact, but to force hidden dependencies, rollout issues, and sibling drift to surface before code is written.
