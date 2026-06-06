import { useEffect, useRef, useState, useCallback } from 'react';
import { useFitnessStore } from '@/store/fitnessStore';
import { Badge } from '@/types';

export type CelebrationEvent =
  | { id: string; type: 'badge';   badge: Badge }
  | { id: string; type: 'levelUp'; fromLevel: number; toLevel: number };

export interface RewardWatcherResult {
  pending: CelebrationEvent | null;
  dismiss: () => void;
}

/**
 * Watches the global badges/level state and queues "gaming event" style
 * celebrations whenever a badge unlocks or the user levels up — so the
 * RewardCelebrationOverlay can fire from anywhere in the app.
 */
export function useRewardWatcher(): RewardWatcherResult {
  const badges = useFitnessStore(s => s.badges);
  const level  = useFitnessStore(s => s.user.level);

  const [queue, setQueue] = useState<CelebrationEvent[]>([]);
  const seenUnlocked = useRef<Set<string> | null>(null);
  const lastLevel    = useRef<number | null>(null);

  useEffect(() => {
    const currentUnlocked = new Set(badges.filter(b => b.unlocked).map(b => b.id));

    // First run: capture baseline without celebrating already-unlocked badges/levels
    if (seenUnlocked.current === null) {
      seenUnlocked.current = currentUnlocked;
      lastLevel.current = level;
      return;
    }

    const newEvents: CelebrationEvent[] = [];

    badges.forEach((badge) => {
      if (badge.unlocked && !seenUnlocked.current!.has(badge.id)) {
        newEvents.push({ id: `badge_${badge.id}_${Date.now()}`, type: 'badge', badge });
      }
    });

    if (lastLevel.current !== null && level > lastLevel.current) {
      newEvents.push({
        id: `levelup_${level}_${Date.now()}`,
        type: 'levelUp',
        fromLevel: lastLevel.current,
        toLevel: level,
      });
    }

    seenUnlocked.current = currentUnlocked;
    lastLevel.current = level;

    if (newEvents.length > 0) {
      setQueue(prev => [...prev, ...newEvents]);
    }
  }, [badges, level]);

  const dismiss = useCallback(() => {
    setQueue(prev => prev.slice(1));
  }, []);

  return { pending: queue[0] ?? null, dismiss };
}
