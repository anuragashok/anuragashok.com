import type { Post } from "#velite";

type TocEntry = Post["toc"][number];

/**
 * Velite's `s.toc()` returns a TREE: each entry may carry `items` (an h3 under
 * an h2). Flattening it — mapping only the top level — silently drops every
 * sub-heading. No post nests today, so nothing was lost yet; the first one that
 * does would have lost half its contents with no error anywhere.
 *
 * One level of indent is enough. A table of contents that needs three is a
 * table of contents for an article that needs an editor.
 */
function TocList({ items, nested = false }: { items: TocEntry[]; nested?: boolean }) {
  return (
    <ul className={nested ? "mt-1 space-y-1 pl-4" : "space-y-1"}>
      {items.map((item) => (
        <li key={item.url}>
          <a href={item.url} className="font-mono text-[0.8rem] text-[var(--muted)] hover:text-[var(--accent)]">
            {item.title}
          </a>
          {item.items && item.items.length > 0 && <TocList items={item.items} nested />}
        </li>
      ))}
    </ul>
  );
}

/** Long posts only. A quiet aside, not a boxed widget above the fold. */
export function TableOfContents({ toc }: { toc: Post["toc"] }) {
  return (
    <nav aria-label="Table of contents" className="mb-10 border-l border-[var(--rule)] pl-4">
      <p className="mb-2 font-mono text-[0.7rem] tracking-[0.14em] text-[var(--muted)]">CONTENTS</p>
      <TocList items={toc} />
    </nav>
  );
}
