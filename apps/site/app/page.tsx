import { profile, yearsOfExperience } from "@anuragashok/profile";
import Link from "next/link";
import { Headline } from "@/components/headline";
import { PostList } from "@/components/post-list";
import { getAllPosts } from "@/lib/posts";

/** Every surface is static. The day someone reads a header or a cookie here, the
 *  build fails loudly instead of the page quietly becoming a server render. */
export const dynamic = "force-static";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 5);
  const years = yearsOfExperience(profile.since);

  return (
    <div>
      <section className="pb-16">
        <p className="mb-4 font-mono text-[0.65rem] tracking-[0.11em] text-[var(--muted)]">
          {profile.role.toUpperCase()} · {profile.company.toUpperCase()} · {profile.location.toUpperCase()}
        </p>
        <Headline profile={profile} />
        <p className="max-w-[46ch] leading-relaxed text-[var(--muted)]">
          {years} years of it. Today I build dispatch at {profile.company} — deciding, thousands of times a
          second, which driver meets which demand. I care about automation, everything-as-code, and what
          changes now that the agent writes the first draft.
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-[0.65rem] tracking-[0.14em] text-[var(--muted)]">WRITING</h2>
        <PostList posts={posts} />
        <Link href="/writing" className="mt-5 inline-block font-mono text-xs text-[var(--accent)] hover:underline">
          all writing →
        </Link>
      </section>
    </div>
  );
}
