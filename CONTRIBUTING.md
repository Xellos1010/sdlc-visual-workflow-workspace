# Contributing

Thank you for helping improve this workspace. The primary runnable product is **Flagship Foundry** under [`apps/flagship-foundry/`](apps/flagship-foundry/).

## Prerequisites

- **Node.js** 20 or newer (see root `package.json` `engines`)
- **pnpm** 9+ (root declares `packageManager`)

## Quick setup

```bash
pnpm install
```

## Verify your change

From the repository root:

```bash
pnpm exec nx affected -t lint,test,build --parallel
```

When working only inside Foundry:

```bash
cd apps/flagship-foundry
npm test
npm run ci:targeted
```

Use the smallest command set that covers your edits (Foundry-only vs whole monorepo).

## Pull requests

- Prefer **Conventional Commits** (`feat:`, `fix:`, `docs:`, etc.) and a short subject line.
- Keep changes **focused**; unrelated refactors belong in separate PRs.
- Do not commit **secrets**, real bearer tokens, or machine-specific absolute paths in docs or fixtures. Use placeholders (see [`docs/PUBLIC_RELEASE.md`](docs/PUBLIC_RELEASE.md)).
- Match existing **TypeScript strictness** and project patterns; follow workspace rules under `.cursor/rules/` where applicable.

## Community standards

- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)

## Legacy path name

Some internal docs and ADRs refer to **`flagship-foundry-work/`**. In this monorepo the same tree lives at **`apps/flagship-foundry/`**. See [`apps/flagship-foundry/docs/REPOSITORY_LAYOUT.md`](apps/flagship-foundry/docs/REPOSITORY_LAYOUT.md).

## Questions

Open a discussion or issue with the area label (Foundry, Nx, docs) so the right maintainers see it.
