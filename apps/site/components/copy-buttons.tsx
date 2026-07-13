"use client";

import { useEffect } from "react";

/**
 * Extracts the code text to copy from a `<pre>` block.
 *
 * Reads from the `<code>` element nested inside `<pre>` (Shiki always emits
 * `<pre><code>...</code></pre>`), NOT from `pre.innerText`. The copy button
 * is appended as a direct child of `<pre>` itself, so `pre.innerText` would
 * include the button's own label ("copy"/"copied") in the result. Reading
 * from `<code>` sidesteps that entirely — the button is never a descendant
 * of `<code>`, so there's nothing to strip and no risk of corrupting code
 * that legitimately contains the word "copy" (e.g. a Dockerfile `COPY`
 * instruction).
 */
export function getCodeText(pre: HTMLPreElement): string {
  const code = pre.querySelector("code");
  return (code ?? pre).textContent ?? "";
}

/** Injects a copy button into every code block. The content is technical —
 *  Dockerfiles, Maven POMs, wiremock configs — so people will copy it. */
export function CopyButtons() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLPreElement>(".prose-custom pre");

    blocks.forEach((pre) => {
      if (pre.querySelector(".copy-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "copy";
      btn.setAttribute("aria-label", "Copy code to clipboard");
      btn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(getCodeText(pre));
        btn.textContent = "copied";
        setTimeout(() => {
          btn.textContent = "copy";
        }, 1500);
      });
      pre.appendChild(btn);
    });
  }, []);

  return null;
}
