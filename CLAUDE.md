# CLAUDE.md

Context for agents working in this repo. Durable facts and rules — not a todo list.
Future work lives in **GitHub issues**, not here. Design rationale lives in `docs/superpowers/specs/`.

## What this repo is

**Everything-as-code, applied to a person.** It is the canonical, version-controlled source of
truth about Anurag Ashok. It *renders* to a website, and will later *push* to every platform he
exists on (dev.to, Medium, LinkedIn, GitHub profile).

The website is the first renderer of that source of truth. **It is not the source of truth.**
Internalize this before changing anything structural.

## The load-bearing rule

**`packages/profile` never imports from `apps/site`.**

```
packages/profile/   me.yaml + schema.ts   canonical identity. zero framework deps.
content/posts/      *.md                  canonical writing. markdown is source of truth.
apps/site/          Next.js renderer      imports both. owns neither.
```

The profile is the product. The site is a renderer. A future `packages/cli` will import the
same profile package to push to external platforms — that only stays cheap if the boundary
holds. Violating it collapses the project's whole thesis into "a blog with a data file."

Corollary, and it is a real requirement, not a flourish: the About page renders **the actual
contents of `me.yaml`**, syntax-highlighted — not a re-serialization of a parsed object. The
thing on screen is the thing in git. There is a Playwright test guarding this. Do not "simplify"
it away.

## Who Anurag is (keep this accurate)

- Lead Software Engineer at **Grab**, Singapore — team **Fulfillment Dispatch** (matching supply
  to demand across SEA).
- Writing software since **Feb 2013**. **Individual contributor by choice**, staying that way.
- Throughline: automation → infrastructure-as-code → everything-as-code → **agentic coding**.
- Previously Singapore Airlines.
- **Not** open to recruitment. No `hireable` flag.
- **No X/Twitter.** Don't add one. LinkedIn: `linkedin.com/in/anurag-ashok/`.

Any bio you find of him online (dev.to, Medium, old GitHub) is ~5 years stale — Singapore
Airlines era, "8+ years." **Do not reuse it.** `packages/profile/me.yaml` is authoritative.

## Visual system (locked — don't drift)

- **Instrument Serif** — headlines only.
- **Inter** — body.
- **IBM Plex Mono** — all metadata, and the manifest block.
- Paper `#FAF9F7` · Ink `#16150F` · Burnt amber `#B45309` — **one** accent, no second one.
- Dark mode is a designed inversion, not a derived one.
- The `me.yaml` manifest block appears on **About only**. It was deliberately kept off the
  homepage: the manifest is the idea, the editorial layout is the site. A joke that lands once
  shouldn't frame essays meant to be read.

## Surfaces

`/` · `/writing` · `/writing/[slug]` · `/about` · `feed.xml` · `sitemap.xml` · `robots.txt` ·
OG images · 404. **That's the whole site.**

No projects page, no `/now`, no `/uses`. The previous version of this site died of unkept
pages. Adding a surface means committing to keeping it alive — get it asked for explicitly.

## Writing

Markdown in `content/posts/`, zod-validated frontmatter (`title`, `date`, `summary`, `tags`,
`draft`). `draft: true` hides in prod, shows in dev.

Agents may draft, edit, and frontmatter posts — that's encouraged, it's the point. But **the
markdown file stays canonical.** An agent is a tool for producing markdown, never a layer
between the author and the file. Don't invent a CMS. The last blog was on Contentful and its
posts weren't in git, which is exactly the thing being fixed.

## Stack

Next.js 16 (App Router) · Tailwind v4 (CSS-first `@theme`) · TypeScript strict · zod ·
Shiki · Vitest · Playwright · pnpm workspace · Vercel.

## Gotchas

- **Sandbox breaks TLS and port binding.** `gh`, `pnpm`, `eslint`, `tsc`, `vitest`,
  `next build`, `playwright` — run with `dangerouslyDisableSandbox: true`. Symptoms are
  `x509: failed to verify certificate` and `EPERM` on bind.
- Vercel: project `anuragashok-com`, scope `anuragashoks-projects`. Deploys via CLI.
- `ENABLE_EXPERIMENTAL_COREPACK=1` is set in prod so corepack honors `packageManager` in
  `package.json`.
