# Reviewing and testing code

Coding agents can produce a lot of code, and that also means they can produce tech debt. Moving fast is great, but you want to keep your quality bar high. Your standards for what gets merged should be the same whether the code was written by hand or by an agent.

AI-generated code can look correct but be subtly wrong. It might follow existing patterns, compile, and pass tests you wrote, but still miss edge cases, have security issues, or duplicate logic that exists somewhere else in your codebase.

This is why code review is so important. You need to put the right processes in place to ensure a high-quality codebase and catch issues before they reach production. It's your job as an engineer to invest in making code review successful.

## Self-review

You should review your code before you ask others to look at it.

**Watch the agent work.** The diff view shows changes as they happen. If you see the agent heading in the wrong direction, click **Stop** or press Cmd Shift Backspace to cancel and redirect. You don't have to wait until it finishes. For larger course corrections, revert the changes and refine your plan before running it again, as we covered in [developing features](https://cursor.com/learn/creating-features.md#when-to-start-over).

**Ask the agent to review all changes at once.** Tag [`@Branch`](https://cursor.com/docs/agent/prompting.md) in your prompt to give the agent the full diff of your current branch. Say something like "review the changes on this branch" or "what am I working on right now?" to give the agent rich context and catch issues across many different files.

For example, you can ask the agent to review its own work:

Self-review

Review the changes I've made to the discount code feature. Look for bugs, missing error handling, and anything that doesn't match our patterns in \{\{file:src/services/PricingService.ts}}

Anticipate reviewer questions

What questions will reviewers have about these changes? What context should I include in the PR description?

## Prepare for peer review

Agents can produce many code changes at once. This can result in one large commit with hundreds of changed lines. That's hard for anyone to review.

We recommend using small, semantic commits with clear descriptions. Each commit represents one logical change. A human reviewer can step through the history of commits rather than parsing a wall of code changes.

This kind of commit housekeeping is tedious by hand, but agents handle it well. For example:

1. Build the feature freely. Don't worry about commit hygiene while you're iterating.
2. Once everything works, ask the agent to rework the commit history into reviewable pieces.
3. The agent resets to `main`, reads through all the changes, and plans a logical sequence to create clean commits with descriptive messages.
4. It validates the final diff matches the original, so none of your changes are lost.

Use this prompt to create a [skill](https://cursor.com/docs/skills.md) so anyone on your team can run `/rework-commits` after finishing a feature:

reworkCommitsPrompt

## Agent Review

After the agent finishes a task, click **Review** then **Find Issues** to run a dedicated code review. The agent analyzes proposed edits line by line and flags potential problems.

For all local changes, open the Source Control tab and run [Agent Review](https://cursor.com/learn/reviewing-testing.md) to compare against your main branch. This catches issues across your full set of changes.

[Media](https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/changelog/changelog-2-1-1.mp4)

This is similar to manually prompting the agent to review your changes. We've carefully structured a prompt to make this effective for you.

## Bugbot for pull requests

[Bugbot](https://cursor.com/docs/bugbot.md) integrates with your source control provider to review pull requests automatically. It's one of a growing number of tools that give feedback directly on the PR.

Bugbot reviews PRs when you push. It reads the full context of your change, including how the modified code connects to the rest of your codebase, and looks for bugs that would reach production. Unlike linters, which catch formatting issues, Bugbot finds logic errors like null pointer exceptions, race conditions, missing error handling, and security issues.

When Bugbot finds an issue, it can also propose a fix. With [autofix](https://cursor.com/docs/bugbot.md#autofix) enabled, you can commit the fix directly from a comment on the pull request.

You can also customize Bugbot by providing [additional rules](https://cursor.com/docs/bugbot.md), which we'll talk more about in the next section on customizing agents.

## Verifiable goals

To help ensure the correctness of your code, you want to give the agent clear signals to validate its own work:

- **Tests** catch behavioral regressions
- **Type checking** catches structural errors
- **Linting** catches style and pattern violations

The more of these checks you have in place, the more confidently you can delegate work to agents. We recommend using typed languages with test coverage and linting rules alongside your agent.

## Let agents write your tests

In the past, building thorough test coverage took significant effort. Most teams would only add tests after something broke, or had heavy processes for ensuring a certain percentage of coverage.

Agents make writing tests much more approachable. You can ask the agent to write tests and then verify they're correct. The agent can also do manual testing for you through the [browser](https://cursor.com/docs/agent/tools/browser.md), checking UI states or flows you'd otherwise verify by hand.

Agent-written tests

Write integration tests for the discount code API endpoint and e2e tests for the checkout discount flow. Look at our existing test patterns and match them.

This matters because high-quality tests give you more confidence to let the agent work autonomously and make changes without introducing regressions.

Good prompts for generating tests:

- "Plan how to get e2e coverage for our checkout flow. What scenarios should we test?"
- "Set up integration tests for the payments API. Use our existing test infrastructure in `src/__tests__/`."
- "What edge cases aren't covered by our current tests for the discount feature?"
- "Write regression tests for the bug we fixed in `PaymentService.ts`."

The agent can also help you set up testing infrastructure from scratch. If you don't have Playwright configured for a web application, you can ask the agent to set up the project, write the configuration, and create your first test.

## Cloud agents

So far, you've worked with agents running locally in your editor. [Cloud agents](https://cursor.com/docs/cloud-agent.md) run in remote sandboxes, which means you can close your laptop and check results later.

Here's how they work:

1. Describe the task and provide relevant context
2. The agent clones your repo and creates a branch
3. It works on its own, opening a pull request when finished
4. You get notified when it's done (via [Slack](https://cursor.com/docs/integrations/slack.md), email, or the [web interface](https://cursor.com/agents))
5. Review the changes and merge when ready

Cloud agents work well for tasks you'd otherwise add to a to-do list: bug fixes that came up while working on something else, test coverage for existing code, documentation updates, or refactors.

## Testing at scale with cloud agents

One powerful pattern is using cloud agents to test many variations in parallel. You can launch multiple cloud agents to try different edge cases, error conditions, and input combinations across your application.

For example, say you added a new discount code feature. You might launch cloud agents to test every discount type, try invalid inputs, test combinations like stacking discounts, and verify behavior at edge case boundary values.

Each cloud agent creates a branch with its test cases and results. You can then aggregate the failures into reproducible local test cases and fix them before merging.

## Speed up your feedback loops

As you start working with more coding agents, the bottleneck moves to the slowest part of your system. That's often waiting for your test suite to finish, running type and linting checks across your codebase, or other steps in your CI pipeline.

Every conversation with an agent pays these costs. If your tests take 10 minutes to run and you launch 10 agents in parallel, that's nearly two hours of waiting. Make your tests 50% faster and you save almost an hour every time.

These improvements pay off repeatedly across every session, every branch, and every agent. Here are some examples of high-leverage changes:

- Speeding up your test suite
- Trimming your dependency tree
- Optimizing your CI pipeline
- Making your type checking faster
- Reducing your build times

These are the kinds of tasks teams might deprioritize, but when agents are running these commands dozens of times a day, the savings compound. A one-hour investment in faster tests can save hundreds of hours over time.

The best part is agents can do this work for you. You can ask an agent to profile your tests and find the slowest ones to fix. You can ask it to audit your dependencies and remove what's unused. These are well-scoped tasks with clear, verifiable output, which is exactly where agents do their best work.

## Common failure pattern

Passing tests don't guarantee the code works correctly. It's possible the tests are checking the wrong behavior. The agent might have written code that works for the happy path but doesn't consider all of the edge cases.

It's important for you to understand the code changes. If the change is too large to review comfortably, consider breaking it into smaller pieces that are easier to review, both for you and for agents.

## What's next

You now understand how to ship new features, debug when things go wrong, and review code to ensure it's high quality. The last piece is making your workflow faster by customizing agents to work with your specific codebase.


---

## Sitemap

[Overview of all docs pages](/llms.txt)