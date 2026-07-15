import type { Metadata } from "next";
import { PostList } from "@/components/post-list";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays and notes on automation, everything-as-code, and agentic coding.",
  alternates: { canonical: "/writing" },
};

export const dynamic = "force-static";

/**
 * No tag filter. Five posts produced sixteen tag buttons, fourteen of which
 * matched exactly one post — a control surface longer than the thing it
 * controlled. Thresholding to 2+ posts left two tags, which reads as broken.
 * Tags stay in frontmatter (the schema keeps them); they are simply not a UI
 * yet. The filter comes back when the corpus earns it.
 *
 * A pleasant side effect: this page now ships zero client JavaScript.
 */
export default function WritingPage() {
  return (
    <div>
      <h1 className="mb-8 font-serif text-[length:var(--text-h1)] tracking-tight">Writing</h1>
      <PostList posts={getAllPosts()} />
    </div>
  );
}
