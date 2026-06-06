import { useMemo } from 'react';
import { useFitnessStore } from '@/store/fitnessStore';
import { Badge, BadgeCategory, XPGainEvent } from '@/types';
import { xpForLevel } from '@/constants/rewards';

export interface RewardsResult {
  badges:         Badge[];
  unlockedBadges: Badge[];
  lockedBadges:   Badge[];
  byCategory:     { category: BadgeCategory; badges: Badge[] }[];

  level:        number;
  xp:           number;
  nextLevelXp:  number;
  xpProgress:   number;   // 0–1

  xpHistory:    XPGainEvent[];

  totalUnlocked: number;
  totalBadges:   number;
}

const CATEGORY_ORDER: BadgeCategory[] = ['consistency', 'fitness', 'nutrition', 'sleep', 'vitals', 'milestone'];

export function useRewards(): RewardsResult {
  const badges    = useFitnessStore(s => s.badges ?? []);
  const xpHistory = useFitnessStore(s => s.xpHistory ?? []);
  const level     = useFitnessStore(s => s.user.level);
  const xp        = useFitnessStore(s => s.user.xp);

  const unlockedBadges = useMemo(() => badges.filter(b => b.unlocked), [badges]);
  const lockedBadges   = useMemo(() => badges.filter(b => !b.unlocked), [badges]);

  const byCategory = useMemo(() => {
    return CATEGORY_ORDER
      .map(category => ({ category, badges: badges.filter(b => b.category === category) }))
      .filter(group => group.badges.length > 0);
  }, [badges]);

  const nextLevelXp = xpForLevel(level);
  const xpProgress  = Math.min(1, Math.max(0, xp / nextLevelXp));

  return {
    badges,
    unlockedBadges,
    lockedBadges,
    byCategory,
    level,
    xp,
    nextLevelXp,
    xpProgress,
    xpHistory,
    totalUnlocked: unlockedBadges.length,
    totalBadges:   badges.length,
  };
}
