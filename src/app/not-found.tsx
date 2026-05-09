import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Not found</h1>
      <p className="text-muted-foreground">
        That page doesn&apos;t exist (anymore).
      </p>
      <Link href="/" className="hover:underline">← Home</Link>
    </div>
  );
}
