import type { Post } from "#velite";
import Link from "next/link";
import { formatDate } from "@/lib/format-date";

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug} className="grid grid-cols-[4.5rem_1fr] items-baseline gap-4 border-t border-[var(--rule)] py-3">
          <span className="font-mono text-[0.65rem] text-[var(--muted)] tabular-nums">{formatDate(post.date)}</span>
          <Link href={`/writing/${post.slug}`} className="font-medium hover:text-[var(--accent)]">
            {post.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
