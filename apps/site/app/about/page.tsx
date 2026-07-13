import { profile, rawProfile, yearsOfExperience } from "@anuragashok/profile";
import type { Metadata } from "next";
import { Manifest } from "@/components/manifest";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.description,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const years = yearsOfExperience(profile.since);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    worksFor: { "@type": "Organization", name: profile.company },
    address: { "@type": "PostalAddress", addressLocality: profile.location },
    url: siteConfig.url,
    sameAs: [profile.links.github, profile.links.linkedin],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 className="mb-8 font-serif text-4xl tracking-tight">About</h1>

      <div className="max-w-[52ch] space-y-4 leading-relaxed">
        <p>
          I&apos;m a {profile.role} at {profile.company} in {profile.location}, on {profile.team} — the
          system that matches supply to demand across Southeast Asia. I&apos;ve been writing software since
          February 2013, and I intend to keep doing exactly that. Individual contributor, by choice.
        </p>
        <p>
          The thread through all of it is automation. If I do a thing twice, I&apos;d rather describe it once
          and let the machine do it. That instinct became infrastructure-as-code, then everything-as-code, and
          lately it&apos;s become agentic coding — which is the same instinct with a much better executor.
        </p>
        <p>
          {years} years in, that&apos;s still the whole job: make the work describable, then make it run
          itself.
        </p>
        <p>This site runs on that idea too. Everything below is generated from a single file in the repo:</p>
      </div>

      <Manifest raw={rawProfile} />

      <p className="mt-3 font-mono text-[0.6rem] leading-relaxed text-[var(--muted)]">
        rendered from <span className="text-[var(--accent)]">packages/profile/me.yaml</span> — the same
        object that will write my GitHub README and LinkedIn headline.
      </p>
    </div>
  );
}
