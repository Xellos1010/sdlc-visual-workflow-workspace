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