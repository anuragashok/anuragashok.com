import type { Metadata } from "next";
import { TagFilter } from "@/components/tag-filter";
import { getAllPosts, getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays and notes on automation, everything-as-code, and agentic coding.",
  alternates: { canonical: "/writing" },
};

export const dynamic = "force-static";

export default function WritingPage() {
  return (
    <div>
      <h1 className="mb-8 font-serif text-4xl tracking-tight">Writing</h1>
      <TagFilter posts={getAllPosts()} tags={getAllTags()} />
    </div>
  );
}
