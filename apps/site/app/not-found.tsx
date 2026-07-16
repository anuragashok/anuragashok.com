import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16">
      <h1 className="mb-3 font-serif text-[length:var(--text-h1)] tracking-tight">Not found.</h1>
      <p className="mb-6 text-[var(--muted)]">That page doesn’t exist — or it did, once.</p>
      <Link href="/writing" className="font-mono text-xs text-[var(--accent)] hover:underline">
        ← all writing
      </Link>
    </div>
  );
}
