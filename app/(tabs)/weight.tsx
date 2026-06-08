import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import KeyboardSlideView from '@/components/ui/KeyboardSlideView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import PillButton from '@/components/ui/PillButton';
import { useProfileSettings, useBmiTracker } from '@/store/fitnessStore';
import ProgressRing from '@/components/ui/ProgressRing';
import { Typography, Radius, Spacing, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { kgToLbs } from '@/utils/units';
import { triggerHaptic } from '@/utils/haptics';
import SparkLine from '@/components/charts/SparkLine';
import CalHeatmap from '@/components/charts/CalHeatmap';
import BMIBar from '@/components/charts/BMIBar';
import { useWeightLogger } from '@/hooks';

const { width: W } = Dimensions.get('window');

type Period = 'today' | 'week' | 'month' | '3m';

const MILESTONES = [90, 85, 80, 75];

export default function WeightScreen() {
  const { colors, isDark: isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const modalS = React.useMemo(() => getModalS(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('week');

  const { user } = useProfileSettings();
  const { weightLogs, deleteWeightLog } = useBmiTracker();

  const streak = user.streak;

  const {
    isLbs,
    logModalVisible, setLogModalVisible,
    logWeightValue, setLogWeightValue,
    logDateOffset, setLogDateOffset,
    logTimeOfDay, setLogTimeOfDay,
    logError, setLogError,
    openLogModal,
    handleAdjustWeight,
    handleSaveWeightLog,
  } = useWeightLogger();

  const [fullscreenModalVisible, setFullscreenModalVisible] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // Intraday logs for today date
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayLogs = weightLogs.filter((log) => log.date === todayDateStr);
  const morningWeight = todayLogs.find((l) => l.timeOfDay === 'morning')?.weight;
  const afternoonWeight = todayLogs.find((l) => l.timeOfDay === 'afternoon')?.weight;
  const nightWeight = todayLogs.find((l) => l.timeOfDay === 'night')?.weight;

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : 78.4;

  const todayData = [
    morningWeight !== undefined ? morningWeight : currentWeight,
    afternoonWeight !== undefined ? afternoonWeight : (morningWeight !== undefined ? morningWeight : currentWeight),
    nightWeight !== undefined ? nightWeight : (afternoonWeight !== undefined ? afternoonWeight : (morningWeight !== undefined ? morningWeight : currentWeight)),
  ];

  const todayStatus = [
    morningWeight !== undefined,
    afternoonWeight !== undefined,
    nightWeight !== undefined,
  ];

  // Daily historic weights (taking last logged entry for each unique date)
  const dailyWeightValues = Object.values(
    weightLogs.reduce<Record<string, number>>((acc, log) => {
      acc[log.date] = log.weight;
      return acc;
    }, {})
  );

  // Derived stats
  const startWeight = 84.8;
  const goalWeight = 72.0;

  // Conversions for display
  const displayCurrentWeight = isLbs ? kgToLbs(currentWeight) : currentWeight;
  const displayGoalWeight = isLbs ? kgToLbs(goalWeight) : goalWeight;
  const displayStartWeight = isLbs ? kgToLbs(startWeight) : startWeight;
  const displayLostWeight = parseFloat((displayStartWeight - displayCurrentWeight).toFixed(1));

  // Weekly difference calculation
  const lastWeekWeight = dailyWeightValues[Math.max(0, dailyWeightValues.length - 8)] || startWeight;
  const displayLastWeekWeight = isLbs ? kgToLbs(lastWeekWeight) : lastWeekWeight;
  const displayWeeklyChange = parseFloat((displayCurrentWeight - displayLastWeekWeight).toFixed(1));
  const weeklyChangeText = displayWeeklyChange < 0 
    ? `${displayWeeklyChange} this week` 
    : displayWeeklyChange > 0 
      ? `+${displayWeeklyChange} this week` 
      : 'stable this week';

  // Dynamic progress ring percentages
  const totalGoalDelta = startWeight - goalWeight;
  const currentGoalDelta = startWeight - currentWeight;
  const goalProgressPct = Math.min(Math.max(Math.round((currentGoalDelta / totalGoalDelta) * 100), 0), 100);
  const displayRemainingWeight = parseFloat(Math.max(displayCurrentWeight - displayGoalWeight, 0).toFixed(1));

  // Dynamic BMI
  const heightM = user.height / 100; // Dynamic height from profile
  const currentBmi = parseFloat((currentWeight / (heightM * heightM)).toFixed(1));

  // Slice chart data based on active period, and scale to lbs if needed
  const rawChartData = period === 'today'
    ? todayData
    : period === 'week' 
      ? dailyWeightValues.slice(-7) 
      : period === 'month' 
        ? dailyWeightValues.slice(-30) 
        : dailyWeightValues;

  const chartData = isLbs ? rawChartData.map(kgToLbs) : rawChartData;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Weight Tracking"
        subtitle="BODY METRICS"
        icon={{ lib: 'MCI', name: 'scale-bathroom' }}
        accentColor={colors.amber}
        rightIcon="add-outline"
        onRightPress={openLogModal}
      />

      {/* Period toggle */}
      <View style={styles.periodRow}>
        {(['today', 'week', 'month', '3m'] as Period[]).map((p) => (
          <PillButton
            key={p}
            label={p === 'today' ? 'Today' : p === '3m' ? '3 Months' : p.charAt(0).toUpperCase() + p.slice(1)}
            active={period === p}
            onPress={() => setPeriod(p)}
            style={{ flex: 1 }}
          />
        ))}
      </View>

      {/* Graph Card */}
      <TouchableOpacity 
        onPress={() => setFullscreenModalVisible(true)} 
        activeOpacity={0.9} 
        style={styles.graphClickable}
      >
        <GlassCard accentColor={colors.lime}>
          <View style={styles.graphHeaderRow}>
            <View style={styles.graphHeaderLeft}>
              <Text style={styles.graphTitle}>Weight Trend</Text>
              <Text style={styles.graphSubtitle}>Tap to inspect logs & view analysis</Text>
            </View>
            <View style={styles.graphZoomIconBubble}>
              <Ionicons name="expand-outline" size={14} color={colors.lime} />
            </View>
          </View>
          <SparkLine data={chartData} period={period} statuses={period === 'today' ? todayStatus : undefined} />
        </GlassCard>
      </TouchableOpacity>

      {/* Log Weight CTA card */}
      <GlassCard accentColor={colors.lime}>
        <View style={styles.ctaRow}>
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>Track Your Body Weight</Text>
            <Text style={styles.ctaSub}>Log today's entry to keep goals and achievements aligned</Text>
          </View>
          <TouchableOpacity style={styles.ctaBtn} onPress={openLogModal} activeOpacity={0.8}>
            <Ionicons name="add" size={14} color={colors.white} />
            <Text style={styles.ctaBtnText}>Log Weight</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Stats panel */}
      <GlassCard accentColor={colors.lime}>
        <View style={styles.statsGrid}>
          {/* Current Weight */}
          <View style={styles.statCard}>
            <View style={[styles.statAccentBar, { backgroundColor: colors.lime }]} />
            <View style={[styles.statIconBubble, { backgroundColor: colors.lime + '15', borderColor: colors.lime + '30' }]}>
              <MaterialCommunityIcons name="scale-bathroom" size={18} color={colors.lime} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={[styles.statValue, { color: colors.lime }]}>{displayCurrentWeight.toFixed(1)}<Text style={styles.statUnit}>{isLbs ? ' lbs' : ' kg'}</Text></Text>
            </View>
          </View>
 
          {/* Goal Weight */}
          <View style={styles.statCard}>
            <View style={[styles.statAccentBar, { backgroundColor: colors.amber }]} />
            <View style={[styles.statIconBubble, { backgroundColor: colors.amber + '15', borderColor: colors.amber + '30' }]}>
              <Ionicons name="flag" size={16} color={colors.amber} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Goal</Text>
              <Text style={[styles.statValue, { color: colors.amber }]}>{displayGoalWeight.toFixed(1)}<Text style={styles.statUnit}>{isLbs ? ' lbs' : ' kg'}</Text></Text>
            </View>
          </View>
 
          {/* Total Lost */}
          <View style={styles.statCard}>
            <View style={[styles.statAccentBar, { backgroundColor: colors.lime }]} />
            <View style={[styles.statIconBubble, { backgroundColor: colors.lime + '15', borderColor: colors.lime + '30' }]}>
              <Ionicons name="trending-down" size={18} color={colors.lime} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Lost</Text>
              <Text style={[styles.statValue, { color: colors.lime }]}>{displayLostWeight.toFixed(1)}<Text style={styles.statUnit}>{isLbs ? ' lbs' : ' kg'}</Text></Text>
              <View style={[styles.statChip, { backgroundColor: displayWeeklyChange <= 0 ? colors.lime + '12' : colors.danger + '12', borderColor: displayWeeklyChange <= 0 ? colors.lime + '25' : colors.danger + '25' }]}>
                <Ionicons name={displayWeeklyChange <= 0 ? "arrow-down" : "arrow-up"} size={8} color={displayWeeklyChange <= 0 ? colors.lime : colors.danger} />
                <Text style={[styles.statChipText, { color: displayWeeklyChange <= 0 ? colors.lime : colors.danger }]}>{weeklyChangeText}</Text>
              </View>
            </View>
          </View>
 
          {/* Streak */}
          <View style={styles.statCard}>
            <View style={[styles.statAccentBar, { backgroundColor: colors.amber }]} />
            <View style={[styles.statIconBubble, { backgroundColor: colors.amber + '15', borderColor: colors.amber + '30' }]}>
              <Ionicons name="flame" size={18} color={colors.amber} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Streak</Text>
              <Text style={[styles.statValue, { color: colors.amber }]}>{streak}<Text style={styles.statUnit}> days</Text></Text>
              <View style={[styles.statChip, { backgroundColor: colors.amber + '12', borderColor: colors.amber + '25' }]}>
                <Text style={[styles.statChipText, { color: colors.amber }]}>🔥 Personal best!</Text>
              </View>
            </View>
          </View>
        </View>
      </GlassCard>
 
      {/* Goal / Slider */}
      <GlassCard accentColor={colors.amber}>
        <SectionHeader title="Goal Progress" accentColor={colors.amber} />
        <View style={styles.goalRow}>
          <ProgressRing size={90} strokeWidth={8} progress={goalProgressPct / 100} color={colors.amber}>
            <Text style={styles.goalRingPct}>{goalProgressPct}%</Text>
          </ProgressRing>
          <View style={styles.goalInfo}>
            <Text style={styles.goalText}>{displayGoalWeight.toFixed(1)} {isLbs ? 'lbs' : 'kg'} target</Text>
            <Text style={styles.goalSub}>{displayRemainingWeight.toFixed(1)} {isLbs ? 'lbs' : 'kg'} remaining</Text>
            <Text style={styles.goalEta}>Est. {Math.max(1, Math.round(displayRemainingWeight / (isLbs ? 1.5 : 0.7)))} weeks at current pace</Text>
            <View style={styles.milestonesRow}>
              {MILESTONES.map((m) => {
                const unlocked = currentWeight <= m;
                const displayM = isLbs ? Math.round(m * 2.20462) : m;
                return (
                  <View
                    key={m}
                    style={[styles.milestoneBadge, !unlocked && styles.milestoneLocked]}
                  >
                    <Text style={[styles.milestoneText, !unlocked && styles.milestoneLockedText]}>
                      {displayM}{isLbs ? 'lbs' : 'kg'} {unlocked ? '✓' : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Heatmap */}
      <GlassCard>
        <SectionHeader title="Log Calendar" accentColor={colors.lime} />
        <CalHeatmap />
        <View style={styles.heatmapLegend}>
          {[{ label: 'Logged', color: colors.lime + '88' }, { label: 'Goal hit', color: colors.lime }, { label: 'Missed', color: colors.danger + '55' }].map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* BMI */}
      <GlassCard accentColor={colors.lime}>
        <SectionHeader title="BMI Indicator" accentColor={colors.lime} />
        <BMIBar bmi={currentBmi} />
      </GlassCard>

      {/* Photo reminder */}
      <TouchableOpacity style={styles.photoCard} activeOpacity={0.8}>
        <View style={styles.photoIconWrap}>
          <Ionicons name="camera" size={22} color={colors.lime} />
        </View>
        <View style={styles.photoText}>
          <Text style={styles.photoTitle}>Progress Photo</Text>
          <Text style={styles.photoSub}>Add this week's progress photo</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.lime} />
      </TouchableOpacity>

      {/* Fullscreen Interactive Weight Analysis Modal */}
      <Modal
        visible={fullscreenModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => { setFullscreenModalVisible(false); setSelectedPointIndex(null); }}
      >
        <View style={[modalS.container, { paddingTop: insets.top }]}>
          {/* Modal Header */}
          <View style={modalS.header}>
            <View>
              <Text style={modalS.headerSub}>BODY ANALYTICS</Text>
              <Text style={modalS.headerTitle}>Weight Analysis</Text>
            </View>
            <TouchableOpacity style={modalS.closeBtn} onPress={() => { setFullscreenModalVisible(false); setSelectedPointIndex(null); }} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Modal Chart Card */}
          <View style={modalS.chartContainer}>
            <GlassCard accentColor={colors.lime} style={modalS.chartGlass}>
              <View style={modalS.chartTitleRow}>
                <Text style={modalS.chartTitle}>Interactive Trend</Text>
                <Text style={modalS.chartSub}>Select a point to view stats</Text>
              </View>
              <SparkLine 
                data={chartData} 
                period={period} 
                statuses={period === 'today' ? todayStatus : undefined}
                onPointPress={(idx) => setSelectedPointIndex(idx)}
              />
            </GlassCard>
          </View>

          {/* Selected Point Details Panel */}
          {selectedPointIndex !== null ? (
            <View style={modalS.infoCard}>
              <View style={[modalS.infoIconBubble, { backgroundColor: colors.lime + '15', borderColor: colors.lime + '35' }]}>
                <Ionicons name="sparkles" size={18} color={colors.lime} />
              </View>
              <View style={modalS.infoTexts}>
                <Text style={modalS.infoLabel}>SELECTED WEIGH-IN</Text>
                <Text style={modalS.infoTitle}>
                  {chartData[selectedPointIndex].toFixed(1)} kg
                  {period === 'today' && ` — ${['Morning 🌅', 'Afternoon ☀️', 'Night 🌙'][selectedPointIndex]}`}
                </Text>
              </View>
              <TouchableOpacity style={modalS.infoClose} onPress={() => setSelectedPointIndex(null)} activeOpacity={0.7}>
                <Ionicons name="close-circle-outline" size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={modalS.tapHint}>
              <Ionicons name="finger-print-outline" size={16} color={colors.lime} style={modalS.tapHintIcon} />
              <Text style={modalS.tapHintText}>Tap dots on the graph to display weight breakdowns</Text>
            </View>
          )}

          {/* Period toggles within the modal */}
          <View style={modalS.periodRow}>
            {(['today', 'week', 'month', '3m'] as Period[]).map((p) => (
              <PillButton
                key={p}
                label={p === 'today' ? 'Today' : p === '3m' ? '3 Months' : p.charAt(0).toUpperCase() + p.slice(1)}
                active={period === p}
                onPress={() => { setPeriod(p); setSelectedPointIndex(null); }}
                style={{ flex: 1 }}
              />
            ))}
          </View>

          {/* Log History Title */}
          <View style={modalS.historyHeader}>
            <View style={modalS.historyHeaderLeft}>
              <Ionicons name="list-outline" size={18} color={colors.lime} />
              <Text style={modalS.historyTitle}>Weight History logs</Text>
            </View>
            <View style={modalS.historyBadge}>
              <Text style={modalS.historyCount}>{weightLogs.length} entries</Text>
            </View>
          </View>

          {/* Scrollable list of weight history logs */}
          <ScrollView style={modalS.historyScroll} contentContainerStyle={modalS.historyScrollContent} showsVerticalScrollIndicator={false}>
            {weightLogs.slice().reverse().map((log) => {
              const emojiMap = { morning: '🌅 Morn', afternoon: '☀️ Aft', night: '🌙 Ngt' };
              const [yr, mo, dy] = log.date.split('-');
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const formattedDate = `${parseInt(dy)} ${months[parseInt(mo) - 1]}`;
              
              const handleDelete = () => {
                const actualIndex = weightLogs.findIndex((item) => item.id === log.id);
                if (actualIndex !== -1) {
                  deleteWeightLog(log.id);
                  setSelectedPointIndex(null);
                }
              };

              return (
                <View key={log.id} style={modalS.logItem}>
                  <View style={modalS.logLeft}>
                    <View style={modalS.logIconWrap}>
                      <Text style={modalS.logEmoji}>{log.timeOfDay === 'morning' ? '🌅' : log.timeOfDay === 'afternoon' ? '☀️' : '🌙'}</Text>
                    </View>
                    <View>
                      <Text style={modalS.logTimeTag}>{emojiMap[log.timeOfDay]}</Text>
                      <Text style={modalS.logDate}>{formattedDate}</Text>
                    </View>
                  </View>
                  <View style={modalS.logCenter}>
                    <Text style={modalS.logWeight}>{(isLbs ? kgToLbs(log.weight) : log.weight).toFixed(1)}<Text style={modalS.logUnit}>{isLbs ? ' lbs' : ' kg'}</Text></Text>
                  </View>
                  <TouchableOpacity style={modalS.logDeleteBtn} onPress={handleDelete} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Slide-Up Weight Logger Modal (Option A - Recommended) */}
      <Modal
        visible={logModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLogModalVisible(false)}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <KeyboardSlideView style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleBlock}>
                  <View style={[styles.modalHeaderIconWrap, { backgroundColor: colors.amber + '15' }]}>
                    <Ionicons name="scale" size={18} color={colors.amber} />
                  </View>
                  <View>
                    <Text style={styles.modalHeaderSub}>TRACK METRICS</Text>
                    <Text style={styles.modalHeaderTitle}>Log Weight</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setLogModalVisible(false)}>
                  <Ionicons name="close" size={20} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.modalForm}>
                  {/* Dynamic Weight Display */}
                  <View style={styles.weightDisplayBox}>
                    <Text style={styles.weightDisplayLabel}>SELECTED WEIGHT</Text>
                    <Text style={styles.weightDisplayValue}>
                      {logWeightValue}
                      <Text style={styles.weightDisplayUnit}>{isLbs ? ' lbs' : ' kg'}</Text>
                    </Text>
                  </View>

                  {/* Quick adjustment pills */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.adjustLabel}>Quick Adjustments</Text>
                    <View style={styles.adjustRow}>
                      <TouchableOpacity style={styles.adjustBtn} onPress={() => { handleAdjustWeight(isLbs ? -2.0 : -1.0); triggerHaptic('selection'); }} activeOpacity={0.75}>
                        <Text style={styles.adjustBtnText}>{isLbs ? '-2.0 lbs' : '-1.0 kg'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.adjustBtn} onPress={() => { handleAdjustWeight(isLbs ? -0.5 : -0.1); triggerHaptic('selection'); }} activeOpacity={0.75}>
                        <Text style={styles.adjustBtnText}>{isLbs ? '-0.5 lbs' : '-0.1 kg'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.adjustBtn} onPress={() => { handleAdjustWeight(isLbs ? 0.5 : 0.1); triggerHaptic('selection'); }} activeOpacity={0.75}>
                        <Text style={styles.adjustBtnText}>{isLbs ? '+0.5 lbs' : '+0.1 kg'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.adjustBtn} onPress={() => { handleAdjustWeight(isLbs ? 2.0 : 1.0); triggerHaptic('selection'); }} activeOpacity={0.75}>
                        <Text style={styles.adjustBtnText}>{isLbs ? '+2.0 lbs' : '+1.0 kg'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Exact Value Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Or Enter Precise Weight</Text>
                    <View style={[styles.inputFieldWrap, !!logError && styles.inputFieldError]}>
                      <Ionicons name="create-outline" size={16} color={colors.muted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={logWeightValue}
                        onChangeText={(t) => {
                          setLogWeightValue(t);
                          if (logError) setLogError('');
                        }}
                        keyboardType="numeric"
                        placeholder="78.4"
                        placeholderTextColor={colors.muted}
                        maxLength={5}
                      />
                    </View>
                    {!!logError && <Text style={styles.errorText}>{logError}</Text>}
                  </View>

                  {/* Time of Day Selector */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Time of Day</Text>
                    <View style={styles.timePillRow}>
                      {(['morning', 'afternoon', 'night'] as const).map((time) => {
                        const isActive = logTimeOfDay === time;
                        const emojiMap = { morning: '🌅 Morning', afternoon: '☀️ Afternoon', night: '🌙 Night' };
                        return (
                          <TouchableOpacity
                            key={time}
                            style={[
                              styles.timePill,
                              isActive && styles.timePillActive,
                              isActive && { borderColor: time === 'morning' ? colors.lime : time === 'afternoon' ? colors.amber : '#6366F1' }
                            ]}
                            onPress={() => setLogTimeOfDay(time)}
                            activeOpacity={0.8}
                          >
                            <Text style={[styles.timePillText, isActive && styles.timePillTextActive, isActive && { color: time === 'morning' ? colors.lime : time === 'afternoon' ? colors.amber : '#6366F1' }]}>
                              {emojiMap[time]}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Log Date Offset Selector (Today vs Yesterday) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Logging For</Text>
                    <View style={styles.datePillRow}>
                      <TouchableOpacity
                        style={[styles.datePill, logDateOffset === 'today' && styles.datePillActive]}
                        onPress={() => setLogDateOffset('today')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.datePillText, logDateOffset === 'today' && styles.datePillTextActive]}>Today</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.datePill, logDateOffset === 'yesterday' && styles.datePillActive]}
                        onPress={() => setLogDateOffset('yesterday')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.datePillText, logDateOffset === 'yesterday' && styles.datePillTextActive]}>Yesterday</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogModalVisible(false)} activeOpacity={0.8}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveWeightLog} activeOpacity={0.8}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                  <Text style={styles.saveBtnText}>Log Weight</Text>
                </TouchableOpacity>
              </View>
            </KeyboardSlideView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },
  periodRow: { flexDirection: 'row', gap: 8 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    flexDirection: 'column',
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  statAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  statIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  statContent: {
    gap: 2,
  },
  statLabel: {
    ...Typography.caption,
    color: colors.muted,
  },
  statValue: {
    ...Typography.h3,
  },
  statUnit: {
    ...Typography.body,
    color: colors.muted,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    marginTop: 4,
  },
  statChipText: {
    ...Typography.micro,
  },

  goalRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  goalRingPct: { ...Typography.bodyBold, color: colors.amber },
  goalInfo: { flex: 1, gap: 4 },
  goalText: { ...Typography.h4, color: colors.text.primary },
  goalSub: { ...Typography.caption, color: colors.muted },
  goalEta: { ...Typography.micro, color: colors.muted, marginTop: 2 },
  milestonesRow: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  milestoneBadge: {
    backgroundColor: colors.lime + '22', borderRadius: Radius.pill,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.lime + '55',
  },
  milestoneLocked: { backgroundColor: 'rgba(0,0,0,0.04)', borderColor: colors.cardBorder },
  milestoneText: { ...Typography.micro, color: colors.lime },
  milestoneLockedText: { color: colors.muted },

  heatmapLegend: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendText: { ...Typography.caption, color: colors.muted },

  photoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.card, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: colors.lime + '33',
    padding: 16,
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  photoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.lime + '15',
    borderWidth: 1,
    borderColor: colors.lime + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { flex: 1 },
  photoTitle: { ...Typography.bodyBold, color: colors.text.primary },
  photoSub: { ...Typography.caption, color: colors.muted },

  // Log Weight CTA Card
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  ctaText: {
    flex: 1,
    gap: 2,
  },
  ctaTitle: {
    ...Typography.bodyBold,
    color: colors.text.primary,
  },
  ctaSub: {
    ...Typography.caption,
    color: colors.muted,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.lime,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaBtnText: {
    ...Typography.captionBold,
    color: colors.white,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 30, 0.60)',
    justifyContent: 'flex-end',
  },
  modalKeyboard: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.ivory,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    minHeight: 480,
    maxHeight: '100%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.lime + '20',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalHeaderIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderSub: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.amber,
  },
  modalHeaderTitle: {
    ...Typography.h3,
    color: colors.text.primary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalScroll: {
    maxHeight: 340,
  },
  modalForm: {
    gap: 20,
    paddingBottom: 20,
  },
  weightDisplayBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 4,
  },
  weightDisplayLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.muted,
  },
  weightDisplayValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.lime,
  },
  weightDisplayUnit: {
    ...Typography.h3,
    color: colors.muted,
  },
  adjustLabel: {
    ...Typography.captionBold,
    color: colors.text.primary,
  },
  adjustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  adjustBtn: {
    flex: 1,
    height: 38,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustBtnText: {
    ...Typography.captionBold,
    color: colors.text.primary,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: colors.text.primary,
  },
  inputFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    height: 46,
  },
  inputFieldError: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '05',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    ...Typography.body,
    color: colors.text.primary,
    padding: 0,
  },
  errorText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.danger,
    marginTop: 2,
  },
  datePillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  datePill: {
    flex: 1,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePillActive: {
    borderColor: colors.amber,
    backgroundColor: colors.amber + '12',
  },
  datePillText: {
    ...Typography.captionBold,
    color: colors.muted,
  },
  datePillTextActive: {
    color: colors.amber,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelBtnText: {
    ...Typography.bodyBold,
    color: colors.text.secondary,
  },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: colors.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    ...Typography.bodyBold,
    color: colors.white,
  },
  graphClickable: {
    width: '100%',
  },
  graphHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  graphHeaderLeft: {
    gap: 2,
  },
  graphTitle: {
    ...Typography.bodyBold,
    color: colors.text.primary,
  },
  graphSubtitle: {
    ...Typography.micro,
    color: colors.muted,
  },
  graphZoomIconBubble: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.lime + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.lime + '30',
  },
  timePillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timePill: {
    flex: 1,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePillActive: {
    backgroundColor: colors.overlay,
  },
  timePillText: {
    ...Typography.captionBold,
    color: colors.muted,
  },
  timePillTextActive: {
    fontWeight: '800',
  },
});

const getModalS = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerSub: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.lime,
  },
  headerTitle: {
    ...Typography.h3,
    color: colors.text.primary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chartContainer: {
    width: '100%',
    marginBottom: 12,
  },
  chartGlass: {
    padding: 16,
  },
  chartTitleRow: {
    marginBottom: 10,
  },
  chartTitle: {
    ...Typography.bodyBold,
    color: colors.text.primary,
  },
  chartSub: {
    ...Typography.micro,
    color: colors.muted,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTexts: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    ...Typography.micro,
    color: colors.muted,
    fontWeight: '700',
  },
  infoTitle: {
    ...Typography.bodyBold,
    color: colors.text.primary,
  },
  infoClose: {
    padding: 4,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.lime + '08',
    borderColor: colors.lime + '20',
    borderWidth: 1,
    borderRadius: Radius.pill,
    marginBottom: 16,
    alignSelf: 'center',
  },
  tapHintIcon: {
    opacity: 0.8,
  },
  tapHintText: {
    ...Typography.micro,
    color: colors.lime,
    fontWeight: '600',
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  historyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyTitle: {
    ...Typography.bodyBold,
    color: colors.text.primary,
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.cardBorder,
    borderRadius: Radius.pill,
  },
  historyCount: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  historyScroll: {
    flex: 1,
  },
  historyScrollContent: {
    gap: 10,
    paddingBottom: 20,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  logEmoji: {
    fontSize: 14,
  },
  logTimeTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
  },
  logDate: {
    fontSize: 9,
    color: colors.muted,
    fontWeight: '500',
  },
  logCenter: {
    alignItems: 'flex-end',
    marginRight: 16,
  },
  logWeight: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  logUnit: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '500',
  },
  logDeleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger + '08',
  },
});
