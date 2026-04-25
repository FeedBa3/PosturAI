---
title: PosturAI
emoji: 🧍
colorFrom: yellow
colorTo: gray
sdk: static
pinned: false
license: mit
app_build_command: npm run build
app_file: dist/index.html
---

# PosturAI — Hugging Face Space

This Space hosts a **client-side** Vite + React app that runs a Teachable Machine
posture model directly in the browser (no server inference).

## How Hugging Face builds this Space

We use the **Static SDK** with a build step:

- `app_build_command: npm run build` — installs deps and builds Vite output into `dist/`
- `app_file: dist/index.html` — Hugging Face serves the built `dist/` folder

That's it — no Docker, no Python, no GPU needed.

## Local development

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## Deploy to Hugging Face Spaces

1. Create a new Space → **SDK: Static**.
2. Rename this file to `README.md` at the **root of the Space repo**
   (the YAML front-matter at the top is what HF reads).
3. Push the entire project (everything except `node_modules/` and `dist/`).
   The included `.gitattributes` and `.gitignore` keep the repo clean.
4. HF will run `npm run build` automatically and serve `dist/`.

## Configure the model

Open the deployed app → **Settings** page → paste your Teachable Machine model
URL (must end with `/`). It's stored in `localStorage`.

Default model: `https://teachablemachine.withgoogle.com/models/e9uE81yJ0/`
