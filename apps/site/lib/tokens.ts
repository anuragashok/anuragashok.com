/**
 * The locked palette — ONE accent, no second one.
 *
 * This is the single source of truth for the palette VALUES. `app/globals.css`
 * declares the same colours in its `@theme` block because CSS cannot import
 * TypeScript, and the OG cards (`next/og` → satori) cannot read CSS variables:
 * satori resolves inline styles only, so the cards need real hex literals.
 *
 * Two declarations of the same numbers is a drift hazard — the palette used to
 * be hardcoded a third time inside each OG card, which meant changing the
 * "locked palette" in globals.css silently left the social cards on the old one.
 * `tests/unit/tokens.test.ts` parses globals.css and fails if the two drift, so
 * there is exactly one place to edit: here, then make the CSS agree.
 */
export const palette = {
  paper: "#faf9f7",
  ink: "#16150f",
  accent: "#b45309",
  muted: "#78716c",
  rule: "#e7e5e4",

  /** Dark mode is a designed inversion, not a derived one. */
  paperDark: "#111110",
  inkDark: "#ebe9e4",
  accentDark: "#e0913a",
  mutedDark: "#8f887f",
  ruleDark: "#2a2825",
} as const;

/** `paperDark` → `--color-paper-dark`. The mapping the CSS-drift test asserts. */
export function cssVarName(token: keyof typeof palette): string {
  return `--color-${token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}
