import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

const WIDTHS = [640, 960, 1280];
const QUALITY = 75;

/**
 * Rewrites velite's `<img src="/static/…">` to run through Next's image optimizer,
 * with a responsive srcset and lazy loading.
 *
 * Post bodies are injected as HTML, so `next/image` (a React component) is not an
 * option. This is the equivalent for static markup: same AVIF/WebP conversion, same
 * resizing, same lazy loading. Without it, hero images ship at full size and LCP suffers.
 */
export function rehypeOptimizeImages() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img") return;

      const src = node.properties?.src;
      if (typeof src !== "string" || !src.startsWith("/static/")) return;

      const optimized = (w: number) =>
        `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${QUALITY}`;

      node.properties.loading = "lazy";
      node.properties.decoding = "async";
      node.properties.sizes = "(max-width: 42rem) 100vw, 42rem";
      node.properties.srcSet = WIDTHS.map((w) => `${optimized(w)} ${w}w`).join(", ");
      node.properties.src = optimized(WIDTHS[WIDTHS.length - 1]!);
    });
  };
}
