# Aesthetic Direction — anuragashok.com

**Date:** 2026-05-10
**Owner:** Anurag Ashok
**Status:** Approved (pending user review of this document)
**Predecessor spec:** `2026-05-09-anuragashok-com-design.md` (build spec)

## 1. Goal

Apply a single coherent aesthetic to the already-deployed site so all future design decisions cascade from it. The category is **modern engineer-blog** (rauchg/leerob/shadcn lineage) — sans-serif body, generous whitespace, monospaced metadata, dark-mode native — with two distinctive choices that keep it from looking generic:

1. **Newsreader** (variable serif) for post titles and the home hero
2. **Warm amber** (~`hsl(35 90% 55%)`) as the single accent color, replacing shadcn's default blue

Body text stays sans-serif. Layout stays narrow.

## 2. What changes vs current state

| Surface | Current | After |
|---|---|---|
| Body font | system-ui (default) | **Inter** via `next/font/google` |
| Heading font | system-ui | **Newsreader** via `next/font/google` for post `<h1>`/home hero only; section `<h2>`/`<h3>` stay Inter to match body |
| Mono font | default monospace | **Geist Mono** via `next/font/google` for code blocks and metadata (dates, reading time) |
| Accent (links, focus, primary button) | shadcn default `--primary` (near-black) | warm amber, both modes |
| OG image background | `#0a0a0a` flat | dark base + amber thin border bottom; title in serif |
| Layout width | `max-w-2xl` (672px) | unchanged |
| Spacing rhythm | `py-10` page, `space-y-8` sections | unchanged (already restrained) |
| Dark mode default | system-preference | unchanged |
| Header / footer | unchanged structure | nav links use the new accent on hover instead of underline |

## 3. Color tokens

Amber is added as a new token (`--accent`). The existing shadcn `--primary` is kept for buttons (still near-black/near-white for high-contrast affordance) — accent is for *attention*, primary is for *action*. They're different jobs.

**Light mode (`:root`)**
- `--accent: 35 90% 50%`  (amber-500, OKLCH-equivalent)
- `--accent-foreground: 35 90% 15%`
- everything else: keep current shadcn neutral

**Dark mode (`.dark`)**
- `--accent: 38 95% 65%`  (slightly lighter amber for contrast against dark bg)
- `--accent-foreground: 35 90% 10%`
- everything else: keep current shadcn neutral

**Where the accent shows up:**
- All `<a>` text inside `prose` post bodies (replaces default Tailwind Typography link color)
- Tag badges' background on hover
- Theme-toggle button hover ring
- Focus rings on all interactive elements (`focus-visible:ring-accent`)
- Home hero section's "Latest writing" heading: small amber underline accent
- OG image: 4px amber border at the bottom edge

The accent does NOT replace `--primary`. shadcn buttons stay neutral.

## 4. Typography

### Fonts (loaded via `next/font/google` for self-hosting + zero CLS)

```ts
// src/app/layout.tsx (or src/lib/fonts.ts)
import { Inter, Newsreader, Geist_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
```

`<html>` gets `${inter.variable} ${newsreader.variable} ${geistMono.variable}`.

### Tailwind config (CSS-first per Tailwind v4)

Add in `globals.css` `@theme` block:

```css
@theme {
  --font-sans: var(--font-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-serif: var(--font-serif), ui-serif, Georgia, "Times New Roman", serif;
  --font-mono: var(--font-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
}
```

Tailwind utilities `font-sans`, `font-serif`, `font-mono` will then resolve to these stacks.

### Where serif lands

- Post page `<h1>`: `font-serif text-4xl tracking-tight font-medium` (was `font-bold`; serifs read better at medium weight)
- Home hero `<h1>` (the site name): `font-serif text-5xl tracking-tight font-medium` — slightly larger to anchor the home page
- Everything else (navigation, post cards, `<h2>`/`<h3>` inside posts, About headings) stays `font-sans` Inter

### Mono

- Code blocks (already styled by `rehype-pretty-code`): pick up `--font-mono` automatically
- Inline `<code>`: `font-mono` via `prose-code:font-mono`
- Post metadata (date + reading time row): `font-mono text-xs tabular-nums` — gives the engineer feel without committing the whole site to mono

## 5. OG image revision

`/og/[slug]` route — small changes to `route.tsx`:

- Background stays `#0a0a0a` for dark feel
- Add a 4px amber bar at the bottom (`borderBottom: "4px solid #f59e0b"`)
- Post title rendered in a serif fallback stack (the `next/og` renderer doesn't get `next/font` automatically; load Newsreader as a `font: [{ name, data, weight, style }]` in the `ImageResponse` options) — load weight 500
- Site name and metadata stay in the system sans stack

This is the main piece of code that gets non-trivially changed; everything else is CSS variable + className tweaks.

## 6. Files affected (full list)

| File | Change |
|---|---|
| `src/app/layout.tsx` | Load Inter/Newsreader/Geist Mono via `next/font/google`; add font-variable classes to `<html>` |
| `src/app/globals.css` | Add `@theme` block with font stacks; add `--accent` and `--accent-foreground` for both modes; tweak `prose` link color |
| `src/app/page.tsx` (Home) | `font-serif` on the `<h1>` site name; small accent underline on the "Latest writing" heading |
| `src/app/blog/[slug]/page.tsx` | `font-serif text-4xl font-medium` on post `<h1>`; metadata row gets `font-mono text-xs tabular-nums` |
| `src/components/post-card.tsx` | Metadata row gets `font-mono text-xs tabular-nums` (matches post page) |
| `src/components/site-header.tsx` | Nav link hover: amber color instead of underline |
| `src/components/site-footer.tsx` | Footer link hover: same amber treatment |
| `src/components/tag-badge.tsx` | Hover state uses amber bg tint |
| `src/components/theme-toggle.tsx` | Focus-visible ring uses accent |
| `src/app/og/[slug]/route.tsx` | Load Newsreader font into `ImageResponse`, add 4px amber bottom border, render title in serif weight 500 |

No new components. No new dependencies (all three fonts are on Google Fonts and consumed via `next/font/google`).

## 7. Out of scope (deferred)

- Logo or wordmark — the home hero "Anurag Ashok" set in serif IS the wordmark for now
- Avatar/photo on home or about — can add later as `public/avatar.png`
- Custom illustrations or icons beyond `lucide-react`
- Distinct typography for tag pages and 404 (they inherit from base)
- Print stylesheet
- Reduced-motion considerations beyond what shadcn already provides (the only motion is the theme toggle icon swap)

## 8. Acceptance

After implementation:
- All E2E smoke tests still pass (no behavior change, only CSS/font additions).
- `pnpm build` passes; `pnpm check` passes.
- Lighthouse perf budget (≥0.95) holds — the three Google Fonts via `next/font` are inlined and self-hosted, so no CLS and no extra origins.
- Visual verification on desktop + mobile of: home hero, post page hero, link color, focus ring, theme toggle, OG image.

## 9. Build order (high level — full plan via writing-plans)

1. Add fonts via `next/font/google`, expose as CSS variables in layout, register in `@theme` block.
2. Add `--accent` tokens to `:root` and `.dark`; wire shadcn-prose link color to accent.
3. Apply `font-serif` to post `<h1>` and home `<h1>`; apply `font-mono tabular-nums` to metadata rows.
4. Update `OG /og/[slug]` route to load Newsreader and add amber bottom border.
5. Visual smoke: build + run + manually check the four key surfaces (home, post, OG image, dark mode).
6. Commit phase-by-phase.
