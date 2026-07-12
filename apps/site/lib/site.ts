import { profile } from "@anuragashok/profile";

export const siteConfig = {
  name: profile.name,
  description: `${profile.role} at ${profile.company}. Writing about automation, everything-as-code, and agentic coding.`,
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  links: profile.links,
} as const;
