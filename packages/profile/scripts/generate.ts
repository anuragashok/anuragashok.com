import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { ProfileSchema } from "../src/schema.js";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = readFileSync(join(pkgRoot, "me.yaml"), "utf8");

// Fail loudly at codegen time rather than shipping an invalid profile.
ProfileSchema.parse(parse(raw));

const out = `// GENERATED FILE — DO NOT EDIT.
// Source: packages/profile/me.yaml
// Regenerate: pnpm --filter @anuragashok/profile gen
//
// The About page renders these exact bytes. That is the point.
export const rawProfile = ${JSON.stringify(raw)};
`;

writeFileSync(join(pkgRoot, "src", "raw.gen.ts"), out);
console.log("profile: wrote src/raw.gen.ts from me.yaml");
