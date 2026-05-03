# Minimum Executable Slice

The minimum slice now proves six things end to end:

1. import an existing ecosystem from a filesystem workspace or export bundle;
2. build a graph of systems, projects, frameworks, platforms, rules, diagrams, and task states;
3. generate Mermaid visualizations and SME profiles;
4. create a plan with manual or auto approval policy;
5. create and control a run with start, pause, resume, and stop;
6. surface the same flow through a Cursor-compatible companion extension.

## Core commands

```bash
npm run bootstrap:sample
npm run api
npm test
```

## Sample assets

- `examples/current-workspace/input/` holds the imported workspace export bundle used for the demo.
- `examples/current-workspace/generated/` is populated by the bootstrap command.
- `state/ecosystems/web-automation-workspace/` holds the generated graph, report, visualizations, and SME profiles.
