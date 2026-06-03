import { InteractionManager } from 'react-native';
import { supabase } from '../lib/supabase';

type SyncOpType = 'upsert' | 'delete';

interface SyncOp {
  table: string;
  payload: any;
  type: SyncOpType;
}

const queue: SyncOp[] = [];
let isFlushScheduled = false;

function scheduleFlush() {
  if (isFlushScheduled) return;
  isFlushScheduled = true;
  // Fires only after all animations/gestures have settled — zero frame impact
  InteractionManager.runAfterInteractions(async () => {
    isFlushScheduled = false;
    await flushQueue();
  });
}

async function flushQueue() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return; // unauthenticated or offline — leave in queue

  while (queue.length > 0) {
    const op = queue.shift()!;
    try {
      if (op.type === 'upsert') {
        await supabase.from(op.table).upsert(op.payload, { onConflict: 'id' });
      } else {
        await supabase.from(op.table).delete().eq('id', op.payload.id);
      }
    } catch {
      queue.unshift(op); // push back to front, retry on next interaction
      break;
    }
  }
}

/**
 * Enqueue a Supabase sync operation.
 * Fires in the background after user interactions complete — never blocks a frame.
 */
export function enqueueSync(
  table: string,
  payload: any,
  type: SyncOpType = 'upsert'
): void {
  queue.push({ table, payload, type });
  scheduleFlush();
}

/** Returns the number of pending ops (useful for a sync indicator UI). */
export function getPendingSyncCount(): number {
  return queue.length;
}
