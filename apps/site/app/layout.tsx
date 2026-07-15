import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeScript } from "@/components/theme-script";
import { siteConfig } from "@/lib/site";
import { mono, sans, serif } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body>
        <div className="mx-auto min-h-screen max-w-3xl px-6">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
        {/* Web Analytics must be toggled ON in the Vercel project dashboard (Analytics
            tab) for this to do anything. Until then it 404s on
            /_vercel/insights/script.js on every page load — harmless, but noisy in
            the console. The component stays: enabling analytics is a dashboard flip,
            not a code change. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
