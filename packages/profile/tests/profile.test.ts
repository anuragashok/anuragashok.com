import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { ProfileSchema, profile, rawProfile, yearsOfExperience } from "../src/index.js";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const meYaml = readFileSync(join(pkgRoot, "me.yaml"), "utf8");

describe("profile", () => {
  it("rawProfile is byte-identical to me.yaml on disk", () => {
    // Guards the thesis: if the generated artifact drifts from the file,
    // the About page renders a lie. Fail here instead.
    expect(rawProfile).toBe(meYaml);
  });

  it("me.yaml satisfies the schema", () => {
    expect(() => ProfileSchema.parse(parse(meYaml))).not.toThrow();
  });

  it("exposes the canonical facts", () => {
    expect(profile.name).toBe("Anurag Ashok");
    expect(profile.company).toBe("Grab");
    expect(profile.team).toBe("Fulfillment Dispatch");
    expect(profile.track).toBe("IC");
    expect(profile.obsessions).toContain("agentic coding");
  });

  it("rejects an unknown track", () => {
    const bad = { ...parse(meYaml), track: "VP" };
    expect(() => ProfileSchema.parse(bad)).toThrow();
  });

  it("rejects a malformed since", () => {
    const bad = { ...parse(meYaml), since: "2013" };
    expect(() => ProfileSchema.parse(bad)).toThrow();
  });

  it("computes whole years of experience", () => {
    expect(yearsOfExperience("2013-02", new Date("2026-07-12"))).toBe(13);
    expect(yearsOfExperience("2013-02", new Date("2026-01-12"))).toBe(12);
  });
});
