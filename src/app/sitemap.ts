import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const posts = await getAllPosts();
  const tags = await getAllTags();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
  ];

  const postEntries = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.frontmatter.updated ?? p.frontmatter.date,
  }));

  const tagEntries = tags.map((t) => ({
    url: `${base}/tags/${t.tag}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...postEntries, ...tagEntries];
}
