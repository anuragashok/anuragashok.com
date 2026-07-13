# CLAUDE.md

Context for agents working in this repo. Durable facts and rules — not a todo list.
Future work lives in **GitHub issues**, not here. Design rationale lives in `docs/superpowers/specs/`.

## Shipping a change — the required workflow

**Follow this for every change. No exceptions, however small — a one-word copy edit goes
through it too.** Never push to `main` directly, and **never merge without Anurag's explicit
confirmation.**

1. **Build and test locally, with Playwright.** Not just `pnpm check` — run the real thing:
   ```
   pnpm check          # typecheck + lint + unit
   pnpm test:e2e       # Playwright against a production build
   ```
   If the change has any visual or runtime surface, **look at it in a browser** as well.
   On this repo that is not optional ceremony: six real bugs have shipped past a fully green
   suite and were caught only by looking at the running page (a build that failed only on a
   clean clone, every post image 404ing from the optimizer, *zero syntax highlighting in light
   mode*, JSX and satori silently eating spaces, a lazy-loaded LCP hero, and CI that had never
   once worked). **Green tests here prove less than they appear to.**

2. **Branch, then open a PR.** Never commit to `main`. The PR automatically gets a Vercel
   preview deployment and a CI run.

3. **Test the preview deployment**, not just the local build. Preview deploys sit behind
   Vercel's deployment protection, so a plain browser or `curl` hits a login wall — use:
   ```
   vercel curl /some/path --deployment <preview-url>
   ```
   Confirm CI and the Vercel check are both green: `gh pr checks <n>`.

4. **Give Anurag the preview URL, and stop.** Report what changed and what you verified.
   **Wait for his explicit confirmation.** Do not merge on your own judgment.

5. **On his go-ahead: merge to `main`** (production deploys automatically) **and verify in
   production** on `https://anuragashok.com` — the real domain, not the `.vercel.app` alias.
   Report what you actually observed live.

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

Second corollary: **the editorial copy is derived, not typed.** The homepage headline is
`profile.headline` with `profile.headline_accent` set in amber; the About page's "February 2013"
is `profile.since`; the years count is computed. Change `me.yaml`, and the pages change. Unit
and e2e tests assert this against the file. Never re-hardcode a fact that lives in the profile —
a string typed into JSX is the exact thing this project claims not to do.

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
**velite** (content pipeline) · Shiki · Vitest · Playwright · pnpm workspace · Vercel.

## The build pipeline (read this before touching a build script)

Two generated artifacts stand between a clean clone and a working page. Both are
gitignored. Neither is optional.

1. **`packages/profile/src/raw.gen.ts`** — `scripts/generate.ts` reads `me.yaml`, validates
   it against the zod schema (fails the build if it's invalid), and emits the file's exact
   bytes as a string export. `src/index.ts` imports it; the About page renders it. Produced
   by `pnpm gen`, which the root `dev` and `build` scripts run **first**. Never make the site
   build without it — that is how a deploy breaks on a fresh clone while every local check
   is green.
2. **`apps/site/.velite/`** — velite compiles `content/posts/*.md` to typed data. Config is
   `apps/site/velite.config.ts`; consumed via the `#velite` import alias (mapped in
   `tsconfig.json` and `vitest.config.ts`). Produced by `velite --clean`, wired as `prebuild`
   / `predev` / part of `typecheck` and `test`. **To add a frontmatter field, edit the
   collection schema in `velite.config.ts`** — that is the only place it is declared.

Content schema uses velite's `s.toc()` (heading tree — it NESTS, don't flatten it) and
`s.metadata()` (reading time).

**`NEXT_PUBLIC_BASE_URL` is required for any production build.** `apps/site/lib/site.ts`
throws without it, on purpose: everything that names the site to the outside world — feed
links and guids, sitemap, robots' sitemap pointer, canonicals, JSON-LD, OG `metadataBase` —
derives from it, and a silent `localhost` fallback fails nothing while publishing garbage.
Dev falls back to localhost. See `.env.example`.

**Every page carries `export const dynamic = "force-static"`.** All four pages, plus
`robots.ts`, `sitemap.ts`, `feed.xml/route.ts`. The whole site is static; the directive is
the guard, so that reading a header or a cookie fails the build instead of quietly turning
a page into a server render.

The locked palette lives in **`apps/site/lib/tokens.ts`**. `globals.css` restates it (CSS
can't import TS) and the OG cards need hex literals (satori resolves no CSS vars) — a unit
test fails if the two drift. Edit `tokens.ts`, then make the CSS agree.

## Gotchas

- **Sandbox breaks TLS and port binding.** `gh`, `pnpm`, `eslint`, `tsc`, `vitest`,
  `next build`, `playwright` — run with `dangerouslyDisableSandbox: true`. Symptoms are
  `x509: failed to verify certificate` and `EPERM` on bind.
- **`extensionAlias` / `turbopack.resolveAlias` in `next.config.ts` are load-bearing.**
  `@anuragashok/profile` is consumed as raw TS source (its `exports` points at
  `./src/index.ts`, never compiled) and its internal imports use NodeNext-style `.js`
  suffixes for files that exist only as `.ts`. Under `transpilePackages`, neither webpack
  nor Turbopack resolves that by default. Delete either alias and the site stops resolving
  `./raw.gen.js`.
- **rehype plugin order.** In `velite.config.ts`, `rehype-slug` MUST run before
  `rehype-autolink-headings`: the autolinker needs a pre-existing heading id to build its
  href, and silently emits no anchor if there isn't one — so every TOC link dies with no
  error. A unit test asserts the anchor, not just the id, precisely because asserting the id
  alone would pass either way.
- **Dates need `timeZone: "UTC"`.** Post frontmatter dates are `YYYY-MM-DD` and parse as UTC
  midnight; formatting without the explicit timezone rolls back a day — and so possibly a
  month or a year — on any machine west of UTC. See `lib/format-date.ts`.
- **Shiki runs at BUILD time**, in velite (posts) and in the `Manifest` server component
  (`me.yaml`). No runtime highlighter ships. Keep it that way.
## Deploying (read before touching Vercel config)

Vercel project `anuragashok-com`, scope `anuragashoks-projects`. **Root Directory is
`apps/site`.** Auto-deploy via the GitHub App: **preview on PR, production on merge to
`main`.** Don't deploy from the CLI by hand unless you mean to.

- **`vercel.json` lives in `apps/site/`, NOT the repo root.** Vercel reads it from the *Root
  Directory*. A `vercel.json` at the repo root is silently ignored — the build falls back to
  `apps/site`'s own `pnpm build`, which skips `packages/profile`'s codegen, and the deploy
  dies on `Can't resolve ./raw.gen.js`. The CLI, by contrast, reads `vercel.json` from the
  current directory — so a root `vercel.json` makes CLI deploys pass while Git deploys fail.
  This exact split cost a broken production build; don't reintroduce it.
- **The build command must run the profile codegen first:**
  `pnpm --filter @anuragashok/profile gen && pnpm build`. It is set in
  `apps/site/vercel.json` *and* at the project level, deliberately.
- **Node 22+.** pnpm 11 requires `>=22.13`. `.nvmrc`, `engines`, CI, and Vercel are all on
  22. CI was pinned to 20 for a while and failed at `setup-node` on every run — it passed
  locally only because the dev machine is on 22+.
- **`NEXT_PUBLIC_BASE_URL` must be set for BOTH Production and Preview** (`https://anuragashok.com`).
  The build throws without it, on purpose. `ENABLE_EXPERIMENTAL_COREPACK=1` likewise, so
  corepack honors `packageManager` in
  `package.json`.
