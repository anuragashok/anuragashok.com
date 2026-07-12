import { type Post, posts } from "#velite";

/** Published posts, newest first. Drafts appear in dev only. */
export function getAllPosts(): Post[] {
  const visible = process.env.NODE_ENV === "development" ? posts : posts.filter((p) => !p.draft);
  return [...visible].sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** Newest-first ordering, so `prev` is the newer post and `next` is the older one. */
export function getAdjacentPosts(slug: string): { prev?: Post; next?: Post } {
  const all = getAllPosts();
  const i = all.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { prev: all[i - 1], next: all[i + 1] };
}

export function getAllTags(): string[] {
  return [...new Set(getAllPosts().flatMap((p) => p.tags))].sort();
}
