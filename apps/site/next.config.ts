import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

// Strict because we load nobody else's JavaScript. No third-party origins,
// no unsafe-eval. 'unsafe-inline' on style-src is required by Next's inlined
// critical CSS; script-src needs it for the pre-paint theme script.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // NEVER set output: 'export' — it disables next/image optimization and headers().
  transpilePackages: ["@anuragashok/profile"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // @anuragashok/profile is consumed as raw TS source (its "exports" field
  // points at ./src/index.ts, never compiled to disk) and its internal
  // relative imports use the NodeNext-style ".js" extension (e.g.
  // "./raw.gen.js", "./schema.js") for files that only exist as ".ts".
  // Neither webpack nor Turbopack resolves that by default when bundling a
  // transpiled package straight from source, so both need an explicit
  // extension-alias. `experimental.extensionAlias` covers `next build`
  // (webpack); `turbopack.resolveAlias` covers `next dev` (Turbopack,
  // default since Next 15), which does not support extensionAlias at all.
  experimental: {
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js"],
    },
  },
  turbopack: {
    resolveAlias: {
      "./raw.gen.js": "../../packages/profile/src/raw.gen.ts",
      "./schema.js": "../../packages/profile/src/schema.ts",
    },
  },
};

export default bundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(nextConfig);
