# Environment parity templates

These templates give you a shared starting point across Claude Code, Codex, and Cursor.

Use them as generated artifacts, not as the final source of truth. The long-term goal is to generate these from Foundry's common intent model so project guardrails stay aligned across tools.

Parity projection follows ADR-004 Option C:
- detect existing targets
- generate proposed output
- diff current vs generated
- auto-apply only machine-owned or empty targets
- require explicit approval for user-owned conflicts (`--approve-user-owned`)
- never blind-overwrite user configuration
