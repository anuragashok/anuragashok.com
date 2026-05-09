export const siteConfig = {
  name: "Anurag Ashok",
  tagline: "Software engineer. Notes from the work.",
  description:
    "Personal site and engineering blog of Anurag Ashok.",
  url:
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.BASE_URL ??
    "http://localhost:3000",
  social: {
    github: "https://github.com/anuragashok",
    x: "https://x.com/anuragashok",
    email: "mailto:hello@anuragashok.com",
  },
  rss: "/feed.xml",
} as const;

export type SiteConfig = typeof siteConfig;
