import { type Profile, splitHeadline } from "@anuragashok/profile";

/**
 * The homepage headline, rendered FROM `me.yaml` — not typed into this file.
 *
 * This used to be literal JSX ("I make <em>code</em> work."), which meant the
 * two most quotable strings on a site whose entire claim is "the profile is the
 * source of truth" were hand-typed into the renderer, and editing `me.yaml`
 * moved nothing. Now the text is `profile.headline` and the amber word is
 * `profile.headline_accent`; a unit test asserts the rendered text is exactly
 * the headline, and the e2e test reads the expected value out of the file on
 * disk. Change the line in `me.yaml` and the homepage changes with it.
 */
export function Headline({ profile }: { profile: Profile }) {
  const { before, accent, after } = splitHeadline(profile);

  return (
    <h1 className="mb-5 font-serif text-[length:var(--text-hero)] leading-[1.05] tracking-tight">
      {before}
      {/* `not-italic`: the serif italic face is deliberately not loaded. */}
      <em className="text-[var(--accent)] not-italic">{accent}</em>
      {after}
    </h1>
  );
}
