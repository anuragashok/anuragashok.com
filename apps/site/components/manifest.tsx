import { codeToHtml } from "shiki";

/**
 * Renders the EXACT bytes of me.yaml. Not a re-serialization of the parsed object.
 * The thing on screen is the thing in git — that identity is the entire point,
 * and a Playwright test asserts it. Do not "simplify" this into JSON.stringify(profile).
 */
export async function Manifest({ raw }: { raw: string }) {
  const html = await codeToHtml(raw, {
    lang: "yaml",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  return (
    <figure className="mt-6 overflow-hidden rounded-md border border-[var(--rule)]">
      <figcaption className="flex items-center justify-between border-b border-[var(--rule)] px-3 py-1.5 font-mono text-[0.6rem] tracking-[0.06em] text-[var(--muted)]">
        <span>me.yaml</span>
        <span className="text-[var(--accent)]">source of truth</span>
      </figcaption>
      <div
        data-testid="manifest"
        className="manifest-body overflow-x-auto p-3 font-mono text-[0.7rem] leading-[1.9]"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
