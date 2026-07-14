import type { Post } from "#velite";
import Link from "next/link";

/** The cheapest way to turn one read into two. */
export function PostNav({ prev, next }: { prev?: Post; next?: Post }) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-16 grid gap-4 border-t border-[var(--rule)] pt-6 sm:grid-cols-2">
      <div>
        {prev && (
          <Link href={`/writing/${prev.slug}`} className="group block">
            <span className="font-mono text-[0.7rem] tracking-[0.12em] text-[var(--muted)]">NEWER</span>
            <span className="mt-1 block text-sm group-hover:text-[var(--accent)]">{prev.title}</span>
          </Link>
        )}
      </div>
      <div className="sm:text-right">
        {next && (
          <Link href={`/writing/${next.slug}`} className="group block">
            <span className="font-mono text-[0.7rem] tracking-[0.12em] text-[var(--muted)]">OLDER</span>
            <span className="mt-1 block text-sm group-hover:text-[var(--accent)]">{next.title}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
