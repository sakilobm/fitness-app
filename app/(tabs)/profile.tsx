import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp, FadeIn,
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, Easing,
} from 'react-native-reanimated';
import ProgressRing from '@/components/ui/ProgressRing';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { useProfileSettings } from '@/store/fitnessStore';
import { useRouter } from 'expo-router';
import { kgToLbs, mlToOz } from '@/utils/units';
import { useRewards } from '@/hooks/useRewards';
import { TIER_META } from '@/constants/rewards';
import { GoalsCalibrationAccordion, QuickPreferencesCard } from '@/components/profile';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
type IconDef = { lib: 'Ionicons'; name: IoniconName } | { lib: 'MCI'; name: MCIName };

function AppIcon({ icon, size, color }: { icon: IconDef; size: number; color: string }) {
  if (icon.lib === 'MCI') return <MaterialCommunityIcons name={icon.name} size={size} color={color} />;
  return <Ionicons name={icon.name} size={size} color={color} />;
}

const { width: SCREEN_W } = Dimensions.get('window');
const TABS = ['Overview', 'Goals', 'Achievements'] as const;
const CTRL_INNER_W = SCREEN_W - 32 - 8; // 16px padding × 2, 4px pad × 2
const TAB_W = CTRL_INNER_W / 3;

// ─── Animated segmented control ───────────────────────────────────────────────
function SegmentedControl({
  activeTab, onTab, colors, isDark,
}: { activeTab: number; onTab: (i: number) => void; colors: ThemeColors; isDark: boolean }) {
  const indicatorX = useSharedValue(0);
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const press = (i: number) => {
    indicatorX.value = withSpring(i * TAB_W, { damping: 22, stiffness: 340, mass: 0.8 });
    onTab(i);
  };

  return (
    <View style={{
      marginHorizontal: 16, marginBottom: 6,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      borderRadius: Radius.pill, padding: 4,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    }}>
      {/* Sliding indicator */}
      <Animated.View
        style={[{
          position: 'absolute', top: 4, left: 4,
          width: TAB_W, height: 38,
          borderRadius: Radius.pill - 2,
          backgroundColor: colors.lime,
          shadowColor: colors.lime,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.38,
          shadowRadius: 10,
          elevation: 6,
        }, indicatorStyle]}
      />
      <View style={{ flexDirection: 'row' }}>
        {TABS.map((label, i) => (
          <TouchableOpacity
            key={label}
            style={{ width: TAB_W, height: 38, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => press(i)}
            activeOpacity={0.75}
          >
            <Text style={{
              fontSize: 13,
              fontWeight: activeTab === i ? '700' : '500',
              color: activeTab === i
                ? (isDark ? '#0D0F0E' : '#fff')
                : colors.muted,
              letterSpacing: activeTab === i ? -0.2 : 0,
            }}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Hero card ─────────────────────────────────────────────────────────────────
function HeroCard({
  colors, isDark, user, progressPct, nextLevelXp, initials,
  weightValStr, onSettings,
}: {
  colors: ThemeColors; isDark: boolean; user: any;
  progressPct: number; nextLevelXp: number;
  initials: string; weightValStr: string;
  onSettings: () => void;
}) {
  const [trackW, setTrackW] = useState(0);
  const xpFillW = useSharedValue(0);

  useEffect(() => {
    if (trackW > 0) {
      xpFillW.value = withTiming(trackW * (progressPct / 100), {
        duration: 1400, easing: Easing.out(Easing.cubic),
      });
    }
  }, [trackW]);

  const xpFillStyle = useAnimatedStyle(() => ({ width: xpFillW.value }));

  const gradColors = isDark
    ? ['#061412', '#0E1D16', '#131A15'] as [string, string, string]
    : ['#0C2318', '#1A4030', '#254D38'] as [string, string, string];

  return (
    <LinearGradient colors={gradColors} style={{ marginHorizontal: 16, borderRadius: Radius.xl, overflow: 'hidden', marginBottom: 14 }}>
      {/* Depth orbs */}
      <View style={{
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        backgroundColor: colors.lime + '10', top: -40, right: -40,
      }} />
      <View style={{
        position: 'absolute', width: 100, height: 100, borderRadius: 50,
        backgroundColor: colors.lime + '08', top: 30, left: -30,
      }} />

      <View style={{ padding: 20, paddingBottom: 18 }}>
        {/* Top row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
          {/* Avatar */}
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: colors.lime + '15',
            borderWidth: 2.5, borderColor: colors.lime,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: colors.lime, shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.55, shadowRadius: 16, elevation: 8,
          }}>
            {user.profilePic
              ? <Image source={{ uri: user.profilePic }} style={{ width: '100%', height: '100%', borderRadius: 38 }} />
              : <Text style={{ fontSize: 26, fontWeight: '700', color: colors.lime }}>{initials}</Text>
            }
            <View style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 14, height: 14, borderRadius: 7,
              backgroundColor: '#22C55E', borderWidth: 2, borderColor: colors.bg,
            }} />
          </View>

          {/* Name + info */}
          <View style={{ flex: 1, paddingTop: 2 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.4 }} numberOfLines={1}>
              {user.name}
            </Text>
            {user.motto ? (
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginTop: 2 }} numberOfLines={1}>
                "{user.motto}"
              </Text>
            ) : null}
            {/* Badges row */}
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: colors.lime + '22', borderRadius: Radius.pill,
                paddingHorizontal: 9, paddingVertical: 4,
                borderWidth: 1, borderColor: colors.lime + '50',
              }}>
                <Ionicons name="flash" size={11} color={colors.lime} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.lime }}>
                  Lv.{user.level}
                </Text>
              </View>
              {user.streak > 0 && (
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  backgroundColor: 'rgba(245,158,11,0.20)', borderRadius: Radius.pill,
                  paddingHorizontal: 9, paddingVertical: 4,
                  borderWidth: 1, borderColor: 'rgba(245,158,11,0.40)',
                }}>
                  <Ionicons name="flame" size={11} color={colors.amber} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.amber }}>
                    {user.streak}d
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Settings button */}
          <TouchableOpacity
            onPress={onSettings}
            style={{
              width: 40, height: 40, borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.10)',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-sharp" size={18} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
        </View>

        {/* XP bar section */}
        <View style={{ marginTop: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.lime, letterSpacing: 0.3 }}>
              {user.xp} XP
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.35)', letterSpacing: 0.3 }}>
              {nextLevelXp - user.xp} to Lv.{user.level + 1}
            </Text>
          </View>
          <View
            style={{
              height: 7, backgroundColor: 'rgba(255,255,255,0.10)',
              borderRadius: Radius.pill, overflow: 'hidden',
            }}
            onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
          >
            <Animated.View style={[{
              height: '100%', borderRadius: Radius.pill,
              backgroundColor: colors.lime,
              shadowColor: colors.lime, shadowOpacity: 0.8, shadowRadius: 6,
            }, xpFillStyle]} />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

// ─── Overview content ──────────────────────────────────────────────────────────
function OverviewContent({
  colors, isDark, user, weekSummary, userStats, progressPct,
  currentWeightDisp, targetWeightDisp, remainingWeightDisp, weightUnit,
}: any) {
  const goalIcon: IoniconName = user.goal === 'Gain Muscle'
    ? 'trending-up' : user.goal === 'Stay Fit' ? 'body' : 'trending-down';

  return (
    <View style={{ gap: 14 }}>
      {/* Stats 2×2 */}
      <Animated.View entering={FadeInUp.delay(60).springify().damping(18)}>
        <View style={{
          marginHorizontal: 16,
          backgroundColor: colors.card,
          borderRadius: Radius.xl, padding: 16,
          borderWidth: 1, borderColor: colors.cardBorder,
          shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
        }}>
          <Text style={{ ...Typography.captionBold, color: colors.muted, letterSpacing: 0.8, marginBottom: 14 }}>
            MY STATS
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {userStats.map((s: any, i: number) => (
              <Animated.View
                key={s.label}
                entering={FadeInUp.delay(80 + i * 60).springify().damping(16)}
                style={{
                  width: '47%', backgroundColor: colors.ivory,
                  borderRadius: Radius.lg, padding: 14,
                  borderWidth: 1, borderColor: colors.cardBorder,
                  gap: 6,
                }}
              >
                <View style={{
                  width: 32, height: 32, borderRadius: 10,
                  backgroundColor: s.color + '15', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name={s.icon} size={17} color={s.color} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.5 }}>
                  {s.value}
                </Text>
                <Text style={{ ...Typography.micro, color: colors.muted, letterSpacing: 0.6 }}>
                  {s.label.toUpperCase()}
                </Text>
              </Animated.View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Weekly summary */}
      <Animated.View entering={FadeInUp.delay(160).springify().damping(18)}>
        <View style={{
          marginHorizontal: 16,
          backgroundColor: colors.card,
          borderRadius: Radius.xl, padding: 16,
          borderWidth: 1, borderColor: colors.cardBorder,
          shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
        }}>
          <Text style={{ ...Typography.captionBold, color: colors.muted, letterSpacing: 0.8, marginBottom: 14 }}>
            THIS WEEK
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {weekSummary.map((w: any, i: number) => (
              <Animated.View
                key={w.label}
                entering={FadeInUp.delay(180 + i * 50).springify().damping(16)}
                style={{ alignItems: 'center', gap: 7 }}
              >
                <View style={{
                  width: 52, height: 52, borderRadius: 17,
                  backgroundColor: w.color + '15', alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderColor: w.color + '30',
                }}>
                  <AppIcon icon={w.icon} size={24} color={w.color} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: w.color, letterSpacing: -0.3 }}>
                  {w.value}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: '600', color: colors.muted, letterSpacing: 0.5 }}>
                  {w.label.toUpperCase()}
                </Text>
              </Animated.View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Goal progress */}
      <Animated.View entering={FadeInUp.delay(260).springify().damping(18)}>
        <View style={{
          marginHorizontal: 16,
          backgroundColor: colors.card, borderRadius: Radius.xl, padding: 18,
          borderWidth: 1, borderColor: colors.amber + '30',
          shadowColor: colors.amber, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
          flexDirection: 'row', alignItems: 'center', gap: 18,
        }}>
          <ProgressRing size={90} strokeWidth={9} progress={0.46} color={colors.amber}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.amber }}>46%</Text>
          </ProgressRing>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={{ ...Typography.captionBold, color: colors.muted, letterSpacing: 0.7 }}>
              GOAL PROGRESS
            </Text>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
              {user.goal}
            </Text>
            <Text style={{ ...Typography.caption, color: colors.muted }}>
              {currentWeightDisp} → {user.goal === 'Stay Fit' ? 'Maintain' : `${targetWeightDisp} ${weightUnit}`}
            </Text>
            <View style={{
              alignSelf: 'flex-start', marginTop: 4,
              flexDirection: 'row', alignItems: 'center', gap: 5,
              backgroundColor: colors.amber + '18', borderRadius: Radius.pill,
              paddingHorizontal: 10, paddingVertical: 4,
              borderWidth: 1, borderColor: colors.amber + '40',
            }}>
              <Ionicons name={goalIcon} size={11} color={colors.amber} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.amber }}>
                {user.goal === 'Stay Fit' ? 'Active lifestyle' : `${remainingWeightDisp.toFixed(1)} ${weightUnit} remaining`}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Goals content ─────────────────────────────────────────────────────────────
function GoalsContent() {
  return (
    <Animated.View entering={FadeInUp.delay(60).springify().damping(18)} style={{ gap: 14, marginHorizontal: 16 }}>
      <GoalsCalibrationAccordion />
      <QuickPreferencesCard />
    </Animated.View>
  );
}

// ─── Achievements content ──────────────────────────────────────────────────────
function AchievementsContent({
  colors, badges, totalUnlocked, totalBadges, onViewAll,
}: any) {
  const grid = badges.slice(0, 12);
  return (
    <View style={{ gap: 14 }}>
      {/* Header */}
      <Animated.View entering={FadeIn.delay(40).duration(280)}>
        <View style={{
          marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.4 }}>
              {totalUnlocked}
              <Text style={{ fontSize: 15, fontWeight: '500', color: colors.muted }}>
                /{totalBadges} earned
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={onViewAll}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 5,
              backgroundColor: colors.amber + '15',
              borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 7,
              borderWidth: 1, borderColor: colors.amber + '35',
            }}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.amber }}>View All</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.amber} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Badge grid 3-column */}
      <Animated.View entering={FadeInUp.delay(80).springify().damping(18)}>
        <View style={{
          marginHorizontal: 16,
          backgroundColor: colors.card, borderRadius: Radius.xl, padding: 16,
          borderWidth: 1, borderColor: colors.cardBorder,
          shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
        }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {grid.map((badge: any, i: number) => {
              const tierColor = TIER_META[badge.tier as keyof typeof TIER_META].color;
              return (
                <Animated.View
                  key={badge.id}
                  entering={FadeInUp.delay(100 + i * 40).springify().damping(16)}
                  style={{
                    width: (SCREEN_W - 32 - 32 - 20) / 3,
                    alignItems: 'center', gap: 6,
                    opacity: badge.unlocked ? 1 : 0.3,
                  }}
                >
                  <View style={{
                    width: 58, height: 58, borderRadius: 20,
                    backgroundColor: badge.unlocked ? tierColor + '14' : colors.ivory,
                    borderWidth: 1.5,
                    borderColor: badge.unlocked ? tierColor + '55' : colors.cardBorder,
                    alignItems: 'center', justifyContent: 'center',
                    shadowColor: badge.unlocked ? tierColor : 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: badge.unlocked ? 0.45 : 0,
                    shadowRadius: 10,
                    elevation: badge.unlocked ? 4 : 0,
                  }}>
                    <AppIcon
                      icon={badge.icon as unknown as IconDef}
                      size={26}
                      color={badge.unlocked ? tierColor : colors.muted}
                    />
                  </View>
                  <Text style={{
                    fontSize: 10, fontWeight: '600', color: colors.text.primary,
                    textAlign: 'center', lineHeight: 13,
                  }} numberOfLines={2}>
                    {badge.label}
                  </Text>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Bottom action bar — THUMB COMFORT ZONE (Fitts's Law) ─────────────────────
function BottomActions({
  colors, isDark, insets, onSettings, onRewards,
}: { colors: ThemeColors; isDark: boolean; insets: any; onSettings: () => void; onRewards: () => void }) {
  const rows = [
    {
      icon: 'settings-sharp' as IoniconName, color: colors.lime,
      title: 'Preferences & Settings', sub: 'Units, privacy, notifications', onPress: onSettings,
    },
    {
      icon: 'trophy' as IoniconName, color: colors.amber,
      title: 'Rewards & Achievements', sub: 'Badges, XP history, milestones', onPress: onRewards,
    },
  ];

  return (
    <View style={{
      backgroundColor: isDark ? 'rgba(13,15,14,0.97)' : 'rgba(248,245,240,0.97)',
      borderTopWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      paddingBottom: insets.bottom + 8,
      paddingTop: 10,
      paddingHorizontal: 16,
      gap: 6,
    }}>
      {rows.map((row) => (
        <TouchableOpacity
          key={row.title}
          onPress={row.onPress}
          activeOpacity={0.75}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 14,
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 12,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
            minHeight: 56,
          }}
        >
          <View style={{
            width: 40, height: 40, borderRadius: 13,
            backgroundColor: row.color + '15', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name={row.icon} size={20} color={row.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text.primary }}>{row.title}</Text>
            <Text style={{ ...Typography.caption, color: colors.muted, marginTop: 1 }}>{row.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useProfileSettings();
  const { badges, totalUnlocked, totalBadges } = useRewards();

  const [activeTab, setActiveTab] = useState(0);
  const [contentKey, setContentKey] = useState(0);

  const weightUnit = user.weightUnit || 'kg';
  const volumeUnit = user.volumeUnit || 'ml';
  const nextLevelXp = user.level * 500;
  const progressPct = Math.min(97, Math.max(3, (user.xp / nextLevelXp) * 100));

  const initials = user.name.split(' ').map((n: string) => n[0] || '').join('').toUpperCase().slice(0, 2);
  const weightValStr = weightUnit === 'lbs' ? `${kgToLbs(user.weight)} lbs` : `${user.weight} kg`;
  const waterValStr = volumeUnit === 'oz' ? `${mlToOz(user.waterGoal)} oz` : `${(user.waterGoal / 1000).toFixed(1)}L`;

  const currentWeightDisp = weightUnit === 'lbs' ? kgToLbs(user.weight) : user.weight;
  const targetWeightDisp = user.goal === 'Gain Muscle'
    ? (weightUnit === 'lbs' ? kgToLbs(85) : 85)
    : (weightUnit === 'lbs' ? kgToLbs(72) : 72);
  const remainingWeightDisp = user.goal === 'Gain Muscle'
    ? Math.max(0, targetWeightDisp - currentWeightDisp)
    : Math.max(0, currentWeightDisp - targetWeightDisp);

  const userStats = [
    { label: 'Age', value: `${user.age}`, icon: 'calendar-outline' as IoniconName, color: '#6366F1' },
    { label: 'Height', value: `${user.height} cm`, icon: 'resize-outline' as IoniconName, color: colors.lime },
    { label: 'Weight', value: weightValStr, icon: 'barbell-outline' as IoniconName, color: colors.amber },
    { label: 'Goal', value: user.goal, icon: (user.goal === 'Gain Muscle' ? 'trending-up-outline' : user.goal === 'Stay Fit' ? 'body-outline' : 'trending-down-outline') as IoniconName, color: colors.chart.calories },
  ];

  const weekSummary = [
    { icon: { lib: 'MCI' as const, name: 'dumbbell' as const }, label: 'Workouts', value: `${user.workoutGoal}`, color: colors.lime },
    { icon: { lib: 'Ionicons' as const, name: 'trophy' as const }, label: 'Goals', value: '18/21', color: colors.amber },
    { icon: { lib: 'Ionicons' as const, name: 'flame' as const }, label: 'Streak', value: `${user.streak}d`, color: colors.amber },
    { icon: { lib: 'Ionicons' as const, name: 'water' as const }, label: 'Water', value: waterValStr, color: colors.chart.water },
  ];

  const handleTab = (i: number) => {
    if (i === activeTab) return;
    setActiveTab(i);
    setContentKey((k) => k + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 28, gap: 0 }}
      >
        {/* ① IDENTITY ZONE — top-left scan anchor (Gutenberg) */}
        <Animated.View entering={FadeIn.duration(340)}>
          <HeroCard
            colors={colors} isDark={isDark} user={user}
            progressPct={progressPct} nextLevelXp={nextLevelXp}
            initials={initials} weightValStr={weightValStr}
            onSettings={() => router.push('/settings')}
          />
        </Animated.View>

        {/* ② NAVIGATION PIVOT — segmented control (Hick's Law) */}
        <Animated.View entering={FadeInUp.delay(80).springify().damping(20)} style={{ marginBottom: 16 }}>
          <SegmentedControl activeTab={activeTab} onTab={handleTab} colors={colors} isDark={isDark} />
        </Animated.View>

        {/* ③ CONTENT ZONE — tab content animates on switch */}
        <Animated.View key={contentKey} entering={FadeInUp.delay(30).springify().damping(20)}>
          {activeTab === 0 && (
            <OverviewContent
              colors={colors} isDark={isDark} user={user}
              weekSummary={weekSummary} userStats={userStats}
              progressPct={progressPct}
              currentWeightDisp={currentWeightDisp}
              targetWeightDisp={targetWeightDisp}
              remainingWeightDisp={remainingWeightDisp}
              weightUnit={weightUnit}
            />
          )}
          {activeTab === 1 && <GoalsContent />}
          {activeTab === 2 && (
            <AchievementsContent
              colors={colors} badges={badges}
              totalUnlocked={totalUnlocked} totalBadges={totalBadges}
              onViewAll={() => router.push('/rewards')}
            />
          )}
        </Animated.View>
      </ScrollView>

      {/* ④ ACTION ZONE — thumb-comfort sticky bar (Fitts's Law) */}
      <BottomActions
        colors={colors} isDark={isDark} insets={insets}
        onSettings={() => router.push('/settings')}
        onRewards={() => router.push('/rewards')}
      />
    </View>
  );
}
