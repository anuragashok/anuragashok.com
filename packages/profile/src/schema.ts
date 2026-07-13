import { z } from "zod";

export const ProfileSchema = z
  .object({
    name: z.string().min(1),
    /** The one line. Renderers print it verbatim — nobody retypes it. */
    headline: z.string().min(1),
    /**
     * The single word inside `headline` that a renderer emphasises (burnt amber
     * on the website; it could be bold on LinkedIn, or nothing at all on a
     * plain-text README). Which word carries the weight is a fact about the
     * headline, not a fact about the website — so it lives here, with it.
     */
    headline_accent: z.string().min(1),
    role: z.string().min(1),
    company: z.string().min(1),
    team: z.string().min(1),
    location: z.string().min(1),
    /** YYYY-MM — when he started writing software professionally. */
    since: z.string().regex(/^\d{4}-\d{2}$/, "since must be YYYY-MM"),
    track: z.enum(["IC", "Manager"]),
    obsessions: z.array(z.string().min(1)).min(1),
    previously: z.array(z.string().min(1)),
    links: z.object({
      github: z.url(),
      linkedin: z.url(),
    }),
  })
  // An accent word that isn't in the headline would render as a headline with
  // nothing emphasised — silently, on the homepage. Fail at codegen instead.
  .refine((p) => p.headline.includes(p.headline_accent), {
    message: "headline_accent must be a word that appears in headline",
    path: ["headline_accent"],
  });

export type Profile = z.infer<typeof ProfileSchema>;

/** The headline, cut around its accent word. */
export type HeadlineParts = { before: string; accent: string; after: string };

/**
 * Splits `headline` around `headline_accent` so a renderer can wrap that one
 * word — without either string being retyped into the renderer. Change the
 * headline in `me.yaml` and the homepage changes. That is the whole thesis,
 * applied to the most quotable string on the site.
 *
 * The schema guarantees the accent word is present, so the miss branch is
 * unreachable in practice; it degrades to an unaccented headline rather than
 * throwing, because a missing highlight is not worth a blank page.
 */
export function splitHeadline(profile: Pick<Profile, "headline" | "headline_accent">): HeadlineParts {
  const { headline, headline_accent: accent } = profile;
  const at = headline.indexOf(accent);
  if (at === -1) return { before: headline, accent: "", after: "" };
  return {
    before: headline.slice(0, at),
    accent,
    after: headline.slice(at + accent.length),
  };
}

/** Whole years since `since` (YYYY-MM), as of `now`. */
export function yearsOfExperience(since: string, now: Date = new Date()): number {
  const [year, month] = since.split("-").map(Number) as [number, number];
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  return Math.floor(months / 12);
}
