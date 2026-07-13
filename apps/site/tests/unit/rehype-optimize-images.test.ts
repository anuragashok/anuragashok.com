import type { Element, Root } from "hast";
import { describe, expect, it } from "vitest";
import { rehypeOptimizeImages } from "@/lib/rehype-optimize-images";

/**
 * Builds a minimal hast tree containing the given `<img src="/static/…">`
 * elements, in document order, each wrapped in its own paragraph — close
 * enough to what velite hands the plugin after markdown->hast.
 */
function treeWithImages(srcs: string[]): Root {
  return {
    type: "root",
    children: srcs.map(
      (src): Element => ({
        type: "element",
        tagName: "img",
        properties: { src },
        children: [],
      }),
    ),
  };
}

function imagesOf(tree: Root): Element[] {
  return tree.children.filter((n): n is Element => n.type === "element" && n.tagName === "img");
}

describe("rehypeOptimizeImages", () => {
  it("makes the FIRST image in a document eager + high fetchpriority, and leaves later images lazy with no fetchpriority", () => {
    const tree = treeWithImages(["/static/hero-aaaaaaaa.jpg", "/static/second-bbbbbbbb.jpg"]);

    rehypeOptimizeImages()(tree);

    const [first, second] = imagesOf(tree);

    expect(first!.properties.loading).toBe("eager");
    // hast's camelCase `fetchPriority` is what property-information serializes
    // to the lowercase HTML attribute `fetchpriority` — see property-information's
    // html schema. Asserting the hast property name here is what actually proves
    // the emitted HTML attribute, since that's the layer this plugin controls.
    expect(first!.properties.fetchPriority).toBe("high");

    expect(second!.properties.loading).toBe("lazy");
    expect(second!.properties.fetchPriority).toBeUndefined();
  });

  it("resets the eager-image counter PER DOCUMENT, so two separate files each get an eager first image", () => {
    // velite calls the attacher (`rehypeOptimizeImages()`) once when the processor
    // is built, then reuses the returned transformer across every post it compiles.
    // Any "have I seen an image yet" state that lives outside the transformer
    // closure — e.g. in the attacher's own scope — survives across files and only
    // the very first post in the build gets an eager hero image. This test
    // reuses a single transformer instance across two documents, which is exactly
    // what would expose that leak.
    const transform = rehypeOptimizeImages();

    const postA = treeWithImages(["/static/post-a-aaaaaaaa.jpg"]);
    const postB = treeWithImages(["/static/post-b-bbbbbbbb.jpg"]);

    transform(postA);
    transform(postB);

    const [imgA] = imagesOf(postA);
    const [imgB] = imagesOf(postB);

    expect(imgA!.properties.loading).toBe("eager");
    expect(imgA!.properties.fetchPriority).toBe("high");

    expect(imgB!.properties.loading).toBe("eager");
    expect(imgB!.properties.fetchPriority).toBe("high");
  });
});
