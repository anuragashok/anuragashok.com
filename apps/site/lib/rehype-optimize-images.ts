import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";
import { POST_IMAGE_QUALITY, POST_IMAGE_WIDTHS } from "./image-sizes";

/**
 * Rewrites velite's `<img src="/static/…">` to run through Next's image optimizer,
 * with a responsive srcset and lazy loading.
 *
 * Post bodies are injected as HTML, so `next/image` (a React component) is not an
 * option. This is the equivalent for static markup: same AVIF/WebP conversion, same
 * resizing, same lazy loading. Without it, hero images ship at full size and LCP suffers.
 *
 * The widths come from `lib/image-sizes.ts` — the same constant `next.config.ts`
 * puts in `images.deviceSizes`. Emitting a width Next does not allow yields a 400
 * from the optimizer, i.e. a silently broken image. See that file.
 *
 * The FIRST image in a post is the hero, almost always the LCP element. Lazy-loading
 * it (like every other image) delays the browser from even discovering it until
 * layout/hydration is further along, which is a self-inflicted LCP regression. So the
 * first image gets `loading="eager"` + `fetchPriority="high"` (hast's camelCase for
 * the HTML `fetchpriority` attribute — see property-information's html schema);
 * every image after it stays lazy, unchanged.
 */
export function rehypeOptimizeImages() {
  return (tree: Root) => {
    // Declared INSIDE the transformer, not in `rehypeOptimizeImages`'s own scope:
    // unified calls the outer factory once (when the processor is built) and
    // reuses the returned transformer across every file it processes. State
    // hoisted into the factory's closure would leak across posts and only the
    // very first post compiled would ever get an eager hero image.
    let seenFirstImage = false;

    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img") return;

      const src = node.properties?.src;
      if (typeof src !== "string" || !src.startsWith("/static/")) return;

      const optimized = (w: number) =>
        `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${POST_IMAGE_QUALITY}`;

      const isHero = !seenFirstImage;
      seenFirstImage = true;

      node.properties.loading = isHero ? "eager" : "lazy";
      if (isHero) {
        node.properties.fetchPriority = "high";
      }
      node.properties.decoding = "async";
      node.properties.sizes = "(max-width: 42rem) 100vw, 42rem";
      node.properties.srcSet = POST_IMAGE_WIDTHS.map((w) => `${optimized(w)} ${w}w`).join(", ");
      node.properties.src = optimized(POST_IMAGE_WIDTHS[POST_IMAGE_WIDTHS.length - 1]!);
    });
  };
}
