# Working with agents

Developers are now writing *a lot* of code with agents. Instead of typing every line by hand, they talk to an agent and have it write the code for them.

In the [Foundations](https://cursor.com/learn/agents.md) course, we learned the core behavior behind agents: give them powerful tools and let them run autonomously in a loop. In this course, we'll cover strategies to work effectively with coding agents when you're building software.

## What's an agent harness?

Cursor is an AI editor with a built-in coding agent. The agent runs inside what's called a "harness," which is made up of three things:

1. **Instructions**: The system prompt and rules that guide behavior
2. **Tools**: File editing, codebase search, terminal execution, and more
3. **Model**: The agent model you pick for the task

Coding agents help you accomplish tasks based on the goals you give them. Every harness has slightly different behavior based on how it's tuned and the models you use.

Some models are trained to call shell commands more often. Others need more explicit instructions. With Cursor, our goal is to support every [frontier model](https://cursor.com/docs/models-and-pricing.md) and [optimize the harness](/blog/codex-model-harness) as much as possible, including the [tools](/blog/semsearch) they have access to.

## Writing effective prompts

Your first entry point into working with agents is the prompt you give them. Consider two different approaches:

Vague prompt

Add a user settings page

The agent had to guess at everything: what layout you wanted, the components, the styling approach, and more. Sometimes this works, but often you need to be more specific with your intent.

Compare that with a more detailed prompt that references existing patterns in your codebase:

Constrained prompt

\`Add a user settings page.

Look at the existing profile page in \{\{file:src/app/profile/page.tsx}} for our layout pattern. Use the same form components from \{\{file:src/components/ui/Form.tsx}}. Settings should include:

\- Display name (text input)
\- Email notifications (toggle)
\- Theme preference (dropdown: light, dark, system)

Store settings using our existing useUserPreferences hook. Follow the same API route pattern as \{\{file:src/app/api/user/profile/route.ts}}.\`

The second prompt is much better because it gives the agent specific instructions grounded in your codebase: existing files, components, and clear scope. The agent follows your patterns instead of inventing new ones.

We'll talk more about this when we learn how to [create new features](https://cursor.com/learn/creating-features.md) and plan larger changes across multiple files.

## Managing your context

As you work with an agent, your conversation builds up [context](https://cursor.com/learn/context.md): messages, tool calls, file contents, and more. This context is the agent's working memory, and it has limitations.

Be mindful of how much context the agent is using. Start a new conversation when you're switching to a new task, or if you notice the agent making mistakes.

If you're still working on the same feature and the agent has useful context from earlier messages, it's worth continuing the conversation. But if the agent keeps going in circles, start fresh even if you're mid-feature. You can reference the old conversation to allow the agent to read the chat transcript.

![Reference past chats to bring in context from previous conversations](https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/blog/past-chats.jpg)

Referencing a past conversation

Continue the auth refactor from \{\{chat:Red auth refactor}}. I've addressed the review feedback on the JWT expiry handling. Now update the refresh token rotation to invalidate old tokens on use.

The latest models are getting very good at finding context for you. When given tools like [semantic search](https://cursor.com/docs/agent/tools/search.md), the agent can pull in relevant files as needed. If you know the exact file, tag it. Otherwise, give the agent a general description and let it find the right files.

## Common failure pattern: scope creep

One of the most common mistakes is asking for too large of a change without planning. You might notice the agent making unrelated changes, editing files you didn't want, or losing focus.

If you see this happening, stop and consider whether you could break the task into smaller pieces. If you're planning an ambitious feature, we'll cover how to create solid plans and specifications in [creating features](https://cursor.com/learn/creating-features.md). Once you have that plan and kick off the first conversation, it's often faster to iterate in smaller follow-up conversations after that.

## What's next

You've learned how agent harnesses work, how to think about writing effective prompts, and how to manage your context. In the next chapter, we'll go deeper on how agents search through your codebase and help you better understand the code and architecture you're working with.


---

## Sitemap

[Overview of all docs pages](/llms.txt)