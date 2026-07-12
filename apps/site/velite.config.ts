import rehypeShiki from "@shikijs/rehype";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { defineCollection, defineConfig, s } from "velite";

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.md",
  schema: s.object({
    title: s.string().max(120),
    slug: s.path().transform((p) => p.replace(/^posts\//, "")),
    date: s.isodate(),
    summary: s.string().max(400),
    tags: s.array(s.string()).default([]),
    draft: s.boolean().default(false),
    toc: s.toc(),
    metadata: s.metadata(),
    content: s.markdown(),
  }),
});

export default defineConfig({
  // Content lives at the REPO ROOT, not inside the app. It is Anurag's, not the site's.
  // `root` is resolved relative to this config file.
  root: "../../content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:8].[ext]",
    clean: true,
  },
  collections: { posts },
  markdown: {
    rehypePlugins: [
      // rehype-slug MUST come first: velite's s.toc() emits anchor URLs but adds no
      // heading ids of its own. Without this, every TOC link is dead.
      rehypeSlug,
      // Structural-typing clash between @shikijs/rehype's
      // Plugin<[RehypeShikiOptions], Root> and velite's PluggableList: unified's
      // `this: Processor` generic resolves to two nominally distinct `Settings`
      // types across the two packages' type graphs even though both point at
      // the same unified@11.0.5 install. Purely a type-level mismatch — runtime
      // behavior is unaffected. Remove the suppression below (and re-check)
      // next time @shikijs/rehype or unified is upgraded.
      [
        // @ts-expect-error — see structural-typing clash note above.
        rehypeShiki,
        {
          themes: { light: "github-light", dark: "github-dark" },
          // Emit CSS vars only — required for the class-based dark mode strategy.
          defaultColor: false,
        },
      ],
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
});
