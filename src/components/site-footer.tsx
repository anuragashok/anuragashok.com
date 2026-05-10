import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>© {year} {siteConfig.name}</span>
        <nav className="flex gap-4">
          <Link href={siteConfig.social.github} className="transition-colors hover:text-accent">GitHub</Link>
          <Link href={siteConfig.social.x} className="transition-colors hover:text-accent">X</Link>
          <Link href={siteConfig.rss} className="transition-colors hover:text-accent">RSS</Link>
        </nav>
      </div>
    </footer>
  );
}
