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
