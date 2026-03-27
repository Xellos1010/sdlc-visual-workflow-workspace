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