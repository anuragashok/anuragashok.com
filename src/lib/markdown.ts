import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";
import type { Root, Heading as MdastHeading, RootContent } from "mdast";

export type Heading = { depth: number; text: string; slug: string };

export type RenderedMarkdown = {
  html: string;
  headings: Heading[];
  readingTime: number; // minutes, min 1
};

const WORDS_PER_MINUTE = 200;

type TextLike = Extract<RootContent, { type: "text" } | { type: "inlineCode" }>;

function isTextLike(node: { type: string }): node is TextLike {
  return node.type === "text" || node.type === "inlineCode";
}

function collectHeadings() {
  return (tree: Root, file: { data: Record<string, unknown> }) => {
    const slugger = new GithubSlugger();
    const headings: Heading[] = [];
    visit(tree, "heading", (node: MdastHeading) => {
      const text = node.children
        .filter(isTextLike)
        .map((c) => c.value)
        .join("");
      headings.push({ depth: node.depth, text, slug: slugger.slug(text) });
    });
    file.data.headings = headings;
  };
}

export async function renderMarkdown(source: string): Promise<RenderedMarkdown> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(collectHeadings)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypePrettyCode, {
      theme: { light: "github-light", dark: "github-dark" },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(source);

  const wordCount = source.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  const headings = (file.data.headings as Heading[]) ?? [];

  return { html: String(file), headings, readingTime };
}
