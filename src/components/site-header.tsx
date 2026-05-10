import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/blog" className="transition-colors hover:text-accent">Blog</Link>
          <Link href="/about" className="transition-colors hover:text-accent">About</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
