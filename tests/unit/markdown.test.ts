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
