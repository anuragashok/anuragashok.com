import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";
import { TagBadge } from "@/components/tag-badge";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.summary,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
      url: `${siteConfig.url}/blog/${slug}`,
      type: "article",
      publishedTime: post.frontmatter.date.toISOString(),
      modifiedTime: post.frontmatter.updated?.toISOString(),
      images: [{ url: `${siteConfig.url}/og/${slug}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.summary,
      images: [`${siteConfig.url}/og/${slug}`],
    },
  };
}

export default async function PostPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontmatter.title,
    description: post.frontmatter.summary,
    datePublished: post.frontmatter.date.toISOString(),
    dateModified: (post.frontmatter.updated ?? post.frontmatter.date).toISOString(),
    author: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: `${siteConfig.url}/blog/${slug}`,
    image: `${siteConfig.url}/og/${slug}`,
  };

  return (
    <article className="prose dark:prose-invert mx-auto max-w-2xl">
      <header className="not-prose mb-8 space-y-2">
        <h1 className="font-serif text-4xl font-medium tracking-tight">
          {post.frontmatter.title}
        </h1>
        <div className="flex items-center gap-2 font-mono text-xs tabular-nums text-muted-foreground">
          <time dateTime={post.frontmatter.date.toISOString()}>
            {post.frontmatter.date.toISOString().slice(0, 10)}
          </time>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>
        {post.frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.frontmatter.tags.map((t) => (
              <TagBadge key={t} tag={t} />
            ))}
          </div>
        )}
      </header>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
