import { AppState } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'fitforge-store' });

// ─── Debounced persist writes ──────────────────────────────────────────────
// The zustand `persist` middleware re-serializes and writes the ENTIRE store
// blob on every single state mutation (toggling a switch, expanding a card,
// awarding XP, etc). Doing that synchronously on the JS thread is what causes
// the perceptible input lag / jank when navigating right after an action.
// Coalescing rapid writes into one (after a short quiet period) keeps state
// reads instant while moving the actual disk I/O off the interaction's critical
// path. Pending writes are flushed immediately if the app backgrounds, so nothing
// is lost if the user closes the app within the debounce window.
const WRITE_DEBOUNCE_MS = 350;
const pendingWrites = new Map<string, { value: string; timer: ReturnType<typeof setTimeout> }>();

function flushKey(key: string): void {
  const entry = pendingWrites.get(key);
  if (!entry) return;
  clearTimeout(entry.timer);
  pendingWrites.delete(key);
  storage.set(key, entry.value);
}

function flushAllPendingWrites(): void {
  for (const key of Array.from(pendingWrites.keys())) flushKey(key);
}

AppState.addEventListener('change', (state) => {
  if (state !== 'active') flushAllPendingWrites();
});

/** Zustand StateStorage-compatible adapter for the persist middleware */
export const zustandMMKVStorage = {
  getItem: (key: string): string | null => {
    // Serve the latest in-flight value so reads stay consistent before a flush.
    const pending = pendingWrites.get(key);
    if (pending) return pending.value;
    return storage.getString(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    const existing = pendingWrites.get(key);
    if (existing) clearTimeout(existing.timer);
    const timer = setTimeout(() => flushKey(key), WRITE_DEBOUNCE_MS);
    pendingWrites.set(key, { value, timer });
  },
  removeItem: (key: string): void => {
    const existing = pendingWrites.get(key);
    if (existing) {
      clearTimeout(existing.timer);
      pendingWrites.delete(key);
    }
    storage.remove(key);
  },
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
