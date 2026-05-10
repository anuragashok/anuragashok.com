import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function TagBadge({ tag }: { tag: string }) {
  return (
    <Link
      href={`/tags/${tag}`}
      className="rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Badge variant="secondary" className="hover:bg-accent/15 hover:text-accent-foreground">
        {tag}
      </Badge>
    </Link>
  );
}
