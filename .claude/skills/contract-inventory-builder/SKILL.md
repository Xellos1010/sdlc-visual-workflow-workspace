---
name: contract-inventory-builder
description: Extracts IO contracts, API boundaries, schema definitions, and event surfaces from a TypeScript/TSX codebase. Trigger on "extract APIs and boundaries", "inventory IO contracts", "what are the interfaces", "show schema map", or before migration gap analysis. Produces contracts/io-contracts.json. Requires repository-cartographer output. Read-only on source.
---

# Contract Inventory Builder

Boundaries before implementation. Contracts are the migration handshake.

## Mindset

Boundary-focused, schema-minded. Every place where data crosses a process, network, filesystem, or component boundary is a contract. Miss none.

## Output artifact

`contracts/io-contracts.json`

## Schema

```json
{
  "contracts": [
    {
      "id": "<unique-id>",
      "file": "<relative-path>",
      "subsystem": "<subsystem-name>",
      "kind": "function-api | react-props | event | http-endpoint | mcp-tool | cli-command | ipc | env-var | filesystem-schema | db-schema",
      "name": "<contract name>",
      "inputs": [
        { "name": "<param>", "type": "<TS type string>", "required": true }
      ],
      "outputs": [
        { "name": "<return or event>", "type": "<TS type string>" }
      ],
      "sideEffects": ["<side-effect kind>"],
      "rustEquivalent": "<trait | struct | enum | fn signature | null>",
      "migrationNotes": "<anything non-obvious about preserving this contract in Rust>"
    }
  ],
  "summary": {
    "total": N,
    "byKind": { "<kind>": N },
    "bySubsystem": { "<subsystem>": N },
    "highComplexityContracts": ["<id>", ...]
  }
}
```

## Procedure

1. Read module-graph.json and pseudocode-ledger.md
2. For each module: identify all exported functions, React components, event emitters, HTTP endpoints, MCP tool registrations, CLI commands, IPC channels, env vars, and schema files
3. For each: create a contract entry
4. For schemas: extract TypeScript interface/type shape into inputs/outputs
5. Map to Rust equivalent where known; leave null and add migrationNotes if complex
6. Write contracts/io-contracts.json
7. Flag high-complexity contracts (complex generics, overloaded signatures, dynamic dispatch)

## Complexity rules

Mark `highComplexityContracts` when:
- The contract uses TypeScript generics that have no direct Rust analog
- The contract is variadic or overloaded
- The output type is a discriminated union with more than 4 variants
- The contract crosses a process or network boundary with implicit serialization

## Quality gates

- [ ] Every exported function/component in module-graph.json has a contract entry
- [ ] Every MCP tool registration captured
- [ ] Every CLI command captured
- [ ] summary.total matches entries array length
- [ ] No contract has empty inputs AND empty outputs unless it is side-effect-only (and side-effects are listed)
