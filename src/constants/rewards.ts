import { Badge, BadgeTier, BadgeCategory } from '@/types';

// ── Level / XP formula ────────────────────────────────────────────────────────
// Mirrors the existing formula in app/(tabs)/profile.tsx: nextLevelXp = level * 500
export function xpForLevel(level: number): number {
  return level * 500;
}

export interface XPGainResult {
  xp:          number;
  level:       number;
  leveledUp:   boolean;
  levelsGained: number;
}

export function applyXPGain(currentXp: number, currentLevel: number, amount: number): XPGainResult {
  let xp = currentXp + amount;
  let level = currentLevel;
  let levelsGained = 0;

  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level += 1;
    levelsGained += 1;
  }

  return { xp, level, leveledUp: levelsGained > 0, levelsGained };
}

// ── XP rewards table ──────────────────────────────────────────────────────────
export const XP_TABLE = {
  weightLog:   10,
  waterLog:    5,
  mealLog:     8,
  sleepLog:    12,
  vitalsLog:   8,
  stepGoalHit: 25,
} as const;

// ── Badge tier metadata ───────────────────────────────────────────────────────
export const TIER_META: Record<BadgeTier, { label: string; color: string; glow: string }> = {
  bronze:   { label: 'Bronze',   color: '#CD7F32', glow: 'rgba(205,127,50,0.35)' },
  silver:   { label: 'Silver',   color: '#9CA3AF', glow: 'rgba(156,163,175,0.35)' },
  gold:     { label: 'Gold',     color: '#FBBF24', glow: 'rgba(251,191,36,0.40)' },
  platinum: { label: 'Platinum', color: '#A78BFA', glow: 'rgba(167,139,250,0.40)' },
};

export const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  consistency: 'Consistency',
  nutrition:   'Nutrition',
  fitness:     'Fitness',
  vitals:      'Vitals',
  sleep:       'Sleep',
  milestone:   'Milestones',
};

// ── Reward stats snapshot — the numeric inputs badge criteria check against ──
export interface RewardStats {
  weightLogCount:   number;
  waterLogCount:    number;
  mealLogCount:     number;
  sleepLogCount:    number;
  vitalsLogCount:   number;
  totalLogCount:    number;
  streak:           number;
  level:            number;
  weightLostKg:     number;   // first log weight − latest log weight (positive = lost)
  avgSleepScore:    number;
  maxDailySteps:    number;
  totalSteps:       number;
  cycleLogCount:    number;
  customQuestCount: number;
}

function ratio(value: number, target: number): number {
  if (target <= 0) return 1;
  return Math.max(0, Math.min(1, value / target));
}

// ── Badge definitions — each carries a pure check against RewardStats ────────
interface BadgeDefinition {
  id:          string;
  label:       string;
  description: string;
  category:    BadgeCategory;
  tier:        BadgeTier;
  icon:        Badge['icon'];
  xpReward:    number;
  check:       (stats: RewardStats) => { met: boolean; progress: number };
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Bronze
  {
    id: 'first_weigh_in', label: 'First Weigh-In', description: 'Log your weight for the first time.',
    category: 'fitness', tier: 'bronze', icon: { lib: 'MCI', name: 'scale-bathroom' }, xpReward: 30,
    check: (s) => ({ met: s.weightLogCount >= 1, progress: ratio(s.weightLogCount, 1) }),
  },
  {
    id: 'hydration_habit', label: 'Hydration Habit', description: 'Log your water intake 7 times.',
    category: 'nutrition', tier: 'bronze', icon: { lib: 'Ionicons', name: 'water' }, xpReward: 40,
    check: (s) => ({ met: s.waterLogCount >= 7, progress: ratio(s.waterLogCount, 7) }),
  },
  {
    id: 'sleep_scholar', label: 'Sleep Scholar', description: 'Log 5 nights of sleep.',
    category: 'sleep', tier: 'bronze', icon: { lib: 'Ionicons', name: 'moon' }, xpReward: 40,
    check: (s) => ({ met: s.sleepLogCount >= 5, progress: ratio(s.sleepLogCount, 5) }),
  },
  {
    id: 'step_starter', label: 'Step Starter', description: 'Hit 10,000 steps in a single day.',
    category: 'fitness', tier: 'bronze', icon: { lib: 'Ionicons', name: 'walk' }, xpReward: 40,
    check: (s) => ({ met: s.maxDailySteps >= 10000, progress: ratio(s.maxDailySteps, 10000) }),
  },

  // Silver
  {
    id: 'consistency_king', label: 'Consistency King', description: 'Reach a 7-day activity streak.',
    category: 'consistency', tier: 'silver', icon: { lib: 'Ionicons', name: 'flame' }, xpReward: 80,
    check: (s) => ({ met: s.streak >= 7, progress: ratio(s.streak, 7) }),
  },
  {
    id: 'macro_master', label: 'Macro Master', description: 'Log 20 meals.',
    category: 'nutrition', tier: 'silver', icon: { lib: 'MCI', name: 'food-apple' }, xpReward: 80,
    check: (s) => ({ met: s.mealLogCount >= 20, progress: ratio(s.mealLogCount, 20) }),
  },
  {
    id: 'vitals_vigilant', label: 'Vitals Vigilant', description: 'Log 10 vitals readings.',
    category: 'vitals', tier: 'silver', icon: { lib: 'Ionicons', name: 'heart' }, xpReward: 80,
    check: (s) => ({ met: s.vitalsLogCount >= 10, progress: ratio(s.vitalsLogCount, 10) }),
  },

  // Gold
  {
    id: 'iron_will', label: 'Iron Will', description: 'Reach a 30-day activity streak.',
    category: 'consistency', tier: 'gold', icon: { lib: 'Ionicons', name: 'shield' }, xpReward: 200,
    check: (s) => ({ met: s.streak >= 30, progress: ratio(s.streak, 30) }),
  },
  {
    id: 'dream_achiever', label: 'Dream Achiever', description: 'Average a sleep score of 85 or higher.',
    category: 'sleep', tier: 'gold', icon: { lib: 'Ionicons', name: 'sparkles' }, xpReward: 200,
    check: (s) => ({ met: s.sleepLogCount >= 5 && s.avgSleepScore >= 85, progress: s.sleepLogCount < 5 ? ratio(s.sleepLogCount, 5) * 0.5 : ratio(s.avgSleepScore, 85) }),
  },
  {
    id: 'scale_tipper', label: 'Scale Tipper', description: 'Lose 5kg from your starting weight.',
    category: 'fitness', tier: 'gold', icon: { lib: 'Ionicons', name: 'trending-down' }, xpReward: 200,
    check: (s) => ({ met: s.weightLostKg >= 5, progress: ratio(s.weightLostKg, 5) }),
  },

  // Platinum
  {
    id: 'marathon_mindset', label: 'Marathon Mindset', description: 'Walk 500,000 total steps.',
    category: 'milestone', tier: 'platinum', icon: { lib: 'MCI', name: 'run-fast' }, xpReward: 400,
    check: (s) => ({ met: s.totalSteps >= 500000, progress: ratio(s.totalSteps, 500000) }),
  },
  {
    id: 'level_10_hero', label: 'Level 10 Hero', description: 'Reach character level 10.',
    category: 'milestone', tier: 'platinum', icon: { lib: 'Ionicons', name: 'trophy' }, xpReward: 400,
    check: (s) => ({ met: s.level >= 10, progress: ratio(s.level, 10) }),
  },
  {
    id: 'centurion', label: 'Centurion', description: 'Log 100 entries across all trackers.',
    category: 'milestone', tier: 'platinum', icon: { lib: 'Ionicons', name: 'medal' }, xpReward: 400,
    check: (s) => ({ met: s.totalLogCount >= 100, progress: ratio(s.totalLogCount, 100) }),
  },
  // Vitals Cycle Tracking Badge
  {
    id: 'flow_finder', label: 'Flow Finder', description: 'Log a cycle tracking entry.',
    category: 'vitals', tier: 'bronze', icon: { lib: 'Ionicons', name: 'heart-half' }, xpReward: 50,
    check: (s) => ({ met: s.cycleLogCount >= 1, progress: ratio(s.cycleLogCount, 1) }),
  },
  // Custom Challenges Badges
  {
    id: 'challenge_creator', label: 'Challenge Creator', description: 'Create a custom challenge.',
    category: 'consistency', tier: 'bronze', icon: { lib: 'Ionicons', name: 'create' }, xpReward: 50,
    check: (s) => ({ met: s.customQuestCount >= 1, progress: ratio(s.customQuestCount, 1) }),
  },
  {
    id: 'quest_master', label: 'Quest Master', description: 'Create 3 custom challenges.',
    category: 'consistency', tier: 'silver', icon: { lib: 'Ionicons', name: 'ribbon' }, xpReward: 100,
    check: (s) => ({ met: s.customQuestCount >= 3, progress: ratio(s.customQuestCount, 3) }),
  },
];

export function createInitialBadges(): Badge[] {
  return BADGE_DEFINITIONS.map((def) => ({
    id:          def.id,
    label:       def.label,
    description: def.description,
    category:    def.category,
    tier:        def.tier,
    icon:        def.icon,
    xpReward:    def.xpReward,
    unlocked:    false,
    unlockedAt:  null,
    progress:    0,
  }));
}

function avg(values: number[]): number {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
}

// ── Derives a RewardStats snapshot from the fitness store state ──────────────
export function computeRewardStats(state: {
  user: { level: number; streak: number };
  weightLogs:       { weight: number; date: string }[];
  waterLogs:        unknown[];
  meals:            { items: unknown[] }[];
  sleepLogs:        { score: number }[];
  heartRateLogs:    unknown[];
  bloodPressureLogs: unknown[];
  bloodGlucoseLogs: unknown[];
  oxygenLogs:       unknown[];
  stepHistory:      { date: string; steps: number }[];
  stepsCount:       number;
  cycleLogs?:       unknown[];
  customQuests?:    unknown[];
}): RewardStats {
  const mealLogCount   = state.meals.reduce((sum, m) => sum + m.items.length, 0);
  const vitalsLogCount =
    state.heartRateLogs.length + state.bloodPressureLogs.length +
    state.bloodGlucoseLogs.length + state.oxygenLogs.length;

  const sortedWeights = [...state.weightLogs].sort((a, b) => a.date.localeCompare(b.date));
  const weightLostKg  = sortedWeights.length >= 2
    ? Math.max(0, sortedWeights[0].weight - sortedWeights[sortedWeights.length - 1].weight)
    : 0;

  const totalStepsFromHistory = state.stepHistory.reduce((sum, d) => sum + d.steps, 0);
  const maxDailySteps = Math.max(state.stepsCount, ...state.stepHistory.map((d) => d.steps), 0);
  const totalSteps    = totalStepsFromHistory + state.stepsCount;

  const totalLogCount =
    state.weightLogs.length + state.waterLogs.length + mealLogCount +
    state.sleepLogs.length + vitalsLogCount;

  return {
    weightLogCount: state.weightLogs.length,
    waterLogCount:  state.waterLogs.length,
    mealLogCount,
    sleepLogCount:  state.sleepLogs.length,
    vitalsLogCount,
    totalLogCount,
    streak:         state.user.streak,
    level:          state.user.level,
    weightLostKg,
    avgSleepScore:  avg(state.sleepLogs.map((l) => l.score)),
    maxDailySteps,
    totalSteps,
    cycleLogCount:  state.cycleLogs ? state.cycleLogs.length : 0,
    customQuestCount: state.customQuests ? state.customQuests.length : 0,
  };
}

export function checkBadge(id: string, stats: RewardStats): { met: boolean; progress: number } | null {
  const def = BADGE_DEFINITIONS.find((b) => b.id === id);
  return def ? def.check(stats) : null;
}
