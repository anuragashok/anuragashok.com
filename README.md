# anuragashok.com

Everything-as-code, applied to a person.

`packages/profile` is the canonical source of truth — `me.yaml` plus a zod schema.
`content/posts` is the canonical writing. `apps/site` is a Next.js renderer that
imports both and owns neither.

The website is the first renderer of that source of truth. It is not the source of truth.

## Develop

    pnpm install
    pnpm dev

## Environment

| Var | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_URL` | Production builds | The public origin, no trailing slash. Feed links, sitemap, robots, canonicals, JSON-LD and OG `metadataBase` all derive from it. A production build **throws** without it rather than silently shipping `localhost`. `pnpm dev` falls back to `http://localhost:3000`. |

See `.env.example`. For a local production build, copy it to `.env.local`.

## Write

Add a Markdown file to `content/posts/`. Filename = slug.

    ---
    title: "Title"
    date: 2026-07-12
    summary: "Short blurb."
    tags: ["topic"]
    ---

    Body…

`draft: true` hides a post in production and shows it in dev.

## Scripts

- `pnpm dev` — dev server
- `pnpm gen` — regenerate `packages/profile/src/raw.gen.ts` from `me.yaml` (gitignored; `dev`/`build` run it for you)
- `pnpm build` — production build (what Vercel runs)
- `pnpm check` — typecheck + lint + unit tests
- `pnpm test:e2e` — Playwright against the production build
