# AGENTS.md

This repository holds standalone Primer Checkout web examples and AI coding skills for Primer Checkout on web, iOS and Android. It is public at github.com/primer-io/examples.

## Repo map

- `examples/`: standalone example projects, one folder each.
- `claude-code-skills/`: the AI skills (primer-web-components, primer-ios-checkout, primer-android-checkout).
- `.claude-plugin/`: the Claude Code marketplace definition (`primer-skills`).

## Rules

- Each example is standalone with its own `package.json` and `package-lock.json`. Run commands (`npm ci`, `npm run dev`, `npm run build`) inside the example's folder.
- Read the example's own `AGENTS.md` or `README.md` before editing it.
- The root `package.json` only runs Prettier: `npm run lint:format` checks formatting, `npm run format` fixes it.
- Never commit `.env` files.
- Adding an example: add its row to the Examples table in `README.md`.
- Adding or renaming a skill: update `.claude-plugin/marketplace.json` and `claude-code-skills/README.md` in the same change.
- The GitHub repository is a mirror. CI force-pushes `main` from Primer's internal repository, so changes pushed directly to GitHub are overwritten.
