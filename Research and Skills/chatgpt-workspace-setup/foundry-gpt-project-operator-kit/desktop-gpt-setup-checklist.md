# Desktop GPT Setup Checklist

Building and editing GPTs must be done on the web, not mobile.

For each GPT folder in `specialist-gpts/`:

1. Open the GPT builder on the web.
2. Create a new GPT.
3. Paste `builder-name.txt` into the Name field.
4. Paste `builder-description.txt` into the Description field.
5. Paste `builder-instructions.md` into Instructions.
6. Add conversation starters from `conversation-starters.md`.
7. Upload the files listed in `knowledge-upload-list.md` to Knowledge.
8. Optionally set a recommended model.
9. Enable capabilities you need.
10. Save and test with the prompt in `../prompts/kickoff-specialist-gpts.md`.

Important:
- GPT Knowledge is for reference material, not behavioral rules.
- Put behavior in Instructions, not Knowledge files.
