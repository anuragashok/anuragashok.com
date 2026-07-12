import { defineConfig } from "velite";

// Deliberately empty: Task 4 owns the actual content collections (posts, etc.)
// wired to content/posts/*.md. This stub exists only because velite 0.4.0
// hard-fails ("config file not found") with no exit-0 fallback when no
// velite.config.ts is present at all — it does not merely warn about missing
// collections as assumed. Without this file, predev/prebuild/typecheck/test
// (all of which invoke `velite --clean` per this task's package.json,
// verbatim from the brief) cannot run, so `next dev` never starts and this
// task's own deliverable — a running dev server — is unverifiable.
// Task 4 will replace `collections: {}` with the real schema.
export default defineConfig({
  collections: {},
});
