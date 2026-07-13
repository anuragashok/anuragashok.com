import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "#velite": fileURLToPath(new URL("./.velite", import.meta.url)),
    },
  },
  // Next requires `"jsx": "preserve"` in tsconfig (it owns the JSX transform),
  // which leaves Vite refusing to parse any .tsx a test imports — e.g. the
  // Headline component, which is server-rendered to a string in
  // tests/unit/headline.test.ts. Vitest has no Next pipeline, so it needs the
  // JSX runtime named here. This overrides tsconfig for the test run only.
  oxc: { jsx: { runtime: "automatic" } },
  test: { environment: "node", include: ["tests/unit/**/*.test.ts"] },
});
