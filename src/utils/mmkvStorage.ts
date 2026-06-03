import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'fitforge-store' });

/** Zustand StateStorage-compatible adapter for the persist middleware */
export const zustandMMKVStorage = {
  getItem: (key: string): string | null => storage.getString(key) ?? null,
  setItem: (key: string, value: string): void => storage.set(key, value),
  removeItem: (key: string): void => { storage.remove(key); },
};

const getPartitionKey = (domain: string, dateStr: string) =>
  `logs:${domain}:${dateStr.substring(0, 7)}`;

/**
 * Synchronous upsert into a year-month partition.
 * No async overhead — runs on the JS thread but without bridging delay.
 */
export function mmkvSaveLog(domain: string, dateStr: string, entry: any): void {
  const key = getPartitionKey(domain, dateStr);
  const raw = storage.getString(key);
  const partition: Record<string, any[]> = raw ? JSON.parse(raw) : {};

  if (!partition[dateStr]) partition[dateStr] = [];
  const idx = partition[dateStr].findIndex((e) => e.id === entry.id);
  if (idx !== -1) partition[dateStr][idx] = entry;
  else partition[dateStr].push(entry);

  storage.set(key, JSON.stringify(partition));
}

/**
 * Synchronous delete from a year-month partition.
 */
export function mmkvDeleteLog(domain: string, dateStr: string, id: string): void {
  const key = getPartitionKey(domain, dateStr);
  const raw = storage.getString(key);
  if (!raw) return;
  const partition: Record<string, any[]> = JSON.parse(raw);
  if (partition[dateStr]) {
    partition[dateStr] = partition[dateStr].filter((e) => e.id !== id);
    storage.set(key, JSON.stringify(partition));
  }
}

/**
 * Load the last N months of logs for a domain.
 * Synchronous — returns immediately.
 */
export function mmkvHydrateLogs(domain: string, monthsBack = 2): any[] {
  const results: any[] = [];
  const today = new Date();
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const raw = storage.getString(`logs:${domain}:${ym}`);
    if (raw) {
      const partition: Record<string, any[]> = JSON.parse(raw);
      Object.values(partition).forEach((entries) => results.push(...entries));
    }
  }
  return results;
}
