import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../../components/ui/GlassCard';
import ProgressRing from '../../components/ui/ProgressRing';
import SectionHeader from '../../components/ui/SectionHeader';
import { Colors, Typography, Radius } from '../../constants/theme';

const USER = {
  name: 'Alex Rivera',
  age: 28,
  height: '178 cm',
  weight: '78.4 kg',
  goal: 'Lose Fat',
  activityLevel: 'Moderate',
  initials: 'AR',
};

interface Badge {
  id: string;
  icon: string;
  label: string;
  unlocked: boolean;
  desc: string;
}

const BADGES: Badge[] = [
  { id: 'b1', icon: '🔥', label: '7-Day Streak', unlocked: true, desc: 'Logged 7 days in a row' },
  { id: 'b2', icon: '💧', label: 'Hydration Pro', unlocked: true, desc: 'Hit water goal 10 days' },
  { id: 'b3', icon: '⚖️', label: '5kg Lost', unlocked: true, desc: 'Lost first 5kg' },
  { id: 'b4', icon: '🏋️', label: 'Iron Will', unlocked: true, desc: '30 workouts logged' },
  { id: 'b5', icon: '🥗', label: 'Macro Master', unlocked: false, desc: 'Hit all macros 7 days' },
  { id: 'b6', icon: '📸', label: 'Photo Journey', unlocked: false, desc: '4 weeks of photos' },
  { id: 'b7', icon: '🏃', label: 'Step Crusher', unlocked: false, desc: '100k steps in a week' },
  { id: 'b8', icon: '💊', label: 'Supplement King', unlocked: false, desc: '30-day supplement streak' },
];

const WEEK_SUMMARY = [
  { icon: '🏋️', label: 'Workouts', value: '4', color: Colors.lime },
  { icon: '🎯', label: 'Goals Hit', value: '18/21', color: Colors.amber },
  { icon: '🔥', label: 'Streak', value: '14d', color: Colors.amber },
  { icon: '💧', label: 'Avg Water', value: '2.1L', color: Colors.chart.water },
];

const USER_STATS = [
  { label: 'Age', value: '28' },
  { label: 'Height', value: '178 cm' },
  { label: 'Weight', value: '78.4 kg' },
  { label: 'Goal', value: 'Lose Fat' },
];

const SETTINGS_ITEMS = [
  { icon: '🌙', label: 'Dark Theme', type: 'toggle', value: true },
  { icon: '⚖️', label: 'Weight Unit', type: 'option', value: 'kg' },
  { icon: '💧', label: 'Volume Unit', type: 'option', value: 'ml' },
  { icon: '📊', label: 'Export Data', type: 'action', value: '' },
  { icon: '🔔', label: 'Notifications', type: 'toggle', value: true },
  { icon: '🔒', label: 'Privacy', type: 'nav', value: '' },
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
              <Text style={styles.levelText}>⚡ Level 8 · 2,840 XP</Text>
            </View>
            <View style={styles.xpBar}>
              <View style={styles.xpFill} />
            </View>
            <Text style={styles.xpSub}>1,160 XP to Level 9</Text>
          </View>
        </View>
      </GlassCard>

      {/* Stats overview */}
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
              <Text style={styles.weekIcon}>{w.icon}</Text>
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
              <View
                key={badge.id}
                style={[styles.badgeItem, !badge.unlocked && styles.badgeLocked]}
              >
                <View style={[styles.badgeCircle, badge.unlocked && styles.badgeCircleActive]}>
                  <Text style={[styles.badgeIcon, !badge.unlocked && styles.badgeIconLocked]}>
                    {badge.icon}
                  </Text>
                </View>
                <Text style={[styles.badgeLabel, !badge.unlocked && styles.badgeLabelLocked]}>
                  {badge.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </GlassCard>

      {/* Goal progress ring */}
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
          {/* Dark theme */}
          <View style={styles.settingRow}>
            <Text style={styles.settingIcon}>🌙</Text>
            <Text style={styles.settingLabel}>Dark Theme</Text>
            <Switch
              value={darkTheme}
              onValueChange={setDarkTheme}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.lime + '88' }}
              thumbColor={darkTheme ? Colors.lime : Colors.muted}
            />
          </View>
          {/* Weight unit */}
          <View style={styles.settingRow}>
            <Text style={styles.settingIcon}>⚖️</Text>
            <Text style={styles.settingLabel}>Weight Unit</Text>
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[styles.unitBtn, unitKg && styles.unitBtnActive]}
                onPress={() => setUnitKg(true)}
              >
                <Text style={[styles.unitBtnText, unitKg && styles.unitBtnTextActive]}>kg</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitBtn, !unitKg && styles.unitBtnActive]}
                onPress={() => setUnitKg(false)}
              >
                <Text style={[styles.unitBtnText, !unitKg && styles.unitBtnTextActive]}>lbs</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Volume unit */}
          <View style={styles.settingRow}>
            <Text style={styles.settingIcon}>💧</Text>
            <Text style={styles.settingLabel}>Volume Unit</Text>
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[styles.unitBtn, unitMl && styles.unitBtnActive]}
                onPress={() => setUnitMl(true)}
              >
                <Text style={[styles.unitBtnText, unitMl && styles.unitBtnTextActive]}>ml</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitBtn, !unitMl && styles.unitBtnActive]}
                onPress={() => setUnitMl(false)}
              >
                <Text style={[styles.unitBtnText, !unitMl && styles.unitBtnTextActive]}>oz</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Notifications */}
          <View style={styles.settingRow}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.lime + '88' }}
              thumbColor={notifications ? Colors.lime : Colors.muted}
            />
          </View>
          {/* Export */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.75}>
            <Text style={styles.settingIcon}>📊</Text>
            <Text style={styles.settingLabel}>Export Data</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          {/* Privacy */}
          <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]} activeOpacity={0.75}>
            <Text style={styles.settingIcon}>🔒</Text>
            <Text style={styles.settingLabel}>Privacy & Security</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Version footer */}
      <Text style={styles.version}>FitForge v1.0.0 · Made with ❤️</Text>
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
    alignSelf: 'flex-start',
    backgroundColor: Colors.lime + '22',
    borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.lime + '44',
  },
  levelText: { ...Typography.captionBold, color: Colors.lime },
  xpBar: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.pill, overflow: 'hidden',
  },
  xpFill: { width: '71%', height: '100%', backgroundColor: Colors.lime, borderRadius: Radius.pill },
  xpSub: { ...Typography.micro, color: Colors.muted },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCell: {
    width: '48%', backgroundColor: Colors.bg + '88',
    borderRadius: Radius.md, padding: 12,
    borderWidth: 1, borderColor: Colors.cardBorder,
    gap: 2,
  },
  statValue: { ...Typography.h4, color: Colors.text.primary },
  statLabel: { ...Typography.caption, color: Colors.muted },

  weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
  weekItem: { alignItems: 'center', gap: 4 },
  weekIcon: { fontSize: 24 },
  weekVal: { ...Typography.h4 },
  weekLabel: { ...Typography.micro, color: Colors.muted },

  badgeScroll: { marginHorizontal: -4 },
  badgeRow: { flexDirection: 'row', gap: 14, paddingHorizontal: 4, paddingBottom: 4 },
  badgeItem: { alignItems: 'center', gap: 6, width: 70 },
  badgeLocked: { opacity: 0.4 },
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
  badgeIcon: { fontSize: 24 },
  badgeIconLocked: { opacity: 0.5 },
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
    backgroundColor: Colors.amber + '22',
    borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.amber + '44',
  },
  goalBadgeText: { ...Typography.captionBold, color: Colors.amber },

  settingsList: {},
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.cardBorder,
  },
  settingIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  settingLabel: { ...Typography.body, color: Colors.text.primary, flex: 1 },
  settingArrow: { ...Typography.h3, color: Colors.muted },
  unitToggle: {
    flexDirection: 'row', gap: 4,
    backgroundColor: Colors.bg, borderRadius: Radius.pill, padding: 3,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  unitBtn: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.pill,
  },
  unitBtnActive: { backgroundColor: Colors.lime + '33' },
  unitBtnText: { ...Typography.captionBold, color: Colors.muted },
  unitBtnTextActive: { color: Colors.lime },

  version: { ...Typography.micro, color: Colors.muted, textAlign: 'center', paddingTop: 8 },
});
