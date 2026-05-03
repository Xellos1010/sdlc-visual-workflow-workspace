# Security policy

## Supported versions

Security fixes are applied on the default branch (`main` or the repository default). There are no separate long-term support branches unless documented in release notes.

## Reporting a vulnerability

Please **do not** open a public issue for undisclosed security problems.

1. Open a **private** security advisory on GitHub (repository **Security** tab → **Report a vulnerability**), or  
2. Email the maintainers with a clear subject line (for example: `[SECURITY]` plus a short summary).

Include:

- Affected component or path (for example: `apps/flagship-foundry/apps/control-plane/`)
- Steps to reproduce or a proof-of-concept where safe to share
- Impact assessment if known (confidentiality, integrity, availability)

We aim to acknowledge reports within a few business days. Critical issues (remote code execution, secret leakage) are prioritized.

## Scope notes

- Treat `state/`, `.env*`, and continuity JSON under `.foundry/` or `.codex/` as **sensitive** if they contain project metadata or tokens.
- The control plane can be configured with bearer tokens and CORS allowlists; see `apps/flagship-foundry/README.md` (ADR-006).

## Safe defaults for contributors

- Never commit real API keys, session tokens, or production URLs with credentials.
- Use `.env.example` or documented placeholders only in committed files.
- Redact local absolute paths and customer names from example exports before opening pull requests.
