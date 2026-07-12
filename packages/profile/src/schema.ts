import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  role: z.string().min(1),
  company: z.string().min(1),
  team: z.string().min(1),
  location: z.string().min(1),
  /** YYYY-MM — when he started writing software professionally. */
  since: z.string().regex(/^\d{4}-\d{2}$/, "since must be YYYY-MM"),
  track: z.enum(["IC", "Manager"]),
  obsessions: z.array(z.string().min(1)).min(1),
  previously: z.array(z.string().min(1)),
  links: z.object({
    github: z.url(),
    linkedin: z.url(),
  }),
});

export type Profile = z.infer<typeof ProfileSchema>;

/** Whole years since `since` (YYYY-MM), as of `now`. */
export function yearsOfExperience(since: string, now: Date = new Date()): number {
  const [year, month] = since.split("-").map(Number) as [number, number];
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  return Math.floor(months / 12);
}
