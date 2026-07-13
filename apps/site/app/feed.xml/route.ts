import { profile } from "@anuragashok/profile";
import { Feed } from "feed";
import { absolutizeHtml } from "@/lib/absolutize-html";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const feed = new Feed({
    title: siteConfig.name,
    description: siteConfig.description,
    id: siteConfig.url,
    link: siteConfig.url,
    language: "en",
    copyright: `© ${new Date().getFullYear()} ${siteConfig.name}`,
    feedLinks: { rss2: `${siteConfig.url}/feed.xml` },
    author: { name: profile.name, link: siteConfig.url },
  });

  for (const post of getAllPosts()) {
    const url = `${siteConfig.url}/writing/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.summary,
      // Full content: RSS stands in for a newsletter here, so it carries the whole post.
      // RSS 2.0 has no xml:base, so root-relative URLs (image optimizer src/srcset, internal
      // links) won't resolve in most readers — make everything absolute and point images at
      // the original static asset instead of the optimizer URL (see absolutize-html.ts).
      content: absolutizeHtml(post.content, siteConfig.url),
      date: new Date(post.date),
      author: [{ name: profile.name, link: siteConfig.url }],
    });
  }

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
