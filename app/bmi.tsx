import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Rect, Text as SvgText, G, Path, Circle,
  Defs, LinearGradient as SvgGrad, Stop, Line,
} from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import ProgressRing from '@/components/ui/ProgressRing';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Colors, Typography, Radius, Shadows } from '@/constants/theme';
import { router } from 'expo-router';
import { useAppStore } from '@/store';
import {
  getBMIResult, BMI_CATEGORIES, bmiToGaugePosition,
  getIdealWeightRange, getWeightToNormal,
  generateSuggestions,
} from '@/utils/bmi';

const { width: W } = Dimensions.get('window');
const BMI_COLOR = '#0EA5E9'; // Sky blue accent for BMI screen
const GAUGE_W = W - 80;
const GAUGE_H = 28;
const CHART_W = W - 64;
const CHART_H = 120;

// ─── BMI Gauge Component ─────────────────────────────────────────────────────

function BMIGauge({ bmi }: { bmi: number }) {
  const position = bmiToGaugePosition(bmi);
  const markerX = 8 + position * (GAUGE_W - 16);

  return (
    <View style={gaugeStyles.container}>
      <Svg width={GAUGE_W} height={GAUGE_H + 50}>
        <Defs>
          <SvgGrad id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#3B82F6" />
            <Stop offset="0.28" stopColor="#2E7D5E" />
            <Stop offset="0.6" stopColor="#F59E0B" />
            <Stop offset="1" stopColor="#EF4444" />
          </SvgGrad>
        </Defs>

        {/* Gauge track */}
        <Rect x={0} y={16} width={GAUGE_W} height={GAUGE_H} rx={14} fill="url(#gaugeGrad)" opacity={0.2} />
        <Rect x={0} y={16} width={GAUGE_W} height={GAUGE_H} rx={14} fill="url(#gaugeGrad)" opacity={0.85} />

        {/* Category boundaries */}
        {[18.5, 25, 30].map((boundary) => {
          const x = 8 + bmiToGaugePosition(boundary) * (GAUGE_W - 16);
          return (
            <Line key={boundary} x1={x} y1={14} x2={x} y2={GAUGE_H + 18} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
          );
        })}

        {/* Marker */}
        <Circle cx={markerX} cy={16 + GAUGE_H / 2} r={14}
          fill="white" stroke={getBMIResult(bmi, 170).color} strokeWidth={3}
        />
        <SvgText
          x={markerX} y={16 + GAUGE_H / 2 + 4}
          fill={getBMIResult(bmi, 170).color}
          fontSize={10} fontWeight="800" textAnchor="middle"
        >
          {bmi.toFixed(1)}
        </SvgText>

        {/* Labels */}
        <SvgText x={GAUGE_W * 0.07} y={GAUGE_H + 38} fill="#3B82F6" fontSize={9} fontWeight="600" textAnchor="middle">Under</SvgText>
        <SvgText x={GAUGE_W * 0.35} y={GAUGE_H + 38} fill="#2E7D5E" fontSize={9} fontWeight="600" textAnchor="middle">Normal</SvgText>
        <SvgText x={GAUGE_W * 0.6} y={GAUGE_H + 38} fill="#F59E0B" fontSize={9} fontWeight="600" textAnchor="middle">Over</SvgText>
        <SvgText x={GAUGE_W * 0.85} y={GAUGE_H + 38} fill="#EF4444" fontSize={9} fontWeight="600" textAnchor="middle">Obese</SvgText>
      </Svg>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 8 },
});

// ─── BMI History Sparkline ───────────────────────────────────────────────────

function BMISparkline({ data }: { data: { date: string; bmi: number }[] }) {
  if (data.length < 2) {
    return (
      <View style={{ alignItems: 'center', padding: 24 }}>
        <Text style={{ ...Typography.caption, color: Colors.muted }}>Need more data for trend</Text>
      </View>
    );
  }

  const recent = data.slice(-14);
  const values = recent.map((d) => d.bmi);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const range = max - min || 1;

  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * CHART_W,
    y: CHART_H - ((v - min) / range) * CHART_H,
  }));

  const pathD = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const areaD = `${pathD} L${CHART_W},${CHART_H} L0,${CHART_H} Z`;

  // Normal BMI zone lines
  const normalMinY = CHART_H - ((18.5 - min) / range) * CHART_H;
  const normalMaxY = CHART_H - ((25 - min) / range) * CHART_H;

  return (
    <Svg width={CHART_W} height={CHART_H + 8}>
      <Defs>
        <SvgGrad id="bmiAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={BMI_COLOR} stopOpacity="0.25" />
          <Stop offset="1" stopColor={BMI_COLOR} stopOpacity="0" />
        </SvgGrad>
      </Defs>

      {/* Normal zone band */}
      {normalMinY >= 0 && normalMaxY >= 0 && (
        <Rect x={0} y={Math.min(normalMinY, normalMaxY)} 
          width={CHART_W} height={Math.abs(normalMinY - normalMaxY)}
          fill="#2E7D5E" opacity={0.08} rx={4}
        />
      )}

      {/* Area fill */}
      <Path d={areaD} fill="url(#bmiAreaGrad)" />
      {/* Line */}
      <Path d={pathD} stroke={BMI_COLOR} strokeWidth={2.5} fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Dots */}
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y}
          r={i === pts.length - 1 ? 5 : 3}
          fill={i === pts.length - 1 ? BMI_COLOR : BMI_COLOR + '88'}
        />
      ))}

      {/* Normal zone labels */}
      {normalMaxY >= 0 && normalMaxY <= CHART_H && (
        <SvgText x={CHART_W - 2} y={normalMaxY - 3}
          fill="#2E7D5E" fontSize={8} textAnchor="end" opacity={0.6}
        >
          25.0
        </SvgText>
      )}
      {normalMinY >= 0 && normalMinY <= CHART_H && (
        <SvgText x={CHART_W - 2} y={normalMinY + 10}
          fill="#2E7D5E" fontSize={8} textAnchor="end" opacity={0.6}
        >
          18.5
        </SvgText>
      )}
    </Svg>
  );
}

// ─── Category Info Cards ─────────────────────────────────────────────────────

function CategoryCards({ currentCategory }: { currentCategory: string }) {
  return (
    <View style={catStyles.grid}>
      {BMI_CATEGORIES.map((cat) => {
        const isActive = cat.label.toLowerCase() === currentCategory;
        return (
          <View
            key={cat.label}
            style={[
              catStyles.card,
              isActive && { borderColor: cat.color, backgroundColor: cat.color + '08' },
            ]}
          >
            <View style={[catStyles.indicator, { backgroundColor: cat.color }]} />
            <View style={catStyles.cardContent}>
              <Text style={[catStyles.label, isActive && { color: cat.color, fontWeight: '700' }]}>
                {cat.label}
              </Text>
              <Text style={catStyles.range}>{cat.range}</Text>
            </View>
            {isActive && (
              <View style={[catStyles.activeBadge, { backgroundColor: cat.color + '18' }]}>
                <Text style={[catStyles.activeText, { color: cat.color }]}>You</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const catStyles = StyleSheet.create({
  grid: { gap: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder,
    paddingVertical: 12, paddingHorizontal: 14, gap: 12,
  },
  indicator: { width: 4, height: 32, borderRadius: 2 },
  cardContent: { flex: 1, gap: 2 },
  label: { ...Typography.bodyBold, color: Colors.text.primary },
  range: { ...Typography.caption, color: Colors.muted },
  activeBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  activeText: { ...Typography.captionBold },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function BMIScreen() {
  const insets = useSafeAreaInsets();
  const {
    user, bmiLogs, currentBMI, weightTrend,
    stepsCount, waterLogs,
  } = useAppStore();

  const [showCalcModal, setShowCalcModal] = useState(false);
  const [calcWeight, setCalcWeight] = useState(user.weight.toString());
  const [calcHeight, setCalcHeight] = useState(user.height.toString());

  const bmiResult = getBMIResult(user.weight, user.height);
  const idealRange = getIdealWeightRange(user.height);
  const weightAction = getWeightToNormal(user.weight, user.height);

  // BMI trend data for sparkline
  const bmiChartData = useMemo(() => {
    return bmiLogs.slice(-14).map((l) => ({ date: l.date, bmi: l.bmi }));
  }, [bmiLogs]);

  // BMI stats
  const bmiStats = useMemo(() => {
    if (bmiLogs.length < 2) return { change: 0, direction: 'stable' as const };
    const first = bmiLogs[0].bmi;
    const last = bmiLogs[bmiLogs.length - 1].bmi;
    const change = parseFloat((last - first).toFixed(1));
    return {
      change: Math.abs(change),
      direction: change < -0.2 ? 'down' as const : change > 0.2 ? 'up' as const : 'stable' as const,
    };
  }, [bmiLogs]);

  // Suggestions
  const waterTotal = waterLogs.reduce((s, l) => s + l.ml, 0);
  const suggestions = generateSuggestions({
    bmiResult,
    stepsPct: stepsCount / user.stepsGoal,
    weightTrend,
    waterPct: waterTotal / user.waterGoal,
  });

  // Calculator modal result
  const calcBMI = useMemo(() => {
    const w = parseFloat(calcWeight);
    const h = parseFloat(calcHeight);
    if (w > 0 && h > 0) return getBMIResult(w, h);
    return null;
  }, [calcWeight, calcHeight]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="BMI Tracker"
        subtitle="BODY METRICS"
        icon={{ lib: 'MCI', name: 'human' }}
        accentColor={BMI_COLOR}
        showBack
        onBack={() => router.back()}
      />

      {/* ════════ BMI Hero Card ════════ */}
      <GlassCard accentColor={bmiResult.color}>
        <View style={styles.heroRow}>
          <View style={[styles.heroIconWrap, { backgroundColor: bmiResult.color + '15', borderColor: bmiResult.color + '30' }]}>
            <MaterialCommunityIcons name="human" size={36} color={bmiResult.color} />
          </View>
          <View style={styles.heroText}>
            <Text style={[styles.heroValue, { color: bmiResult.color }]}>{currentBMI.toFixed(1)}</Text>
            <Text style={styles.heroLabel}>Body Mass Index</Text>
            <View style={[styles.heroBadge, { backgroundColor: bmiResult.color + '15', borderColor: bmiResult.color + '30' }]}>
              <Text style={styles.heroEmoji}>{bmiResult.emoji}</Text>
              <Text style={[styles.heroCatText, { color: bmiResult.color }]}>{bmiResult.label}</Text>
            </View>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatLabel}>Height</Text>
            <Text style={styles.quickStatVal}>{user.height} cm</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatLabel}>Weight</Text>
            <Text style={styles.quickStatVal}>{user.weight.toFixed(1)} kg</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatLabel}>Ideal Range</Text>
            <Text style={styles.quickStatVal}>{idealRange.min}–{idealRange.max} kg</Text>
          </View>
        </View>
      </GlassCard>

      {/* ════════ BMI Scale Gauge ════════ */}
      <GlassCard>
        <SectionHeader title="BMI Scale" accentColor={BMI_COLOR} />
        <BMIGauge bmi={currentBMI} />

        {/* Weight action badge */}
        {weightAction.direction !== 'maintain' && (
          <View style={[styles.actionBadge, {
            backgroundColor: weightAction.direction === 'lose' ? Colors.amber + '12' : '#3B82F6' + '12',
            borderColor: weightAction.direction === 'lose' ? Colors.amber + '30' : '#3B82F6' + '30',
          }]}>
            <Ionicons
              name={weightAction.direction === 'lose' ? 'trending-down' : 'trending-up'}
              size={14}
              color={weightAction.direction === 'lose' ? Colors.amber : '#3B82F6'}
            />
            <Text style={[styles.actionBadgeText, {
              color: weightAction.direction === 'lose' ? Colors.amber : '#3B82F6',
            }]}>
              {weightAction.direction === 'lose' ? 'Lose' : 'Gain'} {weightAction.amount} kg to reach normal BMI
            </Text>
          </View>
        )}
        {weightAction.direction === 'maintain' && (
          <View style={[styles.actionBadge, { backgroundColor: Colors.lime + '12', borderColor: Colors.lime + '30' }]}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.lime} />
            <Text style={[styles.actionBadgeText, { color: Colors.lime }]}>
              You're in the healthy BMI range! 🎉
            </Text>
          </View>
        )}
      </GlassCard>

      {/* ════════ BMI History Chart ════════ */}
      <GlassCard accentColor={BMI_COLOR}>
        <SectionHeader title="BMI Trend" accentColor={BMI_COLOR} />
        <BMISparkline data={bmiChartData} />
        <View style={styles.trendStatsRow}>
          <View style={styles.trendStatItem}>
            <Text style={[styles.trendStatVal, { color: BMI_COLOR }]}>{currentBMI.toFixed(1)}</Text>
            <Text style={styles.trendStatLabel}>Current</Text>
          </View>
          <View style={styles.trendStatDivider} />
          <View style={styles.trendStatItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons
                name={bmiStats.direction === 'down' ? 'arrow-down' : bmiStats.direction === 'up' ? 'arrow-up' : 'remove'}
                size={12}
                color={bmiStats.direction === 'down' ? Colors.lime : bmiStats.direction === 'up' ? Colors.danger : Colors.muted}
              />
              <Text style={[styles.trendStatVal, {
                color: bmiStats.direction === 'down' ? Colors.lime : bmiStats.direction === 'up' ? Colors.danger : Colors.muted,
              }]}>
                {bmiStats.change}
              </Text>
            </View>
            <Text style={styles.trendStatLabel}>Change</Text>
          </View>
          <View style={styles.trendStatDivider} />
          <View style={styles.trendStatItem}>
            <Text style={[styles.trendStatVal, { color: Colors.amber }]}>
              {bmiLogs.length > 0 ? Math.min(...bmiLogs.map((l) => l.bmi)).toFixed(1) : '—'}
            </Text>
            <Text style={styles.trendStatLabel}>Lowest</Text>
          </View>
          <View style={styles.trendStatDivider} />
          <View style={styles.trendStatItem}>
            <Text style={[styles.trendStatVal, { color: Colors.muted }]}>
              {bmiLogs.length > 0 ? Math.max(...bmiLogs.map((l) => l.bmi)).toFixed(1) : '—'}
            </Text>
            <Text style={styles.trendStatLabel}>Highest</Text>
          </View>
        </View>
      </GlassCard>

      {/* ════════ Categories Breakdown ════════ */}
      <GlassCard>
        <SectionHeader title="WHO BMI Categories" accentColor={BMI_COLOR} />
        <CategoryCards currentCategory={bmiResult.category} />
      </GlassCard>

      {/* ════════ BMI Calculator ════════ */}
      <TouchableOpacity
        style={styles.calcCta}
        onPress={() => {
          setCalcWeight(user.weight.toString());
          setCalcHeight(user.height.toString());
          setShowCalcModal(true);
        }}
        activeOpacity={0.85}
      >
        <View style={styles.calcCtaIconWrap}>
          <Ionicons name="calculator" size={22} color={BMI_COLOR} />
        </View>
        <View style={styles.calcCtaText}>
          <Text style={styles.calcCtaTitle}>BMI Calculator</Text>
          <Text style={styles.calcCtaSub}>Try different weight & height values</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
      </TouchableOpacity>

      {/* ════════ Health Suggestions ════════ */}
      <GlassCard>
        <SectionHeader title="Health Suggestions" accentColor={Colors.lime} />
        <Text style={styles.suggestSubtitle}>
          Personalized tips based on your BMI, activity, and trends
        </Text>
        {suggestions.map((tip, idx) => (
          <View key={tip.id} style={[styles.suggestCard, idx > 0 && styles.suggestCardBorder]}>
            <View style={[styles.suggestIconWrap, { backgroundColor: tip.accentColor + '12' }]}>
              <Text style={styles.suggestEmoji}>{tip.icon}</Text>
            </View>
            <View style={styles.suggestContent}>
              <View style={styles.suggestHeader}>
                <Text style={styles.suggestTitle}>{tip.title}</Text>
                <View style={[styles.priorityBadge, {
                  backgroundColor: tip.priority === 'high' ? Colors.danger + '12'
                    : tip.priority === 'medium' ? Colors.amber + '12'
                    : Colors.lime + '12',
                }]}>
                  <Text style={[styles.priorityText, {
                    color: tip.priority === 'high' ? Colors.danger
                      : tip.priority === 'medium' ? Colors.amber
                      : Colors.lime,
                  }]}>
                    {tip.priority === 'high' ? '⚡' : tip.priority === 'medium' ? '💡' : '✨'} {tip.priority}
                  </Text>
                </View>
              </View>
              <Text style={styles.suggestDesc}>{tip.description}</Text>
              <View style={[styles.categoryTag, { backgroundColor: tip.accentColor + '10', borderColor: tip.accentColor + '25' }]}>
                <Text style={[styles.categoryTagText, { color: tip.accentColor }]}>{tip.category}</Text>
              </View>
            </View>
          </View>
        ))}
      </GlassCard>

      {/* ════════ CALCULATOR MODAL ════════ */}
      <Modal visible={showCalcModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={styles.modalDismiss} activeOpacity={1} onPress={() => setShowCalcModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>BMI Calculator</Text>
            <Text style={styles.modalSubtitle}>Calculate BMI for any weight & height</Text>

            {/* Weight input */}
            <Text style={styles.fieldLabel}>Weight (kg)</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.calcInput}
                placeholder="Weight in kg"
                placeholderTextColor={Colors.muted}
                keyboardType="decimal-pad"
                value={calcWeight}
                onChangeText={setCalcWeight}
                maxLength={6}
              />
              <Text style={styles.inputUnit}>kg</Text>
            </View>

            {/* Height input */}
            <Text style={styles.fieldLabel}>Height (cm)</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.calcInput}
                placeholder="Height in cm"
                placeholderTextColor={Colors.muted}
                keyboardType="decimal-pad"
                value={calcHeight}
                onChangeText={setCalcHeight}
                maxLength={5}
              />
              <Text style={styles.inputUnit}>cm</Text>
            </View>

            {/* Live result */}
            {calcBMI && (
              <View style={[styles.calcResult, { borderColor: calcBMI.color + '30' }]}>
                <Text style={[styles.calcResultBMI, { color: calcBMI.color }]}>{calcBMI.value.toFixed(1)}</Text>
                <View style={[styles.calcResultBadge, { backgroundColor: calcBMI.color + '15' }]}>
                  <Text style={styles.calcResultEmoji}>{calcBMI.emoji}</Text>
                  <Text style={[styles.calcResultCat, { color: calcBMI.color }]}>{calcBMI.label}</Text>
                </View>
              </View>
            )}

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowCalcModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.closeBtnTxt}>Done</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  // Hero
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  heroIconWrap: {
    width: 70, height: 70, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    shadowColor: BMI_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  heroText: { flex: 1, gap: 4 },
  heroValue: { fontSize: 52, fontWeight: '800', letterSpacing: -2 },
  heroLabel: { ...Typography.h4, color: Colors.text.primary },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, marginTop: 2,
  },
  heroEmoji: { fontSize: 12 },
  heroCatText: { ...Typography.captionBold },

  // Quick stats
  quickStatsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: 16, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: Colors.cardBorder,
  },
  quickStat: { alignItems: 'center', gap: 3 },
  quickStatLabel: { ...Typography.micro, color: Colors.muted },
  quickStatVal: { ...Typography.bodyBold, color: Colors.text.primary },
  quickStatDivider: { width: 1, height: 32, backgroundColor: Colors.cardBorder, alignSelf: 'center' },

  // Action badge
  actionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'center', marginTop: 12,
    borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1,
  },
  actionBadgeText: { ...Typography.captionBold },

  // Trend stats
  trendStatsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.cardBorder,
  },
  trendStatItem: { alignItems: 'center', gap: 3 },
  trendStatVal: { ...Typography.h4 },
  trendStatLabel: { ...Typography.micro, color: Colors.muted },
  trendStatDivider: { width: 1, height: 28, backgroundColor: Colors.cardBorder, alignSelf: 'center' },

  // Calculator CTA
  calcCta: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 16,
    ...Shadows.card,
  },
  calcCtaIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: BMI_COLOR + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  calcCtaText: { flex: 1, gap: 2 },
  calcCtaTitle: { ...Typography.bodyBold, color: Colors.text.primary },
  calcCtaSub: { ...Typography.caption, color: Colors.muted },

  // Suggestions
  suggestSubtitle: { ...Typography.caption, color: Colors.muted, marginBottom: 4 },
  suggestCard: {
    flexDirection: 'row', gap: 12,
    paddingVertical: 14,
  },
  suggestCardBorder: {
    borderTopWidth: 1, borderTopColor: Colors.cardBorder,
  },
  suggestIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  suggestEmoji: { fontSize: 22 },
  suggestContent: { flex: 1, gap: 4 },
  suggestHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  suggestTitle: { ...Typography.bodyBold, color: Colors.text.primary, flex: 1 },
  suggestDesc: { ...Typography.caption, color: Colors.muted, lineHeight: 18 },
  priorityBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  priorityText: { ...Typography.micro, textTransform: 'capitalize' },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.pill, borderWidth: 1,
    marginTop: 4,
  },
  categoryTagText: { ...Typography.micro, textTransform: 'uppercase' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalDismiss: { flex: 1 },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
    ...Shadows.card,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.muted + '40',
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { ...Typography.h2, color: Colors.text.primary, textAlign: 'center' },
  modalSubtitle: { ...Typography.caption, color: Colors.muted, textAlign: 'center', marginTop: 4, marginBottom: 20 },

  fieldLabel: { ...Typography.captionBold, color: Colors.text.secondary, marginBottom: 4, marginLeft: 4 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bg, borderRadius: Radius.md,
    paddingHorizontal: 16, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  calcInput: {
    flex: 1, height: 50,
    ...Typography.h3, color: Colors.text.primary,
  },
  inputUnit: { ...Typography.caption, color: Colors.muted },

  // Calculator result
  calcResult: {
    alignItems: 'center', gap: 8,
    padding: 20, marginBottom: 16,
    backgroundColor: Colors.bg,
    borderRadius: Radius.lg, borderWidth: 1,
  },
  calcResultBMI: { fontSize: 48, fontWeight: '800', letterSpacing: -2 },
  calcResultBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  calcResultEmoji: { fontSize: 14 },
  calcResultCat: { ...Typography.captionBold },

  closeBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: BMI_COLOR, borderRadius: Radius.pill,
    paddingVertical: 16,
    shadowColor: BMI_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  closeBtnTxt: { ...Typography.bodyBold, color: Colors.bg },
});
