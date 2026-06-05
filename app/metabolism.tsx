import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import ProgressRing from '@/components/ui/ProgressRing';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Colors, Typography, Radius } from '@/constants/theme';
import { router } from 'expo-router';
import TrendLine from '@/components/charts/TrendLine';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very';

const ACTIVITY_LEVELS: { key: ActivityLevel; label: string; multiplier: number }[] = [
  { key: 'sedentary', label: 'Sedentary', multiplier: 1.2 },
  { key: 'light', label: 'Light', multiplier: 1.375 },
  { key: 'moderate', label: 'Moderate', multiplier: 1.55 },
  { key: 'active', label: 'Active', multiplier: 1.725 },
  { key: 'very', label: 'Very Active', multiplier: 1.9 },
];

const BMR = 1820;

const TREND_DATA = [1780, 1800, 1815, 1810, 1820, 1825, 1820];


const MACRO_SPLIT = [
  { label: 'Protein', pct: 0.3, grams: 150, color: Colors.chart.protein },
  { label: 'Carbs', pct: 0.45, grams: 225, color: Colors.chart.carbs },
  { label: 'Fat', pct: 0.25, grams: 56, color: Colors.amber },
];

const BODY_COMP = [
  { label: 'Body Fat', value: 18.5, color: Colors.amber, unit: '%', progress: 0.185 },
  { label: 'Muscle', value: 72.4, color: Colors.lime, unit: '%', progress: 0.724 },
  { label: 'Water', value: 59.1, color: Colors.chart.water, unit: '%', progress: 0.591 },
];

export default function MetabolismScreen() {
  const insets = useSafeAreaInsets();
  const [actLevel, setActLevel] = useState<ActivityLevel>('moderate');
  const mult = ACTIVITY_LEVELS.find((a) => a.key === actLevel)?.multiplier ?? 1.55;
  const tdee = Math.round(BMR * mult);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Metabolism"
        subtitle="ENERGY & BODY"
        icon={{ lib: 'Ionicons', name: 'flame' }}
        accentColor={Colors.amber}
        showBack
        onBack={() => router.back()}
      />

      {/* BMR Hero */}
      <GlassCard accentColor={Colors.amber}>
        <View style={styles.bmrHero}>
          <View style={styles.bmrIconWrap}>
            <Ionicons name="flame" size={36} color={Colors.amber} />
          </View>
          <View style={styles.bmrText}>
            <Text style={styles.bmrValue}>{BMR}</Text>
            <Text style={styles.bmrLabel}>Basal Metabolic Rate</Text>
            <View style={styles.bmrBadge}>
              <Ionicons name="body" size={10} color={Colors.amber} />
              <Text style={styles.bmrSub}>calories your body burns at rest daily</Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* TDEE */}
      <GlassCard accentColor={Colors.lime}>
        <SectionHeader title="Total Daily Energy (TDEE)" accentColor={Colors.lime} />
        <View style={styles.activitySegment}>
          {ACTIVITY_LEVELS.map((a) => (
            <TouchableOpacity
              key={a.key}
              style={[styles.actBtn, actLevel === a.key && styles.actBtnActive]}
              onPress={() => setActLevel(a.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.actBtnText, actLevel === a.key && styles.actBtnTextActive]}>
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.tdeeResult}>
          <Text style={styles.tdeeValue}>{tdee.toLocaleString()}</Text>
          <Text style={styles.tdeeLabel}>kcal / day</Text>
        </View>
        <View style={styles.tdeeBadge}>
          <Text style={styles.tdeeNote}>
            × {mult} multiplier ({ACTIVITY_LEVELS.find((a) => a.key === actLevel)?.label})
          </Text>
        </View>
      </GlassCard>

      {/* Macro split */}
      <GlassCard>
        <SectionHeader title="Macro Split Recommendation" accentColor={Colors.chart.protein} />
        <View style={styles.macroRow}>
          {MACRO_SPLIT.map((m) => (
            <View key={m.label} style={styles.macroItem}>
              <ProgressRing size={80} strokeWidth={8} progress={m.pct} color={m.color}>
                <Text style={[styles.macroPct, { color: m.color }]}>{Math.round(m.pct * 100)}%</Text>
              </ProgressRing>
              <Text style={styles.macroLabel}>{m.label}</Text>
              <View style={[styles.macroGramBadge, { backgroundColor: m.color + '15', borderColor: m.color + '30' }]}>
                <Text style={[styles.macroGrams, { color: m.color }]}>{m.grams}g</Text>
              </View>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Weekly trend */}
      <GlassCard accentColor={Colors.amber}>
        <SectionHeader title="Weekly BMR Trend" accentColor={Colors.amber} />
        <TrendLine data={TREND_DATA} />
        <View style={styles.trendStats}>
          <View style={styles.trendStat}>
            <Text style={styles.trendVal}>{Math.max(...TREND_DATA)}</Text>
            <Text style={styles.trendLbl}>Peak</Text>
          </View>
          <View style={styles.trendStat}>
            <Text style={styles.trendVal}>{Math.min(...TREND_DATA)}</Text>
            <Text style={styles.trendLbl}>Low</Text>
          </View>
          <View style={styles.trendStat}>
            <Text style={styles.trendVal}>{Math.round(TREND_DATA.reduce((s, v) => s + v, 0) / TREND_DATA.length)}</Text>
            <Text style={styles.trendLbl}>Average</Text>
          </View>
        </View>
      </GlassCard>

      {/* Body composition */}
      <GlassCard>
        <SectionHeader title="Body Composition" accentColor={Colors.lime} />
        <View style={styles.bodyRow}>
          {BODY_COMP.map((b) => (
            <View key={b.label} style={styles.bodyCard}>
              <ProgressRing size={72} strokeWidth={7} progress={b.progress} color={b.color}>
                <Text style={[styles.bodyVal, { color: b.color }]}>{b.value}{b.unit}</Text>
              </ProgressRing>
              <Text style={styles.bodyLabel}>{b.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  bmrHero: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  bmrIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: Colors.amber + '15',
    borderWidth: 1,
    borderColor: Colors.amber + '30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.amber,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  bmrText: { flex: 1, gap: 4 },
  bmrValue: { ...Typography.hero, color: Colors.amber },
  bmrLabel: { ...Typography.h4, color: Colors.text.primary },
  bmrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: Colors.amber + '12',
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.amber + '25',
  },
  bmrSub: { ...Typography.micro, color: Colors.amber },

  activitySegment: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  actBtn: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.pill, borderWidth: 1,
    borderColor: Colors.cardBorder, backgroundColor: Colors.card,
  },
  actBtnActive: { backgroundColor: Colors.lime + '18', borderColor: Colors.lime },
  actBtnText: { ...Typography.captionBold, color: Colors.muted },
  actBtnTextActive: { color: Colors.lime },

  tdeeResult: { alignItems: 'center', marginBottom: 4 },
  tdeeValue: { ...Typography.hero, color: Colors.lime },
  tdeeLabel: { ...Typography.caption, color: Colors.muted },
  tdeeBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.lime + '12',
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.lime + '25',
  },
  tdeeNote: { ...Typography.micro, color: Colors.lime, textAlign: 'center' },

  macroRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  macroItem: { alignItems: 'center', gap: 6 },
  macroPct: { ...Typography.captionBold },
  macroLabel: { ...Typography.caption, color: Colors.muted },
  macroGramBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  macroGrams: { ...Typography.captionBold },

  trendStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  trendStat: { alignItems: 'center', gap: 2 },
  trendVal: { ...Typography.h4, color: Colors.amber },
  trendLbl: { ...Typography.micro, color: Colors.muted },

  bodyRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  bodyCard: { alignItems: 'center', gap: 8 },
  bodyVal: { ...Typography.captionBold, fontSize: 11 },
  bodyLabel: { ...Typography.caption, color: Colors.muted },
});
