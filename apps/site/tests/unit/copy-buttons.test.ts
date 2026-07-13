import { describe, expect, it } from "vitest";
import { getCodeText } from "@/components/copy-buttons";

/**
 * Minimal duck-typed stand-in for the DOM elements `getCodeText` touches
 * (`querySelector` and `textContent`). No jsdom dependency in this
 * workspace, and the function only needs that narrow surface — real
 * clipboard-content correctness is verified in a live browser (see the
 * Task 8 report), this test locks in the extraction logic itself.
 */
function fakePre(codeText: string | null): HTMLPreElement {
  const code = codeText === null ? null : { textContent: codeText };
  return {
    querySelector: () => code,
    textContent: "fallback should not be used when <code> exists",
  } as unknown as HTMLPreElement;
}

describe("getCodeText", () => {
  it("reads from the nested <code> element, not from <pre> (which would include the injected button's label)", () => {
    // Simulates the real DOM shape after CopyButtons has appended its button
    // as a trailing sibling of <code> inside <pre>: pre.innerText would be
    // "const x = 1;\ncopy", but the <code> element itself never contains
    // the button, so reading from it can't pick up the label.
    const pre = fakePre("const x = 1;");
    expect(getCodeText(pre)).toBe("const x = 1;");
  });

  it("does not corrupt code that legitimately contains the word 'copy' (e.g. a Dockerfile COPY instruction)", () => {
    const pre = fakePre("FROM node:20\nCOPY . .\nRUN npm install");
    expect(getCodeText(pre)).toBe("FROM node:20\nCOPY . .\nRUN npm install");
  });

  it("falls back to the <pre> element itself if there is no nested <code>", () => {
    const pre = {
      querySelector: () => null,
      textContent: "raw pre text",
    } as unknown as HTMLPreElement;
    expect(getCodeText(pre)).toBe("raw pre text");
  });
});
