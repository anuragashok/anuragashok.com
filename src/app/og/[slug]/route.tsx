import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

// Switched from "edge" to "nodejs": getPost() in @/lib/posts uses
// node:fs/promises, which is not available in the edge runtime.
export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Params = { slug: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const post = slug === "default" ? null : await getPost(slug);

  const title = post?.frontmatter.title ?? siteConfig.name;
  const subtitle = post?.frontmatter.summary ?? siteConfig.tagline;
  const date = post?.frontmatter.date.toISOString().slice(0, 10) ?? "";

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
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.7 }}>{siteConfig.name}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ fontSize: 32, opacity: 0.8, lineHeight: 1.3 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.6 }}>{date}</div>
      </div>
    ),
    size,
  );
}
