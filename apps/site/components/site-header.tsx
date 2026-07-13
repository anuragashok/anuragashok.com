import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="flex items-baseline justify-between py-10">
      <Link href="/" className="font-serif text-lg tracking-tight hover:text-[var(--accent)]">
        {siteConfig.name}
      </Link>
      <nav className="flex items-center gap-5 font-mono text-xs text-[var(--muted)]">
        <Link href="/writing" className="hover:text-[var(--accent)]">Writing</Link>
        <Link href="/about" className="hover:text-[var(--accent)]">About</Link>
        <a href="/feed.xml" className="hover:text-[var(--accent)]">RSS</a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
