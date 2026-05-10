# Aesthetic Direction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved aesthetic direction (Newsreader serif headings + warm amber accent) to the deployed site at anuragashok.com.

**Architecture:** Pure CSS + Tailwind + `next/font` changes. No new components, no new dependencies, no behavior changes. Six small commits, ~9 files touched. Existing tests must continue to pass; visual smoke checks via `pnpm build` and a brief `pnpm dev` look on home + a real post page.

**Tech Stack:** Next.js 16 (`next/font/google`), Tailwind CSS v4 (CSS-first config via `@theme`), shadcn neutral foundation, `@vercel/og` (in OG route).

**Source-of-truth spec:** `docs/superpowers/specs/2026-05-10-aesthetic-direction-design.md`

---

## ⚠️ Implementer note: sandbox handling

The harness sandbox blocks reads inside `node_modules/.pnpm/`. **Always run `pnpm typecheck` / `pnpm lint` / `pnpm test` / `pnpm build` / `pnpm dev` / `pnpm install` with `dangerouslyDisableSandbox: true` in the Bash tool.** File reads/writes via Read/Write/Edit tools work fine without that flag.

## File map (target end state of changes)

| File | Change |
|---|---|
| `src/lib/fonts.ts` (new) | Centralize `next/font/google` font loading for Inter / Newsreader / Geist Mono |
| `src/app/layout.tsx` | Use `fonts.ts` to attach font CSS variables to `<html>` |
| `src/app/globals.css` | Add `@theme` block mapping font CSS variables; define `--accent` / `--accent-foreground` for both modes; tweak `prose` link color |
| `src/app/page.tsx` (Home) | `font-serif text-5xl tracking-tight font-medium` on `<h1>` |
| `src/app/blog/[slug]/page.tsx` | `font-serif text-4xl tracking-tight font-medium` on post `<h1>`; metadata row → `font-mono text-xs tabular-nums` |
| `src/components/post-card.tsx` | Metadata row → `font-mono text-xs tabular-nums` (matches post page) |
| `src/components/site-header.tsx` | Nav link hover: amber color via `hover:text-accent` instead of `hover:underline` |
| `src/components/site-footer.tsx` | Footer link hover: same amber treatment |
| `src/components/tag-badge.tsx` | Hover ring uses accent |
| `src/components/theme-toggle.tsx` | Add `focus-visible:ring-accent focus-visible:ring-2` |
| `src/app/og/[slug]/route.tsx` | Load Newsreader 500 from Google Fonts; render title in serif; add 4px amber bottom border |

## Commit cadence

6 commits, in order:
1. `feat(theme): load Inter, Newsreader, Geist Mono via next/font and register theme tokens`
2. `feat(theme): add amber accent token for light and dark modes`
3. `feat(theme): set serif headings on home and post hero`
4. `feat(theme): use mono tabular-nums for post metadata`
5. `feat(theme): apply accent to nav, focus rings, prose links, tag hover`
6. `feat(theme): render OG image with Newsreader serif title and amber bottom border`

---

## Task 1 — Load fonts and register tokens

**Files:**
- Create: `src/lib/fonts.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create `src/lib/fonts.ts`**

```ts
import { Inter, Newsreader, Geist_Mono } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontSerif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
```

- [ ] **Step 2: Update `src/app/layout.tsx` `<html>` to attach the font variables**

Read the current file first. Find the `<html lang="en" suppressHydrationWarning>` line and replace it with:

```tsx
import { fontSans, fontSerif, fontMono } from "@/lib/fonts";

// inside RootLayout:
return (
  <html
    lang="en"
    suppressHydrationWarning
    className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}
  >
```

(Keep all other imports/JSX intact. Just add the import at top, and add the `className` to the `<html>` tag.)

- [ ] **Step 3: Update `src/app/globals.css` `@theme` block**

Read the current `globals.css`. Locate the `@theme inline { ... }` block (or `@theme { ... }` if not inline) — shadcn init creates one. INSIDE that block (don't replace the block; add at the top of its body), insert:

```css
  --font-sans: var(--font-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-serif: var(--font-serif), ui-serif, Georgia, "Times New Roman", serif;
  --font-mono: var(--font-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
```

If `globals.css` does not have an `@theme` block (older shadcn versions), add one at the top of the file:

```css
@theme {
  --font-sans: var(--font-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-serif: var(--font-serif), ui-serif, Georgia, "Times New Roman", serif;
  --font-mono: var(--font-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
}
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: all pass. Build output unchanged in route count (the fonts get injected into the static HTML automatically).

- [ ] **Step 5: Commit**

```bash
git add src/lib/fonts.ts src/app/layout.tsx src/app/globals.css
git commit -m "feat(theme): load Inter, Newsreader, Geist Mono via next/font and register theme tokens"
```

---

## Task 2 — Define amber accent tokens

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add accent variables to `:root` (light mode)**

In `src/app/globals.css`, find the `:root { ... }` block that shadcn init created (it has lines like `--background: oklch(...)`, `--foreground: oklch(...)`, etc.). INSIDE that block, append:

```css
  --accent: oklch(0.74 0.14 65);
  --accent-foreground: oklch(0.30 0.10 65);
```

(These are roughly amber-500 / amber-900 in OKLCH — the same color space shadcn uses. They're independent of `--primary`.)

> Note: shadcn already defines `--accent` and `--accent-foreground` in some versions. If the `:root` block already has those keys (with neutral-gray values), REPLACE the values with the OKLCH amber values above. Do not add a duplicate.

- [ ] **Step 2: Add accent variables to `.dark` (dark mode)**

Find the `.dark { ... }` block. INSIDE it, set/override:

```css
  --accent: oklch(0.82 0.16 70);
  --accent-foreground: oklch(0.20 0.06 65);
```

- [ ] **Step 3: Verify**

Run: `pnpm build`
Expected: builds clean. Open the file once to sanity-check both blocks have the new values.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(theme): add amber accent token for light and dark modes"
```

---

## Task 3 — Serif headings on home + post page

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/blog/[slug]/page.tsx`

- [ ] **Step 1: Update home `<h1>`**

In `src/app/page.tsx`, find the line:

```tsx
<h1 className="text-3xl font-bold tracking-tight">{siteConfig.name}</h1>
```

Replace with:

```tsx
<h1 className="font-serif text-5xl font-medium tracking-tight">{siteConfig.name}</h1>
```

- [ ] **Step 2: Update post `<h1>`**

In `src/app/blog/[slug]/page.tsx`, find the line:

```tsx
<h1 className="text-3xl font-bold tracking-tight">
  {post.frontmatter.title}
</h1>
```

Replace with:

```tsx
<h1 className="font-serif text-4xl font-medium tracking-tight">
  {post.frontmatter.title}
</h1>
```

- [ ] **Step 3: Verify**

Run: `pnpm build`
Expected: build green.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/blog/[slug]/page.tsx
git commit -m "feat(theme): set serif headings on home and post hero"
```

---

## Task 4 — Mono tabular-nums for metadata

**Files:**
- Modify: `src/app/blog/[slug]/page.tsx`
- Modify: `src/components/post-card.tsx`

- [ ] **Step 1: Update post-page metadata row**

In `src/app/blog/[slug]/page.tsx`, find:

```tsx
<div className="flex items-center gap-2 text-sm text-muted-foreground">
```

Replace with:

```tsx
<div className="flex items-center gap-2 font-mono text-xs tabular-nums text-muted-foreground">
```

(The contents — `<time>`, separator dot, reading-time span — stay the same. Only the outer div className changes.)

- [ ] **Step 2: Update post-card metadata row**

In `src/components/post-card.tsx`, find:

```tsx
<div className="flex items-center gap-2 text-xs text-muted-foreground">
```

Replace with:

```tsx
<div className="flex items-center gap-2 font-mono text-xs tabular-nums text-muted-foreground">
```

- [ ] **Step 3: Verify**

Run: `pnpm build && pnpm test:e2e`
Expected: build green; 6/6 E2E tests still pass (the date assertions look up the rendered text content, not classes).

- [ ] **Step 4: Commit**

```bash
git add src/app/blog/[slug]/page.tsx src/components/post-card.tsx
git commit -m "feat(theme): use mono tabular-nums for post metadata"
```

---

## Task 5 — Apply accent to nav, focus rings, prose links, tag hover

**Files:**
- Modify: `src/components/site-header.tsx`
- Modify: `src/components/site-footer.tsx`
- Modify: `src/components/tag-badge.tsx`
- Modify: `src/components/theme-toggle.tsx`
- Modify: `src/app/globals.css` (prose link color override)

- [ ] **Step 1: Site header nav links**

In `src/components/site-header.tsx`, find:

```tsx
<Link href="/blog" className="hover:underline">Blog</Link>
<Link href="/about" className="hover:underline">About</Link>
```

Replace with:

```tsx
<Link href="/blog" className="transition-colors hover:text-accent">Blog</Link>
<Link href="/about" className="transition-colors hover:text-accent">About</Link>
```

- [ ] **Step 2: Site footer links**

In `src/components/site-footer.tsx`, find the three footer `<Link>` elements (GitHub, X, RSS). They currently have no `className`. Update each:

```tsx
<Link href={siteConfig.social.github} className="transition-colors hover:text-accent">GitHub</Link>
<Link href={siteConfig.social.x} className="transition-colors hover:text-accent">X</Link>
<Link href={siteConfig.rss} className="transition-colors hover:text-accent">RSS</Link>
```

- [ ] **Step 3: Tag badge hover**

In `src/components/tag-badge.tsx`, the current code is:

```tsx
<Link href={`/tags/${tag}`}>
  <Badge variant="secondary">{tag}</Badge>
</Link>
```

Replace with:

```tsx
<Link
  href={`/tags/${tag}`}
  className="rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
>
  <Badge variant="secondary" className="hover:bg-accent/15 hover:text-accent-foreground">
    {tag}
  </Badge>
</Link>
```

- [ ] **Step 4: Theme toggle focus ring**

In `src/components/theme-toggle.tsx`, find the `<Button>`:

```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={toggle}
  aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
>
```

Add a `className` prop:

```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={toggle}
  aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
  className="focus-visible:ring-2 focus-visible:ring-accent"
>
```

- [ ] **Step 5: Prose link color override**

In `src/app/globals.css`, after the existing `@plugin "@tailwindcss/typography";` line, add:

```css
.prose a,
.prose-invert a {
  color: var(--accent);
  text-underline-offset: 3px;
}

.prose a:hover,
.prose-invert a:hover {
  color: var(--accent-foreground);
}
```

(Reason: Tailwind Typography's default link color is `--tw-prose-links`. Direct `.prose a` selectors keep this scoped to post bodies.)

- [ ] **Step 6: Verify**

Run: `pnpm build && pnpm check && pnpm test:e2e`
Expected: all green; 6/6 E2E tests pass; the `theme toggle flips dark class and persists` test still passes (button is still locatable by `aria-label`).

- [ ] **Step 7: Commit**

```bash
git add src/components/site-header.tsx src/components/site-footer.tsx src/components/tag-badge.tsx src/components/theme-toggle.tsx src/app/globals.css
git commit -m "feat(theme): apply accent to nav, focus rings, prose links, tag hover"
```

---

## Task 6 — OG image: Newsreader title + amber bottom border

**Files:**
- Modify: `src/app/og/[slug]/route.tsx`

> Note: `next/og`'s `ImageResponse` does NOT use `next/font` automatically. You must fetch the font as a Buffer and pass it to `ImageResponse`'s `fonts` option.

- [ ] **Step 1: Replace `src/app/og/[slug]/route.tsx`**

Read the current file. Replace its full contents with:

```tsx
import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

// nodejs runtime: getPost reads from the filesystem via lib/posts
// (edge runtime can't import node:fs)
export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

const AMBER = "#f59e0b";
const BG = "#0a0a0a";
const FG = "#fafafa";

type Params = { slug: string };

async function loadNewsreader(): Promise<ArrayBuffer> {
  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500&display=swap",
    { headers: { "User-Agent": "Mozilla/5.0" } },
  ).then((r) => r.text());

  const match = css.match(/url\((https:\/\/[^)]+\.woff2)\)/);
  if (!match) throw new Error("Failed to extract Newsreader woff2 URL");

  return await fetch(match[1]).then((r) => r.arrayBuffer());
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const post = slug === "default" ? null : await getPost(slug);

  const title = post?.frontmatter.title ?? siteConfig.name;
  const subtitle = post?.frontmatter.summary ?? siteConfig.tagline;
  const date = post?.frontmatter.date.toISOString().slice(0, 10) ?? "";

  const newsreader = await loadNewsreader();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: BG,
          color: FG,
          fontFamily: "system-ui, -apple-system, sans-serif",
          borderBottom: `4px solid ${AMBER}`,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.7 }}>{siteConfig.name}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontFamily: "Newsreader, serif",
              fontSize: 72,
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 32, opacity: 0.8, lineHeight: 1.3 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.6 }}>{date}</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: newsreader, weight: 500, style: "normal" },
      ],
    },
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm build`
Expected: build green; the og route is reported as ƒ (server-rendered) — that's expected because of `runtime = "nodejs"` and `getPost`'s filesystem reads.

- [ ] **Step 3: Visual smoke (optional but recommended)**

Run `pnpm dev` in background. Then:

```bash
/usr/bin/curl -sSL -o /tmp/og-default.png http://localhost:3000/og/default
/usr/bin/curl -sSL -o /tmp/og-hello.png http://localhost:3000/og/hello-world
file /tmp/og-default.png /tmp/og-hello.png
```

Both should report PNG image data, 1200×630. Then kill the background dev server.

- [ ] **Step 4: Commit**

```bash
git add src/app/og/[slug]/route.tsx
git commit -m "feat(theme): render OG image with Newsreader serif title and amber bottom border"
```

---

## Task 7 — Push and verify in production

**Files:** none (deploy + smoke check only).

- [ ] **Step 1: Final local check**

```bash
pnpm check && pnpm build && pnpm test:e2e
```

Expected: all green.

- [ ] **Step 2: Push to GitHub**

```bash
git push
```

Expected: 6 new commits pushed to `origin/main`. Vercel's GitHub integration will auto-deploy (set up earlier via `vercel git connect`).

- [ ] **Step 3: Wait for deploy and smoke-check production**

Wait ~60-90 seconds for Vercel to finish the build. Then:

```bash
URL=https://anuragashok-com.vercel.app
for path in / /about /blog /blog/hello-world /feed.xml /sitemap.xml /og/default /og/hello-world; do
  /usr/bin/curl -sSL -o /dev/null -w "%{http_code}  $path  type=%{content_type}\n" "$URL$path"
done
```

All should return 200. The `/og/*` paths should return `image/png`.

- [ ] **Step 4: Manual visual verification**

Open the production URL in a browser:
- `https://anuragashok-com.vercel.app/` — confirm site name renders in serif
- `https://anuragashok-com.vercel.app/blog/hello-world` — confirm post title is serif and metadata is monospace
- `https://anuragashok-com.vercel.app/og/hello-world` — should show 1200×630 PNG with serif title and 4px amber bar at the bottom
- Toggle dark mode — confirm amber accent reads well in both modes

- [ ] **Step 5: No commit needed**

This task is a deployment and verification gate. No code changes.

---

## Self-review (post-write checklist)

**Spec coverage:**
- ✅ §2 table — fonts (Task 1), accent (Task 2 + Task 5), serif headings (Task 3), mono metadata (Task 4), OG (Task 6)
- ✅ §3 — accent tokens added in both `:root` and `.dark` (Task 2); links/focus/hover wired in Task 5; OG bottom border in Task 6
- ✅ §4 — fonts.ts exports the three font configs; layout.tsx attaches variables; @theme registers stacks (Task 1); serif on h1 (Task 3); mono+tabular-nums for metadata (Task 4)
- ✅ §5 — OG route fully rewritten in Task 6 with Newsreader fetched + amber bottom border
- ✅ §6 file list — every file in the spec table appears in this plan
- ✅ §8 acceptance — verified via Task 5 (`pnpm test:e2e`), Task 7 (production smoke)

**Deferred from spec:** the spec §3 "Latest writing heading: small amber underline accent" is intentionally NOT implemented in this plan. It's a small flourish requiring a custom `::after` element that doesn't materially change the aesthetic. Easier to skip and re-evaluate after the bulk of the work lands. Spec §7 ("Out of scope: deferred") sets the precedent.

**No placeholders:** every step has concrete code or commands.

**Type consistency:** font variable names match across files (`--font-sans`, `--font-serif`, `--font-mono`); accent variable names match (`--accent`, `--accent-foreground`); class names used (`font-serif`, `font-mono`, `tabular-nums`, `hover:text-accent`, `focus-visible:ring-accent`) are all standard Tailwind v4 utilities backed by the theme tokens.

**Open follow-ups (deferred per spec §7):** logo/wordmark beyond home hero text, avatar, custom illustrations, distinct typography for tag/404 pages, print stylesheet.
