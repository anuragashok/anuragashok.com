import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    // Build from the REPO ROOT, which is what Vercel runs: the root `build`
    // script regenerates packages/profile/src/raw.gen.ts (gitignored) before
    // building the site. Running `next build` straight from apps/site would
    // pass only because some earlier command happened to regenerate that file
    // — exactly the accident that let a broken production build ship green.
    command: "pnpm build && pnpm start",
    cwd: repoRoot,
    // A production build throws without this (see lib/site.ts). Tests run
    // against localhost, so localhost is the correct public origin here.
    env: { NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000" },
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
