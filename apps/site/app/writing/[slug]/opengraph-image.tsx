import { profile } from "@anuragashok/profile";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og-card";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

export const alt = "Post";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return renderOgCard({
    eyebrow: profile.name.toUpperCase(),
    title: post?.title ?? "Writing",
    titleFontSize: 64,
    titleLetterSpacing: -1,
    titleLineHeight: 1.15,
  });
}
