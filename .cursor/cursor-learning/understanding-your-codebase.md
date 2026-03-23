# Understanding your codebase

One of the most important jobs of a software engineer is building a mental map of a codebase and deeply understanding how the system works. As a project grows, it gets harder and harder to find the right code.

In the past, going through a large codebase meant memorizing regex patterns or learning specialized tools to search effectively. With coding agents, you can describe what you're looking for in natural language and let the agent use tools to find it for you.

Cursor gives agents specific tools to search effectively, and understanding how these tools work will help you ask better questions and get more accurate results.

## Agentic search

The most precise way to find a piece of code is to look for an exact match, whether that's the name of a function, a variable, or other parts of code.

Agents can use `grep`, a tool for finding exact strings, and they're able to create more complicated regex patterns or word boundary matches. There have also been improvements over `grep`, like `ripgrep`, which make searching recursive.

Both of these tools work great. However, Cursor has improved grep even further with [Instant Grep](/changelog/2-1#instant-grep-beta), which can speed up agentic searches on large codebases by a significant amount over `ripgrep`.

[Media](https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/changelog/changelog-2-1-2.mp4)

You don't need to configure anything or change your behavior to use these tools. Cursor provides them automatically, and when you chat with an agent, it uses them under the hood.

## Semantic search

When you don't know exactly what you're looking for, [semantic search](https://cursor.com/docs/agent/tools/search.md) helps you find parts of the codebase by meaning. If you ask the agent "where do we handle authentication?", semantic search can find a file like `middleware/session.ts` even though the word "authentication" isn't a literal string in that file.

This is possible because Cursor [transforms your codebase](https://www.cursor.com/blog/secure-codebase-indexing) into searchable vectors with a custom embedding model. That's a fancy way of saying Cursor builds an understanding of your code symbols mapped back to natural language.

Research on Cursor's [semantic search](/blog/semsearch) shows that combining this tool with grep produces 12.5% higher accuracy in answering codebase questions compared to grep alone. The improvement is largest on codebases with 1,000+ files.

You don't need to configure anything to use this. Cursor automatically indexes your codebase in the background when you start the application.

## Asking good questions

The way you phrase questions affects which search tools the agent uses and how effective the results are. It's a spectrum from specific to broad: you might start by asking for an exact text match like the name of a function, all the way up to broad searches like "help me understand what happens when a user submits a payment in our application."

Start specific when you know what you're looking for. Go broad when you're exploring unfamiliar territory. Let's look at some examples.

In this first example, the agent starts with grep because the prompt asks for something specific. It searches for `import.*PaymentService` to find every file that references the service.

Targeted search

Find all files that import from our PaymentService and show me how they handle the PaymentFailedError.

When you're exploring unfamiliar territory, go broader. In this next example, we're asking a general question about how the application handles failed payments. Notice how the first tool call is "Search codebase." That's the agent using semantic search to find relevant files, then following up with grep to fill in the details.

Broad exploration

How does our application handle failed payments? Walk me through the error flow from the checkout form to the error message the user sees.

## The Explore subagent

The agent can also spawn subagents to complete tasks more efficiently.

There's a built-in [Explore subagent](https://cursor.com/docs/subagents.md) that helps you search through your codebase. The Explore subagent runs in its own context window from the parent agent and uses a faster model, so it can execute many parallel searches without bloating the main conversation.

You don't have to invoke this manually. The agent will use it when it decides it's relevant. However, you can also ask to use the subagent directly if you prefer.

Like we talked about in the [foundations course](https://cursor.com/learn/context.md), understanding and keeping an eye on your context usage matters. If you're searching through many files in your codebase, this will generate a lot of context. Subagents can significantly improve your context management by only returning their findings and keeping the main conversation focused.

## Architectural diagrams

For large or unfamiliar codebases, you can ask the agent to generate architectural diagrams, like [Mermaid diagrams](https://cursor.com/learn/understanding-your-codebase.md), to help you visualize your codebase.

Architecture diagram

Create a Mermaid diagram showing the data flow for our payment system, including the checkout form, API routes, payment service, and Stripe integration.

These diagrams are useful for onboarding, documentation, and design reviews. They can also reveal architectural issues, like a service that depends on too many other services, or a data flow that takes an unexpected path.

## Common failure pattern: changing before understanding

A common mistake is asking the agent to change code without first understanding what exists. The agent might create a new utility function when one already exists, or use a different pattern than the rest of your codebase.

Before asking for changes, ask the agent to explore first:

Explore before changing

Before making any changes, show me how our existing form validation works. What patterns do we use, and where are the shared validators?

Coding agents take your requests literally. Where you don't provide intent, they use their best judgment. Sometimes that works well. But for changes that need to follow existing patterns, you'll get better results when you understand the codebase first and know specifically what to ask for.

## What's next

You can find and understand code. In the next chapter, you'll learn how to go from understanding to shipping: planning features, writing tests, and turning designs into code.


---

## Sitemap

[Overview of all docs pages](/llms.txt)