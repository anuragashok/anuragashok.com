# anuragashok.com — Personal Branding Hub (Phase 1 + 2)

Date: 2026-07-12
Status: Approved design, pending implementation plan

## Premise

This repo is not a website. It is **everything-as-code applied to a person** — a canonical,
version-controlled source of truth about Anurag Ashok, which *renders* to a website and
(later) *pushes* to every platform he exists on. Same idea as his `dotfiles` repo, pointed
at identity instead of a shell.

The website is the first renderer of that source of truth. It is not the source of truth.

## Why rebuild

The previous site was a well-built empty shell: one placeholder post, a blank "Now" section,
no bio, no role, no projects. `anuragashok.com` itself 404s — only `anuragashok-com.vercel.app`
resolves. The stack was fine; the substance was missing and the framing was wrong (a blog that
happened to have an About page, rather than a profile that happens to render a blog).

Decision: **clean slate.** Empty the repo, rebuild.

## Subject facts (canonical, as of 2026-07-12)

- Anurag Ashok — Lead Software Engineer, **Grab**, Singapore.
- Team: **Fulfillment Dispatch** — matching supply to demand across Southeast Asia.
- Writing software since **February 2013** (~13 years).
- **Individual contributor by choice**, and intends to stay one.
- Throughline: automation → infrastructure-as-code → everything-as-code → **agentic coding**.
  Self-described problem solver.
- Previously: Singapore Airlines.
- LinkedIn: `linkedin.com/in/anurag-ashok/`. GitHub: `github.com/anuragashok`.
- **Not** open to recruitment. Drop the `hireable` flag.
- **No X/Twitter.** The `x.com/anuragashok` link in the old config is unverified and gets cut.

Prior bio material found online (dev.to, Medium, GitHub) is ~5 years stale — written at
Singapore Airlines, claiming "8+ years." Do not reuse it verbatim.

## Scope decomposition

The full hub is four subsystems. Only 1 and 2 are in this spec.

| # | Subsystem | Status |
|---|-----------|--------|
| 1 | **Profile-as-code + site** — typed canonical data, visual brand, real content | **This spec** |
| 2 | **Writing** — markdown pipeline, near-zero-friction authoring | **This spec** |
| 3 | **Syndication out** — push posts to dev.to / Medium / LinkedIn, canonical links home | Deferred |
| 4 | **Identity propagation** — generate GitHub README, OG images, LinkedIn headline/banner | Deferred |

3 and 4 are useless without a canonical source and real content to push. They are tracked as
GitHub issues under milestones, not built here.

## Architecture

pnpm workspace:

```
packages/profile/       me.yaml + schema.ts  →  the canonical Anurag. Zero framework deps.
content/posts/          *.md                 →  canonical writing. Markdown is source of truth.
apps/site/              Next.js 16 renderer. Imports both. Owns neither.
```

**The load-bearing rule: `packages/profile` never imports from `apps/site`.**

The profile is the product; the site is its first renderer. Phase 3 adds `packages/cli`
importing the same package to push to dev.to / LinkedIn / GitHub — and it costs nothing to add
because the boundary existed from day one. Violating this rule collapses the entire thesis of
the project into "a blog with a data file."

`me.yaml` is a real YAML file, zod-parsed at build time. The About page renders **the actual
file contents**, syntax-highlighted — not a re-serialization of a parsed object. The thing on
screen is the thing in git. That identity is the point, and it is a hard requirement.

## Site surfaces

`/` · `/writing` · `/writing/[slug]` · `/about` · `feed.xml` · `sitemap.xml` · `robots.txt` ·
OG images · 404.

Nothing else. No projects page, no `/now`, no `/uses`. Every page is a page that has to be
kept alive; the old site died of unkept pages.

Route is `/writing`, not `/blog`. Nothing external links to the old `/blog` paths, so no
redirects are needed.

**Home** is reading-first: serif hero, short bio, a list of recent writing, nothing competing
with the words.

**About** is where the manifest lands: prose paragraphs, then `me.yaml` rendered as itself,
with a line noting it is the same object that will later generate the GitHub README and
LinkedIn headline. The concept is the reward for scrolling, not the wallpaper.

## Visual system (locked)

- **Instrument Serif** — headlines only (`I make code work.`)
- **Inter** — body
- **IBM Plex Mono** — all metadata, and the manifest block
- Paper `#FAF9F7` · Ink `#16150F` · Burnt amber `#B45309` (single accent)
- Dark mode as a designed inversion, not a derived one.
- Manifest block appears on **About only**.

Direction was chosen against two alternatives (a dark monospace "Terminal" direction and a
full "Manifest" direction where the whole homepage rendered as YAML). Verdict: *the manifest
is the idea, the editorial layout is the site.* A joke that lands once should not be the
permanent frame for essays meant to be read.

Copy ships as written during design — accurate, and good enough to launch. Refine later.

## Content pipeline

- Markdown with zod-validated frontmatter: `title`, `date`, `summary`, `tags`, `draft`.
- Shiki for code highlighting. Reading time computed at build.
- `draft: true` — excluded from production builds, visible in dev.
- Authoring ritual: write the `.md` (by hand or with an agent), commit, push, deployed.
  An agent is a *tool for producing markdown* — never a layer between the author and the file.
  Markdown in the repo stays canonical, always.

**Launch content:** the 5 posts from `theoverengineered.blog` (Dec 2020 – Feb 2021).
**Migration is DONE** — they are committed as markdown in `content/posts/`, under version
control for the first time.

| slug | date |
|---|---|
| `initial-post` | 2020-12-19 |
| `generate-rss-and-sitemap-for-nextjs-jamstack-site` | 2020-12-27 |
| `use-docker-for-local-development` | 2021-01-03 |
| `capture-response-time-in-wiremock-recordings` | 2021-02-06 |
| `publishing-my-first-artifact-to-maven-central-using-github-actions` | 2021-02-27 |

**How, and why it matters:** the old blog was a Next.js frontend over Contentful, so the posts
were never in git. During migration we discovered `theoverengineered.blog` **no longer exists**
— the domain expired and is parked for sale on Sedo (€500). The posts existed nowhere live.
They were recovered from an **April 2021 Wayback Machine snapshot** by pulling `__NEXT_DATA__`
out of the archived pages, which still carried the original Contentful payload — so titles,
dates, summaries and tags are the author's originals, corroborated against the archived
`rss.xml`. Code in the wiremock and Maven posts lived in client-rendered gist embeds with no
`src` in the HTML; it was recovered from the GitHub gists API.

This is the strongest possible argument for the premise of this repo. Content in a CMS behind
a domain you forgot to renew is content you do not own. Markdown in git is.

**Decisions taken:**
- **Self-host all images** in `public/`. Do not hotlink `images.ctfassets.net` — it is a CDN
  tied to a Contentful space that may not be under his control, which is the same failure mode
  that just destroyed the old blog.
- **Dates kept as the old site rendered them** (UTC). Contentful stored midnight SGT, so
  `2020-12-20T00:00+08:00` rendered as Dec 19. Matching the rendering keeps them consistent
  with the archived RSS and any surviving inbound links.
- Two images are unrecoverable: a site-relative SVG in `initial-post` and a hotlinked JPEG in
  `use-docker-for-local-development`. Recreate or drop them during implementation.

## Scaffold

```
anuragashok.com/
├── CLAUDE.md
├── docs/superpowers/specs/
├── content/posts/*.md          canonical writing (migrated, done)
├── packages/profile/
│   ├── me.yaml                 canonical identity
│   ├── src/schema.ts           zod
│   └── src/index.ts            parses me.yaml; exports BOTH the typed object
│                               AND the raw file text
├── apps/site/
│   ├── app/                    page.tsx, writing/, about/, feed.xml, og/, not-found
│   ├── components/             ~8, hand-rolled
│   ├── lib/                    markdown pipeline, post loading
│   └── styles/globals.css      Tailwind v4 @theme — the design tokens live here
├── pnpm-workspace.yaml
└── package.json                scripts delegate to the workspace
```

**`packages/profile` exports two things.** The parsed, validated object *and* the raw file
text. The About page needs the literal bytes. If the raw export doesn't exist from day one,
someone will eventually re-serialize the object and the manifest silently becomes a lie.
The Playwright test asserts the rendered block equals the bytes on disk.

**`content/` sits at the repo root, not inside `apps/site`.** It is not the site's content; it
is Anurag's, and the phase-3 CLI reads it too. Same argument as the profile package. Nesting it
under the app gives the app ownership, and the thesis leaks.

**No component library.** shadcn/ui, `@base-ui/react`, `class-variance-authority`,
`tw-animate-css` and `lucide-react` are all dropped. For four pages with a bespoke identity, a
component library is a liability — its defaults pull toward exactly the templated-Next.js-blog
look this rebuild exists to escape. ~8 hand-rolled components; inline SVG for the 3–4 icons.

**Base: `create-next-app`, not a starter template.** A survey of the landscape (July 2026)
found **no Next 16 + Tailwind v4 blog starter with meaningful traction**. The obvious candidate,
`timlrx/tailwind-nextjs-starter-blog` (10.5k★), is on Next 15.5 + Yarn and depends on
`contentlayer2` — a fork of the abandoned Contentlayer — and ~70% of its features (component
library, comments, newsletter, search, projects page) are things this spec explicitly rejects.
`shadcn-ui/taxonomy` is on Next 13 / Tailwind v3 and effectively dead. `leerob/site` is current
but has **no license file** and ships no RSS, OG, or dark mode. Nextra is a docs framework whose
value is a theme we would delete.

Published "perfect Lighthouse" claims are marketing — measured on demos with features disabled.
Page speed here comes from not shipping things, which is already the chosen configuration:
static render, no component library, minimal client JS. Three font families and OG generation
will dominate CWV far more than any starter's baseline.

**Dependencies:** `next`, `react`, `tailwindcss` v4, **`velite`** (markdown + zod frontmatter +
local asset processing, in one dep — the maintained successor to Contentlayer; replaces the
gray-matter + unified/remark/rehype chain), `shiki` (via velite's rehype hook), `yaml`, `zod`,
`feed`, `@vercel/analytics`, `@vercel/speed-insights`. OG images use Next's native
`ImageResponse`; sitemap uses native `sitemap.ts`. Dev: `typescript`, `eslint`, `vitest`,
`@playwright/test`.

Velite's local-asset handling also solves a real problem: post images get processed into the
build instead of hotlinked from `images.ctfassets.net`, a CDN we do not control.

**Dark mode:** system default + manual toggle, persisted to `localStorage`, with an inline
head script to set the class before paint (no flash). The dark theme is a designed inversion,
not a derived one.

**OG images:** `@vercel/og`, per-post plus a default, rendered from the same tokens as the
site. This matters for phase-3 LinkedIn syndication — a link without a card gets scrolled past.

## Features ported from timlrx (and the ones rejected)

`timlrx/tailwind-nextjs-starter-blog` was rejected as a base but mined for features.

**Ported:**
- **JSON-LD** — `BlogPosting` per post, `Person` site-wide.
- **Prev/next post navigation** at the foot of each essay. The cheapest way to turn one read
  into two.
- **Copy-to-clipboard on code blocks.** The content is technical (Dockerfiles, Maven POMs,
  wiremock configs) — people will copy it. A small amount of JS that clearly earns its place.
- **Table of contents** on long posts only (the Maven post is 12k). Renders as a quiet sidebar;
  absent on short posts. Not a boxed widget above the fold.
- **Tag filtering on `/writing`** — client-side filters, **no new routes**. Tags with nowhere
  to go are decoration; tag *archive pages* would be a 5th surface that multiplies with the
  taxonomy. This keeps tags functional and the surface count at four.

**Performance features ported:** timlrx's perf story is largely just Next.js defaults, but
three things are worth taking.

- **Markdown images → `next/image`.** timlrx rewrites every markdown `![]()` into a real
  `next/image` via a remark plugin. This is the biggest genuine win available: automatic
  sizing, lazy loading, AVIF/WebP. The migrated posts are image-heavy (hero image on all five),
  and a raw `<img>` is the single largest LCP hazard on a blog. Pairs with velite's local-asset
  processing: images land in the build, then render optimized.
- **`@next/bundle-analyzer`** behind `ANALYZE=true`. One dev dep, zero runtime. It is how the
  "no component library" decision gets *proven* rather than assumed.
- **Security headers + CSP** — not perf, but the most valuable thing in timlrx's `next.config`.
  CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`. **Ours is far stricter than theirs**: no Giscus, no Umami, no external
  scripts, therefore no `unsafe-eval` and no third-party origins. A clean CSP is nearly free
  when you load nobody else's JavaScript.

Not ported: `rehype-preset-minify` (Next already minifies — marginal), and `rehype-prism-plus`,
which we beat outright — **Shiki highlights at build time and ships zero runtime JS**, while
Prism ships a highlighter to the browser.

**The real perf budget is the fonts.** Three families (Instrument Serif, Inter, IBM Plex Mono)
are a bigger CWV risk than anything a starter could fix. Mitigation: `next/font` self-hosting,
Latin subset only, `font-display: swap`, and preloading only the families used above the fold.
The locked design is also the perf budget being spent — accept it knowingly.

**Rejected:** search (six posts — Cmd+F wins), comments/Giscus (JS payload plus a moderation
chore), newsletter, KaTeX, citations, series, author pages, multiple layouts, the analytics zoo.
This is the ~70% that would make the site slower and the design someone else's.

**Newsletter, specifically:** deliberately not built. **RSS is the newsletter.** A signup box
with nobody behind it is a promise owed; the audience here is engineers, who still use readers.
The feed is therefore first-class, not an afterthought — correct dates, full content, valid
against a feed validator, and linked from every page.

## Testing

- **Vitest** — profile schema validation, markdown pipeline, post loading and draft filtering.
- **Playwright** — smoke test over the production build: every route renders, feed is valid,
  the About page's manifest block matches the contents of `me.yaml` on disk.

That last assertion is worth writing explicitly: it is the test that guards the thesis.

**Pre-commit hook:** typecheck + lint + unit. The fast subset, locally.

**GitHub Actions CI:** typecheck + lint + unit + Playwright, on push. A *check* gate, not a
deploy gate — Vercel still owns deploys. The distinction matters: CI was deleted in commit
f8ef151 ("Vercel build is the deploy gate") precisely because it duplicated the deploy. This
version doesn't; it adds e2e coverage that is too slow for a commit hook, and fails loudly in
CI rather than quietly in a deployment nobody watches.

## Infrastructure

- Vercel deploy (project `anuragashok-com`, scope `anuragashoks-projects`).
- **`anuragashok.com` wired to the domain.** Currently 404s. A branding hub on a `vercel.app`
  subdomain is not a branding hub. **Registrar: Cloudflare.**

## Explicitly out of scope

Syndication. GitHub README / LinkedIn generation. Projects page. `/now`. `/uses`. Email setup
for `hello@anuragashok.com`. All tracked as GitHub issues.

## Open dependencies

None. Post migration is complete; registrar is confirmed (Cloudflare). Implementation can start.

**`theoverengineered.blog` is abandoned deliberately.** It expired and is parked for sale; we
are not buying it back. `anuragashok.com` is the single identity from here — one domain, one
source of truth. The link rot from old dev.to / Medium / gist references is an accepted cost.
The writing itself survives, in git. (Issue #13, closed.)
