# Developing features

Now that you understand the codebase, it's time to build something new.

The key to shipping features with agents is to break the work into steps the agent can verify on its own. Start every major feature with a plan, then set up the right guardrails so the agent can catch and fix its own mistakes.

## Start with a plan

Agents can help you think through what to build before you start writing code.

There are many decisions you need to think through before writing code. If you have an idea for a feature, you might want to build a simple version first and iterate on it later. Or maybe there are specific design decisions to take into consideration.

You can use coding agents to help you think through these decisions before you write code. With Cursor's [Plan Mode](https://cursor.com/docs/agent/plan-mode.md#plan), the agent will research your codebase, ask you clarifying questions, and produce a step-by-step plan you can edit and modify.

When you submit a prompt to plan mode, the agent asks you questions to help figure out the requirements first:

Once you answer, the agent generates a structured plan with milestones it can review and verify as it builds the feature. This plan is editable, so you can make changes if something looks off:

### notification-preferences.md

\`# Notification preferences

\## Overview
Add a notification preferences page to user settings. Users can toggle email, push, and in-app notifications per category (marketing, product updates, security alerts). Preferences stored in the database with optimistic UI updates.

\## Approach
\- Follow the existing settings page layout in src/pages/Settings.tsx
\- Use the UserPreferences table with a JSONB column for notification config
\- Reuse our existing Toggle component from the UI library

\## Tasks
\- \[x] Add notification\_preferences column to UserPreferences table
\- \[ ] Create NotificationPreferences component following Settings.tsx patterns
\- \[ ] Add API route at app/api/user/notifications/route.ts
\- \[ ] Wire up optimistic updates using our existing useOptimistic hook
\- \[ ] Add tests for preference toggling and API validation\`

Cursor makes plans useful by breaking larger requests into smaller, independently verifiable steps. At each step, the agent can measure its progress, confirm the step completed successfully, and move on.

### When to start over

Sometimes the agent builds something that misses the mark. Instead of trying to fix it through follow-up prompts, go back to the plan. Revert the changes and refine the plan to be more specific before running it again.

For example, if you missed a key architecture or system design note, the plan might build the wrong thing. Starting over from the plan feels counterintuitive, but it's often faster than patching an approach that started with the wrong direction.

## Test-driven development with agents

Agents do their best work when they can tell whether their code is correct. When a test fails, the agent can see what went wrong and try again.

Engineers have used test-driven development for a long time, but it wasn't always the most popular way of writing code. With agents, it's much easier to write tests first, and those tests pay off as your codebase grows.

1. **Write tests first.** Ask the agent to write tests based on the expected inputs and outputs. Be explicit you're doing TDD, so it doesn't create mock functions for code that doesn't exist yet.
2. **Confirm the tests fail.** Tell the agent to run the tests and verify they fail. You're not trying to write feature code at this point.
3. **Commit the tests.** When you're satisfied with the test coverage and quality, commit them. This locks in your requirements for the agent to build against.
4. **Ask the agent to write code.** Tell it to make all tests pass without modifying the tests. Keep iterating until everything passes.
5. **Commit the code.** Review the output, confirm it behaves as expected, and commit.

TDD: write tests first

\`Write tests for a discountCode() function that:

\- Returns the discounted price when given a valid code
\- Throws InvalidCodeError for expired codes
\- Applies fixed-amount discounts correctly (e.g., "10OFF" = $10 off)
\- Never returns a negative price (floor at $0)

Follow the test patterns in \{\{file:src/\_\_tests\_\_/pricing.test.ts}}. Do NOT write the function yet.\`

Once the tests are committed, tell the agent to write the code. Be explicit that it should make all tests pass without modifying the tests.

TDD: make the tests pass

\`Make all tests in \{\{file:src/\_\_tests\_\_/discountCode.test.ts}} pass. Follow the service patterns in \{\{file:src/services/PricingService.ts}}. Do NOT modify the tests.\`

Why does this work so well? Because the agent can run tests, see failures, adjust its code, and try again. Each test run gives the agent concrete feedback. Without tests, it has no way to know if the code changes it made work.

This approach is especially valuable for backend code where you can't verify correctness by looking at a screen. You describe the expected behavior in your tests, and the agent writes the code to match.

## Design to code

Agents can process and understand images. You can paste a screenshot or mockup directly into the prompt input, and the agent can match the design based on your image.

This works for:

- **Mockups**: Paste a wireframe or Figma export and ask the agent to build the component
- **Visual debugging**: Screenshot an unexpected UI state and ask the agent to investigate
- **Iteration**: Take a screenshot of the current result and describe what needs to change

You can also connect the [Figma MCP server](/marketplace/figma) so the agent can pull design tokens, variables, and component specs directly from your Figma files.

The [integrated browser](https://cursor.com/docs/agent/tools/browser.md) lets you preview changes as the agent makes them. With this browser, the agent can navigate pages, take screenshots, and verify its own visual output. This saves you from manually passing screenshots back to the agent.

## Common failure pattern: building without verification

The biggest risk when building features quickly is skipping verification. Agents can generate a lot of code fast, but speed without correctness can create more work down the road.

Here's a concrete list of ways to help the agent verify its work:

- **Tests** for logic and behavior
- **Type checking** for structural correctness
- **Linters** to enforce code style and patterns
- **Browser tools or MCP servers** to pull feedback on UI changes

If the agent can't verify its output, you'll end up spending more time making corrections.

## What's next

You've shipped a feature. But software has bugs, and some of them are tricky. In the next chapter, you'll learn systematic approaches to finding and fixing bugs with agents.


---

## Sitemap

[Overview of all docs pages](/llms.txt)