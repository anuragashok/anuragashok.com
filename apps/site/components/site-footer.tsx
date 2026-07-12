import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--rule)] py-8 font-mono text-xs text-[var(--muted)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <div className="flex gap-5">
          <a href={siteConfig.links.github} className="hover:text-[var(--accent)]">GitHub</a>
          <a href={siteConfig.links.linkedin} className="hover:text-[var(--accent)]">LinkedIn</a>
          <a href="/feed.xml" className="hover:text-[var(--accent)]">RSS</a>
        </div>
      </div>
    </footer>
  );
}
