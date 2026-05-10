import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

// nodejs runtime: getPost reads from the filesystem via lib/posts
// (edge runtime can't import node:fs)
export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

const AMBER = "#f59e0b";
const BG = "#0a0a0a";
const FG = "#fafafa";

type Params = { slug: string };

async function loadNewsreader(): Promise<ArrayBuffer> {
  // Fetch Google Fonts CSS with a bare UA so Google returns the TTF fallback.
  // Satori (the engine inside next/og) supports TTF/OTF reliably; woff2
  // requires extra decompression that this @vercel/og build does not include.
  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500&display=swap",
    { headers: { "User-Agent": "Mozilla/5.0" } },
  ).then((r) => r.text());

  const match = css.match(/url\((https:\/\/[^)]+\.ttf)\)/);
  if (!match) throw new Error("Failed to extract Newsreader font URL");

  return await fetch(match[1]).then((r) => r.arrayBuffer());
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const post = slug === "default" ? null : await getPost(slug);

  const title = post?.frontmatter.title ?? siteConfig.name;
  const subtitle = post?.frontmatter.summary ?? siteConfig.tagline;
  const date = post?.frontmatter.date.toISOString().slice(0, 10) ?? "";

  const newsreader = await loadNewsreader();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: BG,
          color: FG,
          fontFamily: "system-ui, -apple-system, sans-serif",
          borderBottom: `4px solid ${AMBER}`,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.7 }}>{siteConfig.name}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontFamily: "Newsreader, serif",
              fontSize: 72,
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 32, opacity: 0.8, lineHeight: 1.3 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.6 }}>{date}</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: newsreader, weight: 500, style: "normal" },
      ],
    },
  );
}
