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