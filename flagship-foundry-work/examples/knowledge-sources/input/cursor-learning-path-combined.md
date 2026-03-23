# Cursor Learning Path (combined)

Generated: 2026-03-21T23:31:54.905Z
Run: docs/cursor-learn/runs/2026-03-21T23-30-28Z

---

## how ai models work

Source: https://cursor.com/learn/how-ai-models-work

# How AI Models Work

Let’s talk about how AI models work.

You can think of them like super intelligent, general purpose API endpoints. Just like you would integrate the Stripe API to handle payments, or Twilio to send text messages, you can call an AI model to solve a variety of tasks.

The biggest difference is: **you are not guaranteed to get the same results every time**.

## Deterministic vs. probabilistic

Traditional software is deterministic. Given some input, if you run the program again, you will get the same output. A developer has explicitly written code to handle the paved path.

AI models are not this way. They are probabilistic. This means there are many different paths the model might take given the same input.

![Two different paths to take, deterministic vs probabilistic](/docs-static/images/path-light.png)

The first piece of your AI mental model is to **never assume you are guaranteed to get the same answer every time**.

When the AI model decides to pick a path, how does it determine what to output? Under the hood, these models are predicting the next chunk of text to respond based on two things:

1. The information the model was “trained” on
2. What you provide the model as an input, called a “prompt”

For example, let’s ask the AI what the meaning of life is:

Anthropic Claude 4 Sonnet

What is the meaning of life? Respond with a single word.

Based on my *input*, the model tries to predict the next word to display. Try running the prompt above a few times. Notice two important things:

1. Even the same model and prompt can give a **different response to the same question**
2. **Models don’t always follow your instructions**.

You may not get a one word response, even though you explicitly asked for it.

## Choosing a model

How do you know which model to use?

AI models vary in their level of intelligence, speed to respond, cost, and areas of expertise. Some models are fast and cheap, but cannot solve deeper technical problems which require more thinking.

Other models are slower and more expensive, but can “think” and work on problems for significantly longer when you have more complicated tasks.

![AI Model Comparison Chart showing different models plotted by intelligence vs speed vs cost](/docs-static/images/models-light.png)

The ultimate goal is a model that is incredibly smart, extremely fast, and very affordable. Whether that model exists today is a question of your use case.

**For building software, current models are very capable for a variety of coding tasks.**

New models are released almost every month, and the state of the art in AI is continuously being redefined. This means you can expect to see even smarter models, which are more capable of solving coding, planning, or other tasks for building software in the future.

## Modalities

You can also interact with models in different ways, or “modalities”. For example, through text into a chatbot, generating an image, talking to a virtual AI, or even generating video from prompts.

Model quality is improving rapidly, so it's important to pay attention to the latest model releases. For example, video generation models were not very good just a few years ago, but are now quite realistic.

[Media](/docs-static/videos/willsmith.mp4)

For building software, using different modalities might look like:

1. Using text to describe the product or feature you want to build, working with the AI together to define a plan
2. Using images to share mockups or designs for the UI you’re trying to build, or providing feedback back to the AI model if the spacing or colors aren’t right
3. Using voice to transcribe what you’re saying into an input for the AI model, saving you from needing to type out long or detailed instructions

Before we talk about how to use AI models effectively, it’s helpful to understand their limitations. Let’s dig into that more in our next lesson.


---

## Sitemap

[Overview of all docs pages](/llms.txt)

---

## hallucination limitations

Source: https://cursor.com/learn/hallucination-limitations

# Hallucinations

Now that you understand how AI models work, let's talk about something that trips up many developers when they first start using AI tools: **hallucination**.

Hallucination is when an AI model confidently generates information that seems plausible but is actually incorrect. It's like when someone tries to bluff their way through a conversation about a topic they don't really know.

## Why do models hallucinate?

Remember how we said AI models predict the next token based on patterns they've learned? Well, sometimes those patterns lead them astray.

Think of these models like extremely powerful text autocomplete. If you've typed "The weather today is..." your phone might suggest "sunny" or "cloudy" based on common patterns. AI models do the same thing, but with entire concepts and code blocks.

When an AI model doesn't know something, it doesn't always say "I don't know." Instead, it generates what seems most likely based on patterns it has seen. For coding, this might mean:

- **Inventing plausible-sounding API methods** that don't actually exist
- **Mixing up syntax** between different programming libraries or frameworks
- **Creating configuration options** that seem reasonable but aren't real

AI model providers take tons of text on the internet (and other proprietary data) to train models up until some date called the “knowledge cutoff”. This date is the latest knowledge models have. AI models may suggest incorrect solutions if you ask about libraries created after this date.

## Hallucination in the wild

Let me show you some real examples of hallucination developers encounter.

The first is a seemingly correct but non-existent import from a package.

```jsx
// AI suggests:
import { debounce } from "react";

// Reality: debounce isn't exported from React!
// You need lodash or to write your own
```

The second is a convincing looking, but fake method on a class:

```python
# AI suggests:
df.remove_outliers(threshold=3)

# Reality: pandas DataFrames don't have this method
# You need to implement outlier removal yourself
```

And finally, an *almost right* configuration file:

```json
// AI suggests for package.json:
{
  "type": "module",
  "exports": "./index.js",
  "browser": true // <- This isn't valid!
}
```

As you work with AI models more, you’ll learn how to spot hallucinations.

It’s worth being skeptical of the results you get back from the model, and verifying the suggestions it makes independently. One way to make this easier is by setting up your editor or application environment to give you feedback.

For example, inside Cursor, an incorrect `import` statement should show an error that the import does not exist, which can then be provided back to the AI model as feedback.

## Other model limitations

Models can also confidently suggest the wrong answer.

You might get a response that says “You’re absolutely right!” when in reality, you were *not* right. Further, some models struggle with things deterministic software is great at, like generating truly random numbers, or counting the number of occurrences of a character in a word.

But even with hallucinations and limitations, AI models are still incredibly useful.

The key to working effectively with AI is developing a verification mindset. Every suggestion is a starting point, not a final answer. This might sound like extra work, but it's actually making you a better developer by forcing you to understand what the code does rather than just copying it.

Throughout this course, we’ll suggest approaches you can take to improve the quality of the code generated and properly work with AI models.

Before we talk about how we can interact with the models, we need to understand more about how they think and how they are priced. Let’s dig into that more in our next lesson.


---

## Sitemap

[Overview of all docs pages](/llms.txt)

---

## tokens pricing

Source: https://cursor.com/learn/tokens-pricing

# Tokens & Pricing

Now that we understand how AI models work at a high level, let's dive into something that will help you understand both **how these models think** and **how much they cost to use**: tokens.

You can think of tokens like the "words" that AI models actually understand. But here's the thing, they're not quite the same as the words you and I would use.

Just like how your computer doesn't actually understand the letter "A" but instead works with binary code (1s and 0s), AI models don't work directly with words like "hello" or "world" either. Instead, they break everything down into smaller chunks called **tokens**.

For example, the word "hello" might be one token, but the word "understanding" could be broken into multiple tokens like "under", "stand", and "ing". Sometimes even parts of words, punctuation, or spaces become their own tokens.

Run a prompt and enable tokenizer view

What are some tips for providing better context when working with AI coding assistants? Be concise.

So why does this matter? Two reasons:

1. **Tokens are how models are priced.** You pay per token, not per word or character.
2. **Tokens are how we measure model speed.** Faster models have a faster TPS, or tokens per second, which are returned back to the user.

Let's talk about pricing first, since this impacts how much you spend on AI model usage.

## Understanding tokens

If we keep the analogy going that AI models are like APIs, then tokens are the units we use to measure and charge for input and output traffic.

AI models charge based on two types of tokens:

1. **Input tokens**, which include everything you send to the model like your prompt and the previous conversation.
2. **Output tokens**, which include everything the model generates back to you.

Output tokens typically cost 2-4x more than input tokens, because generating new content requires more computational work than just processing what you sent.

Since AI models charge based on tokens, understanding them is key to managing your costs. Think of it like knowing what your server costs are.

You’ll want to be intentional about how much information you include in your initial context, which we’ll talk about next, and how you steer the model to be concise or detailed in its responses.

## Streaming responses

Have you ever noticed how ChatGPT or other AI chatbots seem to “type” their responses in real time? It’s not just a visual effect, it’s actually how the models work under the hood.

AI models generate tokens one at a time, in sequence. They predict the next token, then use that prediction to help predict the next token after that, and so on. This is why you see responses appear word by word (or rather, token by token).

Responses can then stream back to you. This is great because you don’t have to wait for the entire response to finish, which could take minutes, and you can interrupt the model if it starts to go off track.

## Optimizing token usage

AI tools often use techniques to reduce the number of tokens sent to the underlying models. For example, automatically caching parts of your prompt that you use repeatedly, or helping you manage the context that you include with each request.

Let’s dive into context in our next lesson.


---

## Sitemap

[Overview of all docs pages](/llms.txt)

---

## context

Source: https://cursor.com/learn/context

# Context

Now that you understand how AI models work, let’s explore how we can improve the quality of their output.

You might think to improve the model output you need to write better prompts. And that will certainly help, but it’s missing the bigger point: **working with AI models is all about managing the context you provide them**.

You can think about this like cooking. Let’s say we’re making a soup.

You have many inputs into the cooking process with all of the ingredients. You follow some path or recipe, keeping track of your progress along the way. And at the end, you have a tasty soup as a result.

Different chefs might add or modify the ingredients to their taste, and even if you follow the same recipe exactly, it might taste slightly different at the end.

This is kind of like working with AI models! Let’s look at a similar example for coding:

1. You can have many inputs, like your current codebase and files, and a prompt to tell the AI model what you want to achieve
2. You follow a plan, sometimes human generated or suggested by the model itself, which can then create a todo list and check items off as it completes tasks
3. At the end, you get generated code you can apply to your project

## System and user prompts

Your inputs, as well as the model outputs, all become part of the “context”. Think of the context like a long list, where the AI model keeps a working memory for the conversation.

At the start of the list is a system prompt. This is how the tool creator can inject some instructions or style for the model to follow. It’s trying to help nudge the output in a certain direction, including defining specific rules to follow.

Then you have the user message or prompt. This could be any directions you want to give the model. For example, adding a new route to manage user accounts. You don’t have to use proper spelling or grammar, as AI models are surprisingly good at figuring out what you meant, but it still can’t hurt.

This doesn’t have to be just text. Many AI products now support attaching images, where the underlying AI model can read and understand the contents of the image and include that text representation in the context.

## Including context

Tools like Cursor can automatically include other relevant information in the input context based on the state of your codebase. For example, your open files, the output from your terminal, linter errors, and more.

For example, try the prompt below. It will include the current file we're viewing, which is the page you're reading right now.

Try running this prompt

What are some practical tips for providing better context when working with AI coding assistants?

After sending the inputs to the model, it generates and returns some output back. For simple questions, this might just be text. For coding use cases, this could be snippets of code to apply to your codebase. Everything returned from the model is part of the output context.

Your conversation may go on for many “turns” back and forth between you and the AI model. Every message in the conversation, including both inputs and outputs, is stored as part of the working memory in context.

The length of this list grows over time. This is important to note! Just like if you were having a conversation with a human, there’s only so much context you can keep in your brain at one time.

As the conversation goes on for a while, it gets harder to remember things people might have said 3 hours ago. This is why understanding and managing context will be an important skill to learn.

## Context limits

Every AI model also has a different context limit, where it will no longer accept further messages in the conversation, so many AI tools give the user feedback on how close they are to those limits or provide ways to compress and summarize the current conversation to stay under the limit.

![How adding more turns grows the context window of a conversation](/docs-static/images/turns-light.png)

Later on in the course, we’ll cover practical examples for how to manage context inside of Cursor. So far we’ve only talked about how we can give the model context we control, like text or images. What about if we want the model to dynamically retrieve context itself?

That’s where tool calling comes in.


---

## Sitemap

[Overview of all docs pages](/llms.txt)

---

## tool calling

Source: https://cursor.com/learn/tool-calling

# Tool Calling

Now that you understand how context works, let's explore how AI models can do more than just generate text. They can actually take actions and retrieve information dynamically through **tool calling**.

Remember how we compared AI models to API endpoints? Well, tool calling is like giving those models the ability to call *other* APIs themselves. It's as if the AI model can learn new skills.

Let me give you an analogy. Imagine you're helping a friend cook dinner over the phone. You can give them instructions based on what you know, but you can't actually see what's in their fridge or taste the food they're making.

Now imagine if your friend sends you photos of their fridge contents, or if they tell you the exact temperature of their oven. Suddenly, you can give much better advice because you have access to real-time information. That's essentially what tool calling does for AI models.

## How tool calling works

When developers build AI applications, they can define specific "tools" that the AI model can use. These tools are like special abilities that extend what the model can do beyond just thinking and responding with text.

You've probably already used tool calling without realizing it! When you ask ChatGPT to generate an image, search the web, or run code, it's using tools behind the scenes.

Here's what happens under the hood:

1. The AI model receives your request and recognizes it needs additional capabilities
2. It formats a special response in JSON (a structured data format) that specifies which tool to use and what parameters to pass
3. The application runs that tool and returns the results
4. The AI model incorporates those results into its context and continues the conversation

## Why tools matter for coding

For building software, tools are incredibly powerful because they let the AI model:

- **Read and write files** in your codebase
- **Search through code** to find relevant functions or patterns
- **Run shell commands** to test code or install packages
- **Access documentation** or search the web for current information
- **Check for errors** by running linters or tests

Without tools, the AI model would be limited to only the information you explicitly provide in the context. With tools, it can actively explore and interact with your codebase.

## What's inside a tool call?

Every tool has three main components:

1. **A name** like `read_file` or `search_web`
2. **A description** that tells the model when and how to use the tool
3. **Parameters** which are the inputs the tool needs to work

Here's an example of what a tool definition might look like:

```json
{
  "name": "read_file",
  "description": "Read the contents of a file from the codebase",
  "parameters": {
    "filepath": "The path to the file to read"
  }
}
```

When the AI model wants to use this tool, it generates a response like:

```json
{
  "tool": "read_file",
  "parameters": {
    "filepath": "src/components/Button.tsx"
  }
}
```

The application then reads that file and adds the contents to the conversation context, allowing the model to understand your Button component and suggest relevant changes.

## The cost of tools

Remember how we talked about tokens and pricing? Tool calls consume tokens in two ways:

1. **Tool definitions** are included in the input context (usually a few hundred tokens per tool)
2. **Tool results** are added to the output context (varies based on what the tool returns)

This means conversations with lots of tool usage will fill up the context window faster and cost more. But the tradeoff is usually worth it because the AI can be much more helpful with access to real-time information.

When tool calls happen, AI models re-evaluate context up until the tool call itself. Inside of tools like Cursor, this means you’ll see more cached input token usage, since we’re resending context back to the model.

## Beyond built-in tools

Recently, a new standard called [MCP](/marketplace) (Model Context Protocol) was created. Think of it as a universal way for AI models to use and integrate tools across applications.

Just like how USB became a standard for connecting devices to computers, MCP aims to be a standard for connecting tools to AI models. This means developers can build tools once and have them work across many different AI apps.

For example, you can use MCP to connect to Figma for design files, Linear to view and manage issues, or even a database to query your data directly. You can also create your own MCP servers to integrate with internal tools and APIs.

Now that you understand tool calling, let's see what happens when we let AI models use multiple tools in sequence. That's where things get interesting with **agents**.


---

## Sitemap

[Overview of all docs pages](/llms.txt)

---

## agents

Source: https://cursor.com/learn/agents

# Agents

So far, we've learned that AI models can call tools to extend their capabilities. But what if we let them call multiple tools, make decisions about which tools to use, and even learn from the results? That's where **agents** come in.

At its core, an agent is simply **tools in a loop**.

Think of it like this: instead of you having to tell the AI what to do step by step, you give it a goal and let it figure out the steps itself. It's the difference between giving someone turn-by-turn directions versus just telling them the destination and letting them use GPS.

## How agents work in practice

Let's say you ask an AI agent to "add a dark mode toggle to my settings page." The agent goes into action, first searching through your codebase to find the settings page. Once it locates the relevant files, it reads them to understand the current structure and styling approach.

Then something interesting happens: the agent creates its own plan for implementing the feature. It might decide to add a state variable, create new CSS classes, implement the toggle component, and update the UI. As it executes each step, it's constantly checking its work, running tests, and fixing any errors that pop up.

This entire process happens through a series of tool calls, with the agent deciding what to do next based on the results of each action. It's like watching someone think out loud, except they're actually doing the work as they go.

## Agents change how we build

The real magic of agents is how they transform your role as a developer.

Instead of having conversations like "What files are in the components folder?" followed by "Can you read the Button component?" and then "Now update it to add a dark mode variant," you can simply state your end goal and let the agent handle the journey.

This is a large shift because it turns you into a **task manager instead of a task doer**. You can have multiple agents working on different parts of your codebase simultaneously. While one agent adds tests to your authentication flow, another can update documentation, and a third can refactor that messy utility file you've been meaning to clean up in the background.

## The reality of working with agents

Agents are great at tasks with clear objectives and established patterns, like adding tests to existing code, updating documentation, refactoring with consistent patterns, and fixing bugs with clear error messages.

However, they still struggle with complex debugging that requires deep understanding of system interactions, perfectly matching visual design mockups down to the pixel, working with new libraries that weren't in their training data, and more.

Think of agents like fast junior developers who need clear direction, who also can easily forget things, so they require oversight. They can get stuck in loops, repeating the same failing approach without recognizing they need a different strategy.

Agents use significantly more tokens than asking simple questions because of all the tool calls and iterations. Without good constraints, they might enthusiastically make changes you didn't intend. And crucially, you're still responsible for verifying the code works correctly and meets your standards.

## The art of delegation

Working effectively with agents is about learning what to delegate and when. Start with smaller, well-defined tasks to build up confidence. As you get comfortable, you can delegate larger chunks of work, but always with checkpoints and verification steps along the way. We’ll cover more practical examples of this later in the course.

The goal isn't to eliminate human involvement but to amplify what you can accomplish. You become the architect and reviewer while agents handle the implementation details.

## Looking ahead

We've covered the foundations of how AI models work, from tokens to context to tools and agents. In the upcoming lessons, we'll dive into practical examples of using these concepts in Cursor to build real software.

You'll learn patterns for structuring prompts that get better results, managing long conversations without hitting context limits, delegating work effectively to agents, setting up proper verification workflows, and debugging when things inevitably go sideways.

Working with AI is a skill that improves with practice. The mental models we've built in these foundation lessons will help you understand *why* certain approaches work better than others, making you more effective at building software with AI assistance.


---

## Sitemap

[Overview of all docs pages](/llms.txt)

---

## working with agents

Source: https://cursor.com/learn/working-with-agents

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

---

## understanding your codebase

Source: https://cursor.com/learn/understanding-your-codebase

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

---

## creating features

Source: https://cursor.com/learn/creating-features

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

---

## finding fixing bugs

Source: https://cursor.com/learn/finding-fixing-bugs

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

---

## reviewing testing

Source: https://cursor.com/learn/reviewing-testing

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

---

## customizing agents

Source: https://cursor.com/learn/customizing-agents

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

---

## putting it together

Source: https://cursor.com/learn/putting-it-together

# Putting it all together

Congratulations, you've learned how to work with coding agents.

You now know how to use agents to understand codebases, create features quickly, search through your code and find bugs, review code more efficiently, and customize agents to your needs. This chapter shows an example of putting all of those pieces together.

## An end-to-end example

You've joined a team that runs an ecommerce platform. You need to add discount codes to the checkout flow. The codebase is unfamiliar, and the feature needs to ship by end of week.

This is a realistic situation. You need to explore before you build, plan before you code, test before you ship, and review before you merge.

## Step 1: Understand the codebase

Before touching anything, explore the checkout flow. Use the agent to build a mental map.

Explore the checkout flow

I need to add discount codes to our checkout flow. Before I make any changes, walk me through how checkout works. What components, API routes, and services are involved? Show me the data flow from the cart to payment confirmation.

Ask follow-up questions to fill gaps:

Find where discounts fit

How does our pricing calculation work in \{\{file:src/services/PricingService.ts}}? Where do we compute the order total, and where would a discount be applied in that flow?

This combines the grep and semantic search from [understanding your codebase](https://cursor.com/learn/understanding-your-codebase.md) to trace the checkout flow, then summarizes what it finds.

## Step 2: Plan the feature

Now that you understand the codebase, create a plan. Switch to Plan Mode (`Shift+Tab`) and outline the work:

### discount-codes.md

\`# Discount codes

\## Overview
Add discount code support to checkout. Users enter a code, the system validates it, and the discount is applied to the order total before tax.

\## Approach
\- Add DiscountService with validation logic (expiry, usage limits)
\- Modify PricingService.calculateTotal() to accept optional discount
\- Add discount code input to OrderSummary component
\- Add /api/discount/validate endpoint

\## Tasks
\- \[ ] Create discount\_codes table migration
\- \[ ] Create DiscountService with applyDiscount()
\- \[ ] Add discount step to PricingService.calculateTotal()
\- \[ ] Add code input UI to OrderSummary component
\- \[ ] Add /api/discount/validate route
\- \[ ] Write tests for all discount types and edge cases\`

Review the plan. Remove steps that are too ambitious for the first iteration. Focus on the core flow: apply a code, calculate the discount, show it in the summary. Then click **Build** to create the first version of this feature.

## Step 3: Debug a failing edge case

After the build, one test keeps failing: stacking a percentage discount with a fixed-amount discount produces the wrong total. The same set of discounts gives different results depending on the order they arrive.

Use Debug Mode or ask the agent to investigate the root cause:

Debug the root cause

The discount stacking test is failing. The same discounts produce different totals depending on application order. Find out why and fix the ordering of discount application in \{\{file:src/services/DiscountService.ts}}. Show me the before and after values at each step.

This applies the debugging principles from the Finding and Fixing Bugs chapter: don't fix symptoms, find the cause.

## Step 4: Review and test

Before pushing, run a self-review:

Self-review before pushing

Review all the changes I've made for the discount code feature. Check for bugs, missing error handling, edge cases, and consistency with existing patterns. What would a code reviewer flag?

If you have cloud agents set up, launch a few to test edge cases you might have missed: unicode characters in discount codes, large discount values, or concurrent code usage. Cloud agents report back with the cases they covered and areas that need more testing, so you can fill gaps before merging.

## Step 5: Write a rule

You learned something during this feature: discount calculations should always apply percentage discounts before fixed-amount discounts so results are consistent regardless of input order. Capture this in a rule so the agent knows for next time:

```markdown
# Pricing rules

- Apply percentage discounts before fixed-amount discounts
- Order total must never go below $0
- See src/services/PricingService.ts for the canonical calculation pattern
```

This completes the loop. You explored, planned, built, tested, debugged, reviewed, and captured knowledge for the future.

## Keep building

The best way to learn is to take what you've learned here and apply it.

The tools and models are improving rapidly and the specific practices will evolve over time. But this core skill, learning how to work collaboratively with coding agents, will keep compounding. It's becoming one of the most important skills in software engineering.

By pushing the limits of what coding agents can do, you'll get the most out of the latest tools and models as they ship. Good luck and stay curious!


---

## Sitemap

[Overview of all docs pages](/llms.txt)
