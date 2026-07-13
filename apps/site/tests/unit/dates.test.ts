import { describe, expect, it } from "vitest";
import { formatDate, formatDateLong } from "@/lib/format-date";

describe("formatDate", () => {
  it("renders a month-boundary date as the calendar date in the frontmatter, not the host-timezone-shifted date", () => {
    // 2021-01-01 parses as UTC midnight. Without `timeZone: "UTC"` in the
    // formatting options, `toLocaleDateString` resolves in the HOST
    // machine's local timezone. On any machine west of UTC (e.g. run this
    // suite under `TZ=Pacific/Midway`, UTC-11), UTC midnight on the 1st
    // rolls back to the previous day — so this would render "DEC 2020"
    // instead of "JAN 2021". This test pins the calendar date to what's
    // actually written in the post frontmatter, regardless of where the
    // code runs.
    expect(formatDate("2021-01-01")).toBe("JAN 2021");
  });
});

describe("formatDateLong", () => {
  it("renders a month-boundary date as the calendar date in the frontmatter, not the host-timezone-shifted date", () => {
    // Same bug class as formatDate above: 2021-01-01 parses as UTC
    // midnight, and without `timeZone: "UTC"` in the formatting options,
    // toLocaleDateString resolves in the HOST machine's local timezone. On
    // any machine west of UTC (e.g. TZ=Pacific/Midway, UTC-11), UTC
    // midnight on the 1st rolls back to the previous day — so this would
    // render "31 December 2020" instead of "1 January 2021".
    expect(formatDateLong("2021-01-01")).toBe("1 January 2021");
  });
});
