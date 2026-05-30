import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import ProgressRing from '@/components/ui/ProgressRing';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors, Typography, Radius } from '@/constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type IconDef =
  | { lib: 'Ionicons'; name: IoniconName }
  | { lib: 'MCI'; name: MCIName };

function AppIcon({ icon, size, color }: { icon: IconDef; size: number; color: string }) {
  if (icon.lib === 'MCI') return <MaterialCommunityIcons name={icon.name} size={size} color={color} />;
  return <Ionicons name={icon.name} size={size} color={color} />;
}

const USER = { name: 'Alex Rivera', initials: 'AR' };

interface Badge {
  id: string;
  icon: IconDef;
  label: string;
  unlocked: boolean;
}

const BADGES: Badge[] = [
  { id: 'b1', icon: { lib: 'Ionicons', name: 'flame' }, label: '7-Day Streak', unlocked: true },
  { id: 'b2', icon: { lib: 'Ionicons', name: 'water' }, label: 'Hydration Pro', unlocked: true },
  { id: 'b3', icon: { lib: 'MCI', name: 'scale-bathroom' }, label: '5kg Lost', unlocked: true },
  { id: 'b4', icon: { lib: 'MCI', name: 'dumbbell' }, label: 'Iron Will', unlocked: true },
  { id: 'b5', icon: { lib: 'MCI', name: 'food-apple' }, label: 'Macro Master', unlocked: false },
  { id: 'b6', icon: { lib: 'Ionicons', name: 'camera' }, label: 'Photo Journey', unlocked: false },
  { id: 'b7', icon: { lib: 'MCI', name: 'run' }, label: 'Step Crusher', unlocked: false },
  { id: 'b8', icon: { lib: 'MCI', name: 'pill' }, label: 'Supplement King', unlocked: false },
];

const WEEK_SUMMARY: { icon: IconDef; label: string; value: string; color: string }[] = [
  { icon: { lib: 'MCI', name: 'dumbbell' }, label: 'Workouts', value: '4', color: Colors.lime },
  { icon: { lib: 'Ionicons', name: 'trophy' }, label: 'Goals Hit', value: '18/21', color: Colors.amber },
  { icon: { lib: 'Ionicons', name: 'flame' }, label: 'Streak', value: '14d', color: Colors.amber },
  { icon: { lib: 'Ionicons', name: 'water' }, label: 'Avg Water', value: '2.1L', color: Colors.chart.water },
];

const USER_STATS = [
  { label: 'Age', value: '28' },
  { label: 'Height', value: '178 cm' },
  { label: 'Weight', value: '78.4 kg' },
  { label: 'Goal', value: 'Lose Fat' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [darkTheme, setDarkTheme] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [unitKg, setUnitKg] = useState(true);
  const [unitMl, setUnitMl] = useState(true);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile header */}
      <GlassCard accentColor={Colors.lime}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{USER.initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{USER.name}</Text>
            <View style={styles.levelBadge}>
              <Ionicons name="flash" size={11} color={Colors.lime} />
              <Text style={styles.levelText}>Level 8 · 2,840 XP</Text>
            </View>
            <View style={styles.xpBar}>
              <View style={styles.xpFill} />
            </View>
            <Text style={styles.xpSub}>1,160 XP to Level 9</Text>
          </View>
        </View>
      </GlassCard>

      {/* Stats */}
      <GlassCard>
        <SectionHeader title="My Stats" />
        <View style={styles.statsGrid}>
          {USER_STATS.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Weekly summary */}
      <GlassCard accentColor={Colors.amber}>
        <SectionHeader title="This Week" />
        <View style={styles.weekRow}>
          {WEEK_SUMMARY.map((w) => (
            <View key={w.label} style={styles.weekItem}>
              <View style={[styles.weekIconWrap, { backgroundColor: w.color + '18' }]}>
                <AppIcon icon={w.icon} size={22} color={w.color} />
              </View>
              <Text style={[styles.weekVal, { color: w.color }]}>{w.value}</Text>
              <Text style={styles.weekLabel}>{w.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Badges */}
      <GlassCard>
        <SectionHeader title="Achievements" action={`${BADGES.filter((b) => b.unlocked).length}/${BADGES.length}`} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
          <View style={styles.badgeRow}>
            {BADGES.map((badge) => (
              <View key={badge.id} style={[styles.badgeItem, !badge.unlocked && styles.badgeLocked]}>
                <View style={[styles.badgeCircle, badge.unlocked && styles.badgeCircleActive]}>
                  <AppIcon
                    icon={badge.icon}
                    size={24}
                    color={badge.unlocked ? Colors.lime : Colors.muted}
                  />
                </View>
                <Text style={[styles.badgeLabel, !badge.unlocked && styles.badgeLabelLocked]}>
                  {badge.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </GlassCard>

      {/* Goal progress */}
      <GlassCard accentColor={Colors.amber}>
        <SectionHeader title="Goal Progress" />
        <View style={styles.goalRow}>
          <ProgressRing size={100} strokeWidth={10} progress={0.46} color={Colors.amber}>
            <Text style={styles.goalPct}>46%</Text>
          </ProgressRing>
          <View style={styles.goalText}>
            <Text style={styles.goalTitle}>Lose Fat</Text>
            <Text style={styles.goalSub}>Current: 78.4 kg → Target: 72.0 kg</Text>
            <Text style={styles.goalEta}>Est. 9 weeks at current pace</Text>
            <View style={styles.goalBadge}>
              <Text style={styles.goalBadgeText}>6.4 kg remaining</Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Settings */}
      <GlassCard>
        <SectionHeader title="Settings" />
        <View style={styles.settingsList}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIconWrap, { backgroundColor: Colors.muted + '18' }]}>
              <Ionicons name="moon" size={18} color={Colors.muted} />
            </View>
            <Text style={styles.settingLabel}>Dark Theme</Text>
            <Switch
              value={darkTheme} onValueChange={setDarkTheme}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.lime + '88' }}
              thumbColor={darkTheme ? Colors.lime : Colors.muted}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={[styles.settingIconWrap, { backgroundColor: Colors.amber + '18' }]}>
              <MaterialCommunityIcons name="scale-bathroom" size={18} color={Colors.amber} />
            </View>
            <Text style={styles.settingLabel}>Weight Unit</Text>
            <View style={styles.unitToggle}>
              <TouchableOpacity style={[styles.unitBtn, unitKg && styles.unitBtnActive]} onPress={() => setUnitKg(true)}>
                <Text style={[styles.unitBtnText, unitKg && styles.unitBtnTextActive]}>kg</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.unitBtn, !unitKg && styles.unitBtnActive]} onPress={() => setUnitKg(false)}>
                <Text style={[styles.unitBtnText, !unitKg && styles.unitBtnTextActive]}>lbs</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={[styles.settingIconWrap, { backgroundColor: Colors.chart.water + '18' }]}>
              <Ionicons name="water" size={18} color={Colors.chart.water} />
            </View>
            <Text style={styles.settingLabel}>Volume Unit</Text>
            <View style={styles.unitToggle}>
              <TouchableOpacity style={[styles.unitBtn, unitMl && styles.unitBtnActive]} onPress={() => setUnitMl(true)}>
                <Text style={[styles.unitBtnText, unitMl && styles.unitBtnTextActive]}>ml</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.unitBtn, !unitMl && styles.unitBtnActive]} onPress={() => setUnitMl(false)}>
                <Text style={[styles.unitBtnText, !unitMl && styles.unitBtnTextActive]}>oz</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={[styles.settingIconWrap, { backgroundColor: Colors.lime + '18' }]}>
              <Ionicons name="notifications" size={18} color={Colors.lime} />
            </View>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notifications} onValueChange={setNotifications}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.lime + '88' }}
              thumbColor={notifications ? Colors.lime : Colors.muted}
            />
          </View>

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.75}>
            <View style={[styles.settingIconWrap, { backgroundColor: Colors.chart.fibre + '18' }]}>
              <Ionicons name="download-outline" size={18} color={Colors.chart.fibre} />
            </View>
            <Text style={styles.settingLabel}>Export Data</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]} activeOpacity={0.75}>
            <View style={[styles.settingIconWrap, { backgroundColor: Colors.danger + '18' }]}>
              <Ionicons name="lock-closed" size={18} color={Colors.danger} />
            </View>
            <Text style={styles.settingLabel}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
          </TouchableOpacity>
        </View>
      </GlassCard>

      <Text style={styles.version}>FitForge v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  profileHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: Colors.lime + '22',
    borderWidth: 2.5, borderColor: Colors.lime,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...Typography.h2, color: Colors.lime },
  profileInfo: { flex: 1, gap: 6 },
  profileName: { ...Typography.h3, color: Colors.text.primary },
  levelBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.lime + '22', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.lime + '44',
  },
  levelText: { ...Typography.captionBold, color: Colors.lime },
  xpBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.pill, overflow: 'hidden' },
  xpFill: { width: '71%', height: '100%', backgroundColor: Colors.lime, borderRadius: Radius.pill },
  xpSub: { ...Typography.micro, color: Colors.muted },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCell: {
    width: '48%', backgroundColor: Colors.bg + '88',
    borderRadius: Radius.md, padding: 12,
    borderWidth: 1, borderColor: Colors.cardBorder, gap: 2,
  },
  statValue: { ...Typography.h4, color: Colors.text.primary },
  statLabel: { ...Typography.caption, color: Colors.muted },

  weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
  weekItem: { alignItems: 'center', gap: 6 },
  weekIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  weekVal: { ...Typography.h4 },
  weekLabel: { ...Typography.micro, color: Colors.muted },

  badgeScroll: { marginHorizontal: -4 },
  badgeRow: { flexDirection: 'row', gap: 14, paddingHorizontal: 4, paddingBottom: 4 },
  badgeItem: { alignItems: 'center', gap: 6, width: 70 },
  badgeLocked: { opacity: 0.35 },
  badgeCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5, borderColor: Colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeCircleActive: {
    backgroundColor: Colors.lime + '15',
    borderColor: Colors.lime + '77',
    shadowColor: Colors.lime, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 8,
  },
  badgeLabel: { ...Typography.micro, color: Colors.text.primary, textAlign: 'center' },
  badgeLabelLocked: { color: Colors.muted },

  goalRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  goalPct: { ...Typography.bodyBold, color: Colors.amber },
  goalText: { flex: 1, gap: 4 },
  goalTitle: { ...Typography.h4, color: Colors.text.primary },
  goalSub: { ...Typography.caption, color: Colors.muted },
  goalEta: { ...Typography.micro, color: Colors.muted },
  goalBadge: {
    alignSelf: 'flex-start', marginTop: 4,
    backgroundColor: Colors.amber + '22', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.amber + '44',
  },
  goalBadgeText: { ...Typography.captionBold, color: Colors.amber },

  settingsList: {},
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.cardBorder,
  },
  settingIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { ...Typography.body, color: Colors.text.primary, flex: 1 },
  unitToggle: {
    flexDirection: 'row', gap: 4,
    backgroundColor: Colors.bg, borderRadius: Radius.pill, padding: 3,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  unitBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.pill },
  unitBtnActive: { backgroundColor: Colors.lime + '33' },
  unitBtnText: { ...Typography.captionBold, color: Colors.muted },
  unitBtnTextActive: { color: Colors.lime },

  version: { ...Typography.micro, color: Colors.muted, textAlign: 'center', paddingTop: 8 },
});
