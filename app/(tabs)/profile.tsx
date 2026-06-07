import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import ProgressRing from '@/components/ui/ProgressRing';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { useProfileSettings } from '@/store/fitnessStore';
import { useRouter } from 'expo-router';
import { kgToLbs, mlToOz } from '@/utils/units';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRewards } from '@/hooks/useRewards';
import { TIER_META } from '@/constants/rewards';
import { GoalsCalibrationAccordion, QuickPreferencesCard } from '@/components/profile';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type IconDef =
  | { lib: 'Ionicons'; name: IoniconName }
  | { lib: 'MCI'; name: MCIName };

function AppIcon({ icon, size, color }: { icon: IconDef; size: number; color: string }) {
  if (icon.lib === 'MCI') return <MaterialCommunityIcons name={icon.name} size={size} color={color} />;
  return <Ionicons name={icon.name} size={size} color={color} />;
}

export default function ProfileScreen() {
  const { colors, isDark: isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useProfileSettings();
  const { badges, totalUnlocked, totalBadges } = useRewards();
  const badgePreview = badges.slice(0, 8);

  // Safe fallbacks for store preferences
  const weightUnit = user.weightUnit || 'kg';
  const volumeUnit = user.volumeUnit || 'ml';

  // Dynamic Level XP progress calculations
  const nextLevelXp = user.level * 500;
  const progressPct = Math.min(100, Math.max(3, (user.xp / nextLevelXp) * 100));

  // Compute initials dynamically
  const initials = user.name
    .split(' ')
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Unit-aware strings
  const weightValStr = weightUnit === 'lbs' ? `${kgToLbs(user.weight)} lbs` : `${user.weight} kg`;
  const waterValStr = volumeUnit === 'oz' ? `${mlToOz(user.waterGoal)} oz` : `${(user.waterGoal / 1000).toFixed(1)}L`;

  // Compute dynamic stats list
  const userStats = [
    { label: 'Age', value: `${user.age}`, icon: 'calendar-outline' as IoniconName, color: '#6366F1' },
    { label: 'Height', value: `${user.height} cm`, icon: 'resize-outline' as IoniconName, color: colors.lime },
    { label: 'Weight', value: weightValStr, icon: 'barbell-outline' as IoniconName, color: colors.amber },
    { label: 'Goal', value: user.goal, icon: (user.goal === 'Gain Muscle' ? 'trending-up-outline' : user.goal === 'Stay Fit' ? 'body-outline' : 'trending-down-outline') as IoniconName, color: colors.chart.calories },
  ];

  // Compute dynamic weekly summary based on goals
  const weekSummary: { icon: IconDef; label: string; value: string; color: string }[] = [
    { icon: { lib: 'MCI' as const, name: 'dumbbell' as const }, label: 'Workouts', value: `${user.workoutGoal}`, color: colors.lime },
    { icon: { lib: 'Ionicons' as const, name: 'trophy' as const }, label: 'Goals Hit', value: '18/21', color: colors.amber },
    { icon: { lib: 'Ionicons' as const, name: 'flame' as const }, label: 'Streak', value: `${user.streak}d`, color: colors.amber },
    { icon: { lib: 'Ionicons' as const, name: 'water' as const }, label: 'Avg Water', value: waterValStr, color: colors.chart.water },
  ];

  // Goal conversions for metrics
  const currentWeightDisp = weightUnit === 'lbs' ? kgToLbs(user.weight) : user.weight;
  const targetWeightDisp = user.goal === 'Gain Muscle'
    ? (weightUnit === 'lbs' ? kgToLbs(85) : 85)
    : (weightUnit === 'lbs' ? kgToLbs(72) : 72);
  const remainingWeightDisp = user.goal === 'Gain Muscle'
    ? Math.max(0, targetWeightDisp - currentWeightDisp)
    : Math.max(0, currentWeightDisp - targetWeightDisp);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Profile"
          subtitle="MY ACCOUNT"
          icon={{ lib: 'Ionicons', name: 'person' }}
          accentColor={colors.lime}
          rightIcon="settings-outline"
          onRightPress={() => router.push('/settings')}
        />

        {/* Profile header card */}
        <GlassCard accentColor={colors.lime}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              {user.profilePic ? (
                <Image source={{ uri: user.profilePic }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
              <View style={styles.avatarDot} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              {user.email ? (
                <Text style={styles.profileEmail} numberOfLines={1}>{user.email}</Text>
              ) : null}
              <Text style={styles.profileMotto} numberOfLines={1}>"{user.motto}"</Text>

              <View style={styles.profileHeaderActions}>
                <View style={styles.levelBadge}>
                  <Ionicons name="flash" size={11} color={colors.lime} />
                  <Text style={styles.levelText}>Level {user.level} · {user.xp} XP</Text>
                </View>
                <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/settings')} activeOpacity={0.75}>
                  <Ionicons name="settings-sharp" size={11} color={colors.lime} />
                  <Text style={styles.editBtnText}>Edit Settings</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.xpBarTrack}>
                <View style={[styles.xpBarFill, { width: `${progressPct}%` }]} />
              </View>
              <Text style={styles.xpSub}>{nextLevelXp - user.xp} XP to Level {user.level + 1}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Goals Calibration — collapsed by default (tap to expand), wired straight
            to the live store so changes apply instantly, no trip to Settings needed. */}
        <GoalsCalibrationAccordion />

        {/* Everyday toggles, surfaced right here instead of buried in Settings */}
        <QuickPreferencesCard />

        {/* Dynamic Stats Grid */}
        <GlassCard>
          <SectionHeader title="My Stats" accentColor="#6366F1" />
          <View style={styles.statsGrid}>
            {userStats.map((s) => (
              <View key={s.label} style={styles.statCell}>
                <View style={[styles.statIconWrap, { backgroundColor: s.color + '12' }]}>
                  <Ionicons name={s.icon} size={16} color={s.color} />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Dynamic Weekly Summary card */}
        <GlassCard accentColor={colors.amber}>
          <SectionHeader title="This Week" accentColor={colors.amber} />
          <View style={styles.weekRow}>
            {weekSummary.map((w) => (
              <View key={w.label} style={styles.weekItem}>
                <View style={[styles.weekIconWrap, { backgroundColor: w.color + '15', borderColor: w.color + '30' }]}>
                  <AppIcon icon={w.icon} size={22} color={w.color} />
                </View>
                <Text style={[styles.weekVal, { color: w.color }]}>{w.value}</Text>
                <Text style={styles.weekLabel}>{w.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Achievements Achievements badge row */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/rewards')}>
          <GlassCard>
            <SectionHeader
              title="Achievements"
              action={`${totalUnlocked}/${totalBadges} · View All →`}
              onAction={() => router.push('/rewards')}
              accentColor={colors.amber}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
              <View style={styles.badgeRow}>
                {badgePreview.map((badge) => {
                  const tierColor = TIER_META[badge.tier].color;
                  return (
                    <View key={badge.id} style={[styles.badgeItem, !badge.unlocked && styles.badgeLocked]}>
                      <View style={[
                        styles.badgeCircle,
                        badge.unlocked && {
                          backgroundColor: tierColor + '12',
                          borderColor: tierColor + '55',
                          shadowColor: tierColor,
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                        },
                      ]}>
                        <AppIcon
                          icon={badge.icon as IconDef}
                          size={24}
                          color={badge.unlocked ? tierColor : colors.muted}
                        />
                      </View>
                      <Text style={[styles.badgeLabel, !badge.unlocked && styles.badgeLabelLocked]}>
                        {badge.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </GlassCard>
        </TouchableOpacity>

        {/* Dynamic Goal progress */}
        <GlassCard accentColor={colors.amber}>
          <SectionHeader title="Goal Progress" accentColor={colors.amber} />
          <View style={styles.goalRow}>
            <ProgressRing size={100} strokeWidth={10} progress={0.46} color={colors.amber}>
              <Text style={styles.goalPct}>46%</Text>
            </ProgressRing>
            <View style={styles.goalText}>
              <Text style={styles.goalTitle}>{user.goal}</Text>
              <Text style={styles.goalSub}>
                Current: {currentWeightDisp} {weightUnit} → Target: {user.goal === 'Stay Fit' ? 'Maintain' : `${targetWeightDisp} ${weightUnit}`}
              </Text>
              <Text style={styles.goalEta}>{user.goal === 'Stay Fit' ? 'Awesome! Keep up active routines' : 'Est. 9 weeks at current pace'}</Text>
              <View style={styles.goalBadge}>
                <Ionicons name={user.goal === 'Gain Muscle' ? 'trending-up' : user.goal === 'Stay Fit' ? 'body' : 'trending-down'} size={11} color={colors.amber} />
                <Text style={styles.goalBadgeText}>
                  {user.goal === 'Stay Fit' ? 'Active lifestyle' : `${remainingWeightDisp.toFixed(1)} ${weightUnit} remaining`}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Settings Navigation Card at the Bottom */}
        <View style={styles.bottomNavRow}>
          <Animated.View entering={FadeInUp.delay(100).springify().damping(18)} style={{ flex: 1 }}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/cycle')} style={{ flex: 1 }}>
              <GlassCard accentColor="#F87171" style={{ flex: 1 }}>
                <View style={styles.settingsNavRow}>
                  <View style={[styles.settingsNavIconWrap, { backgroundColor: '#F87171' + '15' }]}>
                    <Ionicons name="flower" size={20} color="#F87171" />
                  </View>
                  <View style={styles.settingsNavTextWrap}>
                    <Text style={styles.settingsNavTitle}>Cycle Tracking</Text>
                    <Text style={styles.settingsNavSub}>Period, ovulation & symptoms</Text>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(120).springify().damping(18)} style={{ flex: 1 }}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/settings')} style={{ flex: 1 }}>
              <GlassCard accentColor={colors.lime} style={{ flex: 1 }}>
                <View style={styles.settingsNavRow}>
                  <View style={[styles.settingsNavIconWrap, { backgroundColor: colors.lime + '15' }]}>
                    <Ionicons name="settings" size={20} color={colors.lime} />
                  </View>
                  <View style={styles.settingsNavTextWrap}>
                    <Text style={styles.settingsNavTitle}>Preferences</Text>
                    <Text style={styles.settingsNavSub}>Units, backups & privacy</Text>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  profileHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: colors.lime + '18',
    borderWidth: 2.5, borderColor: colors.lime,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: { ...Typography.h2, color: colors.lime },
  avatarDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5, borderColor: colors.card,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { ...Typography.h3, color: colors.text.primary },
  profileEmail: {
    ...Typography.caption,
    color: colors.text.secondary,
    marginTop: 1,
  },
  profileMotto: {
    ...Typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: -2,
  },
  profileHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.lime + '15',
    borderColor: colors.lime + '30',
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editBtnText: {
    ...Typography.micro,
    color: colors.lime,
  },
  levelBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.lime + '18', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.lime + '40',
  },
  levelText: { ...Typography.captionBold, color: colors.lime },
  xpBarTrack: {
    height: 5, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: Radius.pill, overflow: 'hidden', marginTop: 4,
  },
  xpBarFill: {
    height: '100%', backgroundColor: colors.lime, borderRadius: Radius.pill,
  },
  xpSub: { ...Typography.micro, color: colors.muted },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCell: {
    width: '48%', backgroundColor: colors.bg + '88',
    borderRadius: Radius.md, padding: 14,
    borderWidth: 1, borderColor: colors.cardBorder, gap: 4,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { ...Typography.h4, color: colors.text.primary },
  statLabel: { ...Typography.caption, color: colors.muted },

  weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
  weekItem: { alignItems: 'center', gap: 6 },
  weekIconWrap: {
    width: 46, height: 46, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  weekVal: { ...Typography.h4 },
  weekLabel: { ...Typography.micro, color: colors.muted },

  badgeScroll: { marginHorizontal: -4 },
  badgeRow: { flexDirection: 'row', gap: 14, paddingHorizontal: 4, paddingBottom: 4 },
  badgeItem: { alignItems: 'center', gap: 6, width: 70 },
  badgeLocked: { opacity: 0.35 },
  badgeCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderWidth: 1.5, borderColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeLabel: { ...Typography.micro, color: colors.text.primary, textAlign: 'center' },
  badgeLabelLocked: { color: colors.muted },

  goalRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  goalPct: { ...Typography.bodyBold, color: colors.amber },
  goalText: { flex: 1, gap: 4 },
  goalTitle: { ...Typography.h4, color: colors.text.primary },
  goalSub: { ...Typography.caption, color: colors.muted },
  goalEta: { ...Typography.micro, color: colors.muted },
  goalBadge: {
    alignSelf: 'flex-start', marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.amber + '18', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.amber + '40',
  },
  goalBadgeText: { ...Typography.captionBold, color: colors.amber },

  bottomNavRow: { flexDirection: 'row', gap: 10 },

  // Settings / cycle navigation card layout
  settingsNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  settingsNavIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsNavTextWrap: {
    flex: 1,
    gap: 2,
  },
  settingsNavTitle: {
    ...Typography.bodyBold,
    color: colors.text.primary,
  },
  settingsNavSub: {
    ...Typography.caption,
    color: colors.text.secondary,
  },
});
