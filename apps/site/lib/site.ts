import { profile } from "@anuragashok/profile";

/**
 * The site's public identity. Everything downstream hangs off `url`: feed.xml
 * item links and guids, sitemap.xml, robots.txt's sitemap pointer, both JSON-LD
 * blocks, every canonical, and `metadataBase` for OG images.
 *
 * A silent localhost fallback here is a landmine, not a fallback: ship it unset
 * and NOTHING fails — you just publish `http://localhost:3000/...` to Google
 * Search Console and to every RSS subscriber. So the fallback exists for local
 * dev only, and a PRODUCTION build refuses to run without the real value.
 *
 * Set `NEXT_PUBLIC_BASE_URL` in the Vercel project env (and in `.env.local` for
 * a local production build). See `.env.example`.
 */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

if (!baseUrl && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_BASE_URL is not set. A production build cannot proceed: feed links, " +
      "sitemap URLs, canonicals, JSON-LD and OG metadata would all silently point at " +
      "http://localhost:3000. Set it to the public origin (e.g. https://anuragashok.com) " +
      "in the Vercel project env, or in .env.local for a local production build. See .env.example.",
  );
}

export const siteConfig = {
  name: profile.name,
  description: `${profile.role} at ${profile.company}. Writing about automation, everything-as-code, and agentic coding.`,
  url: baseUrl ?? "http://localhost:3000",
  links: profile.links,
} as const;
