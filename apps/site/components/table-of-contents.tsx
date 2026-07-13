import type { Post } from "#velite";

/** Long posts only. A quiet aside, not a boxed widget above the fold. */
export function TableOfContents({ toc }: { toc: Post["toc"] }) {
  return (
    <nav aria-label="Table of contents" className="mb-10 border-l border-[var(--rule)] pl-4">
      <p className="mb-2 font-mono text-[0.6rem] tracking-[0.14em] text-[var(--muted)]">CONTENTS</p>
      <ul className="space-y-1">
        {toc.map((item) => (
          <li key={item.url}>
            <a href={item.url} className="font-mono text-[0.7rem] text-[var(--muted)] hover:text-[var(--accent)]">
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
