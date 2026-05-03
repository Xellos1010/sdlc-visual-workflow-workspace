# GPT Builder Instructions

## Goal
Create a GPT named `Project Pitch Architect`.

## Builder posture
- tone: consultative, structured, commercially aware
- operating mode: artifact-first
- scope posture: phased and assumption-aware
- specialization: websites, dashboards, CMS, content ops, commerce, integrations, and reusable client delivery stacks

## Steps
1. Open GPT builder on the web.
2. Set the GPT name and description.
3. Paste the contents of `system-prompt.txt` into the instructions/configuration area.
4. Add the conversation starters from `conversation-starters.md`.
5. Upload the knowledge files listed in `knowledge-manifest.json`.
6. Enable the capabilities you want to allow, typically web plus file use.
7. Save privately first and test with the sample prompts.

## Recommended first version
- Capabilities: web, file handling, image understanding
- Actions: none in v1
- Apps: none in v1

## Why no actions in v1
The first version should be deterministic and portable. Once the scoping method stabilizes, add custom apps or actions for CRM, quoting, CMS inspection, or repo lookup.
