import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CopyButtons } from "@/components/copy-buttons";
import { PostNav } from "@/components/post-nav";
import { Prose } from "@/components/prose";
import { TableOfContents } from "@/components/table-of-contents";
import { formatDateLong } from "@/lib/format-date";
import { getAdjacentPosts, getAllPosts, getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

/** Posts longer than this get a table of contents. Short ones don't need one. */
const TOC_MIN_READING_TIME = 5;

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      url: `/writing/${post.slug}`,
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(slug);
  const showToc = post.metadata.readingTime >= TOC_MIN_READING_TIME && post.toc.length > 2;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    author: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
    url: `${siteConfig.url}/writing/${post.slug}`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-10">
        <p className="mb-3 font-mono text-[length:var(--text-meta)] tracking-[0.11em] text-[var(--muted)] tabular-nums">
          {formatDateLong(post.date)}
          {" · "}
          {post.metadata.readingTime} MIN READ
        </p>
        <h1 className="font-serif text-[length:var(--text-h1)] leading-[1.1] tracking-tight">{post.title}</h1>
      </header>

      {showToc && <TableOfContents toc={post.toc} />}

      <Prose html={post.content} />
      <CopyButtons />
      <PostNav prev={prev} next={next} />
    </article>
  );
}
