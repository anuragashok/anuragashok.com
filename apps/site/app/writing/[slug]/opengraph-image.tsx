import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

export const alt = "Post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const instrumentSerif = readFileSync(join(process.cwd(), "app/fonts/InstrumentSerif-Regular.ttf"));
const ibmPlexMono = readFileSync(join(process.cwd(), "app/fonts/IBMPlexMono-Regular.ttf"));

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

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
          ANURAG ASHOK
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Instrument Serif",
            fontSize: 64,
            lineHeight: 1.15,
            letterSpacing: -1,
          }}
        >
          {post?.title ?? "Writing"}
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
