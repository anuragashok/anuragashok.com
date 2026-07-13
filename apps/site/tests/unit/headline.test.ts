import { type Profile, profile } from "@anuragashok/profile";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Headline } from "@/components/headline";

// `createElement` rather than JSX: this suite runs under vitest's node
// environment, which does not carry Next's JSX transform config. The component
// is server-rendered to a string, which is all the assertions need.
const render = (p: Profile) => renderToStaticMarkup(createElement(Headline, { profile: p }));
const textOf = (html: string) => html.replace(/<[^>]+>/g, "");

/**
 * The homepage headline is the most quotable string on a site whose whole claim
 * is that `me.yaml` is the source of truth — and it used to be hand-typed JSX.
 * These tests exist so that it cannot quietly become hand-typed JSX again: they
 * compare against `profile`, so the only way to pass is to render the file.
 */
describe("the headline is rendered from me.yaml", () => {
  it("renders exactly profile.headline — no more words, no fewer", () => {
    expect(textOf(render(profile))).toBe(profile.headline);
  });

  it("wraps profile.headline_accent, and only that, in the accent colour", () => {
    const accented = render(profile).match(/<em[^>]*>([^<]*)<\/em>/);
    expect(accented?.[1]).toBe(profile.headline_accent);
    expect(accented?.[0]).toContain("var(--accent)");
  });

  it("would follow me.yaml if the headline changed", () => {
    // Not the real profile — a hypothetical edit to me.yaml. If the component
    // ever goes back to hardcoding the string, this is what breaks.
    const edited: Profile = { ...profile, headline: "I ship systems that hold.", headline_accent: "hold" };
    const html = render(edited);
    expect(textOf(html)).toBe("I ship systems that hold.");
    expect(html).toMatch(/<em[^>]*>hold<\/em>/);
  });
});
