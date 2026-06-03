import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import GlassCard from '@/components/ui/GlassCard';
import { calculateFitnessEngine, BiologicalSex, ActivityLevel, FitnessGoal } from '@/utils/algorithm';
import { useFitnessStore } from '@/store/fitnessStore';

export default function SetupWizardScreen() {
  const router = useRouter();
  const setUser = useFitnessStore((s) => s.setUser);

  const [step, setStep] = useState(0);

  // Form State
  const [sex, setSex] = useState<BiologicalSex>('male');
  const [age, setAge] = useState('24');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [activity, setActivity] = useState<ActivityLevel>('moderately_active');
  const [goal, setGoal] = useState<FitnessGoal>('maintain');

  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleNext = () => {
    if (step === 4) {
      calculateEngine();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const calculateEngine = () => {
    setStep(5); // Show loading
    setIsCalculating(true);
    
    // Simulate thinking time for effect
    setTimeout(() => {
      const output = calculateFitnessEngine({
        age: parseInt(age) || 24,
        heightCm: parseInt(height) || 170,
        weightKg: parseInt(weight) || 70,
        sex,
        activityLevel: activity,
        goal,
      });
      setResults(output);
      setIsCalculating(false);
      setStep(6); // Show results
    }, 2000);
  };

  const handleFinish = async () => {
    if (!results) return;

    // Convert internal goal to display goal string
    const goalMap = {
      lose_fat: 'Fat Loss',
      maintain: 'Stay Healthy',
      build_muscle: 'Build Muscle',
    };

    // Update store (this automatically pushes to Supabase)
    setUser({
      age: parseInt(age) || 24,
      height: parseInt(height) || 170,
      weight: parseInt(weight) || 70,
      goal: goalMap[goal],
      calorieGoal: results.calorieGoal,
      waterGoal: results.waterGoalMl,
      stepsGoal: results.stepsGoal,
      workoutGoal: results.workoutGoal,
      level: 1, // Start at level 1
      xp: 10,   // Give them 10 XP for onboarding
    });

    router.replace('/(tabs)');
  };

  const renderProgress = () => (
    <View style={styles.progressContainer}>
      <TouchableOpacity onPress={handleBack} disabled={step === 0 || step >= 5}>
        <Ionicons name="arrow-back" size={24} color={step > 0 && step < 5 ? Colors.text.primary : 'transparent'} />
      </TouchableOpacity>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min((step / 4) * 100, 100)}%` }]} />
      </View>
      <View style={{ width: 24 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {step < 5 && renderProgress()}
      
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {step === 0 && (
          <View style={styles.stepContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles" size={32} color={Colors.lime} />
            </View>
            <Text style={styles.title}>Welcome to FitForge</Text>
            <Text style={styles.subtitle}>Let's calibrate your fitness engine. We'll need a few details to build your personalized plan.</Text>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>The Basics</Text>
            <Text style={styles.subtitle}>This helps us calculate your basal metabolic rate accurately.</Text>
            
            <Text style={styles.label}>Biological Sex</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.selectableCard, sex === 'male' && styles.selectedCard]}
                onPress={() => setSex('male')}
              >
                <Ionicons name="male" size={24} color={sex === 'male' ? Colors.white : Colors.lime} />
                <Text style={[styles.selectableText, sex === 'male' && styles.selectedText]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.selectableCard, sex === 'female' && styles.selectedCard]}
                onPress={() => setSex('female')}
              >
                <Ionicons name="female" size={24} color={sex === 'female' ? Colors.white : Colors.amber} />
                <Text style={[styles.selectableText, sex === 'female' && styles.selectedText]}>Female</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { marginTop: Spacing.xl }]}>Age (years)</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Your Metrics</Text>
            <Text style={styles.subtitle}>Current body metrics establish your starting baseline.</Text>
            
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="number-pad"
              maxLength={3}
            />

            <Text style={[styles.label, { marginTop: Spacing.xl }]}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Activity Level</Text>
            <Text style={styles.subtitle}>How active is your daily lifestyle?</Text>
            
            <View style={styles.list}>
              {[
                { id: 'sedentary', title: 'Sedentary', desc: 'Little to no exercise, desk job' },
                { id: 'lightly_active', title: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                { id: 'moderately_active', title: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                { id: 'very_active', title: 'Very Active', desc: 'Heavy exercise 6-7 days/week' }
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.listCard, activity === item.id && styles.selectedListCard]}
                  onPress={() => setActivity(item.id as ActivityLevel)}
                >
                  <Text style={[styles.listTitle, activity === item.id && styles.selectedText]}>{item.title}</Text>
                  <Text style={[styles.listDesc, activity === item.id && { color: 'rgba(255,255,255,0.8)' }]}>{item.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Your Goal</Text>
            <Text style={styles.subtitle}>What are you training for?</Text>
            
            <View style={styles.list}>
              {[
                { id: 'lose_fat', title: 'Lose Fat', desc: 'Caloric deficit, higher steps', icon: 'flame', color: Colors.amber },
                { id: 'maintain', title: 'Maintain & Tone', desc: 'Balanced baseline, healthy habits', icon: 'leaf', color: Colors.lime },
                { id: 'build_muscle', title: 'Build Muscle', desc: 'Caloric surplus, heavy lifting', icon: 'barbell', color: Colors.chart.fibre }
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.listCard, goal === item.id && [styles.selectedListCard, { backgroundColor: item.color }]]}
                  onPress={() => setGoal(item.id as FitnessGoal)}
                >
                  <View style={styles.row}>
                    <Ionicons name={item.icon as any} size={24} color={goal === item.id ? Colors.white : item.color} />
                    <View style={{ marginLeft: Spacing.md }}>
                      <Text style={[styles.listTitle, goal === item.id && styles.selectedText]}>{item.title}</Text>
                      <Text style={[styles.listDesc, goal === item.id && { color: 'rgba(255,255,255,0.8)' }]}>{item.desc}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 5 && (
          <View style={[styles.stepContainer, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={Colors.lime} />
            <Text style={[styles.title, { marginTop: Spacing.xl, textAlign: 'center' }]}>Calibrating Engine...</Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>Running clinical nutrition formulas...</Text>
          </View>
        )}

        {step === 6 && results && (
          <View style={styles.stepContainer}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.bubble.green, marginBottom: Spacing.md }]}>
              <Ionicons name="checkmark-done" size={32} color={Colors.lime} />
            </View>
            <Text style={styles.title}>Your Engine is Ready</Text>
            <Text style={styles.subtitle}>Here is your personalized daily blueprint.</Text>

            <GlassCard style={styles.resultsCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Target Calories</Text>
                <Text style={styles.resultValue}>{results.calorieGoal} <Text style={styles.unit}>kcal</Text></Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Daily Steps</Text>
                <Text style={styles.resultValue}>{results.stepsGoal}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Hydration</Text>
                <Text style={styles.resultValue}>{results.waterGoalMl} <Text style={styles.unit}>ml</Text></Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Workouts</Text>
                <Text style={styles.resultValue}>{results.workoutGoal} <Text style={styles.unit}>/ week</Text></Text>
              </View>
            </GlassCard>
            <Text style={styles.disclaimer}>You can always adjust these targets in your Profile settings later.</Text>
          </View>
        )}
      </ScrollView>

      {step < 5 && (
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.primaryButton, Shadows.lime]} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>{step === 0 ? "Let's Go" : "Continue"}</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}

      {step === 6 && (
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.primaryButton, Shadows.lime]} onPress={handleFinish}>
            <Text style={styles.primaryButtonText}>Start Journey</Text>
            <Ionicons name="rocket" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  progressContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, justifyContent: 'space-between' },
  progressBar: { flex: 1, height: 6, backgroundColor: Colors.cardBorder, borderRadius: 3, marginHorizontal: Spacing.md, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.lime, borderRadius: 3 },
  scrollContent: { flexGrow: 1, padding: Spacing.lg, paddingBottom: 100 },
  stepContainer: { flex: 1, paddingTop: Spacing.lg },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  title: { ...Typography.h1, color: Colors.text.primary, marginBottom: Spacing.sm },
  subtitle: { ...Typography.body, color: Colors.text.secondary, marginBottom: Spacing.xxl, lineHeight: 22 },
  label: { ...Typography.h4, color: Colors.text.primary, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  selectableCard: { flex: 1, height: 100, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  selectedCard: { backgroundColor: Colors.lime, borderColor: Colors.lime },
  selectableText: { ...Typography.bodyBold, color: Colors.text.primary },
  selectedText: { color: Colors.white },
  input: { backgroundColor: Colors.card, height: 60, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, ...Typography.h3, color: Colors.text.primary },
  list: { gap: Spacing.md },
  listCard: { backgroundColor: Colors.card, padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 2, borderColor: 'transparent' },
  selectedListCard: { backgroundColor: Colors.lime, borderColor: Colors.lime },
  listTitle: { ...Typography.bodyBold, color: Colors.text.primary, marginBottom: 4 },
  listDesc: { ...Typography.caption, color: Colors.text.secondary },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg, paddingBottom: Spacing.xl, backgroundColor: Colors.bg },
  primaryButton: { height: 56, backgroundColor: Colors.lime, borderRadius: Radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  primaryButtonText: { ...Typography.bodyBold, color: Colors.white },
  resultsCard: { padding: Spacing.lg, backgroundColor: Colors.card, borderRadius: Radius.xl },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  resultLabel: { ...Typography.bodyBold, color: Colors.text.secondary },
  resultValue: { ...Typography.h3, color: Colors.text.primary },
  unit: { ...Typography.body, color: Colors.muted },
  divider: { height: 1, backgroundColor: Colors.cardBorder, marginVertical: Spacing.xs },
  disclaimer: { ...Typography.caption, color: Colors.text.secondary, textAlign: 'center', marginTop: Spacing.lg }
});
