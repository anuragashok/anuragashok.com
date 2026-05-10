# Logo Design — anuragashok.com

**Date:** 2026-05-10
**Owner:** Anurag Ashok
**Status:** Approved (pending user review of this document)
**Predecessor specs:** `2026-05-09-anuragashok-com-design.md` (build), `2026-05-10-aesthetic-direction-design.md` (theme)

## 1. Goal

A small, simple, code-generated logo that fits the established aesthetic (Newsreader serif headings + warm amber accent). Ships as inline SVG (zero image bandwidth). Used in two places:

1. **Site header** — visible on every page next to (desktop) or replacing (mobile) the "Anurag Ashok" wordmark text
2. **Favicon** — the browser tab icon, generated via Next.js's `app/icon.tsx` convention

## 2. The mark

**Lowercase `a` in Newsreader regular + a small amber period.** Reads as a typographic compression of `anuragashok.com`.

Visual idea (rough):

```
    a.
    ↑
   foreground       ↑
   color            small amber dot
                    (uses --accent token)
```

- Letter glyph: Newsreader 500 (the same weight used for headings); color = `currentColor` (inherits from parent text color → adapts to light/dark automatically)
- Period: filled circle, color = `var(--accent)` → flips between amber-500 (light mode) and amber-300 (dark mode) the same way prose links and focus rings do
- Slight optical adjustment: the period sits a hair lower than the baseline of the `a` so it visually centers as "ending punctuation," not "subscript"

**Why a real letter glyph and not a custom-drawn `a`:** Drawing a custom `a` path locks the visual to one font forever; if Newsreader is replaced later, the logo becomes inconsistent with the rest of the site. Using a real Newsreader glyph (rendered as `<text>` inside SVG, OR as a hand-coded path traced from Newsreader 500) keeps the logo coherent with the wordmark forever.

## 3. Implementation

### 3.1 Component

`src/components/logo.tsx` — a server component returning inline SVG:

```tsx
type Props = { size?: number; className?: string };

export function Logo({ size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Anurag Ashok"
      className={className}
    >
      <text
        x="0"
        y="24"
        fontFamily="var(--font-serif)"
        fontWeight="500"
        fontSize="24"
        fill="currentColor"
      >
        a
      </text>
      <circle cx="22" cy="24" r="2" fill="var(--accent)" />
    </svg>
  );
}
```

(Coordinates above are illustrative; the implementer may tune the `circle` cx/cy/r and the `text` x/y/fontSize so the period sits visually right next to the `a`'s descender. ~150–200 bytes inlined.)

### 3.2 Header integration

Replace the current `<Link href="/" className="font-semibold tracking-tight">{siteConfig.name}</Link>` in `src/components/site-header.tsx` with:

```tsx
<Link href="/" className="flex items-center gap-2 font-semibold tracking-tight transition-colors hover:text-accent">
  <Logo size={24} />
  <span className="hidden sm:inline">{siteConfig.name}</span>
</Link>
```

- On mobile (`< 640px`): only the mark is visible
- On desktop: mark + wordmark
- The whole link gets the same hover-amber treatment as nav links (consistent with the aesthetic spec §5)
- `aria-label` on the SVG handles screen-reader naming when the wordmark is hidden

### 3.3 Favicon

Use Next.js 13+'s `src/app/icon.tsx` (or `icon.svg`) convention. Next auto-generates `<link rel="icon">` in the document head.

Two options for implementation:

**Option I (preferred): static `src/app/icon.svg`** — a hand-written SVG file with the same mark, hardcoded amber `#f59e0b` for the dot (browsers don't reliably resolve CSS variables in favicons). Foreground color is set to `#0a0a0a` (near-black). Browsers that support `prefers-color-scheme` in SVG can also include a `<style>` block to flip the foreground; we'll skip that complexity for v1 and just go with one fixed dark-on-light favicon (which works in both Chrome dark mode and light mode tab bars).

**Option II: dynamic `src/app/icon.tsx`** — uses `ImageResponse` to generate the icon at runtime. Heavier (runs on edge/node) for no benefit; skip.

Static SVG file (~200 bytes):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <text x="0" y="24" font-family="ui-serif, Georgia, 'Times New Roman', serif" font-weight="500" font-size="24" fill="#0a0a0a">a</text>
  <circle cx="22" cy="24" r="2" fill="#f59e0b" />
</svg>
```

**Note:** The favicon uses a system serif fallback, NOT Newsreader. Browsers don't load `next/font` in favicons. The shape difference is invisible at favicon size (16×16 px on most displays). This is an acceptable tradeoff vs. inlining the Newsreader font Base64-encoded into the SVG (which would push the favicon to ~50KB).

### 3.4 OG image — DEFERRED

The user picked the `/og/[slug]` route as a possible placement during brainstorming, then de-prioritized it. The OG image already has the wordmark in its upper-left; replacing it with the mark would require fetching the Newsreader font and rendering it via `<text>` in `next/og`. Skipping for v1; can add later in a follow-up by replacing the upper-left text with `<svg>` content in the existing OG route.

## 4. Files affected

| File | Change |
|---|---|
| `src/components/logo.tsx` (new) | Server component returning inline SVG |
| `src/components/site-header.tsx` | Replace bare `<Link>` text wordmark with `<Link>` containing `<Logo>` + responsive `<span>` |
| `src/app/icon.svg` (new) | Static favicon — same mark, hard-coded colors (Next.js auto-wires `<link rel="icon">`) |

3 files. No new dependencies. No tests needed (the existing E2E test for "home page renders" still finds the link by role; the visible accessible name comes from `aria-label` on mobile + the `<span>` on desktop).

## 5. Acceptance

- `pnpm check` and `pnpm build` green.
- `pnpm test:e2e` green (6/6 — header tests still pass because the link is locatable by `name: /Anurag Ashok/i` via `aria-label`).
- Visual smoke (Playwright or Chrome): home page on desktop shows mark + "Anurag Ashok"; mobile (375px viewport) shows mark only; tab bar in Chrome shows the mark as favicon.
- The hover state on the link still works (whole link goes amber on hover).

## 6. Out of scope (deferred)

- OG image upper-left replacement (Section 3.4)
- Animated logo (e.g. period pulsing). Static is enough.
- Apple touch icons / Windows tile icons (browsers fall back to the SVG favicon).
- Logo dark/light mode color toggling in the favicon (single fixed dark-on-light is fine for v1; modern browsers compose tab bars over varied backgrounds and the amber dot makes the mark identifiable either way).
- Print-friendly variant.

## 7. Build order (high-level — full plan via writing-plans)

1. Create `src/components/logo.tsx` with the inline SVG component.
2. Wire `<Logo>` into `src/components/site-header.tsx` with responsive wordmark.
3. Create `src/app/icon.svg` (static favicon).
4. Verify build + E2E + visual smoke at desktop and mobile widths.
5. Single commit (or split between component + header + favicon if cleaner).
