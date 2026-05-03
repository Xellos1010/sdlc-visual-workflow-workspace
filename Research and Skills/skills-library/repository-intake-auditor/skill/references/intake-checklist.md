# Repository intake checklist

Use this checklist when auditing a repository before planning or implementation.

## Identity and ownership
- Repository URL or local path
- Project/client/workspace identity
- Primary app/package areas
- Owner or decision authority when known
- Active branch, default branch, open PRs, and relevant issues

## Structure
- Package manager, monorepo tooling, workspace layout
- Source directories, app directories, library directories
- Test directories and test frameworks
- CI workflows and validation commands
- Config files, environment files, generated files, and migrations

## Documentation
- README and onboarding docs
- Architecture docs, ADRs, design docs, runbooks
- Feature roadmap or issue backlog
- Contribution rules and branch policy

## Risk signals
- Missing validation commands
- Ambiguous ownership
- Unclear generated-code boundaries
- Untracked or dirty worktree
- Multiple active PRs for same lane
- Deprecated docs that conflict with code reality
