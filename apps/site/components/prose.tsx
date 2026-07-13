// Velite compiles markdown to HTML at build time. Shiki has already highlighted
// the code — zero runtime JS ships for highlighting.
export function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose-custom"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
