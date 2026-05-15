/** Week strip in the UI runs Tue–Mon; anchor each strip to the Tuesday of that block. */
export function startOfTuesdayWeek(date: Date): Date {
  const d = new Date(date.getTime());
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const daysSinceTuesday = (day + 5) % 7;
  d.setDate(d.getDate() - daysSinceTuesday);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, delta: number): Date {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + delta);
  return d;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonthShort(d: Date): string {
  return MONTHS_SHORT[d.getMonth()];
}

const DOW_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function formatDowShort(d: Date): string {
  return DOW_SHORT[d.getDay()];
}

/** e.g. "09 Feb 2021" for datepicker pill */
export function formatDayForPill(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd} ${formatMonthShort(d)} ${d.getFullYear()}`;
}
