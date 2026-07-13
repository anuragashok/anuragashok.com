import { profile } from "@anuragashok/profile";
import { ogContentType, ogSize, renderOgCard } from "@/lib/og-card";

export const alt = "Anurag Ashok";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgCard({
    eyebrow: `${profile.role.toUpperCase()} · ${profile.company.toUpperCase()} · ${profile.location.toUpperCase()}`,
    title: profile.headline,
    titleFontSize: 88,
    titleLetterSpacing: -2,
  });
}
