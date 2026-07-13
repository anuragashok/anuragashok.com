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
 */
export function rehypeOptimizeImages() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img") return;

      const src = node.properties?.src;
      if (typeof src !== "string" || !src.startsWith("/static/")) return;

      const optimized = (w: number) =>
        `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${POST_IMAGE_QUALITY}`;

      node.properties.loading = "lazy";
      node.properties.decoding = "async";
      node.properties.sizes = "(max-width: 42rem) 100vw, 42rem";
      node.properties.srcSet = POST_IMAGE_WIDTHS.map((w) => `${optimized(w)} ${w}w`).join(", ");
      node.properties.src = optimized(POST_IMAGE_WIDTHS[POST_IMAGE_WIDTHS.length - 1]!);
    });
  };
}
