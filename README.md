# anuragashok.com

Personal site and blog. Next.js (App Router), Tailwind v4, shadcn/ui, deployed on Vercel.

## Local development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Writing a post

Add a Markdown file under `content/posts/`. Filename = slug (kebab-case).

```md
---
title: "Title"
date: 2026-05-09
summary: "Short blurb."
tags: ["topic"]
---

Body…
```

`draft: true` excludes the post from production builds but shows it in `pnpm dev`.

## Scripts

- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm check` — typecheck + lint + unit tests
- `pnpm test:e2e` — Playwright smoke tests against `pnpm build && pnpm start`
