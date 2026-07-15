export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getMonthFirstDayIndexAligned(year: number, monthIndex: number): number {
  const index = new Date(year, monthIndex, 1).getDay(); // 0 = Sunday
  return index === 0 ? 6 : index - 1; // Aligns Monday=0 to Sunday=6
}

export function buildCalendarDays(year: number, monthIndex: number): Array<string | null> {
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const adjustedFirstDay = getMonthFirstDayIndexAligned(year, monthIndex);

  const days: Array<string | null> = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    days.push(`${year}-${monthStr}-${dayStr}`);
  }
  return days;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
