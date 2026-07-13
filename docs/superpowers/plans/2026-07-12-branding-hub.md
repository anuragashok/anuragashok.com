# Branding Hub Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `anuragashok.com` from an empty repo as everything-as-code applied to a person: a canonical `packages/profile` that renders to a four-page Next.js site with six real posts, deployed on a working custom domain.

**Architecture:** pnpm workspace. `packages/profile` holds `me.yaml` + a zod schema and exports *both* the parsed object and the raw file bytes, with zero framework dependencies. `content/posts/*.md` at the repo root holds the writing. `apps/site` is a Next.js 16 renderer that imports both and owns neither. The load-bearing rule: **`packages/profile` never imports from `apps/site`.**

**Tech Stack:** Next.js 16.2.10 (App Router, static prerender) · React 19 · Tailwind v4.3 (CSS-first `@theme`) · TypeScript strict · velite 0.4.0 (markdown + frontmatter + asset processing) · Shiki 4.3 via `@shikijs/rehype` · zod · `yaml` · `feed` · Vitest · Playwright · pnpm · Vercel.

Spec: `docs/superpowers/specs/2026-07-12-branding-hub-design.md`. Read it before starting.

## Global Constraints

Every task's requirements implicitly include this section.

- **Architecture rule (inviolable):** `packages/profile` never imports from `apps/site`. The profile is the product; the site is a renderer.
- **The About page renders the actual bytes of `me.yaml`**, not a re-serialization of the parsed object. A Playwright test guards this (Task 13). Do not "simplify" it away.
- **Four surfaces only:** `/`, `/writing`, `/writing/[slug]`, `/about`. Plus `feed.xml`, `sitemap.xml`, `robots.txt`, OG images, 404. **Do not add pages.** No projects, no `/now`, no `/uses`.
- **No component library.** No shadcn, no base-ui, no cva, no lucide, no headlessui. Hand-rolled components; inline SVG for icons.
- **Static prerendering. Never set `output: 'export'`** — it kills `next/image` optimization and `headers()`.
- **Design tokens (exact):** paper `#FAF9F7` · ink `#16150F` · burnt amber `#B45309`. **One** accent — do not introduce a second.
- **Fonts (exact):** Instrument Serif (headlines only, weight `400` — non-variable, weight is REQUIRED) · Inter (body, variable, no weight needed) · IBM Plex Mono (metadata + manifest + code, weight `400` only — non-variable, weight REQUIRED). `display: 'swap'`. Preload serif + sans only; mono is `preload: false`.
- **Velite is Zod 3 internally.** `packages/profile` uses its own standalone `zod` (v4). Never mix `s.*` (velite) with the profile's `z.*`. They are separate dependency trees and must stay that way.
- **Run all build/test commands with `dangerouslyDisableSandbox: true`** — the sandbox breaks TLS and port binding. Symptoms: `x509: failed to verify certificate`, `EPERM` on bind.
- **Node >= 20.** pnpm. `packageManager` field pinned in root `package.json`.
- Copy ships as written in the spec/mockups. Do not invent new bio prose.

---

### Task 1: Nuke the old site, scaffold the workspace

Deletes the old app and establishes the pnpm workspace skeleton. Nothing renders yet — this task's deliverable is a clean, installable, empty workspace.

**Preserve (do NOT delete):** `.git/`, `CLAUDE.md`, `docs/`, `content/posts/*.md` (the 5 migrated posts), `.superpowers/` (gitignored), `.vercel/` (gitignored).

**Files:**
- Delete: `src/`, `tests/`, `public/`, `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `tsconfig.json`, `tsconfig.tsbuildinfo`, `next-env.d.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `vitest.config.ts`, `playwright.config.ts`, `components.json`, `vercel.json`, `pnpm-workspace.yaml`, `README.md`, `.nvmrc`, `test-results/`, `content/posts/hello-world.md`
- Create: `pnpm-workspace.yaml`, `package.json`, `tsconfig.base.json`, `.gitignore`, `.nvmrc`, `README.md`

- [ ] **Step 1: Delete the old site, keeping history and content**

```bash
cd /Users/anuragashok/projects/anuragashok.com
git rm -r --quiet src tests public package.json pnpm-lock.yaml next.config.ts tsconfig.json \
  eslint.config.mjs postcss.config.mjs vitest.config.ts playwright.config.ts components.json \
  vercel.json pnpm-workspace.yaml README.md .nvmrc content/posts/hello-world.md
rm -rf test-results tsconfig.tsbuildinfo next-env.d.ts node_modules .next .pnpm-store
git status --short
```

Expected: the 5 migrated posts, `CLAUDE.md` and `docs/` remain. Everything else staged as deleted.

- [ ] **Step 2: Create the workspace manifest**

`pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Create the root package.json**

`package.json`:
```json
{
  "name": "anuragashok.com",
  "version": "1.0.0",
  "private": true,
  "engines": { "node": ">=20.0.0" },
  "packageManager": "pnpm@11.0.9",
  "scripts": {
    "dev": "pnpm --filter @anuragashok/site dev",
    "build": "pnpm --filter @anuragashok/site build",
    "start": "pnpm --filter @anuragashok/site start",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "test:e2e": "pnpm --filter @anuragashok/site test:e2e",
    "check": "pnpm typecheck && pnpm lint && pnpm test"
  },
  "devDependencies": {
    "typescript": "^5.9.0"
  }
}
```

- [ ] **Step 4: Create the base tsconfig**

`tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

- [ ] **Step 5: Create .gitignore and .nvmrc**

`.gitignore`:
```
node_modules/
.next/
out/
dist/
.velite/
apps/site/public/static/
*.tsbuildinfo
next-env.d.ts
.env*.local
.vercel/
.superpowers/
test-results/
playwright-report/
.DS_Store
```

`.nvmrc`:
```
20
```

- [ ] **Step 6: Create the README**

`README.md`:
```markdown
# anuragashok.com

Everything-as-code, applied to a person.

`packages/profile` is the canonical source of truth — `me.yaml` plus a zod schema.
`content/posts` is the canonical writing. `apps/site` is a Next.js renderer that
imports both and owns neither.

The website is the first renderer of that source of truth. It is not the source of truth.

## Develop

    pnpm install
    pnpm dev

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
- `pnpm build` — production build
- `pnpm check` — typecheck + lint + unit tests
- `pnpm test:e2e` — Playwright against the production build
```

- [ ] **Step 7: Verify the workspace installs**

```bash
pnpm install
```
Expected: succeeds. No packages yet, so it's a near-noop — this proves the workspace file is valid.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore!: nuke the old site, scaffold the pnpm workspace

The stack was fine; the framing was wrong. Rebuilding as a profile that
renders a blog, not a blog with an about page.

Preserved: the 5 migrated posts, CLAUDE.md, docs/."
```

---

### Task 2: `packages/profile` — the canonical Anurag

The heart of the project. A zero-framework package holding `me.yaml`, a zod schema, and exports of **both** the parsed object and the raw file bytes.

**Why the raw bytes are generated, not read at runtime:** the About page needs the literal file contents. Reading with `fs` + `import.meta.url` breaks once a bundler rewrites the module path. Instead a codegen step emits the bytes into a TS module, and a unit test asserts the generated file still matches `me.yaml` on disk — so a stale artifact fails CI rather than silently rendering a lie.

**Files:**
- Create: `packages/profile/package.json`, `packages/profile/tsconfig.json`, `packages/profile/me.yaml`, `packages/profile/src/schema.ts`, `packages/profile/src/index.ts`, `packages/profile/scripts/generate.ts`, `packages/profile/vitest.config.ts`
- Generated (gitignored): `packages/profile/src/raw.gen.ts`
- Test: `packages/profile/tests/profile.test.ts`

**Interfaces:**
- Produces (later tasks depend on these exact names):
  - `import { profile, rawProfile, ProfileSchema } from "@anuragashok/profile"`
  - `profile: Profile` — the parsed, validated object
  - `rawProfile: string` — the exact bytes of `me.yaml`
  - `type Profile` — inferred from `ProfileSchema`

- [ ] **Step 1: Create the package manifest**

`packages/profile/package.json`:
```json
{
  "name": "@anuragashok/profile",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "gen": "tsx scripts/generate.ts",
    "prebuild": "pnpm gen",
    "build": "tsc --noEmit",
    "typecheck": "pnpm gen && tsc --noEmit",
    "pretest": "pnpm gen",
    "test": "vitest run",
    "lint": "echo 'no lint config in profile package'"
  },
  "dependencies": {
    "yaml": "^2.7.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.9.0",
    "vitest": "^4.1.5"
  }
}
```

Note: `exports` points at **TS source**. `apps/site` consumes it via `transpilePackages` (Task 3). This keeps the package framework-free — no dist build, no bundler assumptions.

- [ ] **Step 2: Create the package tsconfig**

`packages/profile/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "types": ["node"],
    "noEmit": true
  },
  "include": ["src", "scripts", "tests"]
}
```

- [ ] **Step 3: Write `me.yaml` — the canonical source of truth**

`packages/profile/me.yaml`:
```yaml
# The canonical Anurag Ashok.
# This file is the source of truth. The website is one renderer of it.
# Change a fact here, and it changes everywhere it is published.

name: Anurag Ashok
headline: I make code work.

role: Lead Software Engineer
company: Grab
team: Fulfillment Dispatch # matching supply to demand across Southeast Asia
location: Singapore

since: 2013-02 # writing software professionally
track: IC # and staying that way

obsessions:
  - automation
  - everything-as-code
  - agentic coding

previously:
  - Singapore Airlines

links:
  github: https://github.com/anuragashok
  linkedin: https://www.linkedin.com/in/anurag-ashok/
```

- [ ] **Step 4: Write the schema**

`packages/profile/src/schema.ts`:
```ts
import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  role: z.string().min(1),
  company: z.string().min(1),
  team: z.string().min(1),
  location: z.string().min(1),
  /** YYYY-MM — when he started writing software professionally. */
  since: z.string().regex(/^\d{4}-\d{2}$/, "since must be YYYY-MM"),
  track: z.enum(["IC", "Manager"]),
  obsessions: z.array(z.string().min(1)).min(1),
  previously: z.array(z.string().min(1)),
  links: z.object({
    github: z.url(),
    linkedin: z.url(),
  }),
});

export type Profile = z.infer<typeof ProfileSchema>;

/** Whole years since `since` (YYYY-MM), as of `now`. */
export function yearsOfExperience(since: string, now: Date = new Date()): number {
  const [year, month] = since.split("-").map(Number) as [number, number];
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  return Math.floor(months / 12);
}
```

- [ ] **Step 5: Write the codegen script**

`packages/profile/scripts/generate.ts`:
```ts
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { ProfileSchema } from "../src/schema.js";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = readFileSync(join(pkgRoot, "me.yaml"), "utf8");

// Fail loudly at codegen time rather than shipping an invalid profile.
ProfileSchema.parse(parse(raw));

const out = `// GENERATED FILE — DO NOT EDIT.
// Source: packages/profile/me.yaml
// Regenerate: pnpm --filter @anuragashok/profile gen
//
// The About page renders these exact bytes. That is the point.
export const rawProfile = ${JSON.stringify(raw)};
`;

writeFileSync(join(pkgRoot, "src", "raw.gen.ts"), out);
console.log("profile: wrote src/raw.gen.ts from me.yaml");
```

- [ ] **Step 6: Write the package entrypoint**

`packages/profile/src/index.ts`:
```ts
import { parse } from "yaml";
import { rawProfile } from "./raw.gen.js";
import { ProfileSchema } from "./schema.js";

export { ProfileSchema, yearsOfExperience } from "./schema.js";
export type { Profile } from "./schema.js";

/** The exact bytes of me.yaml. The About page renders this verbatim. */
export { rawProfile };

/** The parsed, validated profile. */
export const profile = ProfileSchema.parse(parse(rawProfile));
```

- [ ] **Step 7: Write the failing tests**

`packages/profile/tests/profile.test.ts`:
```ts
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { ProfileSchema, profile, rawProfile, yearsOfExperience } from "../src/index.js";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const meYaml = readFileSync(join(pkgRoot, "me.yaml"), "utf8");

describe("profile", () => {
  it("rawProfile is byte-identical to me.yaml on disk", () => {
    // Guards the thesis: if the generated artifact drifts from the file,
    // the About page renders a lie. Fail here instead.
    expect(rawProfile).toBe(meYaml);
  });

  it("me.yaml satisfies the schema", () => {
    expect(() => ProfileSchema.parse(parse(meYaml))).not.toThrow();
  });

  it("exposes the canonical facts", () => {
    expect(profile.name).toBe("Anurag Ashok");
    expect(profile.company).toBe("Grab");
    expect(profile.team).toBe("Fulfillment Dispatch");
    expect(profile.track).toBe("IC");
    expect(profile.obsessions).toContain("agentic coding");
  });

  it("rejects an unknown track", () => {
    const bad = { ...parse(meYaml), track: "VP" };
    expect(() => ProfileSchema.parse(bad)).toThrow();
  });

  it("rejects a malformed since", () => {
    const bad = { ...parse(meYaml), since: "2013" };
    expect(() => ProfileSchema.parse(bad)).toThrow();
  });

  it("computes whole years of experience", () => {
    expect(yearsOfExperience("2013-02", new Date("2026-07-12"))).toBe(13);
    expect(yearsOfExperience("2013-02", new Date("2026-01-12"))).toBe(12);
  });
});
```

`packages/profile/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
```

- [ ] **Step 8: Run the tests to verify they fail**

```bash
pnpm --filter @anuragashok/profile test
```
Expected: FAIL — `src/raw.gen.ts` does not exist yet (the `pretest` hook runs `gen`, so if the script is correct this will actually PASS; if it fails, the codegen script is broken — fix it before proceeding).

- [ ] **Step 9: Install and run the tests to verify they pass**

```bash
pnpm install
pnpm --filter @anuragashok/profile test
```
Expected: PASS — 6 tests.

- [ ] **Step 10: Commit**

```bash
git add packages/profile
git commit -m "feat(profile): the canonical Anurag as code

me.yaml is the source of truth. The package exports both the parsed object
and the exact bytes, because the About page renders the bytes — and a test
asserts the generated artifact never drifts from the file on disk."
```

---

### Task 3: `apps/site` — Next.js scaffold, design tokens, fonts, layout

The renderer. This task stands up Next 16 + Tailwind v4, the locked design tokens, the three fonts, dark mode, and the shell (header/footer). Deliverable: a running site with an empty homepage in the correct typography and both themes.

**Files:**
- Create: `apps/site/package.json`, `apps/site/tsconfig.json`, `apps/site/next.config.ts`, `apps/site/postcss.config.mjs`, `apps/site/eslint.config.mjs`, `apps/site/app/layout.tsx`, `apps/site/app/page.tsx`, `apps/site/app/globals.css`, `apps/site/app/fonts.ts`, `apps/site/lib/site.ts`, `apps/site/components/site-header.tsx`, `apps/site/components/site-footer.tsx`, `apps/site/components/theme-toggle.tsx`, `apps/site/components/theme-script.tsx`

**Interfaces:**
- Consumes: `@anuragashok/profile` → `profile`
- Produces: `@/lib/site` → `siteConfig: { name, url, description, links }`; CSS vars `--font-serif`, `--font-sans`, `--font-mono`; Tailwind utilities `font-serif`, `font-sans`, `font-mono`, `text-ink`, `bg-paper`, `text-accent`

- [ ] **Step 1: Create the app manifest**

`apps/site/package.json`:
```json
{
  "name": "@anuragashok/site",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "predev": "velite --clean",
    "dev": "next dev",
    "prebuild": "velite --clean",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "velite --clean && tsc --noEmit",
    "test": "velite --clean && vitest run",
    "test:e2e": "playwright test",
    "analyze": "ANALYZE=true pnpm build"
  },
  "dependencies": {
    "@anuragashok/profile": "workspace:*",
    "@vercel/analytics": "^2.0.1",
    "@vercel/speed-insights": "^2.0.0",
    "feed": "^5.2.1",
    "next": "16.2.10",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.2.0",
    "@next/bundle-analyzer": "^16.2.10",
    "@playwright/test": "^1.59.1",
    "@shikijs/rehype": "^4.3.1",
    "@tailwindcss/postcss": "^4.3.2",
    "@types/hast": "^3.0.4",
    "@types/node": "^20.19.0",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "eslint": "^9.37.0",
    "eslint-config-next": "16.2.10",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-slug": "^6.0.0",
    "shiki": "^4.3.1",
    "tailwindcss": "^4.3.2",
    "typescript": "^5.9.0",
    "unist-util-visit": "^5.1.0",
    "velite": "^0.4.0",
    "vitest": "^4.1.5"
  }
}
```

**Critical:** velite runs via `predev`/`prebuild` scripts, **not** the `next.config.ts` side-effect. The config-hook approach uses a floating un-awaited promise and races the Next compiler on Vercel (velite issue #311: `Module not found: Can't resolve './posts.json'`). Pick exactly one mechanism; this is it.

- [ ] **Step 2: Create the app tsconfig**

`apps/site/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "jsx": "preserve",
    "noEmit": true,
    "allowJs": true,
    "incremental": true,
    "declaration": false,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"],
      "#velite": ["./.velite"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".velite/index.d.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.ts with security headers and the bundle analyzer**

`apps/site/next.config.ts`:
```ts
import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

// Strict because we load nobody else's JavaScript. No third-party origins,
// no unsafe-eval. 'unsafe-inline' on style-src is required by Next's inlined
// critical CSS; script-src needs it for the pre-paint theme script.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // NEVER set output: 'export' — it disables next/image optimization and headers().
  transpilePackages: ["@anuragashok/profile"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default bundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(nextConfig);
```

- [ ] **Step 4: Create postcss and eslint configs**

`apps/site/postcss.config.mjs`:
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

`apps/site/eslint.config.mjs`:
```js
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: [".next/**", ".velite/**", "public/static/**"] },
];
```

- [ ] **Step 5: Create the fonts module**

`apps/site/app/fonts.ts`:
```ts
import { IBM_Plex_Mono, Instrument_Serif, Inter } from "next/font/google";

// Inter is variable — one file covers every weight, no `weight` key.
export const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-sans",
});

// Instrument Serif is NOT variable — `weight` is required. Display face; 400 + italic is all we need.
export const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-serif",
});

// IBM Plex Mono is NOT variable — `weight` is required. 400 only: every extra weight is another file,
// and metadata does not need bold. Below the fold on every page, so it does not preload.
export const mono = IBM_Plex_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-mono",
});
```

- [ ] **Step 6: Create the design tokens**

`apps/site/app/globals.css`:
```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* The locked palette. One accent. Do not add a second. */
  --color-paper: #faf9f7;
  --color-ink: #16150f;
  --color-accent: #b45309;

  /* Dark mode is a designed inversion, not a derived one. */
  --color-paper-dark: #111110;
  --color-ink-dark: #ebe9e4;
  --color-accent-dark: #e0913a;

  --color-muted: #78716c;
  --color-muted-dark: #8f887f;
  --color-rule: #e7e5e4;
  --color-rule-dark: #2a2825;

  --font-serif: var(--font-serif), Georgia, serif;
  --font-sans: var(--font-sans), system-ui, sans-serif;
  --font-mono: var(--font-mono), ui-monospace, monospace;
}

:root {
  --bg: var(--color-paper);
  --fg: var(--color-ink);
  --muted: var(--color-muted);
  --accent: var(--color-accent);
  --rule: var(--color-rule);
}

.dark {
  --bg: var(--color-paper-dark);
  --fg: var(--color-ink-dark);
  --muted: var(--color-muted-dark);
  --accent: var(--color-accent-dark);
  --rule: var(--color-rule-dark);
}

body {
  background-color: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

::selection {
  background-color: var(--accent);
  color: var(--color-paper);
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Shiki dual-theme: @shikijs/rehype with defaultColor:false emits CSS vars only.
   Without this block, code blocks are invisible in dark mode. */
html.dark .shiki,
html.dark .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
```

- [ ] **Step 7: Create the site config**

`apps/site/lib/site.ts`:
```ts
import { profile } from "@anuragashok/profile";

export const siteConfig = {
  name: profile.name,
  description: `${profile.role} at ${profile.company}. Writing about automation, everything-as-code, and agentic coding.`,
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  links: profile.links,
} as const;
```

Note there is **no `x` / Twitter link**. The old config had an unverified one; it is deliberately cut. Do not re-add it.

- [ ] **Step 8: Create the pre-paint theme script**

`apps/site/components/theme-script.tsx`:
```tsx
// Runs before paint to avoid a flash of the wrong theme. Inline by necessity.
const script = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
```

- [ ] **Step 9: Create the theme toggle**

`apps/site/components/theme-toggle.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        {dark ? (
          <circle cx="12" cy="12" r="5" />
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        )}
      </svg>
    </button>
  );
}
```

- [ ] **Step 10: Create the header and footer**

`apps/site/components/site-header.tsx`:
```tsx
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="flex items-baseline justify-between py-10">
      <Link href="/" className="font-serif text-lg tracking-tight hover:text-[var(--accent)]">
        {siteConfig.name}
      </Link>
      <nav className="flex items-center gap-5 font-mono text-xs text-[var(--muted)]">
        <Link href="/writing" className="hover:text-[var(--accent)]">Writing</Link>
        <Link href="/about" className="hover:text-[var(--accent)]">About</Link>
        <a href="/feed.xml" className="hover:text-[var(--accent)]">RSS</a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
```

`apps/site/components/site-footer.tsx`:
```tsx
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--rule)] py-8 font-mono text-xs text-[var(--muted)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <div className="flex gap-5">
          <a href={siteConfig.links.github} className="hover:text-[var(--accent)]">GitHub</a>
          <a href={siteConfig.links.linkedin} className="hover:text-[var(--accent)]">LinkedIn</a>
          <a href="/feed.xml" className="hover:text-[var(--accent)]">RSS</a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 11: Create the root layout**

`apps/site/app/layout.tsx`:
```tsx
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeScript } from "@/components/theme-script";
import { siteConfig } from "@/lib/site";
import { mono, sans, serif } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body>
        <div className="mx-auto min-h-screen max-w-2xl px-6">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

- [ ] **Step 12: Create a placeholder homepage**

`apps/site/app/page.tsx`:
```tsx
export default function HomePage() {
  return <h1 className="font-serif text-5xl tracking-tight">I make code work.</h1>;
}
```

- [ ] **Step 13: Install and run the dev server**

```bash
pnpm install
pnpm --filter @anuragashok/site dev
```
Expected: `velite --clean` runs first (it will warn about no collections — that's fine, Task 4 adds them), then Next starts on :3000. Visit it: the headline renders in Instrument Serif on paper `#FAF9F7`, the header/footer are in IBM Plex Mono, and the theme toggle flips to the dark inversion without a flash on reload.

- [ ] **Step 14: Typecheck and commit**

```bash
pnpm --filter @anuragashok/site typecheck
git add apps/site
git commit -m "feat(site): Next 16 scaffold, locked design tokens, three fonts, dark mode

Instrument Serif and IBM Plex Mono are non-variable, so weight is required.
Mono is preload:false — it lives below the fold on every page.
CSP is strict because we load no third-party JavaScript."
```

---

### Task 4: velite — the content pipeline

Wires markdown at the repo root into the app. Deliverable: `posts` importable from `#velite`, with compiled HTML, TOC, reading time, and Shiki-highlighted code.

**Files:**
- Create: `apps/site/velite.config.ts`, `apps/site/lib/posts.ts`
- Test: `apps/site/tests/unit/posts.test.ts`, `apps/site/vitest.config.ts`

**Interfaces:**
- Consumes: `content/posts/*.md` at the repo root
- Produces:
  - `import { posts } from "#velite"` → `Post[]`
  - `@/lib/posts` → `getAllPosts(): Post[]` (published only, newest first), `getPostBySlug(slug: string): Post | undefined`, `getAdjacentPosts(slug): { prev?: Post; next?: Post }`, `getAllTags(): string[]`
  - `Post` fields: `title`, `slug`, `date`, `summary`, `tags`, `draft`, `content` (HTML), `toc`, `metadata.readingTime`

- [ ] **Step 1: Write the velite config**

`apps/site/velite.config.ts`:
```ts
import rehypeShiki from "@shikijs/rehype";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { defineCollection, defineConfig, s } from "velite";

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.md",
  schema: s.object({
    title: s.string().max(120),
    slug: s.path().transform((p) => p.replace(/^posts\//, "")),
    date: s.isodate(),
    summary: s.string().max(400),
    tags: s.array(s.string()).default([]),
    draft: s.boolean().default(false),
    toc: s.toc(),
    metadata: s.metadata(),
    content: s.markdown(),
  }),
});

export default defineConfig({
  // Content lives at the REPO ROOT, not inside the app. It is Anurag's, not the site's.
  // `root` is resolved relative to this config file.
  root: "../../content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:8].[ext]",
    clean: true,
  },
  collections: { posts },
  markdown: {
    rehypePlugins: [
      // rehype-slug MUST come first: velite's s.toc() emits anchor URLs but adds no
      // heading ids of its own. Without this, every TOC link is dead.
      rehypeSlug,
      [
        rehypeShiki,
        {
          themes: { light: "github-light", dark: "github-dark" },
          // Emit CSS vars only — required for the class-based dark mode strategy.
          defaultColor: false,
        },
      ],
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
});
```

- [ ] **Step 2: Write the failing tests**

`apps/site/tests/unit/posts.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { getAdjacentPosts, getAllPosts, getAllTags, getPostBySlug } from "@/lib/posts";

describe("posts", () => {
  it("loads the migrated posts", () => {
    const all = getAllPosts();
    expect(all.length).toBeGreaterThanOrEqual(5);
  });

  it("sorts newest first", () => {
    const dates = getAllPosts().map((p) => p.date);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
  });

  it("finds a post by slug and compiles its markdown to HTML", () => {
    const post = getPostBySlug("capture-response-time-in-wiremock-recordings");
    expect(post).toBeDefined();
    expect(post?.title).toBe("Capture response time in wiremock recordings");
    expect(post?.date).toContain("2021-02-06");
    expect(post?.content).toContain("<p>");
  });

  it("highlights code with shiki at build time", () => {
    const post = getPostBySlug("capture-response-time-in-wiremock-recordings");
    // Shiki runs at build; zero runtime JS ships. Prism would ship a highlighter.
    expect(post?.content).toContain("shiki");
  });

  it("adds ids to headings so the TOC links resolve", () => {
    const post = getPostBySlug("publishing-my-first-artifact-to-maven-central-using-github-actions");
    expect(post?.toc.length).toBeGreaterThan(0);
    const first = post?.toc[0];
    expect(first).toBeDefined();
    const id = first!.url.replace(/^#/, "");
    expect(post?.content).toContain(`id="${id}"`);
  });

  it("computes reading time", () => {
    const post = getPostBySlug("use-docker-for-local-development");
    expect(post?.metadata.readingTime).toBeGreaterThan(0);
  });

  it("collects tags across posts", () => {
    expect(getAllTags()).toContain("wiremock");
  });

  it("returns adjacent posts for prev/next navigation", () => {
    const { prev, next } = getAdjacentPosts("use-docker-for-local-development");
    // Newest-first ordering: `next` is older, `prev` is newer.
    expect(prev?.slug).toBe("capture-response-time-in-wiremock-recordings");
    expect(next?.slug).toBe("generate-rss-and-sitemap-for-nextjs-jamstack-site");
  });
});
```

`apps/site/vitest.config.ts`:
```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "#velite": fileURLToPath(new URL("./.velite", import.meta.url)),
    },
  },
  test: { environment: "node", include: ["tests/unit/**/*.test.ts"] },
});
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
pnpm --filter @anuragashok/site test
```
Expected: FAIL — `@/lib/posts` does not exist.

- [ ] **Step 4: Write the post loader**

`apps/site/lib/posts.ts`:
```ts
import { type Post, posts } from "#velite";

/** Published posts, newest first. Drafts appear in dev only. */
export function getAllPosts(): Post[] {
  const visible = process.env.NODE_ENV === "development" ? posts : posts.filter((p) => !p.draft);
  return [...visible].sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** Newest-first ordering, so `prev` is the newer post and `next` is the older one. */
export function getAdjacentPosts(slug: string): { prev?: Post; next?: Post } {
  const all = getAllPosts();
  const i = all.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { prev: all[i - 1], next: all[i + 1] };
}

export function getAllTags(): string[] {
  return [...new Set(getAllPosts().flatMap((p) => p.tags))].sort();
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
pnpm --filter @anuragashok/site test
```
Expected: PASS — 8 tests. `velite --clean` runs first via the `test` script and generates `.velite/`.

If the TOC test fails, `rehype-slug` is missing or ordered after `rehype-autolink-headings`. Fix the plugin order.

- [ ] **Step 6: Commit**

```bash
git add apps/site
git commit -m "feat(site): velite content pipeline over repo-root markdown

root: '../../content' — content is Anurag's, not the site's; the phase-3 CLI
reads the same files. rehype-slug is mandatory: velite emits TOC anchors but
no heading ids, so without it every TOC link is dead."
```

---

### Task 5: Bring the post images local

The migrated posts hotlink `images.ctfassets.net` — a CDN tied to a Contentful space we do not control, and the exact failure mode that destroyed the old blog. Velite only copies and hashes **relative** paths, so absolute URLs sail through unoptimized. This task pulls them local so velite processes them and `next/image` can optimize them.

**Files:**
- Create: `content/posts/img/*` (downloaded images)
- Modify: all 5 files in `content/posts/*.md` (rewrite image URLs to relative paths)

- [ ] **Step 1: Inventory the remote images**

```bash
cd /Users/anuragashok/projects/anuragashok.com
grep -oE '!\[[^]]*\]\([^)]+\)' content/posts/*.md
```
Expected: hero images on all 5 posts pointing at `images.ctfassets.net`, plus two known-dead references (a site-relative `/diagrams/initial-post.svg` and an absolute `https://theoverengineered.blog/docker-local.jpg`).

- [ ] **Step 2: Download every reachable image**

```bash
mkdir -p content/posts/img
grep -ohE 'https://images\.ctfassets\.net[^) ]+' content/posts/*.md | sort -u | while read -r url; do
  name=$(basename "${url%%\?*}")
  curl -fsSL "$url" -o "content/posts/img/$name" && echo "ok  $name" || echo "FAIL $url"
done
ls -la content/posts/img/
```
Expected: each hero image downloads. Note any `FAIL` — those join the dead list.

- [ ] **Step 3: Rewrite the markdown to relative paths**

For each post, replace the absolute Contentful URL with a relative path. Velite resolves relative image paths **relative to the markdown file**, so `./img/foo.jpg` is correct.

```bash
cd content/posts
for f in *.md; do
  perl -pi -e 's{https://images\.ctfassets\.net/[^)\s]*/([^/)\s?]+)(\?[^)\s]*)?}{./img/$1}g' "$f"
done
grep -oE '!\[[^]]*\]\([^)]+\)' *.md
```
Expected: every surviving image now reads `![alt](./img/name.jpg)`.

- [ ] **Step 4: Remove the two unrecoverable images**

Both are gone with the domain and cannot be recovered (issue #14). Delete the image lines — the posts read fine without them.

- In `content/posts/initial-post.md`, delete the line referencing `/diagrams/initial-post.svg`.
- In `content/posts/use-docker-for-local-development.md`, delete the line referencing `https://theoverengineered.blog/docker-local.jpg`.

Verify nothing dead remains:
```bash
grep -rE 'ctfassets|theoverengineered|/diagrams/' content/posts/ && echo "STILL DEAD REFS" || echo "clean"
```
Expected: `clean`.

- [ ] **Step 5: Verify velite processes and hashes them**

```bash
cd /Users/anuragashok/projects/anuragashok.com
pnpm --filter @anuragashok/site exec velite --clean
ls apps/site/public/static/
grep -o '/static/[^"]*' apps/site/.velite/posts.json | head -5
```
Expected: content-hashed files (e.g. `technology-theory-22bb5c5c.jpg`) in `public/static/`, and the compiled HTML referencing `/static/...`. This proves the images are now in the build and no longer depend on anyone else's CDN.

- [ ] **Step 6: Route body images through the Next image optimizer**

Velite emits plain `<img src="/static/…">`. Post bodies render as compiled HTML via
`dangerouslySetInnerHTML`, so a React `next/image` component cannot be used here. Without this
step the images ship **unoptimized** and the LCP fix the spec ports from timlrx evaporates.

The equivalent, and it works on static HTML: rewrite each `<img>` to hit Next's optimizer
endpoint (`/_next/image`) with a responsive `srcset`. That buys AVIF/WebP conversion, correct
resizing, and lazy loading — the same wins, no React needed.

Add the dependency:
```bash
pnpm --filter @anuragashok/site add -D unist-util-visit @types/hast
```

Create `apps/site/lib/rehype-optimize-images.ts`:
```ts
import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

const WIDTHS = [640, 960, 1280];
const QUALITY = 75;

/**
 * Rewrites velite's `<img src="/static/…">` to run through Next's image optimizer,
 * with a responsive srcset and lazy loading.
 *
 * Post bodies are injected as HTML, so `next/image` (a React component) is not an
 * option. This is the equivalent for static markup: same AVIF/WebP conversion, same
 * resizing, same lazy loading. Without it, hero images ship at full size and LCP suffers.
 */
export function rehypeOptimizeImages() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img") return;

      const src = node.properties?.src;
      if (typeof src !== "string" || !src.startsWith("/static/")) return;

      const optimized = (w: number) =>
        `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${QUALITY}`;

      node.properties.loading = "lazy";
      node.properties.decoding = "async";
      node.properties.sizes = "(max-width: 42rem) 100vw, 42rem";
      node.properties.srcSet = WIDTHS.map((w) => `${optimized(w)} ${w}w`).join(", ");
      node.properties.src = optimized(WIDTHS[WIDTHS.length - 1]!);
    });
  };
}
```

Register it in `apps/site/velite.config.ts` — **last**, so it runs after the images have been
copied and rewritten to `/static/` paths:
```ts
import { rehypeOptimizeImages } from "./lib/rehype-optimize-images";

// …inside markdown.rehypePlugins, after rehypeAutolinkHeadings:
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      rehypeOptimizeImages,
```

- [ ] **Step 7: Verify the images are optimized**

```bash
pnpm --filter @anuragashok/site exec velite --clean
grep -o '_next/image[^"]*' apps/site/.velite/posts.json | head -3
```
Expected: `src` and `srcset` values pointing at `/_next/image?url=%2Fstatic%2F…&w=…&q=75`.

Then confirm the optimizer actually serves them:
```bash
pnpm --filter @anuragashok/site build
pnpm --filter @anuragashok/site start &
sleep 3
curl -sI "http://localhost:3000/_next/image?url=%2Fstatic%2F$(ls apps/site/public/static | head -1)&w=640&q=75" | grep -i content-type
kill %1
```
Expected: `content-type: image/webp` (or `image/avif`) — **not** `image/jpeg`. That is the proof the optimizer is in the path. If it returns the original type, the rewrite didn't take.

- [ ] **Step 8: Commit**

```bash
git add content/posts apps/site
git commit -m "fix(content): self-host post images and route them through the optimizer

Velite only copies relative paths — absolute Contentful URLs sailed through
untouched and kept us dependent on a CDN tied to a space we don't control.
That is the same failure mode that destroyed the old blog.

Post bodies render as HTML, so next/image (a React component) isn't usable
here. A rehype plugin rewrites each <img> to hit /_next/image with a
responsive srcset instead — same AVIF/WebP conversion, resizing and lazy
loading, on static markup.

Two images are unrecoverable (issue #14): a site-relative SVG and a JPEG
hotlinked from the now-parked domain."
```

---

### Task 6: Home page

Reading-first. Serif hero, short bio from the profile, recent writing. Nothing competing with the words. **No manifest block here** — that lands on About only, deliberately.

**Files:**
- Create: `apps/site/components/post-list.tsx`
- Modify: `apps/site/app/page.tsx`

**Interfaces:**
- Consumes: `@/lib/posts` → `getAllPosts`; `@anuragashok/profile` → `profile`, `yearsOfExperience`
- Produces: `@/components/post-list` → `<PostList posts={Post[]} />`

- [ ] **Step 1: Create the shared post list**

`apps/site/components/post-list.tsx`:
```tsx
import type { Post } from "#velite";
import Link from "next/link";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" }).toUpperCase();
}

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug} className="grid grid-cols-[4.5rem_1fr] items-baseline gap-4 border-t border-[var(--rule)] py-3">
          <span className="font-mono text-[0.65rem] text-[var(--muted)] tabular-nums">{formatDate(post.date)}</span>
          <Link href={`/writing/${post.slug}`} className="font-medium hover:text-[var(--accent)]">
            {post.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Write the home page**

`apps/site/app/page.tsx`:
```tsx
import { profile, yearsOfExperience } from "@anuragashok/profile";
import Link from "next/link";
import { PostList } from "@/components/post-list";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 5);
  const years = yearsOfExperience(profile.since);

  return (
    <div>
      <section className="pb-16">
        <p className="mb-4 font-mono text-[0.65rem] tracking-[0.11em] text-[var(--muted)]">
          {profile.role.toUpperCase()} · {profile.company.toUpperCase()} · {profile.location.toUpperCase()}
        </p>
        <h1 className="mb-5 font-serif text-5xl leading-[1.05] tracking-tight">
          I make <em className="text-[var(--accent)] not-italic">code</em> work.
        </h1>
        <p className="max-w-[46ch] leading-relaxed text-[var(--muted)]">
          {years} years of it. Today I build dispatch at {profile.company} — deciding, thousands of times a
          second, which driver meets which demand. I care about automation, everything-as-code, and what
          changes now that the agent writes the first draft.
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-[0.65rem] tracking-[0.14em] text-[var(--muted)]">WRITING</h2>
        <PostList posts={posts} />
        <Link href="/writing" className="mt-5 inline-block font-mono text-xs text-[var(--accent)] hover:underline">
          all writing →
        </Link>
      </section>
    </div>
  );
}
```

Note the years count is **computed from `me.yaml`**, not hardcoded. It never goes stale — which is the point of the whole repo.

- [ ] **Step 3: Verify it renders**

```bash
pnpm --filter @anuragashok/site dev
```
Visit `http://localhost:3000`. Expected: serif hero with "code" in burnt amber, mono metadata line reading `LEAD SOFTWARE ENGINEER · GRAB · SINGAPORE`, and five posts newest-first. Toggle dark mode — both themes read cleanly.

- [ ] **Step 4: Commit**

```bash
git add apps/site
git commit -m "feat(site): home page — reading-first, no manifest

Years of experience is computed from me.yaml, not hardcoded. It can never
go stale, which is the entire point of the repo."
```

---

### Task 7: Writing index with client-side tag filtering

The post index plus tag filters. **Client-side filtering, no new routes** — tag archive pages would be a fifth surface that multiplies with the taxonomy.

**Files:**
- Create: `apps/site/app/writing/page.tsx`, `apps/site/components/tag-filter.tsx`

**Interfaces:**
- Consumes: `@/lib/posts` → `getAllPosts`, `getAllTags`; `@/components/post-list` → `PostList`
- Produces: `@/components/tag-filter` → `<TagFilter posts={Post[]} tags={string[]} />` (client component; renders its own filtered `PostList`)

- [ ] **Step 1: Create the tag filter**

`apps/site/components/tag-filter.tsx`:
```tsx
"use client";

import type { Post } from "#velite";
import { useState } from "react";
import { PostList } from "./post-list";

export function TagFilter({ posts, tags }: { posts: Post[]; tags: string[] }) {
  const [active, setActive] = useState<string | null>(null);
  const shown = active ? posts.filter((p) => p.tags.includes(active)) : posts;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive(null)}
          aria-pressed={active === null}
          className={`font-mono text-[0.65rem] transition-colors ${
            active === null ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--fg)]"
          }`}
        >
          all
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActive(tag === active ? null : tag)}
            aria-pressed={tag === active}
            className={`font-mono text-[0.65rem] transition-colors ${
              tag === active ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>
      <PostList posts={shown} />
      {shown.length === 0 && (
        <p className="py-6 font-mono text-xs text-[var(--muted)]">Nothing tagged #{active}.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create the writing index**

`apps/site/app/writing/page.tsx`:
```tsx
import type { Metadata } from "next";
import { TagFilter } from "@/components/tag-filter";
import { getAllPosts, getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays and notes on automation, everything-as-code, and agentic coding.",
  alternates: { canonical: "/writing" },
};

export default function WritingPage() {
  return (
    <div>
      <h1 className="mb-8 font-serif text-4xl tracking-tight">Writing</h1>
      <TagFilter posts={getAllPosts()} tags={getAllTags()} />
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
pnpm --filter @anuragashok/site dev
```
Visit `/writing`. Expected: all posts listed, tag buttons across the top. Clicking `#wiremock` narrows the list; clicking it again restores everything. No navigation occurs — the URL never changes.

- [ ] **Step 4: Commit**

```bash
git add apps/site
git commit -m "feat(site): writing index with client-side tag filtering

No tag archive routes — they'd be a fifth surface that multiplies with the
taxonomy. Tags stay functional; the surface count stays at four."
```

---

### Task 8: Post page — prose, TOC, prev/next, copy buttons

The reading surface. Serif headline, Shiki-highlighted code with copy buttons, a quiet TOC on long posts only, and prev/next navigation.

**Files:**
- Create: `apps/site/app/writing/[slug]/page.tsx`, `apps/site/components/prose.tsx`, `apps/site/components/table-of-contents.tsx`, `apps/site/components/copy-buttons.tsx`, `apps/site/components/post-nav.tsx`

**Interfaces:**
- Consumes: `@/lib/posts` → `getAllPosts`, `getPostBySlug`, `getAdjacentPosts`
- Produces: `@/components/prose` → `<Prose html={string} />`

- [ ] **Step 1: Create the prose renderer**

`apps/site/components/prose.tsx`:
```tsx
// Velite compiles markdown to HTML at build time. Shiki has already highlighted
// the code — zero runtime JS ships for highlighting.
export function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose-custom"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

Append to `apps/site/app/globals.css`:
```css
/* Editorial prose. Hand-rolled — no @tailwindcss/typography, whose defaults
   pull toward exactly the templated look this rebuild exists to escape. */
.prose-custom {
  line-height: 1.75;
}
.prose-custom p,
.prose-custom ul,
.prose-custom ol {
  margin: 0 0 1.15rem;
}
.prose-custom h2,
.prose-custom h3 {
  font-family: var(--font-sans);
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 2.25rem 0 0.75rem;
  scroll-margin-top: 2rem;
}
.prose-custom h2 { font-size: 1.35rem; }
.prose-custom h3 { font-size: 1.1rem; }
.prose-custom h2 a,
.prose-custom h3 a { color: inherit; text-decoration: none; }
.prose-custom h6 {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--muted);
  margin: 1.25rem 0 0.35rem;
}
.prose-custom a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.prose-custom ul { list-style: disc; padding-left: 1.25rem; }
.prose-custom ol { list-style: decimal; padding-left: 1.25rem; }
.prose-custom li { margin: 0.3rem 0; }
.prose-custom img { border-radius: 4px; margin: 1.5rem 0; }
.prose-custom hr { border: 0; border-top: 1px solid var(--rule); margin: 2rem 0; }
.prose-custom blockquote {
  border-left: 2px solid var(--accent);
  padding-left: 1rem;
  color: var(--muted);
  margin: 0 0 1.15rem;
}
.prose-custom :not(pre) > code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: color-mix(in oklch, var(--fg) 7%, transparent);
  padding: 0.12em 0.35em;
  border-radius: 3px;
}
.prose-custom pre {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  line-height: 1.65;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0 0 1.15rem;
  border: 1px solid var(--rule);
  position: relative;
}
.copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  color: var(--muted);
  background: var(--bg);
  border: 1px solid var(--rule);
  border-radius: 3px;
  padding: 0.15rem 0.4rem;
  opacity: 0;
  transition: opacity 0.15s;
  cursor: pointer;
}
.prose-custom pre:hover .copy-btn,
.copy-btn:focus-visible { opacity: 1; }
```

- [ ] **Step 2: Create the copy buttons**

`apps/site/components/copy-buttons.tsx`:
```tsx
"use client";

import { useEffect } from "react";

/** Injects a copy button into every code block. The content is technical —
 *  Dockerfiles, Maven POMs, wiremock configs — so people will copy it. */
export function CopyButtons() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLPreElement>(".prose-custom pre");

    blocks.forEach((pre) => {
      if (pre.querySelector(".copy-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "copy";
      btn.setAttribute("aria-label", "Copy code to clipboard");
      btn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(pre.innerText.replace(/^copy\n/, ""));
        btn.textContent = "copied";
        setTimeout(() => { btn.textContent = "copy"; }, 1500);
      });
      pre.appendChild(btn);
    });
  }, []);

  return null;
}
```

- [ ] **Step 3: Create the table of contents**

`apps/site/components/table-of-contents.tsx`:
```tsx
import type { Post } from "#velite";

/** Long posts only. A quiet aside, not a boxed widget above the fold. */
export function TableOfContents({ toc }: { toc: Post["toc"] }) {
  return (
    <nav aria-label="Table of contents" className="mb-10 border-l border-[var(--rule)] pl-4">
      <p className="mb-2 font-mono text-[0.6rem] tracking-[0.14em] text-[var(--muted)]">CONTENTS</p>
      <ul className="space-y-1">
        {toc.map((item) => (
          <li key={item.url}>
            <a href={item.url} className="font-mono text-[0.7rem] text-[var(--muted)] hover:text-[var(--accent)]">
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 4: Create prev/next navigation**

`apps/site/components/post-nav.tsx`:
```tsx
import type { Post } from "#velite";
import Link from "next/link";

/** The cheapest way to turn one read into two. */
export function PostNav({ prev, next }: { prev?: Post; next?: Post }) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-16 grid gap-4 border-t border-[var(--rule)] pt-6 sm:grid-cols-2">
      <div>
        {prev && (
          <Link href={`/writing/${prev.slug}`} className="group block">
            <span className="font-mono text-[0.6rem] tracking-[0.12em] text-[var(--muted)]">NEWER</span>
            <span className="mt-1 block text-sm group-hover:text-[var(--accent)]">{prev.title}</span>
          </Link>
        )}
      </div>
      <div className="sm:text-right">
        {next && (
          <Link href={`/writing/${next.slug}`} className="group block">
            <span className="font-mono text-[0.6rem] tracking-[0.12em] text-[var(--muted)]">OLDER</span>
            <span className="mt-1 block text-sm group-hover:text-[var(--accent)]">{next.title}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Create the post page**

`apps/site/app/writing/[slug]/page.tsx`:
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CopyButtons } from "@/components/copy-buttons";
import { PostNav } from "@/components/post-nav";
import { Prose } from "@/components/prose";
import { TableOfContents } from "@/components/table-of-contents";
import { getAdjacentPosts, getAllPosts, getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

/** Posts longer than this get a table of contents. Short ones don't need one. */
const TOC_MIN_READING_TIME = 5;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      url: `/writing/${post.slug}`,
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(slug);
  const showToc = post.metadata.readingTime >= TOC_MIN_READING_TIME && post.toc.length > 2;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    author: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
    url: `${siteConfig.url}/writing/${post.slug}`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-10">
        <p className="mb-3 font-mono text-[0.65rem] tracking-[0.11em] text-[var(--muted)] tabular-nums">
          {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          {" · "}
          {post.metadata.readingTime} MIN READ
        </p>
        <h1 className="font-serif text-4xl leading-[1.1] tracking-tight">{post.title}</h1>
      </header>

      {showToc && <TableOfContents toc={post.toc} />}

      <Prose html={post.content} />
      <CopyButtons />
      <PostNav prev={prev} next={next} />
    </article>
  );
}
```

- [ ] **Step 6: Verify**

```bash
pnpm --filter @anuragashok/site dev
```
Visit `/writing/capture-response-time-in-wiremock-recordings`. Expected: serif headline, mono date + reading time, Java code blocks highlighted, a `copy` button appearing on hover over each code block (click it — the label flips to `copied`), and prev/next links at the foot. Visit the Maven post — it's long enough to show the TOC; its links jump to the right headings. The wiremock post is short enough that the TOC is absent. Toggle dark mode: **code blocks must invert** (if they stay light, the Shiki CSS block in `globals.css` is missing).

- [ ] **Step 7: Commit**

```bash
git add apps/site
git commit -m "feat(site): post page — prose, shiki, TOC, prev/next, copy buttons

TOC appears on long posts only. Hand-rolled prose styles instead of
@tailwindcss/typography, whose defaults pull toward the templated look."
```

---

### Task 9: About page — where the manifest lands

Prose, then `me.yaml` rendered as **the actual bytes on disk**. This is the payoff of the whole project.

**Files:**
- Create: `apps/site/app/about/page.tsx`, `apps/site/components/manifest.tsx`

**Interfaces:**
- Consumes: `@anuragashok/profile` → `profile`, `rawProfile`, `yearsOfExperience`

- [ ] **Step 1: Create the manifest component**

`apps/site/components/manifest.tsx`:
```tsx
import { codeToHtml } from "shiki";

/**
 * Renders the EXACT bytes of me.yaml. Not a re-serialization of the parsed object.
 * The thing on screen is the thing in git — that identity is the entire point,
 * and a Playwright test asserts it. Do not "simplify" this into JSON.stringify(profile).
 */
export async function Manifest({ raw }: { raw: string }) {
  const html = await codeToHtml(raw, {
    lang: "yaml",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  return (
    <figure className="mt-6 overflow-hidden rounded-md border border-[var(--rule)]">
      <figcaption className="flex items-center justify-between border-b border-[var(--rule)] px-3 py-1.5 font-mono text-[0.6rem] tracking-[0.06em] text-[var(--muted)]">
        <span>me.yaml</span>
        <span className="text-[var(--accent)]">source of truth</span>
      </figcaption>
      <div
        data-testid="manifest"
        className="manifest-body overflow-x-auto p-3 font-mono text-[0.7rem] leading-[1.9]"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
```

Append to `apps/site/app/globals.css`:
```css
.manifest-body pre {
  margin: 0;
  background: transparent !important;
}
```

- [ ] **Step 2: Create the About page**

`apps/site/app/about/page.tsx`:
```tsx
import { profile, rawProfile, yearsOfExperience } from "@anuragashok/profile";
import type { Metadata } from "next";
import { Manifest } from "@/components/manifest";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.description,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const years = yearsOfExperience(profile.since);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    worksFor: { "@type": "Organization", name: profile.company },
    address: { "@type": "PostalAddress", addressLocality: profile.location },
    url: siteConfig.url,
    sameAs: [profile.links.github, profile.links.linkedin],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 className="mb-8 font-serif text-4xl tracking-tight">About</h1>

      <div className="max-w-[52ch] space-y-4 leading-relaxed">
        <p>
          I&apos;m a {profile.role} at {profile.company} in {profile.location}, on {profile.team} — the
          system that matches supply to demand across Southeast Asia. I&apos;ve been writing software since
          February 2013, and I intend to keep doing exactly that. Individual contributor, by choice.
        </p>
        <p>
          The thread through all of it is automation. If I do a thing twice, I&apos;d rather describe it once
          and let the machine do it. That instinct became infrastructure-as-code, then everything-as-code, and
          lately it&apos;s become agentic coding — which is the same instinct with a much better executor.
        </p>
        <p>
          {years} years in, that&apos;s still the whole job: make the work describable, then make it run
          itself.
        </p>
        <p>This site runs on that idea too. Everything below is generated from a single file in the repo:</p>
      </div>

      <Manifest raw={rawProfile} />

      <p className="mt-3 font-mono text-[0.6rem] leading-relaxed text-[var(--muted)]">
        rendered from <span className="text-[var(--accent)]">packages/profile/me.yaml</span> — the same
        object that will write my GitHub README and LinkedIn headline.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Verify the bytes match**

```bash
pnpm --filter @anuragashok/site dev
```
Visit `/about`. Expected: three prose paragraphs, then a bordered `me.yaml` block whose content — **including the comments** (`# and staying that way`, `# matching supply to demand across Southeast Asia`) — is character-for-character the file on disk. Comments surviving is the tell: a re-serialized object would have dropped them.

- [ ] **Step 4: Commit**

```bash
git add apps/site
git commit -m "feat(site): about page — the manifest lands

Renders the exact bytes of me.yaml, comments and all. Comments surviving is
the tell that it's the file and not a re-serialized object. Task 13 adds the
test that keeps it honest."
```

---

### Task 10: RSS, sitemap, robots

RSS is the newsletter — deliberately first-class. Full content, correct dates, valid feed.

**Files:**
- Create: `apps/site/app/feed.xml/route.ts`, `apps/site/app/sitemap.ts`, `apps/site/app/robots.ts`, `apps/site/app/not-found.tsx`

- [ ] **Step 1: Create the feed**

`apps/site/app/feed.xml/route.ts`:
```ts
import { profile } from "@anuragashok/profile";
import { Feed } from "feed";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const feed = new Feed({
    title: siteConfig.name,
    description: siteConfig.description,
    id: siteConfig.url,
    link: siteConfig.url,
    language: "en",
    copyright: `© ${new Date().getFullYear()} ${siteConfig.name}`,
    feedLinks: { rss2: `${siteConfig.url}/feed.xml` },
    author: { name: profile.name, link: siteConfig.url },
  });

  for (const post of getAllPosts()) {
    const url = `${siteConfig.url}/writing/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.summary,
      // Full content: RSS stands in for a newsletter here, so it carries the whole post.
      content: post.content,
      date: new Date(post.date),
      author: [{ name: profile.name, link: siteConfig.url }],
    });
  }

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
```

- [ ] **Step 2: Create the sitemap and robots**

`apps/site/app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((post) => ({
    url: `${siteConfig.url}/writing/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  return [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/writing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...posts,
  ];
}
```

`apps/site/app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Create the 404**

`apps/site/app/not-found.tsx`:
```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16">
      <h1 className="mb-3 font-serif text-4xl tracking-tight">Not found.</h1>
      <p className="mb-6 text-[var(--muted)]">That page doesn&apos;t exist — or it did, once.</p>
      <Link href="/writing" className="font-mono text-xs text-[var(--accent)] hover:underline">
        ← all writing
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Verify the feed is valid**

```bash
pnpm --filter @anuragashok/site build
pnpm --filter @anuragashok/site start &
sleep 3
curl -s http://localhost:3000/feed.xml | head -20
curl -s http://localhost:3000/sitemap.xml | head -10
curl -s http://localhost:3000/robots.txt
kill %1
```
Expected: valid RSS 2.0 with 5 items carrying full content; sitemap listing 8 URLs; robots pointing at the sitemap.

- [ ] **Step 5: Commit**

```bash
git add apps/site
git commit -m "feat(site): RSS, sitemap, robots, 404

RSS carries full post content — it stands in for a newsletter, so it is
first-class, not a checkbox."
```

---

### Task 11: OG images

Per-post and default OG cards, rendered from the same tokens as the site. Matters for phase-3 LinkedIn syndication — a link without a card gets scrolled past.

**Files:**
- Create: `apps/site/app/opengraph-image.tsx`, `apps/site/app/writing/[slug]/opengraph-image.tsx`

**Note:** `ImageResponse` comes from **`next/og`**, not `@vercel/og`. Satori requires explicit `display: flex` on any div with multiple children.

- [ ] **Step 1: Create the default OG image**

`apps/site/app/opengraph-image.tsx`:
```tsx
import { profile } from "@anuragashok/profile";
import { ImageResponse } from "next/og";

export const alt = "Anurag Ashok";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAF9F7",
          color: "#16150F",
          padding: "64px",
          borderBottom: "16px solid #B45309",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, color: "#78716C" }}>
          {profile.role.toUpperCase()} · {profile.company.toUpperCase()} · {profile.location.toUpperCase()}
        </div>
        <div style={{ display: "flex", fontSize: 88, letterSpacing: -2 }}>{profile.headline}</div>
        <div style={{ display: "flex", fontSize: 26, color: "#78716C" }}>anuragashok.com</div>
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 2: Create the per-post OG image**

`apps/site/app/writing/[slug]/opengraph-image.tsx`:
```tsx
import { ImageResponse } from "next/og";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

export const alt = "Post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAF9F7",
          color: "#16150F",
          padding: "64px",
          borderBottom: "16px solid #B45309",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, color: "#78716C" }}>
          ANURAG ASHOK
        </div>
        <div style={{ display: "flex", fontSize: 64, lineHeight: 1.15, letterSpacing: -1 }}>
          {post?.title ?? "Writing"}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#78716C" }}>anuragashok.com</div>
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 3: Verify they prerender**

```bash
pnpm --filter @anuragashok/site build
```
Expected: the build output lists the `opengraph-image` routes as static (`●` / prerendered), one per post plus the default.

```bash
pnpm --filter @anuragashok/site start &
sleep 3
curl -sI http://localhost:3000/opengraph-image | grep -i content-type
kill %1
```
Expected: `content-type: image/png`.

- [ ] **Step 4: Commit**

```bash
git add apps/site
git commit -m "feat(site): OG images from next/og, per-post and default

Statically prerendered. Matters for phase-3 LinkedIn syndication — a link
without a card gets scrolled past."
```

---

### Task 12: Playwright e2e — including the test that guards the thesis

The critical test: the About page's manifest block must equal the bytes of `me.yaml` on disk. If someone later re-serializes the parsed object, this fails.

**Files:**
- Create: `apps/site/playwright.config.ts`, `apps/site/tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Create the Playwright config**

`apps/site/playwright.config.ts`:
```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

- [ ] **Step 2: Write the e2e tests**

`apps/site/tests/e2e/smoke.spec.ts`:
```ts
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const meYaml = readFileSync(join(repoRoot, "packages", "profile", "me.yaml"), "utf8");

test("home renders the hero and recent writing", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("I make");
  await expect(page.getByRole("link", { name: /all writing/i })).toBeVisible();
});

test("writing index lists posts and filters by tag", async ({ page }) => {
  await page.goto("/writing");
  const before = await page.locator("main li").count();
  expect(before).toBeGreaterThanOrEqual(5);

  await page.getByRole("button", { name: "#wiremock" }).click();
  const after = await page.locator("main li").count();
  expect(after).toBeLessThan(before);
  expect(after).toBeGreaterThan(0);
});

test("a post renders with highlighted code and prev/next", async ({ page }) => {
  await page.goto("/writing/capture-response-time-in-wiremock-recordings");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Capture response time");
  await expect(page.locator("pre.shiki").first()).toBeVisible();
  await expect(page.getByText("OLDER")).toBeVisible();
});

test("THE THESIS: the About manifest is byte-identical to me.yaml on disk", async ({ page }) => {
  await page.goto("/about");

  const rendered = await page.getByTestId("manifest").innerText();

  // Shiki wraps each line in spans; innerText reconstructs them with newlines.
  // Compare trimmed, line by line — this asserts the page renders THE FILE,
  // not a re-serialization of the parsed object. If someone swaps this for
  // JSON.stringify(profile) or a YAML dump, the comments vanish and this fails.
  const normalize = (s: string) =>
    s.split("\n").map((l) => l.trimEnd()).join("\n").trim();

  expect(normalize(rendered)).toBe(normalize(meYaml));

  // The comments are the tell. A serializer would drop them.
  expect(rendered).toContain("# and staying that way");
});

test("feed, sitemap and robots are served", async ({ request }) => {
  const feed = await request.get("/feed.xml");
  expect(feed.status()).toBe(200);
  const body = await feed.text();
  expect(body).toContain("<rss");
  expect(body).toContain("Capture response time in wiremock recordings");

  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  expect((await request.get("/robots.txt")).status()).toBe(200);
});

test("404 renders", async ({ page }) => {
  const res = await page.goto("/writing/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Not found");
});
```

- [ ] **Step 3: Run the tests**

```bash
pnpm --filter @anuragashok/site exec playwright install chromium
pnpm --filter @anuragashok/site test:e2e
```
Expected: PASS — 6 tests. The manifest test is the one that matters; if it fails, the About page is not rendering the file.

- [ ] **Step 4: Commit**

```bash
git add apps/site
git commit -m "test(site): e2e smoke, including the test that guards the thesis

The About manifest must be byte-identical to me.yaml on disk. If someone
re-serializes the parsed object, the comments vanish and this fails."
```

---

### Task 13: Pre-commit hook and CI

Pre-commit runs the fast subset. CI runs everything including e2e. **A check gate, not a deploy gate** — Vercel still owns deploys.

**Files:**
- Create: `.github/workflows/ci.yml`, `.husky/pre-commit`
- Modify: `package.json` (root — add husky)

- [ ] **Step 1: Add husky**

```bash
pnpm add -Dw husky
pnpm exec husky init
```

- [ ] **Step 2: Write the pre-commit hook**

`.husky/pre-commit`:
```sh
pnpm typecheck && pnpm lint && pnpm test
```

The fast subset — typecheck, lint, unit. Playwright is too slow for a commit hook; CI covers it.

- [ ] **Step 3: Write the CI workflow**

`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: ["**"]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm --filter @anuragashok/site exec playwright install --with-deps chromium
      - run: pnpm test:e2e
```

This is a **check** gate. It does not deploy — Vercel does. CI was deleted in f8ef151 precisely because it duplicated the deploy; this version adds e2e coverage that is too slow for a commit hook and fails loudly rather than quietly in a deployment nobody watches.

- [ ] **Step 4: Verify the full check passes**

```bash
pnpm check
pnpm test:e2e
```
Expected: both PASS.

- [ ] **Step 5: Commit**

```bash
git add .github .husky package.json
git commit -m "ci: pre-commit fast checks, GitHub Actions full check gate

A check gate, not a deploy gate — Vercel still owns deploys. This is not the
CI that was deleted in f8ef151: it adds e2e, which is too slow for a hook."
```

---

### Task 14: Deploy and wire the domain

`anuragashok.com` currently 404s. A branding hub on a `vercel.app` subdomain is not a branding hub. **Registrar: Cloudflare.**

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create the Vercel config**

`vercel.json`:
```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "outputDirectory": "apps/site/.next",
  "framework": "nextjs"
}
```

- [ ] **Step 2: Set the production environment variables**

```bash
vercel env add NEXT_PUBLIC_BASE_URL production
# value: https://anuragashok.com
vercel env add ENABLE_EXPERIMENTAL_COREPACK production
# value: 1
```
`ENABLE_EXPERIMENTAL_COREPACK=1` makes Vercel honor the `packageManager` field pinning pnpm 11.

- [ ] **Step 3: Deploy a preview and check it**

```bash
vercel --scope anuragashoks-projects
```
Expected: a preview URL. Open it. Verify all four surfaces render, code blocks highlight, dark mode works, and `/about` shows the manifest.

If the build fails with `Module not found: Can't resolve './posts.json'`, the velite `prebuild` script did not run — confirm `apps/site/package.json` has `"prebuild": "velite --clean"` and that no `next.config.ts` velite hook was added (they conflict; use exactly one).

- [ ] **Step 4: Deploy to production**

```bash
vercel --prod --scope anuragashoks-projects
```

- [ ] **Step 5: Add the domain in Vercel**

```bash
vercel domains add anuragashok.com --scope anuragashoks-projects
vercel domains inspect anuragashok.com --scope anuragashoks-projects
```
Note the DNS target Vercel returns.

- [ ] **Step 6: Point Cloudflare DNS at Vercel**

In the Cloudflare dashboard for `anuragashok.com`:
- `A` record, name `@`, value `76.76.21.21`, **proxy OFF (DNS only)** — Cloudflare's proxy in front of Vercel causes redirect loops and breaks Vercel's certificate issuance.
- `CNAME`, name `www`, value `cname.vercel-dns.com`, **proxy OFF**.

Confirm the exact values against `vercel domains inspect` output — prefer what Vercel reports over the values above if they differ.

- [ ] **Step 7: Verify the domain is live**

```bash
sleep 60
curl -sI https://anuragashok.com | head -3
curl -s https://anuragashok.com/feed.xml | head -3
```
Expected: `HTTP/2 200`, and a valid feed. The site that 404'd for months now resolves.

- [ ] **Step 8: Commit**

```bash
git add vercel.json
git commit -m "chore: vercel config and custom domain

anuragashok.com resolves. A branding hub on a vercel.app subdomain is not a
branding hub."
```

---

### Task 15: Merge, and close the loop

- [ ] **Step 1: Run the full check one final time**

```bash
pnpm check && pnpm test:e2e && pnpm build
```
Expected: all PASS. Do not proceed otherwise.

- [ ] **Step 2: Verify the bundle**

```bash
ANALYZE=true pnpm build
```
Expected: the client bundle is small — the only client JS is the theme toggle, the tag filter, and the copy buttons. This is where the "no component library" decision gets **proven** rather than assumed. If a large vendor chunk appears, something pulled in a dependency that shouldn't be there.

- [ ] **Step 3: Merge to main**

```bash
git checkout main
git merge --no-ff rebuild/branding-hub -m "feat: rebuild anuragashok.com as a branding hub

Everything-as-code, applied to a person. packages/profile is the canonical
source of truth; the site is its first renderer. Six posts, four surfaces,
a working domain.

Closes the Phase 1 + 2 milestone."
git push origin main
```

- [ ] **Step 4: Update CLAUDE.md with anything learned**

If implementation surfaced gotchas not in `CLAUDE.md` (velite quirks, Vercel behaviour, Tailwind v4 surprises), add them to the Gotchas section. Future agents will thank you.

- [ ] **Step 5: Verify production one more time**

```bash
curl -sI https://anuragashok.com | head -1
curl -s https://anuragashok.com/about | grep -c "staying that way"
```
Expected: `HTTP/2 200`, and `1` — the manifest comment is live in production, which means the About page is rendering the real file.

---

## Post-implementation

Phases 3 (syndication) and 4 (identity propagation) are tracked as GitHub issues #1–#8 under milestones. Deferred surfaces are #9–#12, #14. Do not start them without a fresh brainstorm — each gets its own spec.
