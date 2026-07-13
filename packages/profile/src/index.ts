import { parse } from "yaml";
import { rawProfile } from "./raw.gen.js";
import { ProfileSchema } from "./schema.js";

export { ProfileSchema, splitHeadline, yearsOfExperience } from "./schema.js";
export type { HeadlineParts, Profile } from "./schema.js";

/** The exact bytes of me.yaml. The About page renders this verbatim. */
export { rawProfile };

/** The parsed, validated profile. */
export const profile = ProfileSchema.parse(parse(rawProfile));
