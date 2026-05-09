import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getAllPosts, getPost, getAllTags, __resetPostsCache } from "@/lib/posts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, "../fixtures/posts");

beforeEach(() => {
  vi.stubEnv("CONTENT_DIR", FIXTURE_DIR);
  __resetPostsCache();
});

afterEach(() => {
  vi.unstubAllEnvs();
  __resetPostsCache();
});

describe("getAllPosts", () => {
  test("returns posts sorted by date desc, drafts excluded in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const posts = await getAllPosts();
    expect(posts.map((p) => p.slug)).toEqual([
      "third-post",
      "second-post",
      "first-post",
    ]);
  });

  test("includes drafts in non-production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const posts = await getAllPosts();
    expect(posts.map((p) => p.slug)).toContain("draft-post");
  });

  test("each post exposes slug, frontmatter, raw body, html", async () => {
    vi.stubEnv("NODE_ENV", "production");
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
    vi.stubEnv("NODE_ENV", "production");
    const post = await getPost("first-post");
    expect(post?.frontmatter.title).toBe("First Post");
  });

  test("returns null for unknown slug", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const post = await getPost("does-not-exist");
    expect(post).toBeNull();
  });

  test("returns null for draft post in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const post = await getPost("draft-post");
    expect(post).toBeNull();
  });
});

describe("getAllTags", () => {
  test("returns tags with counts, deduped, drafts excluded in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
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
