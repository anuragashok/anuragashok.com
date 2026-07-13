import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { palette } from "@/lib/tokens";

/**
 * The favicon: a lowercase Instrument Serif `a`, paper on burnt amber.
 *
 * Generated with `next/og` rather than hand-written as an SVG on purpose — an
 * SVG favicon would have to name a font family the browser may not have, and
 * the whole point of the mark is that it is set in the site's own display face.
 * This renders from the exact TTF the site ships, at build time.
 *
 * Amber (not paper) is the field, because at 16px in a tab strip the fill is
 * what you recognise; the letterform is only confirmation.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const instrumentSerif = readFileSync(join(process.cwd(), "app/fonts/InstrumentSerif-Regular.ttf"));

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: palette.accent,
          color: palette.paper,
          fontFamily: "Instrument Serif",
          fontSize: 26,
          lineHeight: 1,
          // Instrument Serif's `a` is an x-height glyph: the line box centres,
          // but the ink sits high in it. Nudge down so it optically centres.
          paddingTop: 4,
        }}
      >
        a
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Instrument Serif", data: instrumentSerif, style: "normal", weight: 400 }],
    },
  );
}
