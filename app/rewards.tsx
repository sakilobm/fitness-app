import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import GlassCard from '@/components/ui/GlassCard';
import ScreenHeader from '@/components/ui/ScreenHeader';
import SectionHeader from '@/components/ui/SectionHeader';
import { useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { useFitnessStore } from '@/store/fitnessStore';
import { useRewards } from '@/hooks/useRewards';
import type { Badge } from '@/types/index';
import { XPHeroCard, BadgeGrid, BadgeDetailSheet, XPHistoryRow } from '@/components/rewards';

export default function RewardsScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const streak = useFitnessStore(s => s.user.streak);
  const {
    level, xp, nextLevelXp, xpProgress,
    byCategory, xpHistory, totalUnlocked, totalBadges,
  } = useRewards();

  const [selected, setSelected] = React.useState<Badge | null>(null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionHeaderWrap}>
        <ScreenHeader
          title="Rewards"
          subtitle="XP, LEVELS & BADGES"
          icon={{ lib: 'Ionicons', name: 'trophy' }}
          accentColor={colors.amber}
          showBack
          onBack={() => router.back()}
        />
      </View>

      <XPHeroCard
        level={level}
        xp={xp}
        nextLevelXp={nextLevelXp}
        xpProgress={xpProgress}
        streak={streak}
        colors={colors}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeaderWrap}>
          <SectionHeader
            title="Badges"
            accentColor={colors.amber}
            action={`${totalUnlocked}/${totalBadges} unlocked`}
          />
        </View>
        <BadgeGrid groups={byCategory} colors={colors} onSelect={setSelected} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderWrap}>
          <SectionHeader title="XP History" accentColor={colors.lime} />
        </View>
        <GlassCard noPadding style={styles.historyCard}>
          {xpHistory.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={[styles.emptyTxt, { color: colors.muted }]}>
                Log a workout, meal, or vitals reading to start earning XP.
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {xpHistory.map((event) => (
                <XPHistoryRow key={event.id} event={event} colors={colors} />
              ))}
            </View>
          )}
        </GlassCard>
      </View>

      <BadgeDetailSheet badge={selected} onClose={() => setSelected(null)} colors={colors} />
    </ScrollView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { gap: 20 },

  section: { paddingHorizontal: 0 },
  sectionHeaderWrap: { paddingHorizontal: 16 },
  historyCard: { marginHorizontal: 16 },
  historyList: { paddingHorizontal: 16, paddingVertical: 4 },

  emptyHistory: { paddingVertical: 28, paddingHorizontal: 24, alignItems: 'center' },
  emptyTxt: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
