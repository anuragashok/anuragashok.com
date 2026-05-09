import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { PostFrontmatter, type PostFrontmatter as PostFrontmatterT } from "@/lib/schema";
import { renderMarkdown, type Heading } from "@/lib/markdown";

export type Post = {
  slug: string;
  frontmatter: PostFrontmatterT;
  body: string;
  html: string;
  headings: Heading[];
  readingTime: number;
};

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function contentDir(): string {
  return process.env.CONTENT_DIR ?? path.join(process.cwd(), "content/posts");
}

let cache: Promise<Post[]> | null = null;
let cacheKey = "";

export function __resetPostsCache(): void {
  cache = null;
  cacheKey = "";
}

async function loadAll(): Promise<Post[]> {
  const dir = contentDir();
  const entries = await fs.readdir(dir);
  const mdFiles = entries.filter((f) => f.endsWith(".md"));

  const posts = await Promise.all(
    mdFiles.map(async (filename) => {
      const slug = filename.replace(/\.md$/, "");
      if (!SLUG_RE.test(slug)) {
        throw new Error(
          `Invalid slug "${slug}" in ${path.join(dir, filename)}: must be kebab-case`,
        );
      }
      const filePath = path.join(dir, filename);
      const raw = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(raw);

      const parsed = PostFrontmatter.safeParse(data);
      if (!parsed.success) {
        throw new Error(
          `Invalid frontmatter in ${filePath}:\n${parsed.error.toString()}`,
        );
      }

      const rendered = await renderMarkdown(content);

      return {
        slug,
        frontmatter: parsed.data,
        body: content,
        html: rendered.html,
        headings: rendered.headings,
        readingTime: rendered.readingTime,
      } satisfies Post;
    }),
  );

  return posts.sort(
    (a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime(),
  );
}

function getCached(): Promise<Post[]> {
  const key = `${contentDir()}|${process.env.NODE_ENV ?? ""}`;
  if (!cache || cacheKey !== key) {
    cacheKey = key;
    cache = loadAll();
  }
  return cache;
}

function isPublished(p: Post): boolean {
  if (process.env.NODE_ENV === "production" && p.frontmatter.draft) return false;
  return true;
}

export async function getAllPosts(): Promise<Post[]> {
  const all = await getCached();
  return all.filter(isPublished);
}

export async function getPost(slug: string): Promise<Post | null> {
  const all = await getAllPosts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const all = await getAllPosts();
  const counts = new Map<string, number>();
  for (const p of all) {
    for (const t of p.frontmatter.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()].map(([tag, count]) => ({ tag, count }));
}
