# anuragashok.com — Design Spec

**Date:** 2026-05-09
**Owner:** Anurag Ashok
**Status:** Approved (pending user review of this document)

## 1. Goal

Build `anuragashok.com` as a personal-brand site for a software engineer, with a writing-focused blog. Day-one sections: **Home**, **About / Now**, **Blog**. Static-first, fast, and trivially cheap to run.

Out of scope for v1: Projects/portfolio page, comments, newsletter signup, search, i18n.

## 2. Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router, latest stable) |
| Language | TypeScript, strict mode |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` |
| Components | shadcn/ui (copied in, not imported) |
| Content | Markdown files in repo, hand-rolled pipeline |
| Markdown pipeline | `gray-matter` + `remark` / `rehype` (see §5) |
| Frontmatter validation | `zod` |
| Hosting | Vercel |
| Package manager | pnpm |
| Repo | Public GitHub repo `anuragashok/anuragashok.com` |
| Node | Pinned via `engines` in `package.json` and `.nvmrc` |

## 3. Directory layout

```
anuragashok.com/
├── content/
│   └── posts/                 # one .md per post; filename = slug
├── public/                    # favicon, /images/*
├── src/
│   ├── app/
│   │   ├── layout.tsx         # root layout (header, footer, theme bootstrap)
│   │   ├── page.tsx           # Home
│   │   ├── about/page.tsx     # About / Now
│   │   ├── blog/
│   │   │   ├── page.tsx       # post index
│   │   │   └── [slug]/page.tsx
│   │   ├── tags/[tag]/page.tsx
│   │   ├── feed.xml/route.ts  # RSS handler
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── og/[slug]/route.tsx # dynamic OG image (also handles "default")
│   ├── components/
│   │   ├── ui/                # shadcn components (owned in-repo)
│   │   ├── site-header.tsx
│   │   ├── site-footer.tsx
│   │   ├── theme-toggle.tsx   # only client component on most pages
│   │   ├── post-card.tsx
│   │   └── tag-badge.tsx
│   ├── lib/
│   │   ├── posts.ts           # getAllPosts / getPost / getAllTags
│   │   ├── markdown.ts        # md string -> { html, headings, readingTime }
│   │   ├── schema.ts          # zod frontmatter schema
│   │   └── site-config.ts     # name, description, BASE_URL, social links
│   └── styles/globals.css
├── tests/
│   ├── unit/
│   │   ├── markdown.test.ts
│   │   ├── posts.test.ts
│   │   └── schema.test.ts
│   └── e2e/
│       └── smoke.spec.ts
├── tailwind.config.ts
├── postcss.config.js
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── .nvmrc
└── package.json
```

### Module boundaries

- **`lib/posts.ts`** is the only module that reads the filesystem. Routes call it; tests use a fixture directory.
- **`lib/markdown.ts`** is a pure function: `(markdown: string) => Promise<{ html: string; headings: Heading[]; readingTime: number }>`. Independently testable, no I/O.
- **`lib/schema.ts`** owns the frontmatter schema. Imported by `posts.ts`.
- **`lib/site-config.ts`** is the single source of truth for site name, description, `BASE_URL`, and social links.

## 4. Content model

Each post is a single `.md` file under `content/posts/`. Filename (kebab-case) is the slug.

### Frontmatter

```yaml
---
title: "Building anuragashok.com"
date: 2026-05-09
updated: 2026-05-12          # optional
summary: "Short blurb shown on the index, RSS, and OG image."
tags: ["nextjs", "blog"]     # optional, default []
draft: false                 # optional, default false
---
```

### Schema (`src/lib/schema.ts`)

```ts
import { z } from "zod";

export const PostFrontmatter = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  summary: z.string().min(1),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export type PostFrontmatter = z.infer<typeof PostFrontmatter>;
```

### Rules

- Invalid frontmatter fails the build loudly with the offending file path. No silent skipping.
- `draft: true` posts are excluded from production builds; included in `next dev` for preview.
- Slug = filename without `.md`. Slugs must match `/^[a-z0-9]+(-[a-z0-9]+)*$/`. Build fails otherwise.
- Posts are sorted by `date` desc everywhere.
- Tags are case-sensitive and slugged with the same kebab-case rule before being used as URL segments.

## 5. Markdown pipeline

`lib/markdown.ts` builds a unified pipeline once per process and reuses it:

1. `remark-parse`
2. `remark-gfm` — tables, task lists, strikethrough, autolinked URLs
3. `remark-rehype` (with `allowDangerousHtml: false`)
4. `rehype-slug` — heading IDs
5. `rehype-autolink-headings` — anchor links on hover
6. `rehype-pretty-code` — syntax highlighting via Shiki, configured with two themes (one light, one dark) bound to the `dark` class on `<html>`
7. `rehype-stringify`

Reading time is computed from the source word count using a 200 wpm heuristic and returned alongside the HTML.

## 6. Routes

| Route | Renders | Static? |
|---|---|---|
| `/` | Home: short intro + latest 5 posts + links | yes |
| `/about` | About / Now (long-form bio + current focus + contact) | yes |
| `/blog` | Index of all non-draft posts, date desc | yes |
| `/blog/[slug]` | Single post — `generateStaticParams` from `getAllPosts()` | yes |
| `/tags/[tag]` | Posts for one tag — `generateStaticParams` from `getAllTags()` | yes |
| `/feed.xml` | RSS 2.0 (top 30 posts) | yes (route handler with static cache headers) |
| `/sitemap.xml` | Generated by Next's `sitemap.ts` | yes |
| `/robots.txt` | Generated by Next's `robots.ts` | yes |
| `/og/[slug]` | 1200×630 PNG via `@vercel/og`. `[slug]` of `default` returns the site default | runtime, edge |
| `/not-found` (404) | Branded 404 with shell | yes |

### Layout

- Root `<header>`: site name (link to `/`) + nav (Blog, About) + theme toggle.
- Root `<footer>`: copyright year, GitHub + X links, RSS link.
- Post bodies wrapped in `prose dark:prose-invert` with light customizations to match the theme.
- All routes are statically generated. No `dynamic = "force-dynamic"`.

## 7. Styling, theming, SEO

### Theming

- Tailwind v4 with class-based dark mode (`<html class="dark">`).
- `globals.css` defines CSS variables for both themes; shadcn reads them.
- shadcn/ui initialized with the **neutral** base. Day-one components only: `Button`, `Badge`, `Separator`. Add others on demand — do not pre-install the catalog.
- Fonts loaded via `next/font`: one display font for headings (Inter or chosen at scaffold), system stack for body.
- Theme toggle is the **only** client component on most pages. An inline blocking script in `<head>` reads `localStorage.theme` (or `prefers-color-scheme`) and sets the `dark` class before paint to prevent FOUC.

### Per-page metadata

- `generateMetadata` per route returns title, description, canonical URL, and OG/Twitter tags.
- `og:image` for posts → `${BASE_URL}/og/<slug>`; for non-post pages → `${BASE_URL}/og/default`.
- JSON-LD: `BlogPosting` on post pages, `Person` on Home.

### SEO infra

- `sitemap.ts` lists all static routes, all post slugs, and all tag pages with `lastModified` from `updated ?? date`.
- `robots.ts` allows all and points to the sitemap.
- `BASE_URL` env var is the single source of truth for absolute URLs in feeds, OG, and JSON-LD. Local dev uses `http://localhost:3000`.

### OG images

- `/og/[slug]` route handler uses `@vercel/og` to render JSX → PNG.
- Layout: site name, post title, summary, formatted date, brand-colored background, display font.
- `[slug]` of `default` produces the fallback used by Home, About, and any non-post page.

## 8. RSS, analytics, deployment

### RSS

- Route handler `/feed.xml` returns `application/xml`.
- Built from `getAllPosts()` filtered to non-drafts; top 30 by date.
- Uses the `feed` library to emit RSS 2.0.
- Item body = full rendered post HTML; `pubDate` = frontmatter `date`; `link` is absolute via `BASE_URL`.
- Linked from `<head>` with `<link rel="alternate" type="application/rss+xml">` and from the footer.

### Analytics

- Vercel Analytics via `@vercel/analytics/next` (`<Analytics />` in root layout, enabled in Vercel dashboard).
- Vercel Speed Insights via `@vercel/speed-insights/next`.
- No cookies, no consent banner needed.

### Deployment

- GitHub repo `anuragashok/anuragashok.com`, public.
- Vercel project linked to `main`. Every push to `main` deploys to production; PRs get preview URLs.
- Custom domain `anuragashok.com` (apex) plus `www` redirect.
- Vercel env vars: `BASE_URL=https://anuragashok.com`. Local dev uses `.env.local`.

## 9. Tooling

- TypeScript strict mode.
- ESLint with Next's config; Prettier with `prettier-plugin-tailwindcss`.
- `pnpm` for installs.
- Single CI script `pnpm check` runs: typecheck, lint, unit tests.
- Lighthouse CI as a GitHub Action on PRs against the Vercel preview URL with budgets:
  - Performance ≥ 95
  - Accessibility ≥ 95
  - SEO ≥ 95
  - Best Practices ≥ 95

## 10. Testing

### Unit (Vitest)

- **`lib/markdown.test.ts`** — given known Markdown fixtures, produces expected HTML structure, heading IDs, reading time.
- **`lib/posts.test.ts`** — uses a fixture directory of `.md` files:
  - Valid posts are returned in date-desc order.
  - `draft: true` is excluded when `NODE_ENV === "production"` and included otherwise.
  - Invalid frontmatter throws with the file path in the error.
  - Invalid slug (non-kebab-case filename) throws.
  - `getAllTags()` returns deduplicated tags with post counts.
- **`lib/schema.test.ts`** — schema rejects missing `title`, missing `summary`, invalid `date`, non-array `tags`.

### Integration (Playwright, smoke only)

`tests/e2e/smoke.spec.ts` — runs against `next start` in CI:

- Home loads, shows latest posts.
- `/blog` shows expected fixture posts.
- A specific fixture post page renders title, body, tags.
- `/feed.xml` returns valid XML containing the fixture posts.
- `/sitemap.xml` contains expected URLs.
- Theme toggle flips the `dark` class on `<html>` and persists across reload.

### Out of scope for v1 testing

- Visual regression testing (revisit if the design starts churning).
- Cross-browser matrix beyond Playwright's default Chromium.
- Load testing — the site is static.

## 11. Content the user must supply at implementation time

- Display name and tagline for the home hero.
- About / Now copy.
- Social handles (GitHub username confirmed; X handle, email).
- One initial post (`hello-world.md`) so the index isn't empty on launch.
- Brand color (a single accent color) for OG images and links.
- Optional: a 1:1 avatar image at `public/avatar.png`.

## 12. Build order (high-level)

1. Scaffold Next + Tailwind + shadcn/ui; configure ESLint, Prettier, Vitest, Playwright.
2. Implement `lib/schema.ts`, `lib/markdown.ts`, `lib/posts.ts` with unit tests (TDD).
3. Build root layout, `site-header`, `site-footer`, theme toggle (no FOUC).
4. Build `/`, `/about`, `/blog`, `/blog/[slug]`, `/tags/[tag]`.
5. Add `sitemap.ts`, `robots.ts`, `feed.xml` route, `BASE_URL` plumbing.
6. Add OG image route + per-page metadata + JSON-LD.
7. Wire Vercel Analytics and Speed Insights.
8. Author one real post, smoke-test locally.
9. Set up Vercel project, custom domain, env vars; deploy.
10. Add Lighthouse CI workflow; tune until budgets pass.

## 13. Open questions / future work

- **Projects page** — deferred. Easy to add later as `app/projects/page.tsx` reading from `content/projects/*.md` with a sibling `lib/projects.ts`.
- **Search** — defer until ~30+ posts. Likely a static client-side index (e.g., FlexSearch) generated at build.
- **MDX** — current spec is plain Markdown. Switching to MDX later is a `lib/markdown.ts` change plus a route tweak; no architectural shift required.
- **Newsletter** — not in v1. RSS covers serious readers.
