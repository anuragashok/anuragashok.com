import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy for ClaudeCode, a personal Google API client used only by Anurag Ashok.",
  alternates: { canonical: "/privacy" },
};

export const dynamic = "force-static";

const contact = "anurag16890@gmail.com";

// Required to publish a personal Google OAuth app out of Testing. Kept plain:
// one person, one machine, no third parties. Typographic apostrophes only —
// see the note in about/page.tsx on entities in JSX text.
export default function PrivacyPage() {
  return (
    <div>
      <h1 className="mb-3 font-serif text-[length:var(--text-h1)] tracking-tight">Privacy</h1>
      <p className="mb-8 font-mono text-[length:var(--text-meta)] text-[var(--muted)]">Last updated 22 October 2026</p>

      <div data-testid="privacy-prose" className="max-w-[var(--measure)] space-y-4 leading-relaxed">
        <p>
          This policy covers <strong>ClaudeCode</strong>, a Google OAuth app I run for myself. It is a personal
          tool, used only by me ({contact}), so the AI coding agents on my own Mac can read and write my own
          Google Sheets, Docs, Drive and Gmail through the Google APIs.
        </p>
        <h2 className="pt-4 font-serif text-[length:var(--text-h2)] tracking-tight">What it accesses</h2>
        <p>
          Only my own Google account, and only the scopes I grant it. No one else signs in to it, and it collects
          no data from anyone else.
        </p>
        <h2 className="pt-4 font-serif text-[length:var(--text-h2)] tracking-tight">Where the data goes</h2>
        <p>
          Nowhere new. Data it reads stays on my machine and in my Google account. Nothing is sold, and nothing is
          shared with third parties.
        </p>
        <h2 className="pt-4 font-serif text-[length:var(--text-h2)] tracking-tight">Revoking access</h2>
        <p>
          Access can be revoked at any time at{" "}
          <a href="https://myaccount.google.com/permissions" className="underline hover:text-[var(--accent)]">
            myaccount.google.com/permissions
          </a>
          .
        </p>
        <h2 className="pt-4 font-serif text-[length:var(--text-h2)] tracking-tight">Contact</h2>
        <p>
          <a href={`mailto:${contact}`} className="underline hover:text-[var(--accent)]">
            {contact}
          </a>
        </p>
      </div>
    </div>
  );
}
