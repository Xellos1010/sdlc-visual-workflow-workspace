# Manual Setup Checklist

## 1. Create the ChatGPT Project

Project name:

`Flagship Foundry`

Then paste `project/project-custom-instructions.md` into the project instruction field.

## 2. Upload shared project files

Upload these files into the Project first:

- `shared/knowledge-seeds/foundry-doctrine.md`
- `shared/routing/global-agent-routing.json`
- `shared/routing/skill-routing-matrix.json`
- `shared/repo-schema-catalog/repo-schema-catalog.json`

## 3. Create the GPTs

For each folder under `gpts/`:

- copy `builder-name.txt`
- copy `builder-description.txt`
- paste `builder-instructions.md` into GPT Instructions
- add the prompt starters from `conversation-starters.md`
- upload `personality.json`, `skill-routing.md`, and `expected-output.schema.json` as GPT Knowledge files

## 4. Configure GPT capabilities

Use the `gpt-config.json` file in each GPT folder as a configuration guide.

## 5. Keep the setup maintainable

When the repo changes, update:

- `shared/repo-schema-catalog/repo-schema-catalog.json`
- any affected personality pack
- any affected skill routing file
- any affected expected output schema
