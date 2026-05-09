import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.name}.`,
};

export default function AboutPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>About</h1>
      <p>
        I&apos;m {siteConfig.name}, a software engineer. This site is where I write
        about the work.
      </p>
      <h2>Now</h2>
      <p>
        Currently focused on <em>(supplied at content time)</em>.
      </p>
      <h2>Contact</h2>
      <ul>
        <li><a href={siteConfig.social.github}>GitHub</a></li>
        <li><a href={siteConfig.social.x}>X</a></li>
        <li><a href={siteConfig.social.email}>Email</a></li>
      </ul>
    </article>
  );
}
