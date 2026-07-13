import { describe, expect, it } from "vitest";
import { absolutizeHtml } from "@/lib/absolutize-html";

const BASE = "https://anuragashok.com";

describe("absolutizeHtml", () => {
  it("rewrites an optimizer URL to the absolute original static asset", () => {
    const html =
      '<img src="/_next/image?url=%2Fstatic%2Ffoo-abc123.jpg&#x26;w=1280&#x26;q=75" alt="x">';
    expect(absolutizeHtml(html, BASE)).toBe('<img src="https://anuragashok.com/static/foo-abc123.jpg" alt="x">');
  });

  it("strips srcset and sizes from feed images", () => {
    const html =
      '<img src="/_next/image?url=%2Fstatic%2Ffoo-abc123.jpg&#x26;w=1280&#x26;q=75" ' +
      'sizes="(max-width: 42rem) 100vw, 42rem" ' +
      'srcset="/_next/image?url=%2Fstatic%2Ffoo-abc123.jpg&#x26;w=640&#x26;q=75 640w, ' +
      '/_next/image?url=%2Fstatic%2Ffoo-abc123.jpg&#x26;w=1280&#x26;q=75 1280w" ' +
      'alt="x">';
    const result = absolutizeHtml(html, BASE);
    expect(result).not.toContain("srcset");
    expect(result).not.toContain("sizes");
  });

  it("makes a root-relative <a href> absolute", () => {
    const html = '<a href="/writing/x">next post</a>';
    expect(absolutizeHtml(html, BASE)).toBe('<a href="https://anuragashok.com/writing/x">next post</a>');
  });

  it("leaves an already-absolute link untouched", () => {
    const html = '<a href="https://github.com/anuragashok">GitHub</a>';
    expect(absolutizeHtml(html, BASE)).toBe(html);
  });

  it("leaves a fragment link untouched", () => {
    const html = '<a href="#some-heading">Some heading</a>';
    expect(absolutizeHtml(html, BASE)).toBe(html);
  });

  it("leaves a non-optimizer root-relative img src as a plain absolutized path", () => {
    const html = '<img src="/static/foo-abc123.jpg" alt="x">';
    expect(absolutizeHtml(html, BASE)).toBe('<img src="https://anuragashok.com/static/foo-abc123.jpg" alt="x">');
  });

  it("leaves protocol-relative and non-http-scheme URLs untouched", () => {
    const html =
      '<a href="//cdn.example.com/x">cdn</a><a href="mailto:hi@example.com">mail</a>';
    expect(absolutizeHtml(html, BASE)).toBe(html);
  });

  it("handles multiple images and links in the same document, preserving order and surrounding text", () => {
    const html =
      '<p><img src="/_next/image?url=%2Fstatic%2Fa-111.jpg&#x26;w=1280&#x26;q=75" alt="a"></p>' +
      '<p>See <a href="/writing/other-post">this post</a> or <a href="https://example.com">this one</a>.</p>';
    const result = absolutizeHtml(html, BASE);
    expect(result).toBe(
      '<p><img src="https://anuragashok.com/static/a-111.jpg" alt="a"></p>' +
        '<p>See <a href="https://anuragashok.com/writing/other-post">this post</a> or <a href="https://example.com">this one</a>.</p>',
    );
  });

  it("is a no-op on HTML with no root-relative URLs", () => {
    const html = "<p>Just text with <a href=\"https://example.com\">a link</a>.</p>";
    expect(absolutizeHtml(html, BASE)).toBe(html);
  });

  it("strips a trailing slash on baseUrl before joining", () => {
    const html = '<a href="/writing/x">next post</a>';
    expect(absolutizeHtml(html, "https://anuragashok.com/")).toBe(
      '<a href="https://anuragashok.com/writing/x">next post</a>',
    );
  });

  it("rewrites an <img> whose alt text contains an unescaped '>' without corrupting the tag", () => {
    // hast-util-to-html escapes '&' and '"' in attribute values but NOT '>' (spec-compliant), so
    // human-authored alt text like `![Before -> after](./img/x.png)` produces a literal '>' inside
    // a quoted attribute. The old `[^>]*` tag regex truncates the match at that '>', corrupting the
    // tag and everything up to the next literal '>'.
    const html = '<p><img alt="Before -> after" src="/static/diagram-abc123.png"></p>';
    expect(absolutizeHtml(html, BASE)).toBe(
      '<p><img alt="Before -> after" src="https://anuragashok.com/static/diagram-abc123.png"></p>',
    );
  });

  it("rewrites an <a> whose title attribute contains an unescaped '>' without corrupting the tag", () => {
    const html = '<p><a title="See: step 1 -> step 2" href="/writing/x">next post</a></p>';
    expect(absolutizeHtml(html, BASE)).toBe(
      '<p><a title="See: step 1 -> step 2" href="https://anuragashok.com/writing/x">next post</a></p>',
    );
  });

  it("handles single-quoted attribute values", () => {
    const html = "<p><img alt='Before -> after' src='/static/diagram-abc123.png'></p>";
    expect(absolutizeHtml(html, BASE)).toBe(
      "<p><img alt='Before -> after' src=\"https://anuragashok.com/static/diagram-abc123.png\"></p>",
    );
  });

  it("does not throw on a malformed percent-encoded optimizer URL and leaves the src usable", () => {
    const html = '<img src="/_next/image?url=%E0%A4%A&w=640&q=75" alt="x">';
    expect(() => absolutizeHtml(html, BASE)).not.toThrow();
    const result = absolutizeHtml(html, BASE);
    // Degrades gracefully: falls back to absolutizing the raw (still root-relative) optimizer URL
    // rather than crashing the whole feed over one bad image.
    expect(result).toBe(
      '<img src="https://anuragashok.com/_next/image?url=%E0%A4%A&amp;w=640&amp;q=75" alt="x">',
    );
  });
});
