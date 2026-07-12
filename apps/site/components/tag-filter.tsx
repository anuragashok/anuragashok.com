"use client";

import type { Post } from "#velite";
import { useState } from "react";
import { PostList } from "./post-list";

export function TagFilter({ posts, tags }: { posts: Post[]; tags: string[] }) {
  const [active, setActive] = useState<string | null>(null);
  const shown = active ? posts.filter((p) => p.tags.includes(active)) : posts;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive(null)}
          aria-pressed={active === null}
          className={`font-mono text-[0.65rem] transition-colors ${
            active === null ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--fg)]"
          }`}
        >
          all
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActive(tag === active ? null : tag)}
            aria-pressed={tag === active}
            className={`font-mono text-[0.65rem] transition-colors ${
              tag === active ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>
      <PostList posts={shown} />
      {shown.length === 0 && (
        <p className="py-6 font-mono text-xs text-[var(--muted)]">Nothing tagged #{active}.</p>
      )}
    </div>
  );
}
