# anuragashok.com Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy `anuragashok.com` — a personal-brand site with a Markdown-driven blog (Home, About, Blog) on Next.js + Vercel.

**Architecture:** Static-first Next.js (App Router). Markdown posts in `content/posts/` are read at build time by a hand-rolled pipeline (`gray-matter` + `remark`/`rehype` + `zod` schema). Tailwind v4 + shadcn/ui for styling. Class-based dark mode. RSS, sitemap, JSON-LD, dynamic OG images. Vercel Analytics + Speed Insights. Lighthouse CI on PRs.

**Tech Stack:** Next.js (App Router, latest), TypeScript (strict), Tailwind CSS v4, shadcn/ui, `gray-matter`, `unified`/`remark`/`rehype`, `rehype-pretty-code` (Shiki), `zod`, `feed`, `@vercel/og`, Vitest, Playwright, pnpm.

**Source-of-truth spec:** `docs/superpowers/specs/2026-05-09-anuragashok-com-design.md`

---

## File Structure (target end state)

```
anuragashok.com/
├── content/posts/                       # Markdown post sources
│   └── hello-world.md
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Home
│   │   ├── about/page.tsx
│   │   ├── blog/page.tsx                # Index
│   │   ├── blog/[slug]/page.tsx
│   │   ├── tags/[tag]/page.tsx
│   │   ├── feed.xml/route.ts
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── og/[slug]/route.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                          # shadcn (button, badge, separator)
│   │   ├── site-header.tsx
│   │   ├── site-footer.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── theme-script.tsx
│   │   ├── post-card.tsx
│   │   └── tag-badge.tsx
│   └── lib/
│       ├── schema.ts                    # zod frontmatter schema
│       ├── markdown.ts                  # md -> { html, headings, readingTime }
│       ├── posts.ts                     # getAllPosts/getPost/getAllTags
│       ├── site-config.ts               # name, BASE_URL, social links
│       └── utils.ts                     # shadcn cn() helper
├── tests/
│   ├── unit/
│   │   ├── schema.test.ts
│   │   ├── markdown.test.ts
│   │   └── posts.test.ts
│   ├── fixtures/
│   │   └── posts/                       # synthetic .md files for posts.test
│   └── e2e/
│       └── smoke.spec.ts
├── .github/workflows/
│   ├── ci.yml                           # typecheck + lint + unit tests
│   └── lighthouse.yml
├── components.json                      # shadcn config (created by shadcn init)
├── eslint.config.mjs
├── next.config.ts
├── playwright.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── .nvmrc
├── .gitignore
├── package.json
└── README.md
```

**Module boundaries:**
- `lib/posts.ts` is the only filesystem reader; routes call it.
- `lib/markdown.ts` is pure (string in, structured object out); fully unit-testable with no fixtures.
- `lib/schema.ts` owns the frontmatter shape; imported by `posts.ts`.
- `lib/site-config.ts` is the single source of truth for `BASE_URL`, name, socials.
- Theme toggle is the only client component on most pages.

---

## Phase 0 — Repo bootstrap

### Task 1: Initialize Next.js app with TypeScript, Tailwind, App Router, src/ layout, pnpm

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.gitignore`, `.nvmrc`

- [ ] **Step 1: Run create-next-app**

```bash
cd /Users/anuragashok/projects/anuragashok.com
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-pnpm --yes
```

Expected: scaffolded Next.js project with Tailwind v4 wiring (`postcss.config.mjs`, `globals.css` with `@import "tailwindcss";`).

- [ ] **Step 2: Pin Node version**

Create `.nvmrc`:

```
20
```

Edit `package.json` and add an `engines` field:

```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

- [ ] **Step 3: Verify dev server boots**

Run: `pnpm dev`
Expected: server starts on http://localhost:3000 and the default Next.js page renders. Stop with Ctrl-C.

- [ ] **Step 4: Initialize git and first commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js with TypeScript and Tailwind v4"
```

---

### Task 2: Install and initialize shadcn/ui

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/separator.tsx`

- [ ] **Step 1: Run shadcn init**

```bash
pnpm dlx shadcn@latest init -y -d --base-color neutral
```

Expected: creates `components.json`, `src/lib/utils.ts` (with `cn()`), updates `globals.css` with shadcn CSS variables for both themes.

- [ ] **Step 2: Add the day-one components**

```bash
pnpm dlx shadcn@latest add button badge separator
```

Expected: writes `src/components/ui/button.tsx`, `badge.tsx`, `separator.tsx`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: initialize shadcn/ui with Button, Badge, Separator"
```

---

### Task 3: Install testing toolchain (Vitest + Playwright)

**Files:**
- Create: `vitest.config.ts`, `playwright.config.ts`, `tests/unit/sanity.test.ts`

- [ ] **Step 1: Install Vitest and supporting deps**

```bash
pnpm add -D vitest @vitest/coverage-v8 vite-tsconfig-paths
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts"],
    },
  },
});
```

- [ ] **Step 3: Install Playwright**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

- [ ] **Step 4: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm build && pnpm start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

- [ ] **Step 5: Add scripts to `package.json`**

Edit `package.json` `scripts`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "check": "pnpm typecheck && pnpm lint && pnpm test"
  }
}
```

- [ ] **Step 6: Add a sanity unit test so vitest exits 0**

Create `tests/unit/sanity.test.ts`:

```ts
import { test, expect } from "vitest";
test("sanity", () => expect(1).toBe(1));
```

- [ ] **Step 7: Verify**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: typecheck passes, lint passes, vitest reports 1 passing test.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: add Vitest and Playwright with check script"
```

---

## Phase 1 — Content pipeline (strict TDD)

### Task 4: Frontmatter schema (`src/lib/schema.ts`)

**Files:**
- Test: `tests/unit/schema.test.ts`
- Create: `src/lib/schema.ts`

- [ ] **Step 1: Install zod**

```bash
pnpm add zod
```

- [ ] **Step 2: Write the failing test**

Create `tests/unit/schema.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { PostFrontmatter } from "@/lib/schema";

describe("PostFrontmatter", () => {
  const valid = {
    title: "Hello",
    date: "2026-05-09",
    summary: "A post.",
  };

  test("accepts minimum valid frontmatter", () => {
    const parsed = PostFrontmatter.parse(valid);
    expect(parsed.title).toBe("Hello");
    expect(parsed.date).toBeInstanceOf(Date);
    expect(parsed.tags).toEqual([]);
    expect(parsed.draft).toBe(false);
  });

  test("rejects missing title", () => {
    expect(() => PostFrontmatter.parse({ ...valid, title: "" })).toThrow();
  });

  test("rejects missing summary", () => {
    expect(() => PostFrontmatter.parse({ ...valid, summary: "" })).toThrow();
  });

  test("rejects non-array tags", () => {
    expect(() => PostFrontmatter.parse({ ...valid, tags: "x" })).toThrow();
  });

  test("rejects invalid date", () => {
    expect(() => PostFrontmatter.parse({ ...valid, date: "not-a-date" })).toThrow();
  });

  test("coerces ISO string date to Date", () => {
    const parsed = PostFrontmatter.parse(valid);
    expect(parsed.date.toISOString().startsWith("2026-05-09")).toBe(true);
  });

  test("accepts optional updated", () => {
    const parsed = PostFrontmatter.parse({ ...valid, updated: "2026-05-10" });
    expect(parsed.updated).toBeInstanceOf(Date);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/schema.test.ts`
Expected: FAIL — `Cannot find module '@/lib/schema'`.

- [ ] **Step 4: Implement schema**

Create `src/lib/schema.ts`:

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

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/schema.test.ts`
Expected: 7 passing.

- [ ] **Step 6: Commit**

```bash
git add src/lib/schema.ts tests/unit/schema.test.ts package.json pnpm-lock.yaml
git commit -m "feat: add validated post frontmatter schema"
```

---

### Task 5: Markdown pipeline (`src/lib/markdown.ts`)

**Files:**
- Test: `tests/unit/markdown.test.ts`
- Create: `src/lib/markdown.ts`

- [ ] **Step 1: Install pipeline deps**

```bash
pnpm add unified remark-parse remark-gfm remark-rehype rehype-slug rehype-autolink-headings rehype-pretty-code rehype-stringify shiki unist-util-visit github-slugger
```

- [ ] **Step 2: Write the failing test**

Create `tests/unit/markdown.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  test("renders basic Markdown to HTML", async () => {
    const result = await renderMarkdown("# Hello\n\nA paragraph.");
    expect(result.html).toContain("<h1");
    expect(result.html).toContain("Hello");
    expect(result.html).toContain("<p>A paragraph.</p>");
  });

  test("adds id slugs to headings", async () => {
    const result = await renderMarkdown("## My Section");
    expect(result.html).toMatch(/id="my-section"/);
  });

  test("collects headings with depth, text, slug", async () => {
    const result = await renderMarkdown("# Top\n\n## Sub\n\n### Deep");
    expect(result.headings).toEqual([
      { depth: 1, text: "Top", slug: "top" },
      { depth: 2, text: "Sub", slug: "sub" },
      { depth: 3, text: "Deep", slug: "deep" },
    ]);
  });

  test("supports GFM tables", async () => {
    const md = "| a | b |\n|---|---|\n| 1 | 2 |";
    const result = await renderMarkdown(md);
    expect(result.html).toContain("<table>");
  });

  test("computes reading time at 200 wpm (rounded up, min 1)", async () => {
    const oneHundredWords = Array.from({ length: 100 }, () => "word").join(" ");
    const result = await renderMarkdown(oneHundredWords);
    expect(result.readingTime).toBe(1);

    const fourHundredOneWords = Array.from({ length: 401 }, () => "word").join(" ");
    const result2 = await renderMarkdown(fourHundredOneWords);
    expect(result2.readingTime).toBe(3);
  });

  test("highlights code blocks via rehype-pretty-code", async () => {
    const result = await renderMarkdown("```ts\nconst x = 1;\n```");
    expect(result.html).toMatch(/data-language="ts"/);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/markdown.test.ts`
Expected: FAIL — `Cannot find module '@/lib/markdown'`.

- [ ] **Step 4: Implement the pipeline**

Create `src/lib/markdown.ts`:

```ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";

export type Heading = { depth: number; text: string; slug: string };

export type RenderedMarkdown = {
  html: string;
  headings: Heading[];
  readingTime: number; // minutes, min 1
};

const WORDS_PER_MINUTE = 200;

function collectHeadings() {
  return (tree: unknown, file: { data: Record<string, unknown> }) => {
    const slugger = new GithubSlugger();
    const headings: Heading[] = [];
    visit(tree as never, "heading", (node: any) => {
      const text = node.children
        .filter((c: any) => c.type === "text" || c.type === "inlineCode")
        .map((c: any) => c.value)
        .join("");
      headings.push({ depth: node.depth, text, slug: slugger.slug(text) });
    });
    file.data.headings = headings;
  };
}

export async function renderMarkdown(source: string): Promise<RenderedMarkdown> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(collectHeadings)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypePrettyCode, {
      theme: { light: "github-light", dark: "github-dark" },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(source);

  const wordCount = source.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  const headings = (file.data.headings as Heading[]) ?? [];

  return { html: String(file), headings, readingTime };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run tests/unit/markdown.test.ts`
Expected: 6 passing. If the `data-language="ts"` assertion fails, log `result.html` and adjust the regex to match what `rehype-pretty-code` actually emits in your installed version.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Markdown rendering pipeline with headings and reading time"
```

---

### Task 6: Posts library (`src/lib/posts.ts`) with fixture-based tests

**Files:**
- Test: `tests/unit/posts.test.ts`
- Fixtures: `tests/fixtures/posts/*.md`
- Create: `src/lib/posts.ts`

- [ ] **Step 1: Install gray-matter**

```bash
pnpm add gray-matter
```

- [ ] **Step 2: Create test fixtures**

Create `tests/fixtures/posts/first-post.md`:

```md
---
title: "First Post"
date: 2026-01-01
summary: "Earliest."
tags: ["alpha", "beta"]
---

Body of the first post.
```

Create `tests/fixtures/posts/second-post.md`:

```md
---
title: "Second Post"
date: 2026-02-01
summary: "Middle."
tags: ["beta"]
---

Second body.
```

Create `tests/fixtures/posts/third-post.md`:

```md
---
title: "Third Post"
date: 2026-03-01
summary: "Latest."
tags: ["gamma"]
---

Third body.
```

Create `tests/fixtures/posts/draft-post.md`:

```md
---
title: "Draft"
date: 2026-04-01
summary: "Not yet."
tags: []
draft: true
---

Hidden in prod.
```

- [ ] **Step 3: Write the failing test**

Create `tests/unit/posts.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getAllPosts, getPost, getAllTags, __resetPostsCache } from "@/lib/posts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, "../fixtures/posts");
const ORIGINAL_ENV = process.env.NODE_ENV;
const ORIGINAL_CONTENT = process.env.CONTENT_DIR;

beforeEach(() => {
  process.env.CONTENT_DIR = FIXTURE_DIR;
  __resetPostsCache();
});

afterEach(() => {
  process.env.NODE_ENV = ORIGINAL_ENV;
  process.env.CONTENT_DIR = ORIGINAL_CONTENT;
  __resetPostsCache();
});

describe("getAllPosts", () => {
  test("returns posts sorted by date desc, drafts excluded in production", async () => {
    process.env.NODE_ENV = "production";
    const posts = await getAllPosts();
    expect(posts.map((p) => p.slug)).toEqual([
      "third-post",
      "second-post",
      "first-post",
    ]);
  });

  test("includes drafts in non-production", async () => {
    process.env.NODE_ENV = "development";
    const posts = await getAllPosts();
    expect(posts.map((p) => p.slug)).toContain("draft-post");
  });

  test("each post exposes slug, frontmatter, raw body, html", async () => {
    process.env.NODE_ENV = "production";
    const posts = await getAllPosts();
    const first = posts.find((p) => p.slug === "first-post")!;
    expect(first.frontmatter.title).toBe("First Post");
    expect(first.body).toContain("Body of the first post");
    expect(first.html).toContain("<p>Body of the first post.</p>");
    expect(first.readingTime).toBeGreaterThanOrEqual(1);
  });
});

describe("getPost", () => {
  test("returns a single post by slug", async () => {
    process.env.NODE_ENV = "production";
    const post = await getPost("first-post");
    expect(post?.frontmatter.title).toBe("First Post");
  });

  test("returns null for unknown slug", async () => {
    process.env.NODE_ENV = "production";
    const post = await getPost("does-not-exist");
    expect(post).toBeNull();
  });

  test("returns null for draft post in production", async () => {
    process.env.NODE_ENV = "production";
    const post = await getPost("draft-post");
    expect(post).toBeNull();
  });
});

describe("getAllTags", () => {
  test("returns tags with counts, deduped, drafts excluded in production", async () => {
    process.env.NODE_ENV = "production";
    const tags = await getAllTags();
    expect(tags).toEqual(
      expect.arrayContaining([
        { tag: "alpha", count: 1 },
        { tag: "beta", count: 2 },
        { tag: "gamma", count: 1 },
      ]),
    );
    expect(tags.length).toBe(3);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/posts.test.ts`
Expected: FAIL — `Cannot find module '@/lib/posts'`.

- [ ] **Step 5: Implement `src/lib/posts.ts`**

```ts
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { PostFrontmatter, type PostFrontmatter as PostFrontmatterT } from "@/lib/schema";
import { renderMarkdown, type Heading } from "@/lib/markdown";

export type Post = {
  slug: string;
  frontmatter: PostFrontmatterT;
  body: string;
  html: string;
  headings: Heading[];
  readingTime: number;
};

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function contentDir(): string {
  return process.env.CONTENT_DIR ?? path.join(process.cwd(), "content/posts");
}

let cache: Promise<Post[]> | null = null;
let cacheKey = "";

export function __resetPostsCache(): void {
  cache = null;
  cacheKey = "";
}

async function loadAll(): Promise<Post[]> {
  const dir = contentDir();
  const entries = await fs.readdir(dir);
  const mdFiles = entries.filter((f) => f.endsWith(".md"));

  const posts = await Promise.all(
    mdFiles.map(async (filename) => {
      const slug = filename.replace(/\.md$/, "");
      if (!SLUG_RE.test(slug)) {
        throw new Error(
          `Invalid slug "${slug}" in ${path.join(dir, filename)}: must be kebab-case`,
        );
      }
      const filePath = path.join(dir, filename);
      const raw = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(raw);

      const parsed = PostFrontmatter.safeParse(data);
      if (!parsed.success) {
        throw new Error(
          `Invalid frontmatter in ${filePath}:\n${parsed.error.toString()}`,
        );
      }

      const rendered = await renderMarkdown(content);

      return {
        slug,
        frontmatter: parsed.data,
        body: content,
        html: rendered.html,
        headings: rendered.headings,
        readingTime: rendered.readingTime,
      } satisfies Post;
    }),
  );

  return posts.sort(
    (a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime(),
  );
}

function getCached(): Promise<Post[]> {
  const key = `${contentDir()}|${process.env.NODE_ENV ?? ""}`;
  if (!cache || cacheKey !== key) {
    cacheKey = key;
    cache = loadAll();
  }
  return cache;
}

function isPublished(p: Post): boolean {
  if (process.env.NODE_ENV === "production" && p.frontmatter.draft) return false;
  return true;
}

export async function getAllPosts(): Promise<Post[]> {
  const all = await getCached();
  return all.filter(isPublished);
}

export async function getPost(slug: string): Promise<Post | null> {
  const all = await getAllPosts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const all = await getAllPosts();
  const counts = new Map<string, number>();
  for (const p of all) {
    for (const t of p.frontmatter.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()].map(([tag, count]) => ({ tag, count }));
}
```

- [ ] **Step 6: Run tests**

Run: `pnpm vitest run tests/unit/posts.test.ts`
Expected: 7 passing.

- [ ] **Step 7: Run full suite**

Run: `pnpm test`
Expected: schema, markdown, posts, sanity all green.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add posts library reading Markdown from content/posts"
```

---

## Phase 2 — Layout, theming, chrome

### Task 7: Site config module

**Files:**
- Create: `src/lib/site-config.ts`

- [ ] **Step 1: Create `src/lib/site-config.ts`**

```ts
export const siteConfig = {
  name: "Anurag Ashok",
  tagline: "Software engineer. Notes from the work.",
  description:
    "Personal site and engineering blog of Anurag Ashok.",
  url:
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.BASE_URL ??
    "http://localhost:3000",
  social: {
    github: "https://github.com/anuragashok",
    x: "https://x.com/anuragashok",
    email: "mailto:hello@anuragashok.com",
  },
  rss: "/feed.xml",
} as const;

export type SiteConfig = typeof siteConfig;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/site-config.ts
git commit -m "feat: add site-config as single source of truth for URLs and socials"
```

> **Note:** the user will supply final values (X handle, email, tagline) when wiring up content. Defaults above are placeholders that don't break the build.

---

### Task 8: Theme bootstrap (no-FOUC inline script)

**Files:**
- Create: `src/components/theme-script.tsx`

- [ ] **Step 1: Create `src/components/theme-script.tsx`**

```tsx
const SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var dark = stored ? stored === "dark" : prefersDark;
    if (dark) document.documentElement.classList.add("dark");
  } catch (_) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/theme-script.tsx
git commit -m "feat: add inline theme bootstrap script (no FOUC)"
```

---

### Task 9: Site header, footer, and theme toggle

**Files:**
- Create: `src/components/site-header.tsx`, `src/components/site-footer.tsx`, `src/components/theme-toggle.tsx`
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Install lucide-react for the toggle icon**

```bash
pnpm add lucide-react
```

- [ ] **Step 2: Create `src/components/theme-toggle.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {mounted ? (dark ? <Sun className="size-4" /> : <Moon className="size-4" />) : null}
    </Button>
  );
}
```

- [ ] **Step 3: Create `src/components/site-header.tsx`**

```tsx
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/blog" className="hover:underline">Blog</Link>
          <Link href="/about" className="hover:underline">About</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create `src/components/site-footer.tsx`**

```tsx
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>© {year} {siteConfig.name}</span>
        <nav className="flex gap-4">
          <Link href={siteConfig.social.github}>GitHub</Link>
          <Link href={siteConfig.social.x}>X</Link>
          <Link href={siteConfig.rss}>RSS</Link>
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Wire root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  alternates: {
    types: { "application/rss+xml": [{ url: siteConfig.rss, title: siteConfig.name }] },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl px-4 py-10">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Replace default home page with a placeholder so the build is green**

Replace `src/app/page.tsx`:

```tsx
export default function HomePage() {
  return <p>Coming soon.</p>;
}
```

- [ ] **Step 7: Verify build and dev server**

```bash
pnpm typecheck
pnpm build
pnpm dev
```

Open http://localhost:3000. Expected: header with name + Blog/About/toggle, "Coming soon.", footer. Toggle flips the dark class on `<html>` and persists across reload.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add header, footer, theme toggle and root layout"
```

---

## Phase 3 — Pages

### Task 10: Home page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement Home**

Replace `src/app/page.tsx`:

```tsx
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export default async function HomePage() {
  const latest = (await getAllPosts()).slice(0, 5);
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{siteConfig.name}</h1>
        <p className="text-muted-foreground">{siteConfig.tagline}</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Latest writing</h2>
        <ul className="space-y-3">
          {latest.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="font-medium hover:underline">
                {p.frontmatter.title}
              </Link>
              <p className="text-sm text-muted-foreground">{p.frontmatter.summary}</p>
            </li>
          ))}
        </ul>
        <Link href="/blog" className="text-sm hover:underline">All posts →</Link>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm dev`
Expected: home page shows name, tagline, "All posts" link. With no posts yet, the `<ul>` is empty — no error. Note: `getAllPosts()` will throw if `content/posts` does not exist; if so, create the directory: `mkdir -p content/posts`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add home page with latest posts"
```

---

### Task 11: Tailwind Typography plugin (used by About + post pages)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Install plugin**

```bash
pnpm add -D @tailwindcss/typography
```

- [ ] **Step 2: Activate the plugin in `globals.css`**

In `src/app/globals.css`, after the existing `@import "tailwindcss";` line, add:

```css
@plugin "@tailwindcss/typography";
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: add Tailwind Typography plugin"
```

---

### Task 12: About page

**Files:**
- Create: `src/app/about/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.name}.`,
};

export default function AboutPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>About</h1>
      <p>
        I&apos;m {siteConfig.name}, a software engineer. This site is where I write
        about the work.
      </p>
      <h2>Now</h2>
      <p>
        Currently focused on <em>(supplied at content time)</em>.
      </p>
      <h2>Contact</h2>
      <ul>
        <li><a href={siteConfig.social.github}>GitHub</a></li>
        <li><a href={siteConfig.social.x}>X</a></li>
        <li><a href={siteConfig.social.email}>Email</a></li>
      </ul>
    </article>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm dev`. Open http://localhost:3000/about. Expected: prose-styled About page with the placeholder copy.

- [ ] **Step 3: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: add About page"
```

---

### Task 13: Blog index, PostCard, TagBadge

**Files:**
- Create: `src/app/blog/page.tsx`, `src/components/post-card.tsx`, `src/components/tag-badge.tsx`

- [ ] **Step 1: Create `src/components/tag-badge.tsx`**

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function TagBadge({ tag }: { tag: string }) {
  return (
    <Link href={`/tags/${tag}`}>
      <Badge variant="secondary">{tag}</Badge>
    </Link>
  );
}
```

- [ ] **Step 2: Create `src/components/post-card.tsx`**

```tsx
import Link from "next/link";
import type { Post } from "@/lib/posts";
import { TagBadge } from "@/components/tag-badge";

export function PostCard({ post }: { post: Post }) {
  const date = post.frontmatter.date.toISOString().slice(0, 10);
  return (
    <article className="space-y-1">
      <Link href={`/blog/${post.slug}`} className="font-medium hover:underline">
        {post.frontmatter.title}
      </Link>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <time dateTime={post.frontmatter.date.toISOString()}>{date}</time>
        <span>·</span>
        <span>{post.readingTime} min read</span>
      </div>
      <p className="text-sm text-muted-foreground">{post.frontmatter.summary}</p>
      {post.frontmatter.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {post.frontmatter.tags.map((t) => (
            <TagBadge key={t} tag={t} />
          ))}
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 3: Create `src/app/blog/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/post-card";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((p) => (
            <li key={p.slug}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Open `/blog`. Expected: empty-state message ("No posts yet."), since we haven't authored real posts yet.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add blog index page with PostCard and TagBadge"
```

---

### Task 14: Single post page

**Files:**
- Create: `src/app/blog/[slug]/page.tsx`

- [ ] **Step 1: Implement the page**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";
import { TagBadge } from "@/components/tag-badge";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.summary,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
      url: `${siteConfig.url}/blog/${slug}`,
      type: "article",
      publishedTime: post.frontmatter.date.toISOString(),
      modifiedTime: post.frontmatter.updated?.toISOString(),
      images: [{ url: `${siteConfig.url}/og/${slug}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
      images: [`${siteConfig.url}/og/${slug}`],
    },
  };
}

export default async function PostPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontmatter.title,
    description: post.frontmatter.summary,
    datePublished: post.frontmatter.date.toISOString(),
    dateModified: (post.frontmatter.updated ?? post.frontmatter.date).toISOString(),
    author: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: `${siteConfig.url}/blog/${slug}`,
    image: `${siteConfig.url}/og/${slug}`,
  };

  return (
    <article className="prose dark:prose-invert max-w-none">
      <header className="not-prose mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {post.frontmatter.title}
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <time dateTime={post.frontmatter.date.toISOString()}>
            {post.frontmatter.date.toISOString().slice(0, 10)}
          </time>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>
        {post.frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.frontmatter.tags.map((t) => (
              <TagBadge key={t} tag={t} />
            ))}
          </div>
        )}
      </header>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/blog/[slug]/page.tsx
git commit -m "feat: add post page with metadata, OG, and JSON-LD"
```

---

### Task 15: Tag page

**Files:**
- Create: `src/app/tags/[tag]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { PostCard } from "@/components/post-card";

type Params = { tag: string };

export async function generateStaticParams(): Promise<Params[]> {
  const tags = await getAllTags();
  return tags.map((t) => ({ tag: t.tag }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { tag } = await params;
  return { title: `Tag: ${tag}` };
}

export default async function TagPage({ params }: { params: Promise<Params> }) {
  const { tag } = await params;
  const all = await getAllPosts();
  const matching = all.filter((p) => p.frontmatter.tags.includes(tag));
  if (matching.length === 0) notFound();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">#{tag}</h1>
      <ul className="space-y-6">
        {matching.map((p) => (
          <li key={p.slug}><PostCard post={p} /></li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/tags/[tag]/page.tsx
git commit -m "feat: add tag listing page"
```

---

### Task 16: 404 page

**Files:**
- Create: `src/app/not-found.tsx`

- [ ] **Step 1: Implement**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Not found</h1>
      <p className="text-muted-foreground">
        That page doesn&apos;t exist (anymore).
      </p>
      <Link href="/" className="hover:underline">← Home</Link>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/not-found.tsx
git commit -m "feat: branded 404 page"
```

---

## Phase 4 — Discovery: sitemap, robots, RSS, OG

### Task 17: Sitemap

**Files:**
- Create: `src/app/sitemap.ts`

- [ ] **Step 1: Implement**

```ts
import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const posts = await getAllPosts();
  const tags = await getAllTags();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
  ];

  const postEntries = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.frontmatter.updated ?? p.frontmatter.date,
  }));

  const tagEntries = tags.map((t) => ({
    url: `${base}/tags/${t.tag}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...postEntries, ...tagEntries];
}
```

- [ ] **Step 2: Verify**

```bash
pnpm build
```

Expected: Next reports `/sitemap.xml` as a generated route.

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat: generate sitemap.xml from posts and tags"
```

---

### Task 18: robots.txt

**Files:**
- Create: `src/app/robots.ts`

- [ ] **Step 1: Implement**

```ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/robots.ts
git commit -m "feat: emit robots.txt with sitemap reference"
```

---

### Task 19: RSS feed

**Files:**
- Create: `src/app/feed.xml/route.ts`

- [ ] **Step 1: Install feed library**

```bash
pnpm add feed
```

- [ ] **Step 2: Implement the route**

```ts
import { Feed } from "feed";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

export async function GET() {
  const posts = (await getAllPosts()).slice(0, 30);

  const feed = new Feed({
    title: siteConfig.name,
    description: siteConfig.description,
    id: siteConfig.url,
    link: siteConfig.url,
    language: "en",
    favicon: `${siteConfig.url}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} ${siteConfig.name}`,
    feedLinks: { rss2: `${siteConfig.url}/feed.xml` },
    author: { name: siteConfig.name, link: siteConfig.url },
  });

  for (const post of posts) {
    feed.addItem({
      title: post.frontmatter.title,
      id: `${siteConfig.url}/blog/${post.slug}`,
      link: `${siteConfig.url}/blog/${post.slug}`,
      description: post.frontmatter.summary,
      content: post.html,
      date: post.frontmatter.date,
      category: post.frontmatter.tags.map((t) => ({ name: t })),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: emit RSS 2.0 feed at /feed.xml"
```

---

### Task 20: Dynamic OG image route

**Files:**
- Create: `src/app/og/[slug]/route.tsx`
- Modify: `src/app/page.tsx` (Home metadata)

- [ ] **Step 1: Create the route**

```tsx
import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Params = { slug: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const post = slug === "default" ? null : await getPost(slug);

  const title = post?.frontmatter.title ?? siteConfig.name;
  const subtitle = post?.frontmatter.summary ?? siteConfig.tagline;
  const date = post?.frontmatter.date.toISOString().slice(0, 10) ?? "";

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
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.7 }}>{siteConfig.name}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ fontSize: 32, opacity: 0.8, lineHeight: 1.3 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.6 }}>{date}</div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 2: Add Home metadata referencing the default OG**

Edit `src/app/page.tsx` to insert at top of file (above the existing imports if needed):

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "Anurag Ashok",
    description: "Personal site and engineering blog of Anurag Ashok.",
    url: "/",
    images: [{ url: "/og/default" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/default"],
  },
};
```

(Place this metadata export **above** the `export default async function HomePage()`.)

- [ ] **Step 3: Verify**

```bash
pnpm dev
```

Open http://localhost:3000/og/default. Expected: 1200×630 PNG with site name.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add dynamic OG image route and Home metadata"
```

---

## Phase 5 — Analytics, content, deploy

### Task 21: Vercel Analytics + Speed Insights

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Install packages**

```bash
pnpm add @vercel/analytics @vercel/speed-insights
```

- [ ] **Step 2: Mount in root layout**

In `src/app/layout.tsx`, add the imports:

```tsx
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
```

And add `<Analytics />` and `<SpeedInsights />` inside `<body>` after `<SiteFooter />`:

```tsx
<SiteHeader />
<main className="mx-auto w-full max-w-2xl px-4 py-10">{children}</main>
<SiteFooter />
<Analytics />
<SpeedInsights />
```

- [ ] **Step 3: Build & verify**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: enable Vercel Analytics and Speed Insights"
```

---

### Task 22: Author the first post and write smoke tests

**Files:**
- Create: `content/posts/hello-world.md`
- Create: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write `content/posts/hello-world.md`**

```md
---
title: "Hello, world"
date: 2026-05-09
summary: "First post on anuragashok.com — a few words about why this site exists."
tags: ["meta"]
---

This is the first post on the site. More to come.

## What's here

- Engineering notes
- Project write-ups
- The occasional opinion

```ts
const greeting = "hi";
console.log(greeting);
```
```

- [ ] **Step 2: Write the smoke test**

Create `tests/e2e/smoke.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("home page renders with site name", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/.+/);
  await expect(page.getByRole("link", { name: /blog/i }).first()).toBeVisible();
});

test("blog index lists hello-world", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("link", { name: /hello, world/i })).toBeVisible();
});

test("hello-world post renders", async ({ page }) => {
  await page.goto("/blog/hello-world");
  await expect(page.getByRole("heading", { name: "Hello, world" })).toBeVisible();
  await expect(page.getByText("first post on the site")).toBeVisible();
});

test("rss feed serves valid xml with the post", async ({ request }) => {
  const res = await request.get("/feed.xml");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("xml");
  const body = await res.text();
  expect(body).toContain("<rss");
  expect(body).toContain("Hello, world");
});

test("sitemap contains the post URL", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain("/blog/hello-world");
});

test("theme toggle flips dark class and persists", async ({ page }) => {
  await page.goto("/");
  const before = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  await page.getByRole("button", { name: /switch to (light|dark) theme/i }).click();
  if (before) {
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  } else {
    await expect(page.locator("html")).toHaveClass(/dark/);
  }
  await page.reload();
  const after = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  expect(after).toBe(!before);
});
```

- [ ] **Step 3: Run the smoke test**

```bash
pnpm test:e2e
```

Expected: all 6 tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: first post and end-to-end smoke tests"
```

---

### Task 23: GitHub Actions — `ci.yml`

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the workflow**

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm check

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add typecheck/lint/test and Playwright workflows"
```

---

### Task 24: Vercel deploy

**This task touches shared/external state — confirm with the user before each substep.**

- [ ] **Step 1: Push to GitHub** (requires user confirmation)

```bash
gh repo create anuragashok/anuragashok.com --public --source=. --remote=origin --push
```

- [ ] **Step 2: Import the repo in Vercel** (manual)

In the Vercel dashboard: **Add New → Project → Import Git Repository → anuragashok/anuragashok.com**.
- Framework: Next.js (auto-detected).
- Build command: `pnpm build`.
- Install command: `pnpm install --frozen-lockfile`.
- Root directory: `.`

- [ ] **Step 3: Set environment variables in Vercel**

Production:
- `NEXT_PUBLIC_BASE_URL=https://anuragashok.com`

- [ ] **Step 4: Configure custom domain**

In Vercel **Domains**: add `anuragashok.com` (apex) and `www.anuragashok.com`. Configure the redirect from `www` → apex via Vercel's domain settings. Update DNS at the registrar per Vercel's instructions.

- [ ] **Step 5: Enable Vercel Analytics + Speed Insights**

In project settings: toggle on **Analytics** and **Speed Insights**.

- [ ] **Step 6: Verify the live site**

Visit `https://anuragashok.com`. Expected: Home page renders with the first post, dark mode works, `/feed.xml` returns XML, `/og/default` returns a PNG.

---

### Task 25: Lighthouse CI

**Files:**
- Create: `.github/workflows/lighthouse.yml`, `.lighthouserc.json`

- [ ] **Step 1: Create `.lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "url": [
        "https://anuragashok.com/",
        "https://anuragashok.com/about",
        "https://anuragashok.com/blog",
        "https://anuragashok.com/blog/hello-world"
      ],
      "numberOfRuns": 2
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

- [ ] **Step 2: Create `.github/workflows/lighthouse.yml`**

```yaml
name: Lighthouse
on:
  pull_request:
  workflow_dispatch:

jobs:
  lhci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm install -g @lhci/cli@0.14.x
      - run: lhci autorun
```

> Note: this targets the production URL. If you want it against Vercel preview URLs per PR, switch to `treosh/lighthouse-ci-action` with `urls:` derived from the deployment URL — out of scope for v1.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "ci: enforce Lighthouse score budgets on production"
```

---

### Task 26: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write the README**

```md
# anuragashok.com

Personal site and blog. Next.js (App Router), Tailwind v4, shadcn/ui, deployed on Vercel.

## Local development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Writing a post

Add a Markdown file under `content/posts/`. Filename = slug (kebab-case).

```md
---
title: "Title"
date: 2026-05-09
summary: "Short blurb."
tags: ["topic"]
---

Body…
```

`draft: true` excludes the post from production builds but shows it in `pnpm dev`.

## Scripts

- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm check` — typecheck + lint + unit tests
- `pnpm test:e2e` — Playwright smoke tests against `pnpm build && pnpm start`
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

## Self-review checklist (post-write, by plan author)

- ✅ **Spec §2 stack** — Next.js, TS, Tailwind v4, shadcn, Markdown pipeline, zod, Vercel, pnpm: covered in Tasks 1, 2, 4–6, 11.
- ✅ **Spec §3 directory layout** — matches end-state listed at top of plan.
- ✅ **Spec §4 content model & validation** — Tasks 4 (schema) and 6 (filesystem reader, slug regex, draft handling, error path).
- ✅ **Spec §5 Markdown pipeline** — Task 5 includes all listed unified plugins.
- ✅ **Spec §6 routes** — Home (10), About (12), Blog index (13), Post (14), Tags (15), 404 (16), feed.xml (19), sitemap (17), robots (18), OG (20).
- ✅ **Spec §7 theming + SEO + JSON-LD + OG** — Tasks 8 (no-FOUC script), 9 (toggle), 14 (per-post metadata + JSON-LD), 17/18 (sitemap+robots), 20 (OG).
- ✅ **Spec §8 RSS, Analytics, deploy** — Tasks 19, 21, 24.
- ✅ **Spec §9 tooling** (TS strict, ESLint, Prettier, pnpm, `check`) — Tasks 1, 3.
- ✅ **Spec §10 testing** (unit + smoke + Lighthouse) — Tasks 4–6, 22, 23, 25.
- ✅ **Spec §11 user-supplied content** — flagged in Task 7 (placeholders) and Task 22 (first post is starter copy the user can rewrite).
- ✅ **Spec §13 future work** — Projects/search/MDX intentionally not in this plan.

**Type/method consistency:**
- `getAllPosts()`, `getPost(slug)`, `getAllTags()` used identically across Tasks 6, 10, 13, 14, 15, 17, 19, 20.
- `Post` type fields (`slug`, `frontmatter`, `body`, `html`, `headings`, `readingTime`) consistent in Tasks 6, 13, 14.
- `siteConfig` shape (name, tagline, description, url, social.{github,x,email}, rss) used identically in Tasks 7, 8 (script — no use), 9 (header/footer), 10, 11 (no use), 12, 14, 17, 18, 19, 20.

**Placeholder scan:** no "TBD", "TODO", "implement later" inside steps. Two intentional `(supplied at content time)` placeholders are in *user-facing* page copy (About body, Home tagline) and are explicit; they don't block the build.
