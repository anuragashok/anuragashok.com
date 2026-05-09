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
