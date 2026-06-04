import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch,
  TextInput, KeyboardAvoidingView, Platform, Modal, Image, Share, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Typography, Radius, Shadows, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import * as ImagePicker from 'expo-image-picker';
import { useProfileSettings, useFitnessStore } from '@/store/fitnessStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';
import { triggerHaptic } from '@/utils/haptics';
import { kgToLbs, lbsToKg, mlToOz, ozToMl } from '@/utils/units';
import Animated, {
  FadeInUp, FadeInDown,
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming
} from 'react-native-reanimated';

// ─── Preset Avatars for Fast Selection ─────────────────────────────────────────
const AVATAR_PRESETS = [
  { id: 'av1', label: 'Strength', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=80' },
  { id: 'av2', label: 'Runner', url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=150&auto=format&fit=crop&q=80' },
  { id: 'av3', label: 'Yoga', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=150&auto=format&fit=crop&q=80' },
  { id: 'av4', label: 'Trainer', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: 'av5', label: 'Boxing', url: 'https://images.unsplash.com/photo-1491756906593-95123989ad30?w=150&auto=format&fit=crop&q=80' },
  { id: 'av6', label: 'Cyclist', url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=150&auto=format&fit=crop&q=80' },
];

// ─── Spring-press animated button wrapper ─────────────────────────────────────
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
function PressableRow({ onPress, children, style }: { onPress?: () => void; children: React.ReactNode; style?: any }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const handleIn = () => {
    scale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
    opacity.value = withTiming(0.85, { duration: 80 });
  };
  const handleOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 120 });
  };
  return (
    <AnimatedTouchable
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handleIn}
      onPressOut={handleOut}
      style={[aStyle, style]}
    >
      {children}
    </AnimatedTouchable>
  );
}

// ─── Main Settings Screen ─────────────────────────────────────────────────────
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Theme context
  const { colors, isDark: isDarkMode, setIsDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

  // Zustand stores
  const { user, setUser } = useProfileSettings();
  const fitnessStore = useFitnessStore();

  // ─── State Management for Editing Fields ──────────────────────────────────────
  const [formName, setFormName] = useState(user.name);
  const [formAge, setFormAge] = useState(user.age.toString());
  const [formHeight, setFormHeight] = useState(user.height.toString());

  // Preferences
  const [weightUnit, setWeightUnit] = useState(user.weightUnit ?? 'kg');
  const [volumeUnit, setVolumeUnit] = useState(user.volumeUnit ?? 'ml');

  // Weight preference-aware init
  const initialWeight = (user.weightUnit ?? 'kg') === 'lbs' ? kgToLbs(user.weight).toString() : user.weight.toString();
  const [formWeight, setFormWeight] = useState(initialWeight);
  const [formGoal, setFormGoal] = useState(user.goal);
  const [formMotto, setFormMotto] = useState(user.motto);
  const [formProfilePic, setFormProfilePic] = useState(user.profilePic || '');

  // Advanced Goals (numeric states for instant slider / adjuster feedback)
  const [formCalorieGoal, setFormCalorieGoal] = useState(user.calorieGoal);
  const [formWaterGoal, setFormWaterGoal] = useState(user.waterGoal);
  const [formStepsGoal, setFormStepsGoal] = useState(user.stepsGoal);
  const [formWorkoutGoal, setFormWorkoutGoal] = useState(user.workoutGoal);

  // Preference switches
  const [notifications, setNotifications] = useState(user.notificationsEnabled ?? true);
  const [haptics, setHaptics] = useState(user.hapticsEnabled ?? true);
  const [privateProfile, setPrivateProfile] = useState(user.privateProfileEnabled ?? false);
  const [appLock, setAppLock] = useState(user.appLockEnabled ?? false);

  // Modal / Overlay Controls
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [showSplashPreview, setShowSplashPreview] = useState(false);
  const [showSyncing, setShowSyncing] = useState(false);
  const [showDocModal, setShowDocModal] = useState<{ visible: boolean; title: string; content: string }>({
    visible: false, title: '', content: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});

  // Premium Toast States & Helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'alert'>('info');

  const showToast = (message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    triggerHaptic(type === 'success' ? 'success' : type === 'alert' ? 'error' : 'selection');
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  };

  // Handle Weight Unit Toggling with value conversion
  const handleWeightUnitChange = (newUnit: 'kg' | 'lbs') => {
    if (newUnit === weightUnit) return;
    const currentWeightVal = parseFloat(formWeight);
    if (!isNaN(currentWeightVal) && currentWeightVal > 0) {
      if (newUnit === 'lbs') {
        setFormWeight(kgToLbs(currentWeightVal).toString());
      } else {
        setFormWeight(lbsToKg(currentWeightVal).toString());
      }
    }
    setWeightUnit(newUnit);
  };

  // ─── Native Image Picker ──────────────────────────────────────────────────────
  const pickImageFromGallery = async () => {
    setActionSheetVisible(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Gallery access permissions are required to select an avatar.', 'alert');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setFormProfilePic(result.assets[0].uri);
      }

    } catch (e) {
      console.warn('Image picker error: ', e);
    }
  };

  const takePhotoWithCamera = async () => {
    setActionSheetVisible(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showToast('Camera permissions are required to capture an avatar photo.', 'alert');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setFormProfilePic(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Camera capture error: ', e);
    }
  };

  // ─── Save Profile Updates ─────────────────────────────────────────────────────
  const handleSave = () => {
    const errors: Record<string, string> = {};

    if (!formName.trim()) errors.name = 'Full name is required';

    const ageNum = parseInt(formAge, 10);
    if (!formAge || isNaN(ageNum) || ageNum <= 0 || ageNum > 120) errors.age = 'Invalid age (1-120)';

    const heightNum = parseFloat(formHeight);
    if (!formHeight || isNaN(heightNum) || heightNum <= 50 || heightNum > 250) errors.height = 'Invalid height (50-250)';

    const weightNum = parseFloat(formWeight);
    if (weightUnit === 'lbs') {
      if (!formWeight || isNaN(weightNum) || weightNum <= 22 || weightNum > 1100) {
        errors.weight = 'Invalid weight (22-1100 lbs)';
      }
    } else {
      if (!formWeight || isNaN(weightNum) || weightNum <= 10 || weightNum > 500) {
        errors.weight = 'Invalid weight (10-500 kg)';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please correct errors in basic metrics section before saving.', 'alert');
      return;
    }

    const finalWeightInKg = weightUnit === 'lbs' ? lbsToKg(weightNum) : weightNum;

    // Save back to Zustand (which auto-syncs to Supabase profiles DB if logged in)
    setUser({
      name: formName.trim(),
      age: ageNum,
      height: heightNum,
      weight: finalWeightInKg,
      goal: formGoal,
      motto: formMotto.trim(),
      calorieGoal: formCalorieGoal,
      waterGoal: formWaterGoal,
      stepsGoal: formStepsGoal,
      workoutGoal: formWorkoutGoal,
      profilePic: formProfilePic,
      weightUnit,
      volumeUnit,
      notificationsEnabled: notifications,
      hapticsEnabled: haptics,
      privateProfileEnabled: privateProfile,
      appLockEnabled: appLock,
    });

    showToast('Settings saved and synced successfully.', 'success');
  };

  // ─── Sync Supabase manually ───────────────────────────────────────────────
  const handleManualSync = async () => {
    triggerHaptic('selection');
    setShowSyncing(true);
    try {
      await fitnessStore.initializeFromSupabase();
      const updatedUser = useFitnessStore.getState().user;
      // Reload states from store
      setFormName(updatedUser.name);
      setFormAge(updatedUser.age.toString());
      setFormHeight(updatedUser.height.toString());

      const syncedWeight = (updatedUser.weightUnit ?? 'kg') === 'lbs' ? kgToLbs(updatedUser.weight).toString() : updatedUser.weight.toString();
      setFormWeight(syncedWeight);

      setFormGoal(updatedUser.goal);
      setFormMotto(updatedUser.motto);
      setFormCalorieGoal(updatedUser.calorieGoal);
      setFormWaterGoal(updatedUser.waterGoal);
      setFormStepsGoal(updatedUser.stepsGoal);
      setFormWorkoutGoal(updatedUser.workoutGoal);
      setFormProfilePic(updatedUser.profilePic || '');
      setNotifications(updatedUser.notificationsEnabled ?? true);
      setHaptics(updatedUser.hapticsEnabled ?? true);
      setWeightUnit(updatedUser.weightUnit ?? 'kg');
      setVolumeUnit(updatedUser.volumeUnit ?? 'ml');
      setPrivateProfile(updatedUser.privateProfileEnabled ?? false);
      setAppLock(updatedUser.appLockEnabled ?? false);
      showToast('All logs and profile details synced with cloud backup.', 'success');
    } catch (e) {
      showToast('Could not sync with Supabase. Offline cache preserved.', 'info');
    } finally {
      setShowSyncing(false);
    }
  };

  // ─── Change Account Password ───────────────────────────────────────────────
  const handleChangePassword = async () => {
    triggerHaptic('selection');
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user || !authData.user.email) {
      showToast('Password change is only available for online cloud accounts.', 'info');
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authData.user.email, {
        redirectTo: 'fitforge://reset-password',
      });
      if (error) throw error;
      showToast(`Password reset link sent to ${authData.user.email}.`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to send password reset request.', 'alert');
    }
  };

  // ─── Native JSON Data Export ───────────────────────────────────────────────
  const handleExportData = async () => {
    triggerHaptic('selection');
    try {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        appName: 'FitForge Pro',
        profile: {
          name: user.name,
          age: user.age,
          height: user.height,
          weight: user.weight,
          goal: user.goal,
          motto: user.motto,
          calorieGoal: user.calorieGoal,
          waterGoal: user.waterGoal,
          stepsGoal: user.stepsGoal,
          workoutGoal: user.workoutGoal,
          preferences: { weightUnit, volumeUnit, notifications, haptics }
        },
        logs: {
          weightLogs: fitnessStore.weightLogs,
          waterLogs: fitnessStore.waterLogs,
          stepHistory: fitnessStore.stepHistory,
          meals: fitnessStore.meals,
          reminders: fitnessStore.reminders,
        }
      };

      const prettyJson = JSON.stringify(exportPayload, null, 2);
      await Share.share({
        message: prettyJson,
        title: 'FitForge Personal Data Export',
      });
    } catch (e) {
      showToast('Failed to share data export payload.', 'alert');
    }
  };

  // ─── Clear All History Database Purge ──────────────────────────────────────────
  const handleClearHistory = () => {
    if (clearConfirmText !== 'CLEAR') {
      showToast('Please type CLEAR exactly to confirm deletion.', 'alert');
      return;
    }

    // Purge Zustand state logs & metadata
    useFitnessStore.setState({
      weightLogs: [],
      waterLogs: [],
      stepHistory: [],
      stepsCount: 0,
      activeMinutes: 0,
      meals: [
        { id: 'breakfast', label: 'Breakfast', icon: '🌅', expanded: true, items: [] },
        { id: 'lunch', label: 'Lunch', icon: '☀️', expanded: false, items: [] },
        { id: 'dinner', label: 'Dinner', icon: '🌙', expanded: false, items: [] },
        { id: 'snacks', label: 'Snacks', icon: '🍎', expanded: false, items: [] },
      ],
    });

    // Wipe Supabase cloud tables if logged in
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('weight_logs').delete().eq('profile_id', data.user.id).then();
        supabase.from('water_logs').delete().eq('profile_id', data.user.id).then();
        supabase.from('meals').delete().eq('profile_id', data.user.id).then();
      }
    });

    setShowClearModal(false);
    setClearConfirmText('');
    showToast('All tracking records and history logs cleared.', 'success');
  };

  const handleLogout = async () => {
    triggerHaptic('warning');
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of FitForge?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic('success');
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Dynamic Simulated Notification Toast Banner */}
      {toastMessage && (
        <View style={[styles.toastContainer, { top: insets.top + 10 }]}>
          <GlassCard noPadding style={StyleSheet.flatten([styles.toastCard, { borderColor: toastType === 'success' ? colors.lime + '40' : toastType === 'alert' ? colors.danger + '40' : colors.chart.water + '40' }])}>
            <View style={[styles.toastAccentBar, { backgroundColor: toastType === 'success' ? colors.lime : toastType === 'alert' ? colors.danger : colors.chart.water }]} />
            <View style={styles.toastBody}>
              <Ionicons
                name={toastType === 'success' ? 'checkmark-circle' : toastType === 'alert' ? 'trash-outline' : 'notifications'}
                size={18}
                color={toastType === 'success' ? colors.lime : toastType === 'alert' ? colors.danger : colors.chart.water}
              />
              <Text numberOfLines={2} style={styles.toastText}>{toastMessage}</Text>
            </View>
          </GlassCard>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Settings"
          subtitle="PREFERENCES"
          icon={{ lib: 'Ionicons', name: 'settings' }}
          accentColor={colors.lime}
          showBack
          onBack={() => router.back()}
        />

        {/* ─── Profile Overview Card ─── */}
        <Animated.View entering={FadeInUp.delay(50).springify().damping(18)}>
          <GlassCard accentColor={colors.lime}>
            <View style={styles.profileHeader}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setActionSheetVisible(true)}>
                <View style={styles.avatar}>
                  {formProfilePic ? (
                    <Image source={{ uri: formProfilePic }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {formName.split(' ').map((n) => n[0] || '').join('').toUpperCase().slice(0, 2)}
                    </Text>
                  )}
                  <View style={styles.avatarCameraBadge}>
                    <Ionicons name="camera" size={11} color={colors.white} />
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{formName || 'User Settings'}</Text>
                <Text style={styles.profileEmail} numberOfLines={1}>{user.email || 'Local Account'}</Text>
                <View style={styles.levelBadge}>
                  <Ionicons name="flash" size={10} color={colors.lime} />
                  <Text style={styles.levelText}>Active Fitness Profile</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ─── Profile Basic Metrics ─── */}
        <Animated.View entering={FadeInUp.delay(100).springify().damping(18)}>
          <View style={styles.groupLabel}>
            <View style={[styles.groupDot, { backgroundColor: colors.lime }]} />
            <Text style={styles.groupLabelText}>Basic Metrics</Text>
          </View>

          <GlassCard>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Motto</Text>
              <View style={styles.inputFieldWrap}>
                <Ionicons name="chatbox-outline" size={16} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formMotto}
                  onChangeText={setFormMotto}
                  placeholder="Set your motivational motto..."
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[styles.inputFieldWrap, formErrors.name && styles.inputFieldError]}>
                <Ionicons name="person-outline" size={16} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formName}
                  onChangeText={(t) => {
                    setFormName(t);
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  placeholder="Alex Rivera"
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>
            {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}

            <View style={styles.inputRow}>
              {/* Age */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Age</Text>
                <View style={[styles.inputFieldWrap, formErrors.age && styles.inputFieldError]}>
                  <TextInput
                    style={styles.textInput}
                    value={formAge}
                    onChangeText={(t) => {
                      setFormAge(t);
                      if (formErrors.age) setFormErrors({ ...formErrors, age: undefined });
                    }}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>

              {/* Height */}
              <View style={[styles.inputGroup, { flex: 1.2 }]}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <View style={[styles.inputFieldWrap, formErrors.height && styles.inputFieldError]}>
                  <TextInput
                    style={styles.textInput}
                    value={formHeight}
                    onChangeText={(t) => {
                      setFormHeight(t);
                      if (formErrors.height) setFormErrors({ ...formErrors, height: undefined });
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              {/* Weight */}
              <View style={[styles.inputGroup, { flex: 1.2 }]}>
                <Text style={styles.inputLabel}>Weight ({weightUnit})</Text>
                <View style={[styles.inputFieldWrap, formErrors.weight && styles.inputFieldError]}>
                  <TextInput
                    style={styles.textInput}
                    value={formWeight}
                    onChangeText={(t) => {
                      setFormWeight(t);
                      if (formErrors.weight) setFormErrors({ ...formErrors, weight: undefined });
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>
            </View>
            {formErrors.age && <Text style={styles.errorText}>{formErrors.age}</Text>}
            {formErrors.height && <Text style={styles.errorText}>{formErrors.height}</Text>}
            {formErrors.weight && <Text style={styles.errorText}>{formErrors.weight}</Text>}

            {/* Avatar Preset Scroller */}
            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Change Profile Avatar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
              {AVATAR_PRESETS.map((preset) => {
                const isActive = formProfilePic === preset.url;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => { setFormProfilePic(preset.url); triggerHaptic('selection'); }}
                    style={styles.presetItem}
                  >
                    <Image source={{ uri: preset.url }} style={[styles.presetImage, isActive && { borderColor: colors.lime, borderWidth: 2 }]} />
                    <Text style={[styles.presetLabel, isActive && { color: colors.lime, fontWeight: '700' }]}>{preset.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </GlassCard>
        </Animated.View>

        {/* ─── Advanced Goal Calibrators ─── */}
        <Animated.View entering={FadeInUp.delay(150).springify().damping(18)}>
          <View style={styles.groupLabel}>
            <View style={[styles.groupDot, { backgroundColor: colors.amber }]} />
            <Text style={styles.groupLabelText}>Advanced Goals Calibration</Text>
          </View>

          <GlassCard accentColor={colors.amber}>
            {/* Calorie Goals Dial */}
            <View style={styles.goalCard}>
              <View style={styles.goalHeaderRow}>
                <Ionicons name="flame" size={18} color={colors.amber} />
                <Text style={styles.goalCardTitle}>Daily Calories Target</Text>
                <Text style={styles.goalCardValue}>{formCalorieGoal} kcal</Text>
              </View>
              <View style={styles.adjustRow}>
                <TouchableOpacity style={styles.adjustBtn} onPress={() => { setFormCalorieGoal(Math.max(1000, formCalorieGoal - 100)); triggerHaptic('selection'); }}>
                  <Ionicons name="remove" size={16} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.quickPillRow}>
                  {[1800, 2200, 2500, 3000].map((c) => (
                    <TouchableOpacity key={c} style={[styles.quickGoalPill, formCalorieGoal === c && { backgroundColor: colors.amber + '20', borderColor: colors.amber }]} onPress={() => { setFormCalorieGoal(c); triggerHaptic('selection'); }}>
                      <Text style={[styles.quickGoalPillText, formCalorieGoal === c && { color: colors.amber }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.adjustBtn} onPress={() => { setFormCalorieGoal(Math.min(6000, formCalorieGoal + 100)); triggerHaptic('selection'); }}>
                  <Ionicons name="add" size={16} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Water Goals Dial */}
            <View style={styles.goalCard}>
              <View style={styles.goalHeaderRow}>
                <Ionicons name="water" size={18} color={colors.chart.water} />
                <Text style={styles.goalCardTitle}>Daily Hydration Target</Text>
                <Text style={styles.goalCardValue}>
                  {volumeUnit === 'oz'
                    ? `${mlToOz(formWaterGoal)} oz`
                    : `${formWaterGoal} ml`}
                </Text>
              </View>
              <View style={styles.adjustRow}>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => {
                    if (volumeUnit === 'oz') {
                      const currentOz = mlToOz(formWaterGoal);
                      const newOz = Math.max(16, currentOz - 8); // min 16 oz
                      setFormWaterGoal(ozToMl(newOz));
                    } else {
                      setFormWaterGoal(Math.max(500, formWaterGoal - 250));
                    }
                    triggerHaptic('selection');
                  }}
                >
                  <Ionicons name="remove" size={16} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.quickPillRow}>
                  {volumeUnit === 'oz'
                    ? [50, 70, 90, 100].map((ozVal) => (
                      <TouchableOpacity
                        key={ozVal}
                        style={[styles.quickGoalPill, mlToOz(formWaterGoal) === ozVal && { backgroundColor: colors.chart.water + '20', borderColor: colors.chart.water }]}
                        onPress={() => { setFormWaterGoal(ozToMl(ozVal)); triggerHaptic('selection'); }}
                      >
                        <Text style={[styles.quickGoalPillText, mlToOz(formWaterGoal) === ozVal && { color: colors.chart.water }]}>{ozVal}oz</Text>
                      </TouchableOpacity>
                    ))
                    : [1500, 2000, 2500, 3000].map((w) => (
                      <TouchableOpacity
                        key={w}
                        style={[styles.quickGoalPill, formWaterGoal === w && { backgroundColor: colors.chart.water + '20', borderColor: colors.chart.water }]}
                        onPress={() => { setFormWaterGoal(w); triggerHaptic('selection'); }}
                      >
                        <Text style={[styles.quickGoalPillText, formWaterGoal === w && { color: colors.chart.water }]}>{w}</Text>
                      </TouchableOpacity>
                    ))
                  }
                </View>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => {
                    if (volumeUnit === 'oz') {
                      const currentOz = mlToOz(formWaterGoal);
                      const newOz = Math.min(340, currentOz + 8); // max ~10L (340 oz)
                      setFormWaterGoal(ozToMl(newOz));
                    } else {
                      setFormWaterGoal(Math.min(10000, formWaterGoal + 250));
                    }
                    triggerHaptic('selection');
                  }}
                >
                  <Ionicons name="add" size={16} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Steps Goals Dial */}
            <View style={styles.goalCard}>
              <View style={styles.goalHeaderRow}>
                <Ionicons name="footsteps" size={18} color={colors.lime} />
                <Text style={styles.goalCardTitle}>Daily Steps Target</Text>
                <Text style={styles.goalCardValue}>{formStepsGoal.toLocaleString()}</Text>
              </View>
              <View style={styles.adjustRow}>
                <TouchableOpacity style={styles.adjustBtn} onPress={() => { setFormStepsGoal(Math.max(2000, formStepsGoal - 1000)); triggerHaptic('selection'); }}>
                  <Ionicons name="remove" size={16} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.quickPillRow}>
                  {[5000, 8000, 10000, 12000].map((s) => (
                    <TouchableOpacity key={s} style={[styles.quickGoalPill, formStepsGoal === s && { backgroundColor: colors.lime + '20', borderColor: colors.lime }]} onPress={() => { setFormStepsGoal(s); triggerHaptic('selection'); }}>
                      <Text style={[styles.quickGoalPillText, formStepsGoal === s && { color: colors.lime }]}>{(s / 1000)}k</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.adjustBtn} onPress={() => { setFormStepsGoal(Math.min(50000, formStepsGoal + 1000)); triggerHaptic('selection'); }}>
                  <Ionicons name="add" size={16} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Weekly Workouts Dial */}
            <View style={styles.goalCard}>
              <View style={styles.goalHeaderRow}>
                <Ionicons name="fitness" size={18} color={colors.amber} />
                <Text style={styles.goalCardTitle}>Weekly Workouts Target</Text>
                <Text style={styles.goalCardValue}>{formWorkoutGoal} days</Text>
              </View>
              <View style={styles.adjustRow}>
                <TouchableOpacity style={styles.adjustBtn} onPress={() => { setFormWorkoutGoal(Math.max(1, formWorkoutGoal - 1)); triggerHaptic('selection'); }}>
                  <Ionicons name="remove" size={16} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.quickPillRow}>
                  {[3, 4, 5, 6].map((w) => (
                    <TouchableOpacity key={w} style={[styles.quickGoalPill, formWorkoutGoal === w && { backgroundColor: colors.amber + '20', borderColor: colors.amber }]} onPress={() => { setFormWorkoutGoal(w); triggerHaptic('selection'); }}>
                      <Text style={[styles.quickGoalPillText, formWorkoutGoal === w && { color: colors.amber }]}>{w}d</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.adjustBtn} onPress={() => { setFormWorkoutGoal(Math.min(7, formWorkoutGoal + 1)); triggerHaptic('selection'); }}>
                  <Ionicons name="add" size={16} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ─── Preferences Switches ─── */}
        <Animated.View entering={FadeInUp.delay(200).springify().damping(18)}>
          <View style={styles.groupLabel}>
            <View style={[styles.groupDot, { backgroundColor: '#6366F1' }]} />
            <Text style={styles.groupLabelText}>System Settings & Preferences</Text>
          </View>

          <GlassCard>
            {/* Dark Theme toggle */}
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
                trackColor={{ false: 'rgba(0,0,0,0.10)', true: colors.lime + '99' }}
                thumbColor={isDarkMode ? colors.lime : '#ccc'}
              />
            </View>

            <View style={styles.divider} />

            {/* Notifications toggle */}
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
                onValueChange={(val) => { setNotifications(val); triggerHaptic('light'); }}
                trackColor={{ false: 'rgba(0,0,0,0.10)', true: colors.lime + '99' }}
                thumbColor={notifications ? colors.lime : '#ccc'}
              />
            </View>

            <View style={styles.divider} />

            {/* Haptic feedback toggle */}
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
                onValueChange={(val) => { setHaptics(val); triggerHaptic('light'); }}
                trackColor={{ false: 'rgba(0,0,0,0.10)', true: colors.lime + '99' }}
                thumbColor={haptics ? colors.lime : '#ccc'}
              />
            </View>

            <View style={styles.divider} />

            {/* Weight unit selector */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: colors.chart.protein + '15' }]}>
                <MaterialCommunityIcons name="scale-bathroom" size={18} color={colors.chart.protein} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Weight Unit Type</Text>
              </View>
              <View style={styles.pillToggle}>
                <TouchableOpacity style={[styles.pill, weightUnit === 'kg' && styles.pillActive]} onPress={() => { handleWeightUnitChange('kg'); triggerHaptic('selection'); }}>
                  <Text style={[styles.pillText, weightUnit === 'kg' && styles.pillTextActive]}>kg</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pill, weightUnit === 'lbs' && styles.pillActive]} onPress={() => { handleWeightUnitChange('lbs'); triggerHaptic('selection'); }}>
                  <Text style={[styles.pillText, weightUnit === 'lbs' && styles.pillTextActive]}>lbs</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Volume unit selector */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: colors.chart.water + '15' }]}>
                <Ionicons name="water" size={18} color={colors.chart.water} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Volume Liquid Unit</Text>
              </View>
              <View style={styles.pillToggle}>
                <TouchableOpacity style={[styles.pill, volumeUnit === 'ml' && styles.pillActive]} onPress={() => { setVolumeUnit('ml'); triggerHaptic('selection'); }}>
                  <Text style={[styles.pillText, volumeUnit === 'ml' && styles.pillTextActive]}>ml</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pill, volumeUnit === 'oz' && styles.pillActive]} onPress={() => { setVolumeUnit('oz'); triggerHaptic('selection'); }}>
                  <Text style={[styles.pillText, volumeUnit === 'oz' && styles.pillTextActive]}>oz</Text>
                </TouchableOpacity>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ─── Privacy & Security Preferences ─── */}
        <Animated.View entering={FadeInUp.delay(220).springify().damping(18)}>
          <View style={styles.groupLabel}>
            <View style={[styles.groupDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.groupLabelText}>Privacy & Security</Text>
          </View>

          <GlassCard>
            {/* Private profile mode toggle */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: colors.danger + '12' }]}>
                <Ionicons name="lock-closed" size={18} color={colors.danger} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Private Profile Mode</Text>
                <Text style={styles.rowSub}>{privateProfile ? 'Profile details hidden locally' : 'Public sharing active'}</Text>
              </View>
              <Switch
                value={privateProfile}
                onValueChange={(val) => { setPrivateProfile(val); triggerHaptic('medium'); }}
                trackColor={{ false: 'rgba(0,0,0,0.10)', true: colors.lime + '99' }}
                thumbColor={privateProfile ? colors.lime : '#ccc'}
              />
            </View>

            <View style={styles.divider} />

            {/* App lock toggle */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: '#6366F115' }]}>
                <Ionicons name="shield-checkmark" size={18} color="#6366F1" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>App Passcode Lock</Text>
                <Text style={styles.rowSub}>{appLock ? 'Require passcode on start' : 'App lock disabled'}</Text>
              </View>
              <Switch
                value={appLock}
                onValueChange={(val) => { setAppLock(val); triggerHaptic('medium'); }}
                trackColor={{ false: 'rgba(0,0,0,0.10)', true: colors.lime + '99' }}
                thumbColor={appLock ? colors.lime : '#ccc'}
              />
            </View>

            <View style={styles.divider} />

            {/* Change password button */}
            <PressableRow style={styles.row} onPress={handleChangePassword}>
              <View style={[styles.iconBubble, { backgroundColor: colors.amber + '15' }]}>
                <Ionicons name="key" size={18} color={colors.amber} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Change Account Password</Text>
                <Text style={styles.rowSub}>Send password reset instructions</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableRow>
          </GlassCard>
        </Animated.View>

        {/* ─── Privacy, Data & Actions ─── */}
        <Animated.View entering={FadeInUp.delay(250).springify().damping(18)}>
          <View style={styles.groupLabel}>
            <View style={[styles.groupDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.groupLabelText}>Privacy & Data Actions</Text>
          </View>

          <GlassCard>
            {/* Sync DB Status */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: 'rgba(52,211,153,0.12)' }]}>
                <Ionicons name="cloud-done-outline" size={18} color={colors.lime} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Database Cloud Backup</Text>
                <Text style={styles.rowSub}>{user.email ? 'Connected & active' : 'Offline local database mode'}</Text>
              </View>
              <TouchableOpacity style={styles.syncBtn} onPress={handleManualSync} disabled={showSyncing}>
                <Text style={styles.syncBtnTxt}>{showSyncing ? 'Syncing...' : 'Sync Now'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Export JSON logs */}
            <PressableRow style={styles.row} onPress={handleExportData}>
              <View style={[styles.iconBubble, { backgroundColor: colors.chart.fibre + '15' }]}>
                <Ionicons name="download-outline" size={18} color={colors.chart.fibre} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Export Fitness Data Logs</Text>
                <Text style={styles.rowSub}>Share JSON file containing all logs</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableRow>

            <View style={styles.divider} />

            {/* Replay splash screen */}
            <PressableRow style={styles.row} onPress={() => setShowSplashPreview(true)}>
              <View style={[styles.iconBubble, { backgroundColor: colors.lime + '15' }]}>
                <Ionicons name="play-circle-outline" size={18} color={colors.lime} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Replay Splash Entrance</Text>
                <Text style={styles.rowSub}>Watch startup animations</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableRow>

            <View style={styles.divider} />

            {/* Clear history */}
            <PressableRow style={styles.row} onPress={() => { setClearConfirmText(''); setShowClearModal(true); }}>
              <View style={[styles.iconBubble, { backgroundColor: colors.danger + '12' }]}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: colors.danger }]}>Clear Data History</Text>
                <Text style={styles.rowSub}>Wipe all local and cloud logs</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.danger + '88'} />
            </PressableRow>
          </GlassCard>
        </Animated.View>

        {/* ─── Legal / Privacy Policy ─── */}
        <Animated.View entering={FadeInUp.delay(300).springify().damping(18)}>
          <GlassCard>
            <PressableRow style={styles.row} onPress={() => setShowDocModal({ visible: true, title: 'Privacy Policy', content: 'Your health and workout logs are stored locally on your device using encrypted sandbox directories. FitForge does not sell, distribute, or trace your personal telemetry logs. Backups are stored in Supabase with standard TLS encryption protocols.' })}>
              <View style={[styles.iconBubble, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                <Ionicons name="document-text-outline" size={18} color={colors.muted} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableRow>

            <View style={styles.divider} />

            <PressableRow style={styles.row} onPress={() => setShowDocModal({ visible: true, title: 'Terms of Service', content: 'By utilizing FitForge, you acknowledge that all metabolic calculations (BMR, TDEE, BMI, macro targets) are estimated based on mathematical algorithms (Mifflin-St Jeor). Always consult a healthcare professional before starting extreme dieting regimes.' })}>
              <View style={[styles.iconBubble, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.muted} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableRow>
          </GlassCard>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(320).springify()}>
          <TouchableOpacity style={styles.saveMainBtn} onPress={handleSave} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={20} color={colors.white} />
            <Text style={styles.saveMainBtnTxt}>Save Settings Changes</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Log Out */}
        <Animated.View entering={FadeInDown.delay(340).springify()}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={styles.logoutBtnTxt}>Log Out of Account</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Version */}
        <View style={styles.versionBlock}>
          <Text style={styles.versionText}>FitForge Premium v1.0.0</Text>
          <Text style={styles.versionSub}>Made with 💚 and spring physics</Text>
        </View>
      </ScrollView>

      {/* ─── Camera / Gallery Action Sheet DP ─── */}
      <Modal visible={actionSheetVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setActionSheetVisible(false)}>
          <View style={styles.actionSheet}>
            <View style={styles.actionSheetHandle} />
            <Text style={styles.actionSheetTitle}>Select Display Photo</Text>

            <TouchableOpacity style={styles.actionRow} onPress={pickImageFromGallery}>
              <Ionicons name="image" size={20} color={colors.lime} />
              <Text style={styles.actionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={takePhotoWithCamera}>
              <Ionicons name="camera" size={20} color={colors.lime} />
              <Text style={styles.actionText}>Take Photo with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 0 }]} onPress={() => setActionSheetVisible(false)}>
              <Ionicons name="close-circle" size={20} color={colors.danger} />
              <Text style={[styles.actionText, { color: colors.danger }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ─── Clear Database Warning Modal ─── */}
      <Modal visible={showClearModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
          <View style={[styles.actionSheet, { borderTopWidth: 2, borderColor: colors.danger + '40' }]}>
            <View style={[styles.actionSheetHandle, { backgroundColor: colors.danger + '40' }]} />
            <View style={styles.dangerHeader}>
              <Ionicons name="warning" size={32} color={colors.danger} />
              <Text style={styles.dangerTitle}>Permanently Clear History?</Text>
            </View>
            <Text style={styles.dangerDesc}>
              This action will permanently wipe your weight tracking logs, hydration counts, steps entries, and nutrition meals history. This database purge cannot be undone.
            </Text>

            <Text style={styles.confirmLabel}>Type CLEAR to confirm:</Text>
            <View style={[styles.inputFieldWrap, { borderColor: colors.danger + '50', marginBottom: 20 }]}>
              <TextInput
                style={[styles.textInput, { color: colors.danger }]}
                value={clearConfirmText}
                onChangeText={setClearConfirmText}
                placeholder="CLEAR"
                placeholderTextColor={colors.danger + '40'}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[styles.dangerConfirmBtn, clearConfirmText !== 'CLEAR' && { opacity: 0.35 }]}
              disabled={clearConfirmText !== 'CLEAR'}
              onPress={handleClearHistory}
            >
              <Ionicons name="trash" size={18} color={colors.white} />
              <Text style={styles.dangerConfirmBtnText}>Purge All My Data</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowClearModal(false)}>
              <Text style={styles.cancelBtnTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── Legal Documents Viewer Modal ─── */}
      <Modal visible={showDocModal.visible} transparent animationType="slide">
        <View style={styles.backdrop}>
          <View style={styles.actionSheet}>
            <View style={styles.actionSheetHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.docTitle}>{showDocModal.title}</Text>
              <TouchableOpacity style={styles.closeBtnSmall} onPress={() => setShowDocModal({ visible: false, title: '', content: '' })}>
                <Ionicons name="close" size={18} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.docContent}>{showDocModal.content}</Text>
            <TouchableOpacity style={styles.saveMainBtn} onPress={() => setShowDocModal({ visible: false, title: '', content: '' })}>
              <Text style={styles.saveMainBtnTxt}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Fullscreen Animated Splash Preview ─── */}
      {showSplashPreview && (
        <Modal visible={true} transparent={false} animationType="none" statusBarTranslucent>
          <AnimatedSplashScreen
            isAppReady={false}
            preview
            onPreviewDismiss={() => setShowSplashPreview(false)}
          />
        </Modal>
      )}
    </View>
  );
}

// ─── Styles Stylesheet Factory ────────────────────────────────────────────────
const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },

  profileHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.lime + '18',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.lime + '40',
  },
  avatarImage: { width: 62, height: 62, borderRadius: 31 },
  avatarText: { ...Typography.h2, color: colors.lime },
  avatarCameraBadge: {
    position: 'absolute', right: -2, bottom: -2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.lime,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.card,
  },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { ...Typography.h3, color: colors.text.primary },
  profileEmail: { ...Typography.caption, color: colors.text.secondary },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.lime + '12',
    borderRadius: Radius.pill,
    paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  levelText: { fontSize: 9, fontWeight: '700', color: colors.lime },

  groupLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 4 },
  groupDot: { width: 6, height: 6, borderRadius: 3 },
  groupLabelText: { ...Typography.captionBold, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },

  inputGroup: { gap: 6, marginBottom: 12 },
  inputLabel: { ...Typography.captionBold, color: colors.text.primary },
  inputFieldWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder,
    paddingHorizontal: 12, height: 46,
  },
  inputFieldError: { borderColor: colors.danger, backgroundColor: colors.danger + '05' },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, ...Typography.body, color: colors.text.primary, padding: 0 },
  errorText: { fontSize: 10, fontWeight: '600', color: colors.danger, marginTop: 2 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },

  presetsRow: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  presetItem: { alignItems: 'center', gap: 4 },
  presetImage: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: colors.cardBorder },
  presetLabel: { fontSize: 10, color: colors.text.secondary },

  // Goal Cards
  goalCard: { paddingVertical: 10 },
  goalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  goalCardTitle: { ...Typography.bodyBold, color: colors.text.primary, flex: 1 },
  goalCardValue: { ...Typography.bodyBold, color: colors.text.primary },
  adjustRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'space-between' },
  adjustBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  quickPillRow: { flexDirection: 'row', gap: 6, flex: 1, justifyContent: 'center' },
  quickGoalPill: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  quickGoalPillText: { fontSize: 11, fontWeight: '600', color: colors.text.secondary },

  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 12 },

  // Row preferences
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  iconBubble: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  rowContent: { flex: 1, gap: 2 },
  rowTitle: { ...Typography.bodyBold, color: colors.text.primary },
  rowSub: { ...Typography.caption, color: colors.text.secondary },
  pillToggle: { flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: Radius.pill, padding: 3, borderWidth: 1, borderColor: colors.cardBorder },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill },
  pillActive: { backgroundColor: colors.lime },
  pillText: { fontSize: 11, fontWeight: '700', color: colors.text.secondary },
  pillTextActive: { color: colors.white },

  syncBtn: { backgroundColor: colors.lime + '15', borderWidth: 1, borderColor: colors.lime, borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  syncBtnTxt: { fontSize: 11, fontWeight: '700', color: colors.lime },

  // Action Buttons
  saveMainBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.lime, borderRadius: Radius.pill, paddingVertical: 16,
    shadowColor: colors.lime, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
    marginTop: 10,
  },
  saveMainBtnTxt: { ...Typography.bodyBold, color: colors.white },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.danger + '12', borderRadius: Radius.pill, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.danger + '30',
    marginTop: 8,
  },
  logoutBtnTxt: { ...Typography.bodyBold, color: colors.danger },
  versionBlock: { alignItems: 'center', marginTop: 24, gap: 2 },
  versionText: { ...Typography.captionBold, color: colors.text.secondary },
  versionSub: { ...Typography.micro, color: colors.muted },

  // Backdrop / ActionSheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  actionSheet: {
    backgroundColor: colors.ivory, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  actionSheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.muted + '30', alignSelf: 'center', marginBottom: 20 },
  actionSheetTitle: { ...Typography.h3, color: colors.text.primary, textAlign: 'center', marginBottom: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  actionText: { ...Typography.bodyBold, color: colors.text.primary },

  // Danger sheet
  dangerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  dangerTitle: { ...Typography.h3, color: colors.danger },
  dangerDesc: { ...Typography.body, color: colors.text.secondary, marginBottom: 16, lineHeight: 20 },
  confirmLabel: { ...Typography.captionBold, color: colors.danger, marginBottom: 6 },
  dangerConfirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.danger, borderRadius: Radius.pill, paddingVertical: 16,
  },
  dangerConfirmBtnText: { ...Typography.bodyBold, color: colors.white },
  cancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 6 },
  cancelBtnTxt: { ...Typography.bodyBold, color: colors.text.secondary },

  // Docs
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  docTitle: { ...Typography.h3, color: colors.text.primary },
  closeBtnSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  docContent: { ...Typography.body, color: colors.text.secondary, lineHeight: 22, marginBottom: 20 },

  // Toast Styles
  toastContainer: {
    position: 'absolute',
    left: 16, right: 16,
    zIndex: 9999,
  },
  toastCard: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  toastAccentBar: {
    height: 3,
  },
  toastBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  toastText: {
    ...Typography.captionBold,
    color: colors.text.primary,
    flex: 1,
  },
});
