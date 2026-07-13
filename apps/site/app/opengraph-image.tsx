import { readFileSync } from "node:fs";
import { join } from "node:path";
import { profile } from "@anuragashok/profile";
import { ImageResponse } from "next/og";

export const alt = "Anurag Ashok";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const instrumentSerif = readFileSync(join(process.cwd(), "app/fonts/InstrumentSerif-Regular.ttf"));
const ibmPlexMono = readFileSync(join(process.cwd(), "app/fonts/IBMPlexMono-Regular.ttf"));

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAF9F7",
          color: "#16150F",
          padding: "64px",
          borderBottom: "16px solid #B45309",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "IBM Plex Mono",
            fontSize: 22,
            letterSpacing: 3,
            color: "#78716C",
          }}
        >
          {profile.role.toUpperCase()} · {profile.company.toUpperCase()} · {profile.location.toUpperCase()}
        </div>
        <div
          style={{ display: "flex", fontFamily: "Instrument Serif", fontSize: 88, letterSpacing: -2 }}
        >
          {profile.headline}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "IBM Plex Mono",
            fontSize: 26,
            color: "#78716C",
          }}
        >
          anuragashok.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: instrumentSerif, style: "normal", weight: 400 },
        { name: "IBM Plex Mono", data: ibmPlexMono, style: "normal", weight: 400 },
      ],
    },
  );
}
