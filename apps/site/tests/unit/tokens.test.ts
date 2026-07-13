import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { cssVarName, palette } from "@/lib/tokens";

const css = readFileSync(fileURLToPath(new URL("../../app/globals.css", import.meta.url)), "utf8");

/** The `@theme` block only — never the `:root`/`.dark` aliases, which are `var()` refs. */
const theme = css.slice(css.indexOf("@theme"), css.indexOf("}", css.indexOf("@theme")));

describe("the locked palette", () => {
  it.each(Object.entries(palette))(
    "globals.css declares %s with the same value as lib/tokens.ts",
    (token, value) => {
      const declaration = new RegExp(`${cssVarName(token as keyof typeof palette)}:\\s*(#[0-9a-fA-F]{3,8});`);
      const match = theme.match(declaration);
      expect(match, `${cssVarName(token as keyof typeof palette)} is not declared in globals.css @theme`).not.toBeNull();
      expect(match?.[1]?.toLowerCase()).toBe(value.toLowerCase());
    },
  );

  it("has exactly ONE accent per mode — a second one is a design regression, not a feature", () => {
    const accents = theme.match(/--color-accent[a-z-]*:/g) ?? [];
    expect(accents.sort()).toEqual(["--color-accent-dark:", "--color-accent:"]);
  });
});
