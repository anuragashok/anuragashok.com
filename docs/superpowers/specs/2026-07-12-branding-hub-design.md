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

**Launch content:** the 5 posts from `theoverengineered.blog` (Dec 2020 – Feb 2021), migrated
with original dates. They currently live in **Contentful**, not in git — the old blog is a
Next.js frontend over a CMS. Migration pulls them via the Contentful delivery API and commits
them as markdown, which finally puts them under version control.

Posts to migrate:
1. Initial Post
2. Generate RSS and Sitemap for Next.js JAMstack site
3. Use Docker for local development
4. Capture response time in wiremock recordings
5. Publishing my first artifact to maven central using GitHub actions

## Testing

- **Vitest** — profile schema validation, markdown pipeline, post loading and draft filtering.
- **Playwright** — smoke test over the production build: every route renders, feed is valid,
  the About page's manifest block matches the contents of `me.yaml` on disk.

That last assertion is worth writing explicitly: it is the test that guards the thesis.

## Infrastructure

- Vercel deploy (project `anuragashok-com`, scope `anuragashoks-projects`).
- **`anuragashok.com` wired to the domain.** Currently 404s. A branding hub on a `vercel.app`
  subdomain is not a branding hub. Registrar to be confirmed by the user.

## Explicitly out of scope

Syndication. GitHub README / LinkedIn generation. Projects page. `/now`. `/uses`. Email setup
for `hello@anuragashok.com`. All tracked as GitHub issues.

## Open dependencies

1. **Contentful space ID + delivery token** — blocks post migration.
2. **Registrar for `anuragashok.com`** — blocks domain wiring.

Neither blocks the rest of the build.
