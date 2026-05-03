# ts-to-rust-foundry-starter

A free, local-first starter for:

- `.ts` / `.tsx` reverse engineering
- UML artifact generation
- pseudocode ledger generation
- Rust skeleton generation
- Yellicode-based Rust templating from a UML-oriented JSON model

## What this starter does

This repo is intentionally split into **three layers**:

1. **AST extraction (ts-morph)**
   - parses `.ts` and `.tsx`
   - extracts classes, interfaces, enums, type aliases, imports, and functions
   - emits a normalized `model.json` per source file

2. **Diagram + behavior artifacts**
   - emits `uml.nomnoml`
   - emits `uml.mmd` (Mermaid class diagram)
   - emits `pseudocode.md`
   - optionally tries **TsUML2** for `.ts` files if available locally

3. **Rust generation**
   - emits `generated.rs` per input file
   - maps interfaces/classes/enums/functions to starter Rust artifacts
   - keeps function bodies as `todo!()` with pseudocode comments

## Why ts-morph is the backbone

TsUML2 is good for structural UML rendering, but function-body migration requires AST access and custom logic. This starter therefore uses **ts-morph as the source of truth** and treats TsUML2 as an optional structural renderer.

## Output mirroring

If the input is a folder, the output mirrors the source hierarchy.

Example:

```text
input/
  domain/Todo.ts
  components/TodoList.tsx

output/
  domain/Todo/
    model.json
    pseudocode.md
    uml.nomnoml
    uml.mmd
    generated.rs
  components/TodoList/
    model.json
    pseudocode.md
    uml.nomnoml
    uml.mmd
    generated.rs
  index.json
```

## Install

```bash
npm install
```

Optional if you want TsUML2 integration for `.ts` files:

```bash
npm install --save-dev tsuml2
```

Optional if you want SVG rendering from nomnoml DSL:

```bash
npm install --save-dev nomnoml-cli
```

## Commands

Full pipeline:

```bash
npm run full -- --input ./examples/src --output ./artifacts --use-tsuml2 auto
```

Analyze only:

```bash
npm run analyze -- --input ./examples/src --output ./artifacts
```

Rust generation only:

```bash
npm run generate:rust -- --input ./examples/src --output ./artifacts
```

## CLI options

```text
--input <path>         File or folder input
--output <path>        Output root
--tsconfig <path>      Optional tsconfig.json
--use-tsuml2 <mode>    auto | always | never
--command <mode>       full | analyze | generate-rust
```

## Function-body logic migration

This starter does **not** claim full semantic TypeScript -> Rust translation. Instead it creates a safe handoff:

- a structural UML-oriented model
- a pseudocode ledger for each function/method
- Rust signatures and type mappings
- `todo!()` placeholders where manual or AI-assisted implementation is required

That makes it suitable for a second-stage AI pass that:

- performs variable scope analysis
- resolves async strategy
- chooses ownership / borrowing patterns
- maps UI code to a Rust UI target such as Dioxus, Yew, or Leptos

## TSX caveat

TSX is parsed, but React component rendering logic is **not directly convertible** to generic Rust. The starter marks likely UI functions/components and leaves framework selection explicit.

## Yellicode setup

See `yellicode/` for a starter template that reads a UML-oriented JSON model and emits Rust.

Run it after installing Yellicode packages:

```bash
cd yellicode
npx yellicode
```

## Suggested next step

Use this starter in two phases:

1. produce artifacts for the whole TypeScript codebase
2. feed the generated `model.json` + `pseudocode.md` into a higher-trust Rust implementation workflow
