const NUMBER = new Intl.NumberFormat("en-GB");

const UTC_DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function formatCount(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${NUMBER.format(count)} ${count === 1 ? singular : plural}`;
}

export function formatUtcDateTime(date: Date): string {
  return `${UTC_DATE_TIME.format(date)} UTC`;
}
