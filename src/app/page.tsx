import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export default async function HomePage() {
  const latest = (await getAllPosts()).slice(0, 5);
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{siteConfig.name}</h1>
        <p className="text-muted-foreground">{siteConfig.tagline}</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Latest writing</h2>
        <ul className="space-y-3">
          {latest.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="font-medium hover:underline">
                {p.frontmatter.title}
              </Link>
              <p className="text-sm text-muted-foreground">{p.frontmatter.summary}</p>
            </li>
          ))}
        </ul>
        <Link href="/blog" className="text-sm hover:underline">All posts →</Link>
      </section>
    </div>
  );
}
