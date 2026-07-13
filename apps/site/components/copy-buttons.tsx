"use client";

import { useEffect } from "react";

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
        await navigator.clipboard.writeText(pre.innerText.replace(/^copy\n/, ""));
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
