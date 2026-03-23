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