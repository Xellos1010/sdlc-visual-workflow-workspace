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