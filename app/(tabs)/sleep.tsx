import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';
import { useSleepLogger } from '@/hooks/useSleepLogger';
import GlassCard from '@/components/ui/GlassCard';
import {
  SleepHeroCard,
  SleepHypnogram,
  WeeklySleepChart,
  SleepLogCard,
  AddSleepSheet,
} from '@/components/sleep';
import { formatDuration } from '@/constants/sleep';

export default function SleepScreen() {
  const { colors } = useTheme();
  const {
    sleepLogs,
    addSleepLog,
    deleteSleepLog,
    lastNight,
    weeklyLogs,
    avgDurationMin,
    avgScore,
    sleepDebtMin,
  } = useSleepLogger();

  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={st.header}>
        <View>
          <Text style={[st.headerTitle, { color: colors.text.primary }]}>Sleep</Text>
          <Text style={[st.headerSub, { color: colors.muted }]}>Track your rest</Text>
        </View>
        <TouchableOpacity
          onPress={() => setSheetVisible(true)}
          style={[st.addBtn, { backgroundColor: colors.lime }]}
          activeOpacity={0.82}
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={st.scroll}
      >
        {/* Hero card */}
        <SleepHeroCard
          log={lastNight}
          avgScore={avgScore}
          sleepDebtMin={sleepDebtMin}
          colors={colors}
        />

        {/* Hypnogram */}
        {lastNight && (
          <Animated.View entering={FadeInDown.delay(120).springify().damping(20)}>
            <GlassCard style={st.card} accentColor="#6366F1">
              <Text style={[st.cardTitle, { color: colors.text.primary }]}>Sleep Stages</Text>
              <Text style={[st.cardSub, { color: colors.muted }]}>
                Last night · {formatDuration(lastNight.totalMin)}
              </Text>
              <SleepHypnogram log={lastNight} colors={colors} />
            </GlassCard>
          </Animated.View>
        )}

        {/* Weekly stats row */}
        <Animated.View entering={FadeInDown.delay(180).springify().damping(20)} style={st.statsRow}>
          <StatPill
            label="Avg Duration"
            value={formatDuration(avgDurationMin)}
            color="#38BDF8"
            colors={colors}
          />
          <StatPill
            label="Avg Score"
            value={String(avgScore)}
            color="#A78BFA"
            colors={colors}
          />
          <StatPill
            label="Sleep Debt"
            value={sleepDebtMin > 0 ? formatDuration(sleepDebtMin) : '—'}
            color={sleepDebtMin > 60 ? colors.amber : colors.lime}
            colors={colors}
          />
        </Animated.View>

        {/* Weekly chart */}
        <Animated.View entering={FadeInDown.delay(240).springify().damping(20)}>
          <GlassCard style={st.card}>
            <WeeklySleepChart weeklyLogs={weeklyLogs} colors={colors} />
          </GlassCard>
        </Animated.View>

        {/* History */}
        {sleepLogs.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).springify().damping(20)}>
            <Text style={[st.sectionTitle, { color: colors.text.primary }]}>History</Text>
            {sleepLogs.map((log, i) => (
              <SleepLogCard
                key={log.id}
                log={log}
                index={i}
                colors={colors}
                onDelete={deleteSleepLog}
              />
            ))}
          </Animated.View>
        )}

        <View style={st.bottomPad} />
      </ScrollView>

      <AddSleepSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSave={addSleepLog}
        colors={colors}
      />
    </SafeAreaView>
  );
}

function StatPill({
  label, value, color, colors,
}: { label: string; value: string; color: string; colors: any }) {
  return (
    <View style={[st.statPill, { backgroundColor: color + '18', borderColor: color + '35' }]}>
      <Text style={[st.statVal, { color }]}>{value}</Text>
      <Text style={[st.statLbl, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },

  scroll: { paddingBottom: 120 },
  card: { marginHorizontal: 16, marginTop: 12, marginBottom: 24 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  cardSub: { fontSize: 12, marginBottom: 12 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  statPill: { flex: 1, borderRadius: 14, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  statLbl: { fontSize: 10, fontWeight: '600', marginTop: 2, textAlign: 'center' },

  sectionTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 16, marginBottom: 10, marginTop: 4 },
  bottomPad: { height: 20 },
});
