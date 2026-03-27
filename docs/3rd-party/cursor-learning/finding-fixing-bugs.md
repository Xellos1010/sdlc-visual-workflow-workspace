# Finding and fixing bugs

As coding agents write more code, engineers spend more time reviewing that code and tracking down bugs. Even with help from coding agents, it's worth brushing up on the fundamentals of effective debugging and finding ways to speed up your work by delegating parts of that process to agents.

## Debugging fundamentals

Good debugging follows the same principles whether a human or an agent does the work:

1. **Create a reliable reproduction.** If you can't reproduce the bug, you can't verify the fix. Write down the exact steps, inputs, and conditions that trigger the issue.
2. **Reduce to a minimal case.** Strip away everything not related to the bug. The smaller the reproduction, the easier it is to find the root cause.
3. **Isolate variables.** Change one thing at a time. If you change three things and the bug goes away, you don't know which change fixed it.
4. **Form specific hypotheses.** Come up with a few ideas for what could be the root cause. "The bug is probably in the payment code" is too vague. "The bug occurs because `calculateTotal()` doesn't account for negative discounts" is specific enough to test.
5. **Instrument your code.** Add logging at the inputs and outputs of where you suspect the issue. Compare expected values to what you see.
6. **Prevent regressions with tests.** Once you find and fix the bug, write a test that would have caught it. This prevents the same bug from coming back.

## Two approaches to debugging

### Quickly solving simple errors

For bugs with clear error messages or straightforward causes, the agent can often find and fix the problem directly. Paste in the error, give it some context about when it happens, and let the agent work.

Stack trace debugging

\`This test is failing:

\\\`\\\`\\\`
TypeError: Cannot read properties of undefined (reading 'profile')
at getProfile (src/services/UserService.ts:45)
at UserController.show (src/controllers/UserController.ts:23)
\\\`\\\`\\\`

The error happens when a user created before we added the profile onboarding flow tries to view their profile. Find the root cause and fix it.\`

This works well when the cause is visible in the error message. The agent can read the stack trace, find the code, and patch it. However, this doesn't always work, and you might need to take a more systematic approach to finding the root cause.

### Debug Mode: evidence first

For trickier bugs, [Debug Mode](https://cursor.com/docs/agent/plan-mode.md#debug) takes a different approach. Instead of guessing at fixes, it collects runtime evidence first.

![Debug Mode in the agent dropdown](https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/changelog/changelog-2-2-debug-dropdown.jpg)

Debug Mode follows five steps, which mirror the debugging fundamentals:

1. **Generates hypotheses** about what could go wrong
2. **Instruments your code** with targeted logging
3. **Asks you to reproduce** the bug while it collects data
4. **Analyzes the logs** to identify the root cause
5. **Makes a targeted fix** based on your evidence

Debug Mode: intermittent failure

Checkout is failing intermittently for some users. No consistent error message. Sometimes the order goes through, sometimes it silently fails and the user sees a blank confirmation page.

Debug Mode can help you find and fix your trickiest bugs. It takes the fundamentals we covered earlier and teaches the agent to be an effective debugger, automating the investigation you'd otherwise do manually.

## Run multiple models in parallel

For hard bugs, different models sometimes find different things. Cursor lets you run the same debugging prompt across multiple models simultaneously. Each agent works in isolation, so they won't interfere with each other.

The workflow:

1. Write a clear debugging brief with the reproduction steps and your hypotheses
2. Select multiple models from the agent dropdown
3. Submit the prompt; each model works independently
4. Compare the proposed fixes from each model
5. Keep the approach with the strongest evidence

Cursor will suggest which solution it believes is best, but you should evaluate the reasoning, not only the final solution. To further confirm the accuracy of the fix, you can ask the model to verify its work and ensure it's the correct solution.

![Multi-agent judging shows which solution Cursor recommends](https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/changelog/changelog-2-2-judge.jpg)

## Bring runtime data into the agent loop

The agent can spot performance problems and common bugs by reading code alone. But the more runtime evidence you give it, the deeper it can go.

### Start with a question

You don't always need logs or profiling tools to start investigating. Ask the agent a direct question and it will analyze your code for common issues.

Performance debugging from code

The order history page takes 4 seconds to load for users with lots of orders. Why is this slow?

In the example above, the agent found a slow query by reading through the code. No logging or performance profiling needed. For some performance issues, this is enough.

### Feed it runtime evidence

When code analysis alone isn't enough, give the agent real data. Paste terminal output, query logs, or other data into the conversation. The agent can use this data to more effectively find the root cause.

For example, if you're investigating a slow database query, you can run `EXPLAIN ANALYZE` on a slow Postgres query, paste the output, and the agent can trace the issue back to your schema:

EXPLAIN ANALYZE debugging

\`This query is taking 1.2 seconds in production. Here's the EXPLAIN ANALYZE output:

\\\`\\\`\\\`
Seq Scan on orders  (cost=0.00..45892.00 rows=47 width=244) (actual time=0.423..1203.112 rows=47 loops=1)
Filter: (user\_id = 'usr\_abc123')
Rows Removed by Filter: 2341856
Planning Time: 0.089 ms
Execution Time: 1203.298 ms
\\\`\\\`\\\`

Find why it's doing a sequential scan and fix it.\`

The same pattern works for application logs, profiling data, or build and test output.

### Use the browser for frontend debugging

For frontend issues, Cursor's [integrated browser](https://cursor.com/docs/agent/tools/browser.md) gives the agent direct access to your web application. It can read console logs, inspect network requests, and observe the DOM without you needing to copy anything.

Ask the agent to open a page, reproduce an issue, and check the console for errors or the network tab for slow requests. The agent sees what you'd see in DevTools and can trace problems back to your source code.

### Connect monitoring tools with MCP

[MCP servers](https://cursor.com/docs/mcp.md) give your agent new capabilities and connect it to production observability tools. Instead of pasting data manually, the agent pulls what it needs on demand.

MCP-powered debugging

We're getting a spike in checkout errors since yesterday's deploy. Can you pull the details from Sentry and check the Datadog logs to figure out what's going on?

In the example above, the agent queries Sentry through MCP and pulls in the relevant error details. It correlates the error with logs, finds the offending code, and proposes a fix, all in the same conversation.

Useful MCP servers for debugging:

- **[Sentry](/marketplace/sentry)**: Error details, stack traces, and breadcrumbs
- **[Datadog](/marketplace/datadog)**: Production logs and APM traces
- **Databases**: Query production data to verify hypotheses
- **Linear or GitHub Issues**: Pull bug reports and reproduction steps into the conversation

You can set up workflows where monitoring alerts on your production application trigger agent investigations automatically. If an error rate spikes, a ticket gets created in Linear, and an agent starts diagnosing the issue before a human even looks. This can reduce the time to solve customer-reported errors, or even fix issues before customers notice.

## Common failure pattern: accepting fixes you don't understand

If you don't understand the fix, you can't validate whether it's correct. The agent might add a null check that makes the error go away, but the underlying data inconsistency remains.

When the agent proposes a fix, ask questions until you understand it. Why is that value null? What changed to cause this? Is this the root cause, or are we masking the symptom? As we covered in [foundations](https://cursor.com/learn/how-ai-models-work.md), agents can hallucinate plausible-sounding explanations. You need to develop your own understanding and use the data from your investigation to confirm the agent has identified the real root cause.

## What's next

Now that you understand debugging and how coding agents can speed up your investigation, you need to make sure your changes are correct and won't introduce regressions. In the next chapter, you'll learn how to review code and test it systematically.


---

## Sitemap

[Overview of all docs pages](/llms.txt)