import Link from "next/link";
import type { Post } from "@/lib/posts";
import { TagBadge } from "@/components/tag-badge";

export function PostCard({ post }: { post: Post }) {
  const date = post.frontmatter.date.toISOString().slice(0, 10);
  return (
    <article className="space-y-1">
      <Link href={`/blog/${post.slug}`} className="font-medium hover:underline">
        {post.frontmatter.title}
      </Link>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <time dateTime={post.frontmatter.date.toISOString()}>{date}</time>
        <span>·</span>
        <span>{post.readingTime} min read</span>
      </div>
      <p className="text-sm text-muted-foreground">{post.frontmatter.summary}</p>
      {post.frontmatter.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {post.frontmatter.tags.map((t) => (
            <TagBadge key={t} tag={t} />
          ))}
        </div>
      )}
    </article>
  );
}
