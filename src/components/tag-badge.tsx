import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function TagBadge({ tag }: { tag: string }) {
  return (
    <Link href={`/tags/${tag}`}>
      <Badge variant="secondary">{tag}</Badge>
    </Link>
  );
}
