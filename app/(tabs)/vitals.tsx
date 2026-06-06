import { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';
import { useVitals } from '@/hooks/useVitals';
import GlassCard from '@/components/ui/GlassCard';
import ScreenHeader from '@/components/ui/ScreenHeader';
import {
  VitalTypeSelector,
  VitalCard,
  VitalChart,
  RangeBar,
  VitalHistoryCard,
  AddVitalSheet,
} from '@/components/vitals';
import { VitalType, VITAL_CONFIG } from '@/constants/vitals';

export default function VitalsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const vitals = useVitals();

  const [selected,     setSelected]     = useState<VitalType>('heartRate');
  const [sheetVisible, setSheetVisible] = useState(false);

  const cfg = VITAL_CONFIG[selected];

  // Pull correct data for selected type
  const { logs, latest, weekValues, avg, min, max, rangeValue } = useMemo(() => {
    switch (selected) {
      case 'heartRate':
        return {
          logs:        vitals.hrLogs,
          latest:      vitals.latestHR,
          weekValues:  vitals.weeklyHR.map(l => l.bpm),
          avg:         vitals.avgHR,
          min:         vitals.minHR,
          max:         vitals.maxHR,
          rangeValue:  vitals.latestHR?.bpm ?? 72,
        };
      case 'bloodPressure':
        return {
          logs:        vitals.bpLogs,
          latest:      vitals.latestBP,
          weekValues:  vitals.weeklyBP.map(l => l.systolic),
          avg:         vitals.avgSys,
          min:         vitals.weeklyBP.length ? Math.min(...vitals.weeklyBP.map(l => l.systolic)) : 0,
          max:         vitals.weeklyBP.length ? Math.max(...vitals.weeklyBP.map(l => l.systolic)) : 0,
          rangeValue:  vitals.latestBP?.systolic ?? 120,
        };
      case 'bloodGlucose':
        return {
          logs:        vitals.glucoseLogs,
          latest:      vitals.latestGlucose,
          weekValues:  vitals.weeklyGlucose.map(l => l.value),
          avg:         vitals.avgGlucose,
          min:         vitals.weeklyGlucose.length ? Math.min(...vitals.weeklyGlucose.map(l => l.value)) : 0,
          max:         vitals.weeklyGlucose.length ? Math.max(...vitals.weeklyGlucose.map(l => l.value)) : 0,
          rangeValue:  vitals.latestGlucose?.value ?? 90,
        };
      case 'oxygen':
        return {
          logs:        vitals.oxygenLogs,
          latest:      vitals.latestOxygen,
          weekValues:  vitals.weeklyOxygen.map(l => l.spo2),
          avg:         vitals.avgSpo2,
          min:         vitals.weeklyOxygen.length ? Math.min(...vitals.weeklyOxygen.map(l => l.spo2)) : 0,
          max:         vitals.weeklyOxygen.length ? Math.max(...vitals.weeklyOxygen.map(l => l.spo2)) : 0,
          rangeValue:  vitals.latestOxygen?.spo2 ?? 98,
        };
    }
  }, [selected, vitals]);

  function handleDelete(id: string) {
    switch (selected) {
      case 'heartRate':     vitals.deleteHeartRate(id);    break;
      case 'bloodPressure': vitals.deleteBloodPressure(id); break;
      case 'bloodGlucose':  vitals.deleteBloodGlucose(id); break;
      case 'oxygen':        vitals.deleteOxygen(id);        break;
    }
  }

  // Chronological order for chart (oldest first)
  const chartLogs = useMemo(() => [...logs].reverse(), [logs]);

  return (
    <View style={[st.safe, { backgroundColor: colors.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[st.scroll, { paddingTop: insets.top + 16 }]}
      >
        <View style={st.screenHeaderWrap}>
          <ScreenHeader
            title="Vitals"
            subtitle="HEALTH METRICS"
            icon={{ lib: 'Ionicons', name: 'pulse' }}
            accentColor={cfg.color}
            rightElement={
              <TouchableOpacity
                onPress={() => setSheetVisible(true)}
                style={[st.addBtn, { backgroundColor: cfg.color }]}
                activeOpacity={0.82}
              >
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            }
          />
        </View>

        {/* Type selector */}
        <VitalTypeSelector selected={selected} onChange={setSelected} colors={colors} />

        {/* Hero card */}
        <Animated.View entering={FadeInDown.delay(60).springify().damping(20)} style={st.section}>
          <VitalCard
            type={selected}
            latest={latest}
            weekValues={weekValues}
            avg={avg}
            min={min}
            max={max}
            colors={colors}
          />
        </Animated.View>

        {/* Range bar */}
        {latest && (
          <Animated.View entering={FadeInDown.delay(120).springify().damping(20)}>
            <GlassCard style={st.card}>
              <Text style={[st.sectionTitle, { color: colors.text.primary }]}>Range Analysis</Text>
              <RangeBar type={selected} value={rangeValue} colors={colors} />
            </GlassCard>
          </Animated.View>
        )}

        {/* Chart */}
        {chartLogs.length >= 2 && (
          <Animated.View entering={FadeInDown.delay(180).springify().damping(20)}>
            <GlassCard style={st.card}>
              <Text style={[st.sectionTitle, { color: colors.text.primary }]}>7-Day Trend</Text>
              <Text style={[st.sectionSub, { color: colors.muted }]}>{cfg.description}</Text>
              <VitalChart type={selected} logs={chartLogs} colors={colors} />
            </GlassCard>
          </Animated.View>
        )}

        {/* History */}
        {logs.length > 0 && (
          <Animated.View entering={FadeInDown.delay(240).springify().damping(20)}>
            <Text style={[st.historyTitle, { color: colors.text.primary }]}>History</Text>
            {logs.map((log, i) => (
              <VitalHistoryCard
                key={log.id}
                type={selected}
                log={log}
                index={i}
                colors={colors}
                onDelete={handleDelete}
              />
            ))}
          </Animated.View>
        )}

        <View style={st.bottomPad} />
      </ScrollView>

      <AddVitalSheet
        visible={sheetVisible}
        initialType={selected}
        onClose={() => setSheetVisible(false)}
        onSaveHR={vitals.addHeartRate}
        onSaveBP={vitals.addBloodPressure}
        onSaveGlucose={vitals.addBloodGlucose}
        onSaveOxygen={vitals.addOxygen}
        colors={colors}
      />
    </View>
  );
}

const st = StyleSheet.create({
  safe:         { flex: 1 },
  addBtn:       { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  screenHeaderWrap: { paddingHorizontal: 16 },

  scroll:       { paddingBottom: 120 },
  section:      { marginTop: 12 },
  card:         { marginHorizontal: 16, marginTop: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionSub:   { fontSize: 11, marginBottom: 10, fontStyle: 'italic' },
  historyTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 16, marginTop: 12, marginBottom: 10 },
  bottomPad:    { height: 20 },
});
