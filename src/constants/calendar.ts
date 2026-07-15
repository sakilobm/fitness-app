/**
 * @file calendar.ts
 * @module Utilities/CalendarHelpers
 * @description Pure, zero-dependency algorithmic computations for calendar layout generation and ISO date serialization.
 * 
 * @param {number} year - Enna Vāngum (Inputs): The target calendar year (e.g., 2026).
 * @param {number} month - Enna Vāngum (Inputs): The target calendar month (0-indexed, 0 = January, 11 = December).
 * @param {number} day - Enna Vāngum (Inputs): The day of the month (1-indexed).
 * @process Enna Pannum (Internal Processing):
 *          - Calculates month start day offsets and total days in month.
 *          - Generates complete padding sequences to fill calendar grids.
 *          - Standardizes year-month-date formats into standardized YYYY-MM-DD representations.
 * @returns {(number | null)[]} Enna Return Pannum (Outputs): Decoupled array of days with prefix pads for grid rendering.
 */

import { Dimensions } from 'react-native';

const { width: SW } = Dimensions.get('window');

export const CAL_H_PAD = 16;
export const CELL_W     = Math.floor((SW - CAL_H_PAD * 2) / 7);
export const CELL_H     = CELL_W + 18;
export const CIRCLE_SIZE = Math.min(CELL_W - 6, 38);

export const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const DOT_COLORS = {
  weight: '#A78BFA',
  steps:  '#34D399',
  water:  '#38BDF8',
  meals:  '#FB923C',
  sleep:  '#818CF8',
} as const;

export type Filter = 'all' | 'weight' | 'water' | 'meals' | 'steps' | 'sleep';

export interface FilterConfig {
  key: Filter;
  label: string;
  dotKey?: keyof typeof DOT_COLORS;
}

export const FILTER_CONFIG: FilterConfig[] = [
  { key: 'all',    label: 'All' },
  { key: 'weight', label: 'Weight', dotKey: 'weight' },
  { key: 'water',  label: 'Water',  dotKey: 'water' },
  { key: 'meals',  label: 'Meals',  dotKey: 'meals' },
  { key: 'steps',  label: 'Steps',  dotKey: 'steps' },
  { key: 'sleep',  label: 'Sleep',  dotKey: 'sleep' },
];

// ── Date helpers ──────────────────────────────────────────────────────────────

export function todayISO(): string {
  const d = new Date();
  return toISO(d.getFullYear(), d.getMonth(), d.getDate());
}

export function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDow  = new Date(year, month, 1).getDay();
  const startOff  = (firstDow + 6) % 7; // Monday-first
  const count     = new Date(year, month + 1, 0).getDate();
  const cells     = Math.ceil((startOff + count) / 7) * 7;
  const arr: (number | null)[] = new Array(cells).fill(null);
  for (let i = 0; i < count; i++) arr[startOff + i] = i + 1;
  return arr;
}
