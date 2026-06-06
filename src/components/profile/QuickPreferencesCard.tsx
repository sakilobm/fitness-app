import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { Typography, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { useProfileSettings } from '@/store/fitnessStore';
import { triggerHaptic } from '@/utils/haptics';

/** The everyday toggles from "System Settings & Preferences", surfaced directly
 * in Profile — same switches, same store fields, instant apply either side. */
export default function QuickPreferencesCard() {
  const { colors, isDark: isDarkMode, setIsDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const { user, setUser } = useProfileSettings();

  const notifications = user.notificationsEnabled ?? true;
  const haptics = user.hapticsEnabled ?? true;

  const trackColor = { false: 'rgba(0,0,0,0.10)', true: colors.lime + '99' };
  const thumbColor = (on: boolean) => (on ? colors.lime : '#ccc');

  return (
    <GlassCard>
      <SectionHeader title="Quick Preferences" accentColor="#6366F1" />

      <View style={styles.row}>
        <View style={[styles.iconBubble, { backgroundColor: 'rgba(99,102,241,0.12)' }]}>
          <Ionicons name="moon" size={18} color="#6366F1" />
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>Dark Theme Mode</Text>
          <Text style={styles.rowSub}>{isDarkMode ? 'Themed in dark mode' : 'Themed in light mode'}</Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={(val) => { setIsDarkMode(val); triggerHaptic('medium'); }}
          trackColor={trackColor}
          thumbColor={thumbColor(isDarkMode)}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={[styles.iconBubble, { backgroundColor: colors.lime + '15' }]}>
          <Ionicons name="notifications" size={18} color={colors.lime} />
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>Push Notifications Alerts</Text>
          <Text style={styles.rowSub}>{notifications ? 'Receive daily logs reminders' : 'Alerts are disabled'}</Text>
        </View>
        <Switch
          value={notifications}
          onValueChange={(val) => { setUser({ notificationsEnabled: val }); triggerHaptic('light'); }}
          trackColor={trackColor}
          thumbColor={thumbColor(notifications)}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={[styles.iconBubble, { backgroundColor: colors.amber + '15' }]}>
          <Ionicons name="pulse" size={18} color={colors.amber} />
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>Micro Haptic Feedback</Text>
          <Text style={styles.rowSub}>{haptics ? 'Satisfying clicks enabled' : 'Touch feedback off'}</Text>
        </View>
        <Switch
          value={haptics}
          onValueChange={(val) => { setUser({ hapticsEnabled: val }); triggerHaptic('light'); }}
          trackColor={trackColor}
          thumbColor={thumbColor(haptics)}
        />
      </View>
    </GlassCard>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  iconBubble: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowContent: { flex: 1, gap: 2 },
  rowTitle: { ...Typography.bodyBold, color: colors.text.primary },
  rowSub: { ...Typography.caption, color: colors.text.secondary },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 4 },
});
