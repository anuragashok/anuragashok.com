/**
 * Formats an ISO date string (post frontmatter dates are `YYYY-MM-DD`,
 * which parse as UTC midnight) as "MON YYYY".
 *
 * `timeZone: "UTC"` is required: without it, `toLocaleDateString` resolves
 * in the HOST machine's local timezone, so a date at the start of a month
 * can roll back to the previous day (and therefore render the wrong month
 * or year) on any machine west of UTC.
 */
export function formatDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })
    .toUpperCase();
}

/**
 * Formats a `YYYY-MM` month (as in `me.yaml`'s `since`) as "February 2013".
 *
 * Constructed with `Date.UTC` and read back in UTC for the same reason as the
 * functions around it: a local-time construction of the first of a month can
 * resolve to the last day of the previous one.
 */
export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number) as [number, number];
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Formats an ISO date string as a full date, e.g. "6 February 2021".
 *
 * Same `timeZone: "UTC"` requirement as {@link formatDate} — without it a
 * date at the start of a month can render as the previous day (and
 * therefore the wrong month) on any machine west of UTC.
 */
export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
