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
