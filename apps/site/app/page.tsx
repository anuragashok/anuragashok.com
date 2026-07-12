import { profile, yearsOfExperience } from "@anuragashok/profile";
import Link from "next/link";
import { PostList } from "@/components/post-list";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 5);
  const years = yearsOfExperience(profile.since);

  return (
    <div>
      <section className="pb-16">
        <p className="mb-4 font-mono text-[0.65rem] tracking-[0.11em] text-[var(--muted)]">
          {profile.role.toUpperCase()} · {profile.company.toUpperCase()} · {profile.location.toUpperCase()}
        </p>
        <h1 className="mb-5 font-serif text-5xl leading-[1.05] tracking-tight">
          I make <em className="text-[var(--accent)] not-italic">code</em> work.
        </h1>
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
