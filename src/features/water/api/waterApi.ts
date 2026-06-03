import { supabase } from '@/lib/supabase';
import { useFitnessStore } from '@/store/fitnessStore';
import { mmkvSaveLog, mmkvDeleteLog } from '@/utils/mmkvStorage';
import { enqueueSync } from '@/utils/syncQueue';
import { LogEntry } from '@/types';

const getPastDateStr = (daysAgo = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const waterApi = {
  /**
   * Optimistic add:
   *   1. Zustand in-memory update (instant, triggers UI re-render)
   *   2. MMKV partition write (synchronous, < 1ms)
   *   3. Supabase upsert enqueued for background sync (after interactions settle)
   */
  async addLog(ml: number): Promise<void> {
    const today = getPastDateStr();
    const entry: LogEntry = {
      id: `w_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      ml,
    };

    useFitnessStore.getState().addWaterLog(ml);
    mmkvSaveLog('water', today, entry);

    const userId = await getUserId();
    if (userId) {
      enqueueSync('water_logs', { ...entry, user_id: userId, date: today });
    }
  },

  /**
   * Optimistic delete — removes from Zustand and MMKV immediately,
   * then enqueues the Supabase delete.
   */
  async deleteLog(id: string): Promise<void> {
    const today = getPastDateStr();

    useFitnessStore.getState().deleteWaterLog(id);
    mmkvDeleteLog('water', today, id);

    const userId = await getUserId();
    if (userId) {
      enqueueSync('water_logs', { id, user_id: userId }, 'delete');
    }
  },

  /**
   * Reconcile remote logs into local state — call once on app foreground restore.
   * Remote wins on conflict (deduped by id).
   */
  async reconcile(daysBack = 7): Promise<void> {
    const userId = await getUserId();
    if (!userId) return;

    const since = getPastDateStr(daysBack);
    const { data, error } = await supabase
      .from('water_logs')
      .select('id, time, ml')
      .eq('user_id', userId)
      .gte('date', since)
      .order('date', { ascending: true });

    if (error || !data) return;

    const localIds = new Set(
      useFitnessStore.getState().waterLogs.map((l) => l.id)
    );
    const newRemote: LogEntry[] = data
      .filter((row) => !localIds.has(row.id))
      .map((row) => ({ id: row.id, time: row.time, ml: row.ml }));

    if (newRemote.length > 0) {
      useFitnessStore.setState((s) => ({
        waterLogs: [...s.waterLogs, ...newRemote],
      }));
    }
  },
};
