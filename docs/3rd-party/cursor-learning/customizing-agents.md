# Customizing agents

Coding agents are extremely intelligent without any customization. They have a great understanding of software engineering proven approaches and generally make correct decisions.

However, they don't know how your team likes to write software, your preferred tools, or the context of your business. This is where customization comes in. You can modify agents to help them be more effective and produce higher quality output.

Cursor provides two layers of customization that map to how you'd onboard a new teammate: **rules** for things they should always know, and **skills** for specialized knowledge they can pull in when relevant.

## Rules: static context

[Rules](https://cursor.com/docs/rules.md) are markdown files stored in `.cursor/rules/` that the agent sees at the start of every conversation. You can think of them as always-included instructions that shape how the agent works with your code.

A good rule file is short, specific, and points to examples rather than copying them:

```markdown
# Commands

- `npm run build`: Build the project
- `npm run typecheck`: Run the typechecker
- `npm run test`: Run tests (prefer single test files for speed)

# Code style

- Use ES modules (import/export), not CommonJS (require)
- Destructure imports: `import { foo } from 'bar'`
- See `components/Button.tsx` for canonical component structure

# Workflow

- Always typecheck after making a series of code changes
- API routes go in `app/api/` following existing patterns
```

Rules work best for:

- Build and test commands the agent should know
- Code conventions the agent should follow
- Pointers to canonical examples in your codebase
- Guardrails (files not to modify, patterns to avoid)

### What to avoid in rules

- **Don't copy entire style guides.** Use a linter instead. Rules should complement your tooling instead of replacing it.
- **Don't document every command.** The agent already knows common tools. Add project-specific commands only.
- **Start simple.** Rules are included in every conversation, so they add up. Add rules only when you notice the agent making the same mistake repeatedly, and keep them short.

Check rules into git so your whole team can benefit from the shared knowledge.

## Skills: dynamic context

[Skills](https://cursor.com/docs/skills.md) extend what your agents can do with specialized knowledge and workflows. Unlike rules, skills are [loaded dynamically](https://cursor.com/blog/dynamic-context-discovery). The agent decides when to use them based on the task at hand.

Skills are defined in a `SKILL.md` file and can include domain knowledge, custom workflows, and scripts and code the agent can execute.

```markdown
---
description: Deploy to staging. Use when the user asks to deploy, ship, or push to staging.
---

# Deploy to staging

## Steps

1. Run `npm run build` and confirm it succeeds
2. Run `npm run test` and confirm all tests pass
3. Run `npm run deploy:staging`
4. Verify the deployment by checking https://staging.example.com/health
5. Report the deployment status and URL
```

The key difference between rules and skills:

|                  | Rules                             | Skills                              |
| ---------------- | --------------------------------- | ----------------------------------- |
| **When loaded**  | Every conversation                | Only when relevant                  |
| **Purpose**      | Always-on conventions             | Specialized workflows               |
| **Context cost** | Always uses context space         | Only uses full context when invoked |
| **Best for**     | What the agent should always know | What the agent can do when asked    |

## MCP: connecting to external tools

[MCP (Model Context Protocol)](https://cursor.com/docs/mcp.md) lets the agent connect to external tools and pull in relevant context. MCP servers expose this context and actions the agent can use on demand.

For example, you can connect the agent to:

- **Slack** to read messages and post updates
- **Datadog** to investigate production logs
- **Sentry** to look up error details and stack traces
- **Databases** to query data directly
- **Figma** to pull design tokens and component specs

Browse the [Marketplace](/marketplace) to find servers for the tools you use.

### CLI tools as agent capabilities

Beyond MCP, the agent can run any CLI tool installed in your terminal. Tools like `gh`, `aws`, `kubectl`, and `docker` work without extra configuration. The agent can execute them directly.

Point the agent at useful tools through a rule:

```markdown
- Use `gh` for all GitHub operations (issues, PRs, CI checks)
- Use `aws s3` for file storage operations
```

This is useful for debugging too. Instead of switching to a browser to check CI status or look up an issue, you can ask the agent: "Check why CI failed on this PR using `gh`." It runs the commands, reads the output, and takes action based on it.

## Saving reusable workflows

You can also invoke skills on demand using `/` in the agent input. This turns skills into reusable workflows you can trigger by name, which is ideal for tasks you run many times per day.

For example, a `/pr` skill that commits, pushes, and opens a pull request:

```markdown
---
description: Create a pull request for the current changes.
---

1. Look at the staged and unstaged changes with `git diff`
2. Write a clear commit message based on what changed
3. Commit and push to the current branch
4. Use `gh pr create` to open a pull request with title/description
5. Return the PR URL when done
```

pr

prSkill

Other workflows that work well as skills:

- `/fix-issue [number]`: Fetch issue details with `gh issue view`, find relevant code, fix the bug, and open a PR
- `/review`: Run linters, check for common issues, and summarize what needs attention
- `/update-deps`: Check for outdated dependencies and update them one by one, running tests after each

Check these into git so your whole team can run them.

## The before and after

Here's what customization looks like in practice. Consider a team that uses Next.js, Tailwind, and Vitest:

**Before rules:** The agent uses `jest` for testing (because it's more common in training data), creates components with CSS modules, and puts API routes in random locations.

**After adding three rules:**

```markdown
- Tests use Vitest, not Jest. See `src/__tests__/example.test.ts` for patterns.
- Style with Tailwind utility classes. No CSS modules or styled-components.
- API routes go in `app/api/[resource]/route.ts` following existing patterns.
```

The agent now follows the team's conventions by default. No more correcting the same mistakes in every conversation.

## Common failure pattern: over-engineering rules

You might be tempted to write rules for everything. Resist this. Too many rules consume unnecessary context and may confuse the agent.

Keep your rules minimal and high quality. They should be a shared artifact your team is constantly updating. If you only need something occasionally, put it in a skill instead.

## What's next

You've customized your agent to match your team's patterns. In the final chapter, you'll tie everything together in an end-to-end example that applies everything you've learned in this course.


---

## Sitemap

[Overview of all docs pages](/llms.txt)