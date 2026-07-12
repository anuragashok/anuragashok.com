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
