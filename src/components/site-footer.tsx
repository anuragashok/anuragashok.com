import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>© {year} {siteConfig.name}</span>
        <nav className="flex gap-4">
          <Link href={siteConfig.social.github}>GitHub</Link>
          <Link href={siteConfig.social.x}>X</Link>
          <Link href={siteConfig.rss}>RSS</Link>
        </nav>
      </div>
    </footer>
  );
}
