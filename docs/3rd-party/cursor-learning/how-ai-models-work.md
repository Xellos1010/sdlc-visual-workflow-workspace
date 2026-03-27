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