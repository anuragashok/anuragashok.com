import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { profile } from "@anuragashok/profile";
import { expect, test } from "@playwright/test";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const meYaml = readFileSync(join(repoRoot, "packages", "profile", "me.yaml"), "utf8");

// Read the expected copy out of the FILE, not out of a fixture. If the headline
// in me.yaml changes and the homepage doesn't follow, this fails — which is the
// point: the hero is a renderer of the profile, not a copy of it.
const expected = (key: string) => meYaml.match(new RegExp(`^${key}:\\s*(.+?)\\s*(?:#.*)?$`, "m"))?.[1] ?? "";

test("home renders the headline FROM me.yaml, with its accent word highlighted", async ({ page }) => {
  await page.goto("/");

  const headline = expected("headline");
  expect(headline).not.toBe("");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(headline);

  // The one amber word is named by me.yaml too, not chosen by the renderer.
  await expect(page.locator("h1 em")).toHaveText(expected("headline_accent"));

  await expect(page.getByRole("link", { name: /all writing/i })).toBeVisible();
});

test("writing index lists every post, and has no tag filter", async ({ page }) => {
  await page.goto("/writing");

  await expect(page.locator("main li")).toHaveCount(5);
  await expect(page.getByRole("link", { name: "Capture response time in wiremock recordings" })).toBeVisible();

  // The tag filter is gone: 16 tags for 5 posts was a control surface longer
  // than the thing it controlled. No buttons on this page at all.
  await expect(page.locator("main button")).toHaveCount(0);
});

test("about derives its prose from me.yaml, not from hand-typed copy", async ({ page }) => {
  await page.goto("/about");

  // me.yaml says `since: 2013-02`; the page must say February 2013 because of it.
  await expect(page.getByText(/writing software since February 2013/)).toBeVisible();

  // Interpolated facts must keep the space that separates them from the prose.
  // SWC drops the leading space of a JSX text chunk that sits next to an
  // expression AND contains an HTML entity, which shipped "Fulfillment Dispatch—
  // the system" and "13years in" to the page. Nothing failed; it just read wrong.
  const prose = await page.locator("main div.max-w-\\[52ch\\]").innerText();
  expect(prose).toContain(`on ${profile.team} — the system`);
  expect(prose).toMatch(/\d+ years in, that/);
  expect(prose).not.toMatch(/\S—/); // no word jammed against an em dash
});

test("a post renders with highlighted code and prev/next", async ({ page }) => {
  await page.goto("/writing/capture-response-time-in-wiremock-recordings");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Capture response time");
  await expect(page.locator("pre.shiki").first()).toBeVisible();
  await expect(page.getByText("OLDER")).toBeVisible();
});

test("post images actually load through the optimizer", async ({ page }) => {
  // Every post image was broken in production: the srcset asked the optimizer for
  // widths that weren't in `images.deviceSizes`, so it answered 400. A 400 on an
  // <img> is a broken image and NOTHING else — the build passes, the HTML looks
  // right, and only a human looking at the page ever finds out. So: assert pixels.
  await page.goto("/writing/publishing-my-first-artifact-to-maven-central-using-github-actions");

  const img = page.locator(".prose-custom img").first();
  await img.scrollIntoViewIfNeeded();
  await expect(img).toBeVisible();

  const decoded = await img.evaluate(
    (el: HTMLImageElement) => el.decode().then(() => el.naturalWidth).catch(() => 0),
  );
  expect(decoded).toBeGreaterThan(0);
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
