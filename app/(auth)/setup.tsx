import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  FadeIn,
  FadeInUp,
  FadeInDown,
  ZoomIn,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography, useTheme } from '@/constants/theme';
import { calculateFitnessEngine, BiologicalSex, ActivityLevel, FitnessGoal } from '@/utils/algorithm';
import { useFitnessStore } from '@/store/fitnessStore';
import { ThemeCtx, StepDots, ChoiceCard, MetricInput, StepHeader, PulseRing } from '@/components/setup';
import type { Palette } from '@/components/setup';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const STEPS_COUNT = 5;

// ─── LOADING_PHASES ────────────────────────────────────────────────────────────
const LOADING_PHASES = [
  { icon: 'heart-outline',   color: '#EF4444', title: 'Analyzing Vitals',     subtitle: 'Checking biological metrics & BMR baseline...' },
  { icon: 'barbell-outline', color: '#0EA5E9', title: 'Calibrating Training',  subtitle: 'Structuring optimal training frequency...' },
  { icon: 'water-outline',   color: '#3B82F6', title: 'Hydration Scaling',     subtitle: 'Formulating daily intake formulas...' },
  { icon: 'flame-outline',   color: '#F59E0B', title: 'Caloric Targeting',     subtitle: 'Optimizing macronutrient thresholds...' },
  { icon: 'trophy-outline',  color: '#2E7D5E', title: 'Finalizing Program',    subtitle: 'Forging your custom daily targets...' },
];

// ──────────────────────────────────────────────────────────────────────────────
export default function SetupWizardScreen() {
  const router = useRouter();
  const setUser  = useFitnessStore((s) => s.setUser);
  const user     = useFitnessStore((s) => s.user);
  const { colors, isDark: isDarkMode } = useTheme();

  // ─ Resolve palette dynamically based on global theme tokens ───────────────────────────
  const D = React.useMemo(() => ({
    bg: colors.bg,
    card: colors.card,
    cardBorder: colors.cardBorder,
    glass: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    glassBorder: isDarkMode ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
    textPrimary: colors.text.primary,
    textSecondary: colors.text.secondary,
    textMuted: colors.muted,
    accent: colors.lime,
    accentGlow: isDarkMode ? 'rgba(52,211,153,0.25)' : 'rgba(46,125,94,0.15)',
    statusBar: colors.statusBar,
  }), [colors, isDarkMode]);

  // Rebuild styles whenever theme changes (memoized to avoid unnecessary recreates)
  const s = React.useMemo(() => makeStyles(D), [D]);

  const isRecalibrating = user.level > 1 || user.xp > 0 || user.weight !== 70 || user.height !== 170;

  const [step, setStep]         = useState(0);
  const [sex, setSex]           = useState<BiologicalSex>('male');
  const [age, setAge]           = useState('24');
  const [height, setHeight]     = useState('170');
  const [weight, setWeight]     = useState('70');
  const [activity, setActivity] = useState<ActivityLevel>('moderately_active');
  const [goal, setGoal]         = useState<FitnessGoal>('maintain');
  const [results, setResults]   = useState<any>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);

  // ── Animations ──────────────────────────────────────────────────────────────
  const progressWidth = useSharedValue(0);
  const iconScale     = useSharedValue(1);
  const iconRotation  = useSharedValue(0);

  React.useEffect(() => {
    progressWidth.value = withTiming(Math.min((step / 4) * 100, 100), { duration: 400, easing: Easing.out(Easing.exp) });
  }, [step]);

  React.useEffect(() => {
    iconScale.value = withSequence(
      withTiming(0,   { duration: 150 }),
      withTiming(1.2, { duration: 160 }),
      withTiming(1,   { duration: 150 }),
    );
    iconRotation.value = withSequence(
      withTiming(360, { duration: 400 }),
      withTiming(0,   { duration: 0 }),
    );
  }, [loadingPhase]);

  React.useEffect(() => {
    let interval: any;
    if (step === 5) {
      setLoadingPhase(0);
      interval = setInterval(() => setLoadingPhase((p) => Math.min(p + 1, LOADING_PHASES.length - 1)), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [step]);

  const animatedIconStyle   = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }, { rotate: `${iconRotation.value}deg` }],
  }));
  const animatedProgressStyle = useAnimatedStyle(() => ({ width: `${progressWidth.value}%` }));

  // ── Color helpers ────────────────────────────────────────────────────────────
  const getPrimaryColor = (): string => {
    if (step === 0) return D.accent;
    if (step === 1) return sex === 'male' ? '#3B82F6' : '#EC4899';
    if (step === 2) return '#F59E0B';
    if (step === 3) {
      if (activity === 'sedentary')         return '#3B82F6';
      if (activity === 'lightly_active')    return D.accent;
      if (activity === 'moderately_active') return '#F59E0B';
      if (activity === 'very_active')       return '#EF4444';
    }
    if (goal === 'lose_fat')     return '#F59E0B';
    if (goal === 'maintain')     return D.accent;
    if (goal === 'build_muscle') return '#0EA5E9';
    return D.accent;
  };
  const activeColor = getPrimaryColor();

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleNext = () => { step === 4 ? calculateEngine() : setStep(step + 1); };
  const handleBack = () => { if (step > 0 && step < 5) setStep(step - 1); };

  const calculateEngine = () => {
    const cid = 'setup_' + Math.random().toString(36).substring(2, 8);
    console.log(`[${cid}] engine calc start`);
    setStep(5);
    setTimeout(() => {
      try {
        const out = calculateFitnessEngine({
          age: parseInt(age) || 24,
          heightCm: parseInt(height) || 170,
          weightKg: parseInt(weight) || 70,
          sex, activityLevel: activity, goal,
        });
        console.log(`[${cid}] done: cal=${out.calorieGoal}`);
        setResults(out);
        setStep(6);
      } catch (e) {
        console.error(`[${cid}] failed`, e);
        setStep(4);
      }
    }, 5200);
  };

  const handleFinish = async () => {
    if (!results) return;
    const goalMap: Record<FitnessGoal, string> = { lose_fat: 'Fat Loss', maintain: 'Stay Healthy', build_muscle: 'Build Muscle' };
    setUser({
      age: parseInt(age) || 24, height: parseInt(height) || 170, weight: parseInt(weight) || 70,
      goal: goalMap[goal], calorieGoal: results.calorieGoal, waterGoal: results.waterGoalMl,
      stepsGoal: results.stepsGoal, workoutGoal: results.workoutGoal, level: 1, xp: 10,
      setupCompleted: true,
    });
    router.replace('/(tabs)');
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  const phase = LOADING_PHASES[loadingPhase] || LOADING_PHASES[0];

  return (
    <ThemeCtx.Provider value={D}>
    <View style={s.root}>
      <StatusBar barStyle={D.statusBar} backgroundColor={D.bg} />

      {/* ── Top Nav ─────────────────────────────────────────────────────── */}
      {step < 5 && (
        <SafeAreaView edges={['top']} style={s.navBar}>
          <TouchableOpacity onPress={handleBack} style={[s.backBtn, (step === 0) && { opacity: 0 }]} disabled={step === 0}>
            <Ionicons name="chevron-back" size={20} color={D.textSecondary} />
          </TouchableOpacity>

          {/* Animated segmented progress dots */}
          <StepDots currentStep={step} totalSteps={STEPS_COUNT} activeColor={activeColor} />

          <View style={s.navRight}>
            <Text style={[s.stepCounter, { color: activeColor }]}>{step + 1}<Text style={s.stepTotal}>/5</Text></Text>
          </View>
        </SafeAreaView>
      )}

      {/* Thin glow progress bar */}
      {step < 5 && (
        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, animatedProgressStyle, { backgroundColor: activeColor }]} />
        </View>
      )}

      {/* ── Scrollable content ──────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── STEP 0 — Welcome ──────────────────────────────────────────── */}
        {step === 0 && (
          <View style={s.stepWrap}>
            {/* Big hero graphic */}
            <Animated.View entering={ZoomIn.springify().damping(18)} style={s.heroOrb}>
              {/* Outer decorative rings */}
              <View style={[s.orbRing, { width: 220, height: 220, borderRadius: 110, borderColor: activeColor + '15' }]} />
              <View style={[s.orbRing, { width: 170, height: 170, borderRadius: 85,  borderColor: activeColor + '25' }]} />
              <View style={[s.orbRing, { width: 120, height: 120, borderRadius: 60,  borderColor: activeColor + '40' }]} />
              {/* Center icon */}
              <View style={[s.orbCenter, { backgroundColor: activeColor, shadowColor: activeColor }]}>
                <Ionicons name={isRecalibrating ? 'refresh' : 'barbell'} size={34} color="#fff" />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).springify().damping(18)}>
              <Text style={s.welcomeLabel}>{isRecalibrating ? 'RECALIBRATE' : 'GET STARTED'}</Text>
              <Text style={s.welcomeTitle}>
                {isRecalibrating ? 'Update\nYour Program' : 'Build Your\nFitness Profile'}
              </Text>
              <Text style={s.welcomeSubtitle}>
                {isRecalibrating
                  ? "Refresh your metrics and goals to generate a brand new training program tailored to where you are now."
                  : "Answer a few quick questions so we can forge a science-backed program built exactly for your body and goals."}
              </Text>
            </Animated.View>

            {/* Feature pills */}
            <Animated.View entering={FadeInUp.delay(350).springify().damping(18)} style={s.pillRow}>
              {[
                { icon: 'timer-outline',   label: 'Takes 2 min' },
                { icon: 'shield-checkmark', label: 'Science-based' },
                { icon: 'star-outline',    label: 'Personalized' },
              ].map((p) => (
                <View key={p.label} style={[s.pill, { borderColor: activeColor + '30', backgroundColor: activeColor + '10' }]}>
                  <Ionicons name={p.icon as any} size={13} color={activeColor} />
                  <Text style={[s.pillText, { color: activeColor }]}>{p.label}</Text>
                </View>
              ))}
            </Animated.View>
          </View>
        )}

        {/* ── STEP 1 — Basics ───────────────────────────────────────────── */}
        {step === 1 && (
          <View style={s.stepWrap}>
            <StepHeader stepNum={1} label="BASICS" title="Tell Us About You" subtitle="This helps us calculate your basal metabolic rate with precision." color={activeColor} />

            {/* Sex selector — horizontal large cards */}
            <Animated.View entering={FadeInUp.delay(160).springify().damping(18)} style={s.sexRow}>
              {[
                { id: 'male',   icon: 'male',   label: 'Male',   color: '#3B82F6' },
                { id: 'female', icon: 'female', label: 'Female', color: '#EC4899' },
              ].map((item) => {
                const sel = sex === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSex(item.id as BiologicalSex)}
                    activeOpacity={0.85}
                    style={[s.sexCard, sel && { backgroundColor: item.color + '18', borderColor: item.color + '80', shadowColor: item.color, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 }]}
                  >
                    <View style={[s.sexIconBubble, { backgroundColor: sel ? item.color + '30' : D.glass }]}>
                      <Ionicons name={item.icon as any} size={30} color={sel ? item.color : D.textMuted} />
                    </View>
                    <Text style={[s.sexLabel, sel && { color: item.color, fontWeight: '700' }]}>{item.label}</Text>
                    {sel && (
                      <View style={[s.sexCheck, { backgroundColor: item.color }]}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </Animated.View>

            {/* Age input */}
            <Animated.View entering={FadeInUp.delay(240).springify().damping(18)}>
              <Text style={s.fieldLabel}>Age</Text>
              <MetricInput
                icon="calendar-outline"
                label="YOUR AGE"
                unit="years"
                value={age}
                onChange={setAge}
                color={activeColor}
                delay={0}
              />
            </Animated.View>
          </View>
        )}

        {/* ── STEP 2 — Metrics ──────────────────────────────────────────── */}
        {step === 2 && (
          <View style={s.stepWrap}>
            <StepHeader stepNum={2} label="METRICS" title="Your Body Stats" subtitle="Current measurements establish your starting baseline." color={activeColor} />
            <MetricInput icon="resize-outline"    label="HEIGHT" unit="cm"  value={height} onChange={setHeight} color={'#F59E0B'} delay={120} />
            <MetricInput icon="fitness-outline"   label="WEIGHT" unit="kg"  value={weight} onChange={setWeight} color={'#FB923C'} delay={200} />

            {/* Visual BMI preview */}
            <Animated.View entering={FadeInUp.delay(300).springify().damping(18)} style={s.bmiPreviewCard}>
              <Text style={s.bmiLabel}>ESTIMATED BMI</Text>
              {(() => {
                const h = parseInt(height) || 170;
                const w = parseInt(weight) || 70;
                const bmi = (w / ((h / 100) ** 2)).toFixed(1);
                const bmiNum = parseFloat(bmi);
                const cat = bmiNum < 18.5 ? { label: 'Underweight', color: '#3B82F6' } : bmiNum < 25 ? { label: 'Normal', color: D.accent } : bmiNum < 30 ? { label: 'Overweight', color: '#F59E0B' } : { label: 'Obese', color: '#EF4444' };
                return (
                  <View style={s.bmiRow}>
                    <Text style={[s.bmiValue, { color: cat.color }]}>{bmi}</Text>
                    <View style={[s.bmiBadge, { backgroundColor: cat.color + '20', borderColor: cat.color + '50' }]}>
                      <Text style={[s.bmiBadgeText, { color: cat.color }]}>{cat.label}</Text>
                    </View>
                  </View>
                );
              })()}
            </Animated.View>
          </View>
        )}

        {/* ── STEP 3 — Activity ─────────────────────────────────────────── */}
        {step === 3 && (
          <View style={s.stepWrap}>
            <StepHeader stepNum={3} label="LIFESTYLE" title="Activity Level" subtitle="How would you describe your daily physical activity?" color={activeColor} />
            {[
              { id: 'sedentary',         icon: 'cafe-outline',     label: 'Sedentary',         subtitle: 'Desk job, minimal movement', color: '#3B82F6' },
              { id: 'lightly_active',    icon: 'walk-outline',     label: 'Lightly Active',    subtitle: 'Light exercise 1–3 days/week', color: D.accent },
              { id: 'moderately_active', icon: 'bicycle-outline',  label: 'Moderately Active', subtitle: 'Exercise 3–5 days/week', color: '#F59E0B' },
              { id: 'very_active',       icon: 'fitness-outline',  label: 'Very Active',       subtitle: 'Intense training 6–7 days', color: '#EF4444' },
            ].map((item, i) => (
              <ChoiceCard
                key={item.id}
                selected={activity === item.id}
                onPress={() => setActivity(item.id as ActivityLevel)}
                icon={item.icon}
                label={item.label}
                subtitle={item.subtitle}
                color={item.color}
                delay={i * 60}
              />
            ))}
          </View>
        )}

        {/* ── STEP 4 — Goal ─────────────────────────────────────────────── */}
        {step === 4 && (
          <View style={s.stepWrap}>
            <StepHeader stepNum={4} label="MISSION" title="Your Primary Goal" subtitle="What outcome are you optimizing for right now?" color={activeColor} />
            {[
              { id: 'lose_fat',     icon: 'flame-outline',   label: 'Burn Fat',         subtitle: 'Caloric deficit · high-step targets', color: '#F59E0B', badge: '🔥 Most Popular' },
              { id: 'maintain',     icon: 'leaf-outline',    label: 'Stay Fit',         subtitle: 'Balanced approach · sustainable habits', color: D.accent, badge: null },
              { id: 'build_muscle', icon: 'barbell-outline', label: 'Build Muscle',     subtitle: 'Caloric surplus · strength focus', color: '#0EA5E9', badge: null },
            ].map((item, i) => (
              <View key={item.id}>
                <ChoiceCard
                  selected={goal === item.id}
                  onPress={() => setGoal(item.id as FitnessGoal)}
                  icon={item.icon}
                  label={item.label}
                  subtitle={item.subtitle}
                  color={item.color}
                  delay={i * 70}
                />
                {item.badge && goal !== item.id && (
                  <Animated.View entering={FadeIn.delay(i * 70 + 200)} style={[s.goalBadge, { backgroundColor: item.color + '20', borderColor: item.color + '40' }]}>
                    <Text style={[s.goalBadgeText, { color: item.color }]}>{item.badge}</Text>
                  </Animated.View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── STEP 5 — Calibration loading ──────────────────────────────── */}
        {step === 5 && (
          <SafeAreaView style={s.calibrateScreen} edges={['top', 'bottom']}>
            {/* Pulsing rings */}
            <View style={s.ringContainer}>
              <PulseRing color={phase.color} size={220} delay={0} />
              <PulseRing color={phase.color} size={160} delay={400} />
              <PulseRing color={phase.color} size={100} delay={800} />
              {/* Center core */}
              <View style={[s.calibrateCore, { backgroundColor: phase.color, shadowColor: phase.color }]}>
                <Animated.View style={animatedIconStyle}>
                  <Ionicons name={phase.icon as any} size={38} color="#fff" />
                </Animated.View>
              </View>
            </View>

            <View style={s.calibrateTexts}>
              <Text key={`t-${loadingPhase}`} style={s.calibrateTitle}>{phase.title}</Text>
              <Text key={`s-${loadingPhase}`} style={[s.calibrateSubtitle, { color: phase.color }]}>{phase.subtitle}</Text>

              {/* Phase progress dots */}
              <View style={s.phaseDotsRow}>
                {LOADING_PHASES.map((_, i) => (
                  <View
                    key={i}
                    style={[s.phaseDot,
                      i < loadingPhase  && { backgroundColor: phase.color, opacity: 0.4 },
                      i === loadingPhase && { backgroundColor: phase.color, width: 20 },
                    ]}
                  />
                ))}
              </View>

              {/* Status rows */}
              <View style={s.statusRows}>
                {LOADING_PHASES.map((p, i) => (
                  <Animated.View
                    key={i}
                    style={[s.statusRow, i > loadingPhase && { opacity: 0.25 }]}
                  >
                    <View style={[s.statusDot, { backgroundColor: i <= loadingPhase ? p.color : D.cardBorder }]}>
                      {i < loadingPhase && <Ionicons name="checkmark" size={10} color="#fff" />}
                    </View>
                    <Text style={[s.statusLabel, i <= loadingPhase && { color: D.textPrimary }]}>{p.title}</Text>
                    {i < loadingPhase  && <Text style={[s.statusDone, { color: p.color }]}>Done</Text>}
                    {i === loadingPhase && <Text style={[s.statusDone, { color: p.color }]}>Running...</Text>}
                  </Animated.View>
                ))}
              </View>
            </View>
          </SafeAreaView>
        )}

        {/* ── STEP 6 — Results ──────────────────────────────────────────── */}
        {step === 6 && results && (
          <SafeAreaView style={s.resultsScreen} edges={['top', 'bottom']}>
            {/* Hero trophy block */}
            <Animated.View entering={ZoomIn.springify().damping(16)} style={[s.trophyOrb, { borderColor: activeColor + '40', shadowColor: activeColor }]}>
              <Ionicons name="trophy" size={40} color={activeColor} />
            </Animated.View>
            <Animated.Text entering={FadeInUp.delay(100).springify().damping(18)} style={s.resultsTitle}>
              {isRecalibrating ? 'Program Updated' : "You're All Set"}
            </Animated.Text>
            <Animated.Text entering={FadeInUp.delay(160).springify().damping(18)} style={s.resultsSubtitle}>
              {'Your personalized daily targets are ready. Fine-tune any value below.'}
            </Animated.Text>

            {/* Metric result cards grid */}
            {[
              { icon: 'flame',     color: '#F59E0B', label: 'Calories',  key: 'calorieGoal',  unit: 'kcal' },
              { icon: 'footsteps', color: '#EC4899', label: 'Steps',     key: 'stepsGoal',    unit: 'steps' },
              { icon: 'water',     color: '#3B82F6', label: 'Hydration', key: 'waterGoalMl',  unit: 'ml' },
              { icon: 'barbell',   color: '#0EA5E9', label: 'Workouts',  key: 'workoutGoal',  unit: '/wk' },
            ].map((item, i) => (
              <Animated.View key={item.key} entering={FadeInUp.delay(200 + i * 70).springify().damping(18)} style={[s.resultCard, { borderColor: item.color + '30' }]}>
                <View style={[s.resultIconBubble, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={s.resultCardLabel}>{item.label}</Text>
                <View style={s.resultEditRow}>
                  <TextInput
                    style={[s.resultCardValue, { color: item.color }]}
                    value={String(results[item.key] ?? '')}
                    onChangeText={(v) => setResults({ ...results, [item.key]: parseInt(v) || 0 })}
                    keyboardType="number-pad"
                  />
                  <Text style={s.resultCardUnit}>{item.unit}</Text>
                  <Ionicons name="pencil-outline" size={13} color={D.textMuted} />
                </View>
              </Animated.View>
            ))}

            <Animated.Text entering={FadeIn.delay(600)} style={s.disclaimer}>
              Tap any number to customize your targets before you begin.
            </Animated.Text>
          </SafeAreaView>
        )}
      </ScrollView>

      {/* ── Footer CTA ─────────────────────────────────────────────────── */}
      {step < 5 && (
        <SafeAreaView edges={['bottom']} style={s.footer}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleNext}
            style={[s.ctaBtn, { backgroundColor: activeColor, shadowColor: activeColor }]}
          >
            <Text style={s.ctaLabel}>
              {step === 0 ? (isRecalibrating ? 'Update Stats' : "Let's Go") : step === 4 ? 'Calculate My Plan' : 'Continue'}
            </Text>
            <Ionicons name={step === 4 ? 'rocket' : 'arrow-forward'} size={20} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>
      )}

      {step === 6 && (
        <SafeAreaView edges={['bottom']} style={s.footer}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleFinish}
            style={[s.ctaBtn, { backgroundColor: activeColor, shadowColor: activeColor }]}
          >
            <Text style={s.ctaLabel}>{isRecalibrating ? 'Save & Return' : 'Start Training'}</Text>
            <Ionicons name="barbell" size={20} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
    </ThemeCtx.Provider>
  );
}
// ─── Styles factory (accepts palette so it reacts to dark/light) ─────────────
function makeStyles(D: Palette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: D.bg },
    navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: D.card, borderWidth: 1, borderColor: D.cardBorder, alignItems: 'center', justifyContent: 'center' },
    navRight: {},
    stepCounter: { fontSize: 13, fontWeight: '700' },
    stepTotal: { fontSize: 13, fontWeight: '400', color: D.textMuted },
    progressTrack: { height: 2, backgroundColor: D.cardBorder, marginHorizontal: 20, borderRadius: 1, overflow: 'hidden', marginBottom: 4 },
    progressFill: { height: '100%', borderRadius: 1 },
    scrollContent: { flexGrow: 1, paddingBottom: 120 },
    stepWrap: { padding: 24 },
    heroOrb: { alignItems: 'center', justifyContent: 'center', height: 240, marginBottom: 36 },
    orbRing: { position: 'absolute', borderWidth: 1 },
    orbCenter: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 12 },
    welcomeLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2.5, color: D.textMuted, marginBottom: 12 },
    welcomeTitle: { fontSize: 38, fontWeight: '800', color: D.textPrimary, letterSpacing: -1, lineHeight: 44, marginBottom: 16 },
    welcomeSubtitle: { fontSize: 16, color: D.textSecondary, lineHeight: 26, marginBottom: 28 },
    pillRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill, borderWidth: 1 },
    pillText: { fontSize: 12, fontWeight: '600' },
    sexRow: { flexDirection: 'row', gap: 14, marginBottom: 24 },
    sexCard: { flex: 1, backgroundColor: D.card, borderRadius: 20, borderWidth: 1.5, borderColor: D.cardBorder, alignItems: 'center', justifyContent: 'center', paddingVertical: 26, gap: 10, shadowOffset: { width: 0, height: 4 } },
    sexIconBubble: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    sexLabel: { fontSize: 16, fontWeight: '600', color: D.textSecondary },
    sexCheck: { position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    fieldLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: D.textMuted, marginBottom: 8 },
    bmiPreviewCard: { backgroundColor: D.card, borderRadius: 18, borderWidth: 1, borderColor: D.cardBorder, padding: 20, marginTop: 8 },
    bmiLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: D.textMuted, marginBottom: 10 },
    bmiRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    bmiValue: { fontSize: 40, fontWeight: '800' },
    bmiBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.pill, borderWidth: 1 },
    bmiBadgeText: { fontSize: 13, fontWeight: '700' },
    goalBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, borderWidth: 1, marginTop: -8, marginBottom: 12, marginLeft: 18 },
    goalBadgeText: { fontSize: 11, fontWeight: '700' },
    calibrateScreen: { flex: 1, alignItems: 'center', paddingTop: 24, minHeight: SCREEN_H * 0.85 },
    ringContainer: { alignItems: 'center', justifyContent: 'center', height: 220, width: 220, marginBottom: 48 },
    calibrateCore: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 24, elevation: 16 },
    calibrateTexts: { alignItems: 'center', paddingHorizontal: 28, width: '100%' },
    calibrateTitle: { fontSize: 26, fontWeight: '800', color: D.textPrimary, marginBottom: 8, textAlign: 'center' },
    calibrateSubtitle: { fontSize: 15, fontWeight: '600', textAlign: 'center', marginBottom: 28 },
    phaseDotsRow: { flexDirection: 'row', gap: 8, marginBottom: 32, alignItems: 'center' },
    phaseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: D.cardBorder },
    statusRows: { width: '100%', gap: 10 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 18, backgroundColor: D.card, borderRadius: 14, borderWidth: 1, borderColor: D.cardBorder },
    statusDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    statusLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: D.textSecondary },
    statusDone: { fontSize: 12, fontWeight: '700' },
    resultsScreen: { flex: 1, padding: 24, minHeight: SCREEN_H * 0.85 },
    trophyOrb: { width: 90, height: 90, borderRadius: 45, backgroundColor: D.card, borderWidth: 2, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    resultsTitle: { fontSize: 30, fontWeight: '800', color: D.textPrimary, textAlign: 'center', marginBottom: 8 },
    resultsSubtitle: { fontSize: 15, color: D.textSecondary, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
    resultCard: { backgroundColor: D.card, borderRadius: 18, borderWidth: 1.5, padding: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 16 },
    resultIconBubble: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    resultCardLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: D.textSecondary },
    resultEditRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    resultCardValue: { fontSize: 22, fontWeight: '800', minWidth: 50, textAlign: 'right', padding: 0 },
    resultCardUnit: { fontSize: 13, fontWeight: '600', color: D.textMuted },
    disclaimer: { fontSize: 12, color: D.textMuted, textAlign: 'center', marginTop: 12 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, backgroundColor: D.bg, paddingTop: 12, borderTopWidth: 1, borderTopColor: D.cardBorder },
    ctaBtn: { height: 58, borderRadius: Radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8, marginBottom: 4 },
    ctaLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  });
}
