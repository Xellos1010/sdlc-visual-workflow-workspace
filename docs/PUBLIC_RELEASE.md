# Public release checklist

Use this before publishing the repository or squashing history to a single public commit.

## Community and legal files (root)

- [ ] [LICENSE](../LICENSE) — copyright year and holder are correct for your organization.
- [ ] [CONTRIBUTING.md](../CONTRIBUTING.md) — commands and paths match your CI.
- [ ] [SECURITY.md](../SECURITY.md) — vulnerability reporting path is monitored.
- [ ] [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) — enforcement contact aligns with SECURITY or a dedicated inbox.

## Documentation

- [ ] [README.md](../README.md) — quick start, links to Foundry app and CONTRIBUTING.
- [ ] [apps/flagship-foundry/README.md](../apps/flagship-foundry/README.md) — env vars and CI references use current paths (`apps/flagship-foundry/`, not legacy `flagship-foundry-work/` in user-facing sections).

## Secrets and sensitive data

- [ ] No real API keys, tokens, or passwords in tracked files (search: `sk-`, `Bearer `, `api_key`, `.env` contents).
- [ ] No home-directory absolute paths (`/Users/`, `/home/`) in docs, ADR references, or example JSON (use repo-relative paths or `<placeholder>`).
- [ ] Example exports under `apps/flagship-foundry/examples/` contain only redacted or synthetic data.
- [ ] `.gitignore` excludes local env files, caches, and staging directories you do not intend to ship.
- [ ] If **`.superpowers/`** (or similar) was committed by mistake, remove it from the index: `git rm -r --cached .superpowers` and keep the directory ignored so local brainstorming artifacts are not published.

## History hygiene (optional squash)

If you replace git history with one commit, maintain a separate narrative document:

- [ ] [docs/COMMIT_HISTORY_OVERVIEW.md](COMMIT_HISTORY_OVERVIEW.md) filled in and stored **outside** the repo or attached to the release, or committed as non-sensitive summary only.

## Verification

```bash
pnpm install
pnpm exec nx affected -t lint,test,build --parallel
cd apps/flagship-foundry && npm test && npm run ci:targeted
```

Adjust targets to match what you ship publicly.
