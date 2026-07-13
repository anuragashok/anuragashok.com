import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { HeadlineParts } from "@anuragashok/profile";
import { ImageResponse } from "next/og";
import { palette } from "./tokens";

/**
 * The one OG card. Both social cards — the site card and the per-post card —
 * are the same object: a mono eyebrow, a serif title, the domain, and the
 * amber rule along the bottom. Only the eyebrow, the title, and the title's
 * type size differ, so those are the only props.
 *
 * satori (which `next/og` renders with) resolves inline styles only: no CSS
 * variables, no stylesheet. Hence real hex literals — from `palette`, the
 * single source, never retyped here.
 */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const instrumentSerif = readFileSync(join(process.cwd(), "app/fonts/InstrumentSerif-Regular.ttf"));
const ibmPlexMono = readFileSync(join(process.cwd(), "app/fonts/IBMPlexMono-Regular.ttf"));

export function renderOgCard({
  eyebrow,
  title,
  titleFontSize,
  titleLetterSpacing,
  titleLineHeight,
}: {
  eyebrow: string;
  /**
   * A plain string renders flat, like a post title. `HeadlineParts` (from
   * `splitHeadline`) renders `accent` in the same burnt amber the homepage
   * uses for `headline_accent` — so the two most visible copies of the
   * headline, the hero and the OG card, agree on which word is emphasised.
   */
  title: string | HeadlineParts;
  titleFontSize: number;
  titleLetterSpacing: number;
  titleLineHeight?: number;
}): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: palette.paper,
          color: palette.ink,
          padding: "64px",
          borderBottom: `16px solid ${palette.accent}`,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "IBM Plex Mono",
            fontSize: 22,
            letterSpacing: 3,
            color: palette.muted,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Instrument Serif",
            fontSize: titleFontSize,
            letterSpacing: titleLetterSpacing,
            // Satori boxes each JSX child of a flex container as its own flex
            // item, which drops the ordinary HTML whitespace-collapsing that
            // would otherwise keep a single space between adjacent text nodes
            // and the <span> — "I make " + <span>code</span> + " work." was
            // rendering as "makecodework." with the spaces silently eaten.
            // `pre` renders the literal characters in each text node instead.
            whiteSpace: "pre",
            ...(titleLineHeight ? { lineHeight: titleLineHeight } : {}),
          }}
        >
          {typeof title === "string" ? (
            title
          ) : (
            <>
              {title.before}
              <span style={{ color: palette.accent }}>{title.accent}</span>
              {title.after}
            </>
          )}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "IBM Plex Mono",
            fontSize: 26,
            color: palette.muted,
          }}
        >
          anuragashok.com
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Instrument Serif", data: instrumentSerif, style: "normal", weight: 400 },
        { name: "IBM Plex Mono", data: ibmPlexMono, style: "normal", weight: 400 },
      ],
    },
  );
}
