import { profile } from "@anuragashok/profile";
import { Feed } from "feed";
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
      content: post.content,
      date: new Date(post.date),
      author: [{ name: profile.name, link: siteConfig.url }],
    });
  }

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
