import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { palette } from "@/lib/tokens";

/** The same mark as `icon.tsx`, at the size iOS wants for a home-screen tile. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const instrumentSerif = readFileSync(join(process.cwd(), "app/fonts/InstrumentSerif-Regular.ttf"));

export default function AppleIcon() {
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
          fontSize: 140,
          lineHeight: 1,
          paddingTop: 20,
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
