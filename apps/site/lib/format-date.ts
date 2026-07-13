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
