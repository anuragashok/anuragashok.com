import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { PostCard } from "@/components/post-card";

type Params = { tag: string };

export async function generateStaticParams(): Promise<Params[]> {
  const tags = await getAllTags();
  return tags.map((t) => ({ tag: t.tag }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { tag } = await params;
  return { title: `Tag: ${tag}` };
}

export default async function TagPage({ params }: { params: Promise<Params> }) {
  const { tag } = await params;
  const all = await getAllPosts();
  const matching = all.filter((p) => p.frontmatter.tags.includes(tag));
  if (matching.length === 0) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">#{tag}</h1>
      <ul className="space-y-6">
        {matching.map((p) => (
          <li key={p.slug}><PostCard post={p} /></li>
        ))}
      </ul>
    </div>
  );
}
