import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, TextInput, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Ellipse, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import StatBadge from '@/components/ui/StatBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors, Typography, Radius } from '@/constants/theme';
import { router } from 'expo-router';

const { width: W } = Dimensions.get('window');
const CYLINDER_W = 120;
const CYLINDER_H = 220;
const GOAL_ML = 2500;

interface LogEntry {
  time: string;
  ml: number;
}

const initialLog: LogEntry[] = [
  { time: '07:15', ml: 250 },
  { time: '09:30', ml: 500 },
  { time: '11:00', ml: 250 },
  { time: '13:45', ml: 200 },
];

function WaterCylinder({ filled }: { filled: number }) {
  const fillHeight = useSharedValue(0);

  useEffect(() => {
    fillHeight.value = withTiming(filled, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [filled]);

  const fillStyle = useAnimatedStyle(() => ({
    height: fillHeight.value * CYLINDER_H,
  }));

  const waveY = CYLINDER_H * (1 - filled);

  return (
    <View style={{ alignItems: 'center', width: CYLINDER_W, height: CYLINDER_H }}>
      {/* cylinder track */}
      <View style={cyS.track}>
        {/* fill */}
        <Animated.View style={[cyS.fill, fillStyle]} />
        {/* wave overlay */}
        <View style={[cyS.waveRow, { bottom: filled * CYLINDER_H - 10 }]}>
          <Text style={cyS.wave}>〰〰〰</Text>
        </View>
      </View>
    </View>
  );
}

const cyS = StyleSheet.create({
  track: {
    width: CYLINDER_W,
    height: CYLINDER_H,
    borderRadius: 60,
    backgroundColor: 'rgba(77,166,255,0.08)',
    borderWidth: 1.5,
    borderColor: Colors.chart.water + '66',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    backgroundColor: Colors.chart.water + 'BB',
  },
  waveRow: {
    position: 'absolute',
    left: 0, right: 0,
    alignItems: 'center',
  },
  wave: { color: Colors.chart.water, opacity: 0.4, fontSize: 16, letterSpacing: -2 },
});

const QUICK_AMOUNTS = [150, 250, 500];

export default function WaterScreen() {
  const insets = useSafeAreaInsets();
  const [log, setLog] = useState<LogEntry[]>(initialLog);
  const [showCustom, setShowCustom] = useState(false);
  const [customVal, setCustomVal] = useState('');

  const totalMl = log.reduce((s, e) => s + e.ml, 0);
  const filled = Math.min(totalMl / GOAL_ML, 1);

  const addWater = (ml: number) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setLog((l) => [{ time, ml }, ...l]);
    // haptic placeholder
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Water Tracking</Text>
      </View>

      {/* Hero cylinder */}
      <View style={styles.heroSection}>
        <WaterCylinder filled={filled} />
        <View style={styles.heroText}>
          <Text style={styles.mlNum}>{totalMl}<Text style={styles.mlUnit}> ml</Text></Text>
          <Text style={styles.mlGoal}>of {GOAL_ML} ml goal</Text>
          <View style={styles.mlBadge}>
            <Text style={styles.mlBadgeText}>{Math.round(filled * 100)}% hydrated</Text>
          </View>
        </View>
      </View>

      {/* Quick add */}
      <GlassCard accentColor={Colors.chart.water}>
        <SectionHeader title="Quick Add" />
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map((ml) => (
            <TouchableOpacity
              key={ml}
              style={styles.quickBtn}
              onPress={() => addWater(ml)}
              activeOpacity={0.75}
            >
              <Ionicons name="water" size={20} color={Colors.chart.water} />
              <Text style={styles.quickMl}>{ml} ml</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.quickBtn, styles.customBtn]}
            onPress={() => setShowCustom(true)}
            activeOpacity={0.75}
          >
            <Ionicons name="create-outline" size={20} color={Colors.muted} />
            <Text style={styles.quickMl}>Custom</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Log history */}
      <GlassCard>
        <SectionHeader title="Today's Log" />
        {log.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="water-outline" size={44} color={Colors.muted} />
            <Text style={styles.emptyText}>No logs yet — start drinking!</Text>
          </View>
        ) : (
          <View style={styles.logList}>
            {log.map((entry, i) => (
              <View key={i} style={styles.logEntry}>
                <View style={styles.logTimeline}>
                  <View style={styles.logDot} />
                  {i < log.length - 1 && <View style={styles.logLine} />}
                </View>
                <View style={styles.logInfo}>
                  <Text style={styles.logTime}>{entry.time}</Text>
                  <View style={styles.logPill}>
                    <Text style={styles.logPillText}>{entry.ml} ml</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </GlassCard>

      {/* Goal & streak */}
      <GlassCard accentColor={Colors.chart.water}>
        <SectionHeader title="Daily Goal" />
        <View style={styles.goalRow}>
          <Text style={styles.goalValue}>{GOAL_ML} ml</Text>
          <Text style={styles.goalRange}>Recommended: 2,000–3,000 ml/day</Text>
        </View>
      </GlassCard>

      <View style={styles.statsRow}>
        <StatBadge label="Streak" value="8d 🔥" color={Colors.chart.water} />
        <StatBadge label="Best Day" value="3,200 ml" color={Colors.chart.water} />
        <StatBadge label="Avg/Day" value="2,100 ml" color={Colors.lime} />
      </View>

      {/* Reminder chip */}
      <TouchableOpacity style={styles.reminderChip} activeOpacity={0.8}>
        <Ionicons name="alarm" size={20} color={Colors.amber} />
        <Text style={styles.reminderText}>Next reminder at 3:00 PM</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.amber} />
      </TouchableOpacity>

      {/* Custom modal */}
      <Modal visible={showCustom} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Custom Amount</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              placeholder="Enter ml..."
              placeholderTextColor={Colors.muted}
              value={customVal}
              onChangeText={setCustomVal}
              autoFocus
            />
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                const ml = parseInt(customVal, 10);
                if (ml > 0) addWater(ml);
                setCustomVal('');
                setShowCustom(false);
              }}
            >
              <Text style={styles.modalBtnText}>Add Water</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCustom(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { padding: 4 },
  backText: { ...Typography.h4, color: Colors.lime },
  title: { ...Typography.h1, color: Colors.text.primary },

  heroSection: { flexDirection: 'row', alignItems: 'center', gap: 32, paddingVertical: 12, justifyContent: 'center' },
  heroText: { gap: 6 },
  mlNum: { ...Typography.hero, color: Colors.chart.water },
  mlUnit: { ...Typography.h2, color: Colors.chart.water },
  mlGoal: { ...Typography.caption, color: Colors.muted },
  mlBadge: {
    backgroundColor: Colors.chart.water + '22',
    borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.chart.water + '55',
  },
  mlBadgeText: { ...Typography.captionBold, color: Colors.chart.water },

  quickRow: { flexDirection: 'row', gap: 8 },
  quickBtn: {
    flex: 1, alignItems: 'center', gap: 6,
    backgroundColor: Colors.chart.water + '15',
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.chart.water + '44',
    paddingVertical: 12,
  },
  customBtn: { backgroundColor: Colors.card, borderColor: Colors.cardBorder },
  quickIcon: { fontSize: 20 },
  quickMl: { ...Typography.captionBold, color: Colors.text.primary },

  emptyState: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  emptyIcon: { fontSize: 40 },
  emptyText: { ...Typography.body, color: Colors.muted },

  logList: { gap: 0 },
  logEntry: { flexDirection: 'row', gap: 12, minHeight: 48 },
  logTimeline: { alignItems: 'center', width: 20 },
  logDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.chart.water, marginTop: 4 },
  logLine: { flex: 1, width: 1, backgroundColor: Colors.cardBorder, marginTop: 4 },
  logInfo: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingBottom: 12 },
  logTime: { ...Typography.caption, color: Colors.muted, width: 40, marginTop: 2 },
  logPill: {
    backgroundColor: Colors.chart.water + '22',
    borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.chart.water + '44',
  },
  logPillText: { ...Typography.captionBold, color: Colors.chart.water },

  goalRow: { gap: 4 },
  goalValue: { ...Typography.h2, color: Colors.chart.water },
  goalRange: { ...Typography.caption, color: Colors.muted },

  statsRow: { flexDirection: 'row', gap: 8 },

  reminderChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.amberOverlay,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.amber + '44',
    padding: 14,
  },
  reminderIcon: { fontSize: 18 },
  reminderText: { ...Typography.body, color: Colors.text.primary, flex: 1 },
  reminderArrow: { ...Typography.h3, color: Colors.amber },

  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: '#1A2E1C',
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: 28, gap: 16,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  modalTitle: { ...Typography.h3, color: Colors.text.primary },
  modalInput: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 14, color: Colors.text.primary, ...Typography.h3,
    textAlign: 'center',
  },
  modalBtn: {
    backgroundColor: Colors.chart.water, borderRadius: Radius.pill,
    paddingVertical: 14, alignItems: 'center',
  },
  modalBtnText: { ...Typography.bodyBold, color: Colors.bg },
  modalCancel: { alignItems: 'center', paddingVertical: 8 },
  modalCancelText: { ...Typography.bodyBold, color: Colors.danger },
});
